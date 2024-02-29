class Shop{
    constructor(){
        this.inventory = [];
        this.essentials = [];
        this.stockInventory();
    }

    getInventory(){
        let inventory = [];
        this.inventory.forEach((item)=>{
            if(item && !item.purchased){
                inventory.push(item);
            }
        })
        
        return inventory;
    }

    inventoryCleanup(){
        let newInventory = [];
        let slot = 0;
        this.inventory.forEach((item) =>{
            if(item){
                newInventory.push(item);
                item.slot = slot;
                slot++;
            }
        })
        this.inventory = newInventory;
    }

    stockInventory(){
        let tiers = [0,0,3,4,4];
        let slot = 0;
        let unallowed = ['stone','bone','lead','silver','gold','adamantine','lightsteel','ironwood','crystal','glass','rubber'];
        tiers.forEach((tier)=>{
            let priceMultiplier = LootManager.roll(1,4) + tier;
            let item = LootManager.getWeaponLoot(tier);
            
            while(!this.itemAllowed(item,unallowed)){
                item = LootManager.getWeaponLoot(tier);                
            }
            
            item.price = Math.max(item.value,1) * priceMultiplier;
            item.slot = slot;
            item.tier = tier;
            this.inventory.push(item);
            slot++;
        })

        let fuel = this.getFuel();
        fuel.slot = slot;
        this.inventory.push(fuel);
        slot++;
    }

    itemAllowed(item,unallowed){
        
        let name = item.name;
        let result = true;
        unallowed.forEach((value)=>{
            if (name.includes(value)){
                result = false;
            }
        })
        

        return result;
    }

    restockInventory(){
        let unallowed = ['stone','bone','lead','silver','gold','crystal','glass','rubber'];
        this.inventory.forEach((item)=>{
            let slot = item.slot;
            if(item.tier == 'fuel'){
                let fuel = this.getFuel();
                fuel.slot = slot;
                fuel.fresh = true;
                this.inventory[slot] = fuel;
            }else{
                let restockChance = Math.max(50-(item.tier*8),10);
                let random = LootManager.roll(1,99);
                if(random < restockChance || item.purchased){
                    let newItem = LootManager.getWeaponLoot(item.tier);
                    while(!this.itemAllowed(newItem,unallowed)){
                        newItem = LootManager.getWeaponLoot(item.tier);                
                    }
                    let priceMultiplier = LootManager.roll(1,4) + item.tier;
                    newItem.price = Math.max(newItem.value,1) * priceMultiplier;
                    newItem.slot = slot;
                    newItem.fresh = true;
                    newItem.tier = item.tier;
                    this.inventory[slot] = newItem;
                }
            }
            if(item.fresh){
                item.fresh = false;
            }
        })
    }

    getFuel(){
        let fuel = JSON.parse(JSON.stringify(itemVars.fuel.oilFlask));
        let priceMultiplier = LootManager.roll(2,4);
        fuel.price = Math.max(fuel.value,1) * priceMultiplier;
        fuel.tier = 'fuel';

        return fuel;
    }

    buyItem(slot){
        let item = this.inventory[slot];
        if (item.price > Player.gold){
            return false;
        }
        Player.gold -= item.price;
        if(slot != -1){
            this.inventory[slot] = {purchased:true,tier:item.tier};
        }
        item.fresh = false;
        Player.inventory.push(item);
        Player.inventoryCleanup();
        this.inventoryCleanup();
    }

    sellItem(slot){
        let item = Player.inventory[slot];
        Player.inventory[slot] = false;
        Player.gold += item.value;
        Player.inventoryCleanup();
    }

}