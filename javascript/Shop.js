class ShopManager{

//why did i do this???
    static getInventory(){
        let inventory = [];
        ShopManager.inventory.forEach((item)=>{
            if(item && !item.purchased){
                inventory.push(item);
            }
        })
        
        return inventory;
    }

    //I don't think this ever actually does anything...
    //items are never truly removed from the shop, they are just marked as "purchased".
    /*
    static inventoryCleanup(){
        let newInventory = [];
        let slot = 0;
        Shop.inventory.forEach((item) =>{
            if(item){
                newInventory.push(item);
                item.slot = slot;
                slot++;
            }
        })
        Shop.setInventory(newInventory);
    }
    */


    //stock inventory from fresh
    //called by Save.mapInit()
    static generateShopInventory(mapId, shopId){
        let shopTemplate = mapVars[mapId].shops[shopId]
        let inventory = [];
        let slot = 0;
        shopTemplate.weaponTiers.forEach((tier)=>{
            let priceMultiplier = Random.roll(1,4) + tier;
            let item = LootManager.getWeaponLoot(tier, shopTemplate.carriedMaterials);
            
            item.price = Math.max(item.value,1) * priceMultiplier;
            item.slot = slot;
            item.tier = tier;
            inventory.push(item);
            slot++;
        })

        for(let i=0; i<shopTemplate.fuelSlots; i++){
            let fuel = shopTemplate.getFuel();
            fuel.slot = slot;
            inventory.push(fuel);
            slot++;
        }

        for(let i=0; i<shopTemplate.potionSlots; i++){
            let potion = ShopManager.getPotion();
            potion.slot = slot;
            inventory.push(potion);
            slot++;
        }

        return inventory;        
    }

    static restockShops(mapId){
        let roster = Save.maps[mapId].roster
        roster.forEach((entity)=>{
            if(entity.entityType=='shop'){
                ShopManager.restockShopInventory(mapId,entity.shopId,entity.inventory);
            }
        })
    }

    //pass roster inventory (which is an object, so pass by reference), and update its item array.
    static restockShopInventory(mapId, shopId, inventory){
        let inventoryItems = inventory.items;
        let shopTemplate = mapVars[mapId].shops[shopId]
        inventoryItems.forEach((item)=>{
            let slot = item.slot;
            if(item.tier == 'fuel'){
                if(Random.roll(0,2)){
                    let fuel = ShopManager.getFuel();
                    fuel.slot = slot;
                    fuel.fresh = true;
                    inventoryItems[slot] = fuel;
                }
            }else if(item.tier == 'potion'){
                if(Random.roll(0,2)){
                    let potion = ShopManager.getPotion();
                    potion.slot = slot;
                    potion.fresh = true;
                    inventoryItems[slot] = potion;
                }
            }else if(item.tier == 'supplies'){
                if(Random.roll(0,2)){
                    let supplies = ShopManager.getSupplies();
                    supplies.slot = slot;
                    supplies.fresh = true;
                    inventoryItems[slot] = supplies;
                }
            }else{
                let restockChance = Math.max(50-(item.tier*8),10);
                let random = Random.roll(1,99);
                if(random < restockChance){
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
        let item = JSON.parse(JSON.stringify(ShopManager.inventory[slot]));
        if (item.price > Player.gold){
            Log.addMessage("Too poor!",'danger')
            //Sound.playError();
            GameMaster.postPlayerAction()
            return false;
        }
        Player.changeGold(item.price*-1);
        item.fresh = false;
        Inventory.take(slot,false);
        if(slot != -1){
            ShopManager.inventory.splice(slot,0,{purchased:true,tier:item.tier, weapon:item.weapon})
        }
        Player.inventoryCleanup();
        Inventory.displayInventory();
        Inventory.findValidSelect();
        Log.addMessage("Purchased "+item.name+" for "+item.price+" gold.")
        GameMaster.postPlayerAction()
        return true;
    }

    static sellItem(slot){
        let item = Player.inventory.items[slot];
        Player.inventory.items[slot] = false;
        let value = LootManager.getValue(item)
        Player.changeGold(value);
        Player.inventoryCleanup();
        Log.addMessage("sold "+item.name+" for "+value+" gold.")
        XP.gainSellXP(value)
        GameMaster.postPlayerAction()
    }

}