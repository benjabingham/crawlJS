class Shop{

    static get weaponTiers(){
        return GameMaster.currentTown.shop.weaponTiers;
    }

    static get inventory(){
        return GameMaster.currentTown.shop.inventory;
    }

    static get fuelSlots(){
        return GameMaster.currentTown.shop.fuelSlots;
    }

    static get potionSlots(){
        return GameMaster.currentTown.shop.potionSlots;
    }

    static get carriedMaterials(){
        return GameMaster.currentTown.shop.carriedMaterials
    }

    static setInventory(arr){
        GameMaster.currentTown.shop.inventory = arr;
    }

    static shopInit(){
        Shop.stockInventory();
    }

    static getInventory(){
        let inventory = [];
        Shop.inventory.forEach((item)=>{
            if(item && !item.purchased){
                inventory.push(item);
            }
        })
        
        return inventory;
    }

    //I don't think this ever actually does anything...
    //items are never truly removed from the shop, they are just marked as "purchased".
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


    //stock inventory from fresh
    static stockInventory(){
        Shop.setInventory([]);
        let slot = 0;
        Shop.weaponTiers.forEach((tier)=>{
            let priceMultiplier = Random.roll(1,4) + tier;
            let item = LootManager.getWeaponLoot(tier, Shop.carriedMaterials);
            
            item.price = Math.max(item.value,1) * priceMultiplier;
            item.slot = slot;
            item.tier = tier;
            Shop.inventory.push(item);
            slot++;
        })

        for(let i=0; i<Shop.fuelSlots; i++){
            let fuel = Shop.getFuel();
            fuel.slot = slot;
            Shop.inventory.push(fuel);
            slot++;
        }

        /*
        for(let i=0; i<0; i++){
            let supplies = Shop.getSupplies();
            supplies.slot = slot;
            Shop.inventory.push(supplies);
            slot++;
        }
        */

        for(let i=0; i<Shop.potionSlots; i++){
            let potion = Shop.getPotion();
            potion.slot = slot;
            Shop.inventory.push(potion);
            slot++;
        }

        console.log(Shop.carriedMaterials)
        console.log(Shop.inventory);
        
    }

    static restockInventory(){
        this.inventory.forEach((item)=>{
            let slot = item.slot;
            if(item.tier == 'fuel'){
                if(Random.roll(0,2)){
                    let fuel = Shop.getFuel();
                    fuel.slot = slot;
                    fuel.fresh = true;
                    Shop.inventory[slot] = fuel;
                }
            }else if(item.tier == 'potion'){
                if(Random.roll(0,2)){
                    let potion = Shop.getPotion();
                    potion.slot = slot;
                    potion.fresh = true;
                    Shop.inventory[slot] = potion;
                }
            }else if(item.tier == 'supplies'){
                if(Random.roll(0,2)){
                    let supplies = Shop.getSupplies();
                    supplies.slot = slot;
                    supplies.fresh = true;
                    Shop.inventory[slot] = supplies;
                }
            }else{
                let restockChance = Math.max(50-(item.tier*8),10);
                let random = Random.roll(1,99);
                if(random < restockChance){
                    let newItem = LootManager.getWeaponLoot(item.tier, Shop.carriedMaterials);
                    let priceMultiplier = Random.roll(1,4) + item.tier;
                    newItem.price = Math.max(newItem.value,1) * priceMultiplier;
                    newItem.slot = slot;
                    newItem.fresh = true;
                    newItem.tier = item.tier;
                    Shop.inventory[slot] = newItem;
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
        let item = Shop.inventory[slot];
        if (item.price > Player.gold){
            return false;
        }
        Player.gold -= item.price;
        if(slot != -1){
            Shop.inventory[slot] = {purchased:true,tier:item.tier};
        }
        item.fresh = false;
        Player.inventory.items.push(item);
        Player.inventoryCleanup();
        Shop.inventoryCleanup();
    }

    static sellItem(slot){
        let item = Player.inventory.items[slot];
        Player.inventory.items[slot] = false;
        Player.gold += item.value;
        Player.inventoryCleanup();
    }

}