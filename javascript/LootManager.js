class LootManager{

    static getEntityLoot(entitySave){
        let lootChances = false;
        let monsterKey = entitySave.value.monsterKey;
        let containerKey = entitySave.value.containerKey;
        
        if(entitySave.value.loot){
            lootChances = entitySave.value.loot;
        }else if(monsterKey){
            let template = monsterVars[monsterKey];
            lootChances = template.loot;
            if(template.inventory){
                entitySave.inventory = [...template.inventory];
            }
        }else if(containerKey){
            let template = containerVars[containerKey];
            lootChances = template.loot;
            if(template.inventory){
                entitySave.inventory = [...template.inventory];
            }
        }

        if(!entitySave.inventory){
            entitySave.inventory = [];
        }

        if(!lootChances){
            return false;
        }
        let weaponLoot = lootChances.weapon;
        if(weaponLoot){
            if(Random.roll(1,99) < weaponLoot.chance){
                entitySave.inventory.push(LootManager.getWeaponLoot(weaponLoot.tier));
            }
        }

        let treasureLoot = lootChances.treasure;
        if(treasureLoot){
            if(Random.roll(1,99) < treasureLoot.chance){
                entitySave.inventory.push(LootManager.getTreasureLoot(treasureLoot.tier));
            }
        }
    }

    static getTreasureLoot(tier){
        let nRolls = tier-3;
        let greater = (nRolls > 0);
        nRolls = Math.abs(nRolls);

        let treasure = LootManager.getTreasure();
        let treasureMaterial = LootManager.getTreasureMaterial();
        LootManager.applyModifier(treasure, treasureMaterial);

        for(let i = 0; i < nRolls; i++){
            let newTreasure = LootManager.getTreasure();
            treasureMaterial = LootManager.getTreasureMaterial();
            LootManager.applyModifier(newTreasure, treasureMaterial);
            if((greater && newTreasure.value > treasure.value) || (!greater && newTreasure.value < treasure.value)){
                treasure = newTreasure;
            }
        }

        return treasure;
    }

    static getWeaponLoot(tier){
        let weapon = LootManager.getWeapon();
        let weaponMaterial = LootManager.getWeaponMaterial(tier);
        LootManager.applyModifier(weapon, weaponMaterial);
        LootManager.getIsWorn(weapon, tier);

        return weapon;
    }

    static getWeaponMaterial(tier){
        let materials = Object.keys(itemVars.weaponMaterials);
        let nMaterials = materials.length;
        let nRolls = tier-3;
        let maxMinFunc = (nRolls > 0) ? Math.max : Math.min;
        nRolls = Math.abs(nRolls);
        let materialIndex = Random.roll(0,nMaterials-1);
        for(let i = 0; i < nRolls; i++){
            let newIndex = Random.roll(0,nMaterials-1);
            materialIndex = maxMinFunc(materialIndex,newIndex);
        }
        let key = materials[materialIndex];
        let material = itemVars.weaponMaterials[key];

        return material;
    }

    static getTreasureMaterial(){
        let materials = Object.keys(itemVars.treasureMaterials);
        let nMaterials = materials.length;
        let materialIndex = Random.roll(0,nMaterials-1);
        let key = materials[materialIndex];
        let material = itemVars.treasureMaterials[key];

        return material;
    }

    static getIsWorn(weapon, tier){
        let nonWornChance = 20 * tier;
        if(Random.roll(0,99) >= nonWornChance){
            LootManager.applyModifier(weapon,itemVars.weaponModifiers.worn);
        }
    }

    static getWeapon(){
        let weapons = Object.keys(itemVars.weapons);
        let nWeapons = weapons.length;
        let weaponIndex = Random.roll(0,nWeapons-1);
        
        let key = weapons[weaponIndex];
        let weapon = itemVars.weapons[key];

        return JSON.parse(JSON.stringify(weapon));
    }

    static getTreasure(){
        let treasures = Object.keys(itemVars.treasure);
        let nTreasures = treasures.length;
        let treasureIndex = Random.roll(0,nTreasures-1);
        
        let key = treasures[treasureIndex];
        let treasure = itemVars.treasure[key];

        return JSON.parse(JSON.stringify(treasure));
    }

    static applyModifier(item, modifier, recursion = false){
        item[modifier.name] = true;
        for (const [key, value] of Object.entries(modifier)){
            switch(key){
                case 'name':
                    item[key] = value + ' ' + item[key];
                    break;
                case 'damage':
                case 'stunTime':
                case 'weight':
                    if(item[key]){
                        item[key] += value;
                        item[key] = Math.max(1,item[key]);
                    }
                    break;
                case 'flimsy':
                    if(!item[key]){
                        item[key] = 0;
                    }
                    item[key]+= value;
                    break;
                case 'blunt':
                case 'edged':
                    if(item.type[key] || (item.type['sword'] && key == 'edged')){
                        LootManager.applyModifier(item, value,true);
                    }
                    break;
                case 'value':
                    if(item[key]){
                        item[key] *= value;
                        item[key] += .5;
                        item[key] = Math.floor(item[key]);
                        item[key] = Math.max(item[key], 1);
                    }
            }
        }
        let lootManager = this;
        //apply modifier to special strikes
        ['jab','swing','strafe'].forEach(function(val){
            //only do this once!
            if(item[val] && !recursion){
                lootManager.applyModifier(item[val], modifier);
            }
        })
    }

    static breakWeapon(item){
        item.name += " (broken)";
        item.weapon = false;
        item.value *= 0.7;
        item.value = Math.floor(item.value);
        item.value = Math.max(item.value,1);
    }

}