class LootManager{

    static getEntityLoot(entitySave){
        //console.log(entitySave);
        let entityGroupInfo = entitySave.entityGroupInfo;
        let lootChances = false;
        let key = entityGroupInfo.key;
        
        let template = false;
        switch (entityGroupInfo.entityType){
            case 'container':
                template = containerVars[key];
                break;
            case 'monster':
                template = monsterVars[key];
                break;
            default:
        }

        if(!entitySave.inventory){
            entitySave.inventory = {
                items: []
            };
        }

        if(!template){
            console.log('NO TEMPLATE FOUND FOR '+key)
            return false;
        }

        lootChances = template.loot;

        if(lootChances){
            let weaponLoot = lootChances.weapon;
            if(weaponLoot){
                if(Random.roll(1,99) < weaponLoot.chance){
                    entitySave.inventory.items.push(LootManager.getWeaponLoot(weaponLoot.tier,weaponLoot.allowedMaterials));
                }
            }

            let treasureLoot = lootChances.treasure;
            if(treasureLoot){
                if(Random.roll(1,99) < treasureLoot.chance){
                    entitySave.inventory.items.push(LootManager.getTreasureLoot(treasureLoot.tier,weaponLoot.allowedMaterials));
                }
            }

            let potionLoot = lootChances.potion;
            if(potionLoot){
                if(Random.roll(1,99) < potionLoot.chance){
                    entitySave.inventory.items.push(LootManager.getPotionLoot(potionLoot.tier));
                }
            }

            let goldLoot = lootChances.gold;
            if(goldLoot){
                if(Random.roll(1,99) < goldLoot.chance){
                    entitySave.inventory.gold = Random.roll(1,goldLoot.amount);
                }else{
                    entitySave.inventory.gold = 0;
                }
            }
        }   

        let inventory = LootManager.getInventoryFromTemplate(template)
        if(inventory){
            entitySave.inventory.items = entitySave.inventory.items.concat(inventory);
        }
        //trim down to max size
        entitySave.inventory.items = LootManager.trimInventory(entitySave.inventory.items, template.inventorySlots)
    }

    static trimInventory(items, max){
        console.log({items:items,max:max})
        while(items.length > max){
            console.log(items.pop());
        }

        return items;
    }


    static getInventoryFromTemplate(template){
        let templateInventory=template.inventory;
        if(!templateInventory){
            return false;
        }
        let inventory = [];
        templateInventory.forEach((item)=>{
            let random=Random.roll(0,99);
            if(random < item.chance){
                let itemCopy = JSON.parse(JSON.stringify(item.item))
                inventory.push(itemCopy);
            }
        })

        return inventory;
    }

    static getTreasureLoot(tier, allowedMaterials){
        let nRolls = tier-3;
        let greater = (nRolls > 0);
        nRolls = Math.abs(nRolls);

        let treasure = LootManager.getTreasure();
        let treasureMaterial = LootManager.getTreasureMaterial(allowedMaterials);
        LootManager.applyModifier(treasure, treasureMaterial);

        for(let i = 0; i < nRolls; i++){
            let newTreasure = LootManager.getTreasure();
            treasureMaterial = LootManager.getTreasureMaterial(allowedMaterials);
            LootManager.applyModifier(newTreasure, treasureMaterial);
            if((greater && newTreasure.value > treasure.value) || (!greater && newTreasure.value < treasure.value)){
                treasure = newTreasure;
            }
        }

        LootManager.getTreasureModifier(treasure, tier);


        return treasure;
    }

    static getPotionLoot(tier){
        let nRolls = tier-3;
        let greater = (nRolls > 0);
        nRolls = Math.abs(nRolls);

        let potion = LootManager.getPotion();

        for(let i = 0; i < nRolls; i++){
            let newPotion = LootManager.getPotion();
            if((greater && newPotion.value > potion.value) || (!greater && newPotion.value < potion.value)){
                potion = newPotion;
            }
        }

        //be nice... Lower chance to find negative potions
        if(potion.negative){
            if(Random.roll(0,tier)){
                potion = JSON.parse(JSON.stringify(itemVars.potions.unlabeled))
            }
        }

        if(potion.unlabeled){
            potion.tier = tier;
        }

        return potion;
        
    }

