class ShopManager{

    //stock inventory from fresh
    //called by Save.mapInit()
    static generateShopInventory(mapId, shopId){
        let shopTemplate = mapVars[mapId].shops[shopId]
        let inventory = [];
        let slot = 0;
        if(shopTemplate.specialItems){
            shopTemplate.specialItems.forEach((item)=>{
                item.slot = slot;
                item.specialShopItem=true;
                inventory.push(item);
                slot++;
            })
        }
        
        if(shopTemplate.weaponTiers){
            shopTemplate.weaponTiers.forEach((tier)=>{
                let priceMultiplier = Random.roll(1,4) + tier;
                let item = LootManager.getWeaponLoot(tier, shopTemplate.carriedMaterials);
                
                item.price = Math.max(item.value,1) * priceMultiplier;
                item.slot = slot;
                item.tier = tier;
                inventory.push(item);
                slot++;
            })
        }

        if(shopTemplate.fuelSlots){
            for(let i=0; i<shopTemplate.fuelSlots; i++){
                let fuel = ShopManager.getFuel();
                fuel.slot = slot;
                inventory.push(fuel);
                slot++;
            }
        }
        

        if(shopTemplate.potionSlots){
            for(let i=0; i<shopTemplate.potionSlots; i++){
                let potion = ShopManager.getPotion();
                potion.slot = slot;
                inventory.push(potion);
                slot++;
            }
        }
       
        return inventory;        
    }

    static restockShops(mapId){
        let roster = Save.maps[mapId].roster
        roster.forEach((entity)=>{
            if(entity.entityGroupInfo.shop){
                ShopManager.restockShopInventory(mapId,entity.entityGroupInfo.shopId,entity);
            }
        })
    }

    //pass roster entity, and update its item array.
    static restockShopInventory(mapId, shopId, entitySave){
        let inventory = entitySave.inventory
        console.log('restocking!!!!!!!')
        let inventoryItems = inventory.items;
        console.log({
            mapId:mapId,
            shopId:shopId,
        })
        let shopTemplate = mapVars[mapId].shops[shopId]
        let restockChances = shopTemplate.restockChances
        inventoryItems.forEach((item)=>{
            let slot = item.slot;
            if(item.tier == 'fuel'){
                let restockChance = restockChances.fuel
                if(Math.random() < restockChance){
                    let fuel = ShopManager.getFuel();
                    fuel.slot = slot;
                    fuel.fresh = true;
                    inventoryItems[slot] = fuel;
                }
            }else if(item.tier == 'potion'){
                let restockChance = restockChances.potion
                if(Math.random() < restockChance){
                    let potion = ShopManager.getPotion();
                    potion.slot = slot;
                    potion.fresh = true;
                    inventoryItems[slot] = potion;
                }
            }else if(item.tier == 'supplies'){
                let restockChance = restockChances.supplies
                if(Math.random() < restockChance){
                    let supplies = ShopManager.getSupplies();
                    supplies.slot = slot;
                    supplies.fresh = true;
                    inventoryItems[slot] = supplies;
                }
            }else if(restockChances && restockChances.weaponTiers){
                let restockChance = restockChances.weaponTiers[item.tier]
                if(Math.random() < restockChance){
                    let newItem = LootManager.getWeaponLoot(item.tier, ShopManager.carriedMaterials);
                    let priceMultiplier = Random.roll(1,4) + item.tier;
                    newItem.price = Math.max(newItem.value* priceMultiplier,1) ;
                    newItem.slot = slot;
                    newItem.fresh = true;
                    newItem.tier = item.tier;
                    inventoryItems[slot] = newItem;
                }
            }
            if(item.fresh){
                item.fresh = false;
            }
            let newItem = inventoryItems[slot]
            if(newItem.fresh){
                console.log(entitySave)
                let message = $('<span>').append(
                    entitySave.entityGroupInfo.entityName+" stocked "
                ).append(
                    Inventory.getItemNameSpanFull(newItem).addClass('bold capitalize')
                ).append(
                    " - "+newItem.price+" Gold"
                )
                Log.addSpanMessage(message)
            }
        })
    }

    static getSupplies(){
        let tier = Random.roll(0,5)
        let item = LootManager.getSupplyLoot(tier);
        let multiplier = tier+1.5;
        item.price = Math.ceil(item.value * multiplier);
        item.tier = 'supplies'

        return item;
    }

    static getFuel(){
        let fuel = JSON.parse(JSON.stringify(itemVars.fuel.oilFlask));

        let priceMultiplier = Random.roll(2,5);

        //variance...
        if(fuel.uses){
            let useDiff = Random.roll(0,(fuel.uses))-1;
            for(let i = 0; i < useDiff; i++){
                LootManager.expendUse(fuel);
                fuel.value++;
            }

        }

        fuel.price = Math.max(fuel.value,1) * priceMultiplier;

        
        fuel.tier = 'fuel';

        return fuel;
    }

    static getPotion(){
        let tier = Random.roll(0,4);
        let potion = LootManager.getPotionLoot(tier);
        potion.price = potion.value * (tier+1);
        potion.tier = 'potion'

        return potion;
    }

