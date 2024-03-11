class Shop{

    static inventory = [];
    static essentials = [];

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
        Shop.inventory = newInventory;
    }


    static stockInventory(){
        let tiers = [0,0,1,3,4,4];
        let slot = 0;
        let unallowed = ['stone','bone','obsidian','lead','silver','gold','adamantine','lightsteel','ironwood','crystal','glass','rubber'];
        tiers.forEach((tier)=>{
            let priceMultiplier = Random.roll(1,4) + tier;
            let item = LootManager.getWeaponLoot(tier);
            
            while(!Shop.itemAllowed(item,unallowed)){
                item = LootManager.getWeaponLoot(tier);                
            }
            
            item.price = Math.max(item.value,1) * priceMultiplier;
            item.slot = slot;
            item.tier = tier;
            Shop.inventory.push(item);
            slot++;
        })

        let fuel = Shop.getFuel();
        fuel.slot = slot;
        Shop.inventory.push(fuel);
        slot++;
    }

    static itemAllowed(item,unallowed){
        
        let name = item.name;
        let result = true;
        unallowed.forEach((value)=>{
            if (name.includes(value)){
                result = false;
            }
        })
        

        return result;
    }

    static restockInventory(){
        let unallowed = ['stone','bone','obsidian','lead','silver','gold','adamantine','lightsteel','ironwood','crystal','glass','rubber'];
        this.inventory.forEach((item)=>{
            let slot = item.slot;
            if(item.tier == 'fuel'){
                let fuel = Shop.getFuel();
                fuel.slot = slot;
                fuel.fresh = true;
                Shop.inventory[slot] = fuel;
            }else{
                let restockChance = Math.max(50-(item.tier*8),10);
                let random = Random.roll(1,99);
                if(random < restockChance || item.purchased){
                    let newItem = LootManager.getWeaponLoot(item.tier);
                    while(!Shop.itemAllowed(newItem,unallowed)){
                        newItem = LootManager.getWeaponLoot(item.tier);                
                    }
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

    static getFuel(){
        let fuel = JSON.parse(JSON.stringify(itemVars.fuel.oilFlask));
        let priceMultiplier = Random.roll(2,4);
        fuel.price = Math.max(fuel.value,1) * priceMultiplier;
        fuel.tier = 'fuel';

        return fuel;
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