    static getPotion(){
        let potions = Object.keys(itemVars.potions);
        let nPotions = potions.length;
        let potionIndex = Random.roll(0,nPotions-1);
        
        let key = potions[potionIndex];
        let potion = itemVars.potions[key];

        //this is to make a copy of the object - this way it isn't passed by reference.
        return JSON.parse(JSON.stringify(potion));
    }

    //allowedMaterials is an array of weapon material keys. Rarity will be based on order!
    static getWeaponLoot(tier, allowedMaterials=false){
        let weapon = LootManager.getWeapon();
        let weaponMaterial = LootManager.getWeaponMaterial(tier, allowedMaterials);
        LootManager.applyModifier(weapon, weaponMaterial);
        LootManager.getIsWorn(weapon, tier);

        return weapon;
    }

    static getTreasureModifier(treasure, tier){
        let random = Random.roll(1,99);
        random += tier*5;
        if(random < 30){
            LootManager.applyModifier(treasure, itemVars.treasureModifiers.decrepit)
        }else if (random < 60){
            LootManager.applyModifier(treasure, itemVars.treasureModifiers.distressed)
        }else if (random >= 90){
            LootManager.applyModifier(treasure, itemVars.treasureModifiers.pristine)
        }
    }


    static getWeaponMaterial(tier, allowedMaterials = false){
        let materials;
        if(allowedMaterials){
            materials = allowedMaterials;
        }else{
            materials = Object.keys(itemVars.weaponMaterials);        
        }
        let nMaterials = materials.length; 
        let nRolls = tier-3;
        let maxMinFunc = (nRolls > 0) ? Math.max : Math.min;
        nRolls = Math.abs(nRolls);
        let materialIndex = Random.roll(0,nMaterials-1);
        //material rarity is based on its position in the list of weapon materials
        for(let i = 0; i < nRolls; i++){
            let newIndex = Random.roll(0,nMaterials-1);
            materialIndex = maxMinFunc(materialIndex,newIndex);
        }
        let key = materials[materialIndex];
        let material = itemVars.weaponMaterials[key];

        return material;
    }

    //allowedMaterials is an array of keys of materials
    static getTreasureMaterial(allowedMaterials = false){
        let materials;
        if(allowedMaterials){
            materials = allowedMaterials;
        }else{
            materials = Object.keys(itemVars.treasureMaterials);
        }
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

        //this is to make a copy of the object - this way it isn't passed by reference.
        return JSON.parse(JSON.stringify(weapon));
    }

    static getTreasure(){
        let treasures = Object.keys(itemVars.treasure);
        let nTreasures = treasures.length;
        let treasureIndex = Random.roll(0,nTreasures-1);
        
        let key = treasures[treasureIndex];
        let treasure = itemVars.treasure[key];

        //this is to make a copy of the object - this way it isn't passed by reference.
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
                    break;
                case 'color':
                    item[key] = value;
                    break;
                default:
                    item[key] = value;
            }
        }
        //apply modifier to special strikes
        ['jab','swing','strafe'].forEach(function(val){
            //only do this once!
            if(item[val] && !recursion){
                LootManager.applyModifier(item[val], modifier);
            }
        })
    }

    static getStarterWeapon(){
        
        let starterWeapon = LootManager.getWeaponLoot(1)
        while(starterWeapon.value > 5){
            starterWeapon = LootManager.getWeaponLoot(1)
        }
        if(!starterWeapon.flimsy){
            starterWeapon.flimsy = 1
        }
        starterWeapon.flimsy += 5;

        return starterWeapon
    }

    static breakWeapon(item){
        item.name += " (broken)";
        item.weapon = false;
        item.value *= 0.7;
        item.value = Math.floor(item.value);
        item.value = Math.max(item.value,1);
    }

    getColor(val){
        let color;
        if(val <= 3){
            color = 'brown';
        }else if (val <= 15){
            color = 'gray';
        }else if (val <= 25){
            color = 'silver';
        }else if (val <= 35){
            color = 'gold';
        }else if (val <= 50){
            color = 'gold';
        }else{
            color = 'purple';
        }

        return color;
    }
}