    static buyItem(slot){
        let shop = Inventory.selectedContainer
        let shopItems = shop.inventory.items
        let item = shopItems[slot];
        if (item.price > Player.gold){
            Log.addMessage("Too poor!",'danger')
            //Sound.playError();
            GameMaster.postPlayerAction()
            return false;
        }
        Player.changeGold(item.price*-1);
        if(item.specialShopItem){
            ShopManager.transferSpecial(item)
        }else{
            ShopManager.transferItem(item)
        }
        if(item.type != 'rest' && !(item.effects && item.effects.rest)){
            Log.addMessage("Purchased "+item.name+" for "+item.price+" gold.")
            GameMaster.postPlayerAction()
        }else{

        }
        return true;
    }

    static transferItem(item){
        let shop = Inventory.selectedContainer
        let shopItems = shop.inventory.items
        let slot = item.slot;
        item.fresh = false;
        console.log(item)
        console.log(item.fresh)
        Inventory.take(slot,false);
        if(slot != -1){
            shopItems.splice(slot,0,{purchased:true,tier:item.tier, weapon:item.weapon})
        }
        Player.inventoryCleanup();
        Inventory.displayInventory();
        Inventory.findValidSelect();
    }

    static transferSpecial(item){
        let itemType = item.type
        console.log(item.type);
        switch(itemType){
            case "morsel":
                let morsel = JSON.parse(JSON.stringify(itemVars.food.morsel))
                LootManager.getFlavorText(morsel)
                Player.pickUpItem(morsel)
                GameMaster.postPlayerAction();
                break;
            case "fullMeal":
                Player.changeNourishment(100)
                Sound.playEat();
                GameMaster.postPlayerAction();
                break;
            case "rest":
                ShopManager.triggerRest()
                break;
            case "gamble":
                ShopManager.triggerGamble(item)
                break;
            default:
                throw(new Error("Special shop item type "+itemType+ " not found."))
        }
    }

    static triggerRest(){
        let restInfo = Player.getRestInfo();
        Log.printDayToLog(false);
        let oldLuck = Player.luck;
        GameMaster.nextDay();

        let container = Inventory.selectedContainer
        let selectedSlots = JSON.parse(JSON.stringify(Inventory.displayedInventorySlots))
        console.log(selectedSlots)
        Log.addMessage('You rested.')
        if(restInfo.healthChange > 0){
            Log.addMessage("Gained "+restInfo.healthChange+" health.",'pos')
        }
        if(oldLuck < Player.luck){
            Log.addMessage("Gained "+(Player.luck-oldLuck)+ " luck!","win")
        }
        if(restInfo.nourishmentChange < 0){
            Log.addMessage("Lost "+restInfo.nourishmentChange*-1+" hunger.",'danger')
        }
        GameMaster.getRoom(EntityManager.currentMap.name,false,{x:EntityManager.playerEntity.x,y:EntityManager.playerEntity.y},false)
        Inventory.openContainerInventory(Board.entityAt(container.x,container.y));
        Inventory.displayedInventorySlots = selectedSlots
        
        //GameMaster.postPlayerAction();
    }

    static triggerGamble(item){
        Log.printDayToLog(false);
        let oldLuck = Player.luck;
        let effects = item.effects;
        if(effects.rest){
            GameMaster.nextDay(false);
            XP.checkLevelUp();
        }

        Sound.playDrink();

        let container = Inventory.selectedContainer
        let selectedSlots = JSON.parse(JSON.stringify(Inventory.displayedInventorySlots))
        if(item.message){
            Log.addMessage(item.message)
        }
        if(effects.luck){
            let luck = Random.roll(effects.luck.min,effects.luck.max)
            Player.changeLuck(luck)
            let message = luck >= 0 ? "Gained" : "Lost"
            message += " " +Math.abs(luck)+" Luck."
            Log.addMessage(message,message = luck > 0 ? "pos" : "danger")
        }
        if(effects.hunger){
            let hunger = Random.roll(effects.hunger.min,effects.hunger.max)
            Player.changeNourishment(hunger)
            let message = hunger >= 0 ? "Gained" : "Lost"
            message += " " +Math.abs(hunger)+" Hunger."
            Log.addMessage(message,message = hunger > 0 ? "pos" : "danger")
        }
        if(effects.fatigue){
            let fatigue = Random.roll(effects.fatigue.min,effects.fatigue.max)
            Player.changeFatigue(fatigue)
            let message = fatigue >= 0 ? "Gained" : "Lost"
            message += " " +Math.abs(fatigue)+" Fatigue."
            Log.addMessage(message,message = fatigue > 0 ? "danger" : "pos")
        }
        GameMaster.getRoom(EntityManager.currentMap.name,false,{x:EntityManager.playerEntity.x,y:EntityManager.playerEntity.y},false)
        Inventory.openContainerInventory(Board.entityAt(container.x,container.y));
        Inventory.displayedInventorySlots = selectedSlots
        console.log(selectedSlots)
        
        
        //GameMaster.postPlayerAction();
    }


    static sellItem(slot,postPlayerAction = true){
        let item = Player.inventory.items[slot];
        Player.inventory.items[slot] = false;
        let value = LootManager.getValue(item)
        Player.changeGold(value);
        Player.inventoryCleanup();
        Log.addMessage("sold "+item.name+" for "+value+" gold.")
        XP.gainSellXP(value)
        if(postPlayerAction){
            GameMaster.postPlayerAction()
        }
    }

  
}