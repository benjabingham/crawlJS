class LootManager{

    static getEntityLoot(entitySave, entityType = false){
        //console.log(entitySave);
        let entityGroupInfo = entitySave.entityGroupInfo;
        let lootChances = false;
        let key;
        if(entitySave.key){
            key = entitySave.key
        }else{
            key = entityGroupInfo.key;
        }
        console.log(key)

        if(!entityType){
            entityType = entityGroupInfo.entityType
        }
        
        let template = false;
        switch (entityType){
            case 'container':
                template = containerVars[key];
                break;
            case 'monster':
                template = monsterVars[key];
                break;
            default:
                return false;
        }

        if(!entitySave.inventory){
            entitySave.inventory = {
                items: []
            };
        }

        if(!template){
            console.log('NO TEMPLATE FOUND FOR '+key)
            console.log(entitySave)
            return false;
        }

        lootChances = template.loot;

        if(lootChances){
            let weaponLoot = lootChances.weapon;
            if(weaponLoot){
                if(Random.roll(1,99) < weaponLoot.chance){
                    entitySave.inventory.items.push(LootManager.getWeaponLoot(weaponLoot.tier,weaponLoot.allowedMaterials, weaponLoot.curseMultiplier));
                }
            }

            let treasureLoot = lootChances.treasure;
            if(treasureLoot){
                if(Random.roll(1,99) < treasureLoot.chance){
                    entitySave.inventory.items.push(LootManager.getTreasureLoot(treasureLoot.tier,treasureLoot.allowedMaterials,treasureLoot.preferredRange));
                }
            }

            let potionLoot = lootChances.potion;
            if(potionLoot){
                if(Random.roll(1,99) < potionLoot.chance){
                    entitySave.inventory.items.push(LootManager.getPotionLoot(potionLoot.tier));
                }
            }

            let supplyLoot = lootChances.supplies;
            if(supplyLoot){
                if(Random.roll(1,99) < supplyLoot.chance){
                    entitySave.inventory.items.push(LootManager.getSupplyLoot(supplyLoot.tier));
                }
            }

            let foodLoot = lootChances.food;
            if(foodLoot){
                if(Random.roll(1,99) < foodLoot.chance){
                    if(!foodLoot.maxNumber){
                        foodLoot.maxNumber = 1;
                    }
                    let n = Random.roll(1,foodLoot.maxNumber)
                    for(let i=0; i< n; i++){
                        entitySave.inventory.items.push(LootManager.getFoodLoot(foodLoot.tier, foodLoot.rottenMultiplier));
                    }
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
        //console.log({items:items,max:max})
        while(items.length > max){
            items.pop();
        }

        return items;
    }


    static getInventoryFromTemplate(template){
        let templateInventory=template.inventory;
        if(!templateInventory){
            return false;
        }
        let inventory = [];
        //console.log(templateInventory)
        templateInventory.forEach((item)=>{
            let random=Random.roll(0,99);
            if(random < item.chance){
                let itemCopy = JSON.parse(JSON.stringify(item.item))
                inventory.push(itemCopy);
            }
        })

        return inventory;
    }

    static getTreasureLoot(tier, allowedMaterials, preferredRange = {min: 0 , max: 9999}){
        let nRolls = tier-3;
        let greater = (nRolls > 0);
        let min = preferredRange.min;
        let max = preferredRange.max;
        nRolls = Math.abs(nRolls);

        let treasure = LootManager.getTreasure();
        let treasureMaterial = LootManager.getTreasureMaterial(allowedMaterials);
        LootManager.applyModifier(treasure, treasureMaterial);

        for(let i = 0; i < nRolls; i++){
            let newTreasure = LootManager.getTreasure();
            treasureMaterial = LootManager.getTreasureMaterial(allowedMaterials);
            LootManager.applyModifier(newTreasure, treasureMaterial);
            //if value is outside of range, expand range and try again
            if(
                (greater && newTreasure.value > treasure.value) ||
                (!greater && newTreasure.value < treasure.value)
            ){

                treasure = newTreasure;
            }
        }

        LootManager.getTreasureModifier(treasure, tier);
        LootManager.getTreasureSize(treasure);
        console.log(treasure)
        //if outside of range, widen range and try again!
        if(treasure.value > max){
            let newMax = max * 1.5;
            treasure = LootManager.getTreasureLoot(tier, allowedMaterials, {min:min, max:newMax})
        }else if(treasure.value < min){
            let newMin = Math.floor(min/2)
            treasure = LootManager.getTreasureLoot(tier,allowedMaterials, {min:newMin, max:max})
        }

        treasure.treasure = true;
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
    static getWeaponLoot(tier, allowedMaterials=false, curseMultiplier = 1){
        //extra curse bonus...
        if(Random.roll(1,30) <= curseMultiplier){
            tier+= 3
            curseMultiplier = 999;
        }        
        let weaponMaterial = LootManager.getWeaponMaterial(tier, allowedMaterials);
        let weapon = LootManager.getWeapon(weaponMaterial.key);
        LootManager.applyModifier(weapon, weaponMaterial);
        LootManager.getIsCursed(weapon,tier,curseMultiplier)
        LootManager.getIsWorn(weapon, tier);
        if(!weapon.flimsy || weapon.flimsy < 0){
            weapon.flimsy = 0;
        }

        return weapon;
    }

    static getFoodLoot(tier = 0, rottenMultiplier = 1){
        console.log(rottenMultiplier)
        let foods = Object.keys(itemVars.food);
        let nFoods = foods.length; 
        //nrolls represents number of EXTRA rolls.
        let nRolls = tier-3;
        let maxMinFunc = (nRolls > 0) ? Math.max : Math.min;
        nRolls = Math.abs(nRolls);
        let foodIndex = Random.roll(0,nFoods-1);
        //food rarity is based on its position in the list of foods
        for(let i = 0; i < nRolls; i++){
            let newIndex = Random.roll(0,nFoods-1);
            foodIndex = maxMinFunc(foodIndex,newIndex);
        }
        let foodKey = foods[foodIndex]
        let food = JSON.parse(JSON.stringify(itemVars.food[foodKey]));

        if(food.preserved){rottenMultiplier /= 2}
        if(food.perishable){rottenMultiplier *= 2}
        food.rottenMultiplier = rottenMultiplier;
        if(Math.random() < rottenMultiplier * .2){
            LootManager.applyModifier(food,itemVars.foodModifiers.rotten)
            console.log('rotten')
        }else{
            console.log('not rotten')
        }

        console.log(food)
        return food;
    }

    static getSupplyLoot(tier = 1){
        let random = Random.roll(0,99)
        let item;
        if(random < 50){
            item = LootManager.getFoodLoot(tier);
        }else if (random < 70){
            item = JSON.parse(JSON.stringify(itemVars.fuel.kindling))
        }else if(random < 78){
            item = JSON.parse(JSON.stringify(itemVars.fuel.oilFlask))
            let n = Random.roll(0,2);
            for(let i = 0; i < n; i++){
                LootManager.expendUse(item);
            }
        }else if (random < 88){
            item = LootManager.getTool();
        }else if (random < 93){
            let weapons = ['shortsword','club','handaxe','pickaxe']
            let weapon = itemVars.weapons[weapons[Random.roll(0,weapons.length-1)]];
            weapon = JSON.parse(JSON.stringify(weapon));
            let material = LootManager.getWeaponMaterial(tier,['wood','copper','iron','steel']);
            LootManager.applyModifier(weapon,material);
            if(Random < 86){
                LootManager.applyModifier(itemVars.weaponModifiers.worn)
            }
            item = weapon;
        }else if (random < 98){
            item = LootManager.getPotionLoot(tier)
        }else{
            item = JSON.parse(JSON.stringify(itemVars.drops.pan))
        }
        return item;
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

    static getTreasureSize(treasure){
        if(!treasure.scalable){
            return false
        }
        let random = Random.roll(1,99);
        let size;

        if(random < 5){
            size = itemVars.treasureSizes.tiny;
        }else if (random < 15){
            size = itemVars.treasureSizes.small
        }else if (random < 25){
            size = itemVars.treasureSizes.large
        }else if (random < 30){
            size = itemVars.treasureSizes.huge
        }

        if(!size){return false}

        LootManager.applyModifier(treasure, size);
    }

    static getWeightedWeaponMaterials(allowedMaterials = false){
        let materials;
        let weightedMaterials = [];
        if(allowedMaterials){
            materials = allowedMaterials;
        }else{
            materials = Object.keys(itemVars.weaponMaterials);        
        }

        materials.forEach((key)=>{
            let material = itemVars.weaponMaterials[key];
            for(let i = 0; i < material.frequency; i++){
                weightedMaterials.push(key);
            }
        })

        return weightedMaterials;
    }


    static getWeaponMaterial(tier, allowedMaterials = false){
        let materials = LootManager.getWeightedWeaponMaterials(allowedMaterials);
        let nMaterials = materials.length; 
        //nrolls represents number of EXTRA rolls.
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
        material.key = key;

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

    //checks to apply worn to weapon
    static getIsWorn(weapon, tier){
        let nonWornChance = 20 * tier;
        if(Random.roll(0,99) >= nonWornChance){
            LootManager.applyModifier(weapon,itemVars.weaponModifiers.worn);
        }
    }

    //checks to apply cursed to a weapon
    static getIsCursed(weapon, tier, multiplier = 1){
        let notCursedChance = (30 * tier) / multiplier;
        if(Random.roll(0,99) < notCursedChance){
            return false;
        }
        let chance = (weapon.value) * multiplier
        if(Random.roll(0,99) < chance){
            LootManager.applyModifier(weapon,itemVars.weaponModifiers.cursed);
        }

        return true;
    }

    static getWeapon(material = false){
        let weapons = Object.keys(itemVars.weapons);
        let nWeapons = weapons.length;
        let weaponIndex = Random.roll(0,nWeapons-1);
        
        let key = weapons[weaponIndex];
        let weapon = itemVars.weapons[key];
        let i = 0;
        while(material && weapon.disallowedMaterials && weapon.disallowedMaterials.includes(material)){
            weaponIndex = Random.roll(0,nWeapons-1);
            key = weapons[weaponIndex];
            weapon = itemVars.weapons[key];
            if(i > 10){
                return JSON.parse(JSON.stringify(itemVars.food.baguette))
            }
        }

        //this is to make a copy of the object - this way it isn't passed by reference.
        return JSON.parse(JSON.stringify(weapon));
    }

    static getTool(){
        let tools = Object.keys(itemVars.tools);
        let nTools = tools.length;
        let toolIndex = Random.roll(0,nTools-1);
        
        let key = tools[toolIndex];
        let tool = itemVars.tools[key];
        
        //this is to make a copy of the object - this way it isn't passed by reference.
        return JSON.parse(JSON.stringify(tool));
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
                    if(!modifier.symbol){
                        item[key] = value + ' ' + item[key];
                    }
                    break;
                case 'symbol':
                    if(!item.symbols){
                        item.symbols = [value]
                    }else{
                        item.symbols.push(value);
                    }
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
                case 'sharp':
                    if(item.type[key]){
                        LootManager.applyModifier(item, value,true);
                    }
                    break;
                case 'value':
                    if(item[key]){
                        //separately store the unrounded version of the items value
                        if(!item.floatValue){item.floatValue = item.value}
                        item.floatValue *= value;
                        item[key] = item.floatValue;
                        item[key] += .5;
                        item[key] = Math.floor(item[key]);
                        item[key] = Math.max(item[key], 0);
                    
                    }
                    break;
                case 'color':
                    item[key] = value;
                    break;
                case 'bulk':
                    if(!item[key]){
                        item[key] = 1;
                    }
                    item[key] *= value 

                    //round to nearest tenth
                    item[key] *= 10;
                    item[key] += .5;
                    item[key] = Math.floor(item[key]);
                    item[key] /= 10;
                    
                    //min value 0.1
                    item[key] = Math.max(item[key], 0.1);
                    break;
                default:
                    if(typeof(value) == "number"){
                        if(!item[key]){
                            item[key] = 0;
                        }
                        item[key]+= value;
                    }else{
                        item[key] = value;
                    }
            }
        }
        //apply modifier to special strikes
        ['jab','swing','strafe','draw'].forEach(function(val){
            //only do this once!
            if(item[val] && !recursion){
                LootManager.applyModifier(item[val], modifier);
            }
        })
    }

    static getStarterWeapon(){
        /*
        let starterWeapon = LootManager.getWeaponLoot(1,['wood','flint','iron'],0)
    
        while(starterWeapon.value > 5){
            starterWeapon = LootManager.getWeaponLoot(1,['wood','flint','iron'],0)
        }
        if(!starterWeapon.flimsy){
            starterWeapon.flimsy = 1
        }
        starterWeapon.flimsy += 5;
        */

        let starterWeapon = LootManager.getTool();

        return starterWeapon
    }

    static breakWeapon(item){
        item.name += " (broken)";
        item.weapon = false;
        if(!item.floatValue){item.floatValue = item.value}
        item.floatValue *= 0.7;
        item.value = item.floatValue;
        item.value = Math.floor(item.value);
        item.value = Math.max(item.value,0);
    }

    static expendUse(item){
        if(item.uses < 2){
            console.log ('ITEM COULD NOT BE EXPENDED')
            return false;
        }

        let newRatio = 1/item.uses;
        item.value = Math.floor(item.value - (newRatio*item.value));
        item.uses--;
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

    static getItemNameWithSymbols(item){
        let name = item.name;
        if(item.symbols){
            item.symbols.forEach((symbol)=>{
                name+=" "+symbol
            })
        }
    
        return name;
    }

    //takes string type, returns array of weapon objects of that type.
    static getWeaponsOfType(type){
        let weapons = [];
        console.log(type);
        Object.keys(itemVars.weapons).forEach(key =>{
            let weapon = itemVars.weapons[key];
            console.log(weapon);
            if(weapon.type && weapon.type[type]){
                weapons.push(weapon);
            }
        })
        Object.keys(itemVars.drops).forEach(key =>{
            let weapon = itemVars.drops[key];
            if(weapon.weapon && weapon.type && weapon.type[type]){
                weapons.push(weapon);
            }
        })
        Object.keys(itemVars.tools).forEach(key =>{
            let weapon = itemVars.tools[key];
            if(weapon.weapon && weapon.type && weapon.type[type]){
                weapons.push(weapon);
            }
        })
        Object.keys(itemVars.food).forEach(key =>{
            let weapon = itemVars.food[key];
            if(weapon.weapon && weapon.type && weapon.type[type]){
                weapons.push(weapon);
            }
        })

        return weapons;
    }

    static getValue(item){
        let value = item.value;
        if(item.treasure && Player.perks.sell.trinketPeddler){
            value += (Player.perks.sell.trinketPeddler.val * Player.perks.sell.trinketPeddler.amount);
        }

        if(item.treasure && Player.perks.sell.appraiser){
            let multiplier = Player.perks.sell.appraiser.val * 0.2;
            multiplier += 1;
            value *= multiplier;
            value = Math.floor(value);
        }

        if(item.pelt && Player.perks.sell.trapper){
            let multiplier = Player.perks.sell.trapper.val
            multiplier += 1
            value *= multiplier;
            value = Math.ceiling(value);
        }

        return value;
    }
}