class Player {
    static staminaMax = 10;
    static stamina;

    static healthMax = 10;
    static health;

    static luckMax = 10;
    static luck;

    static nourishmentMax = 10;
    static nourishment;

    static light = 0;
    static lightMax = 8;
    static lightTime = 0;
        
    static inventorySlots = 10;
    static inventory = [
        {
            usable:true,
            name: "oil flask",
            fuel:true,
            light:2,
            uses:3
        }
    ];
    static gold = 15;
    static equipped = false;

    static playerInit(){
        Player.stamina = Player.staminaMax;
        Player.health = Player.healthMax
        Player.luck = Player.luckMax
        Player.nourishment = Player.nourishmentMax
        Player.inventoryCleanup();
    }

    static getPlayerJson(){
        return{
            stamina:Player.stamina,
            health:Player.health,
            luck:Player.luck,
            nourishment:Player.nourishment,
            light:Player.light,
            lightTime:Player.lightTime,
            inventory:Player.inventory,
            gold:Player.gold,
            equipped:Player.equipped
        }
    }

    static get staminaPercent(){
        return Math.floor((Player.stamina/Player.staminaMax)*100);
    }

    static get healthPercent(){
        return Math.floor((Player.health/Player.healthMax)*100);
    }

    static get luckPercent(){
        return Math.floor((Player.luck/Player.luckMax)*100);

    }

    static get nourishmentLevel(){
        let level;
        let nourishment = Player.nourishment;
        if(nourishment == 0){
            level = 0;
        }else if(nourishment < 4){
            level = 1;
        }else if (nourishment == 10){
            level = 3;
        }else{
            level = 2;
        }

        return level;
    }

    static rest(){
        let health = Player.nourishmentLevel-1;
        Player.changeHealth(health);

        let luck = Math.floor(Math.random()*2)
        Player.changeLuck(luck);

        Player.changeNourishment(-5);

        console.log(Player.nourishment);
        console.log(Player.nourishmentLevel);
    }


    static gainStamina(){
        let stamina;
        if(Player.nourishment < 4){
            stamina = 1;
        }else{
            stamina = 2;
        }
        let random = Math.random()*100;
        if(Player.nourishment == 0 && random < 50){
            stamina--;
        }
        if(Player.nourishment ==10 && random < 50){
            stamina++;
        }

        Player.changeStamina(stamina);
    }

    static changeStamina(n){
        Player.stamina = Math.max(0,Player.stamina)
        Player.stamina = Player.stamina+n;
        Player.stamina = Math.min(Player.staminaMax,Player.stamina);
    }

    static changeHealth(n){
        Player.health = Player.health+n;
        Player.health = Math.min(Player.healthMax,Player.health);
        Player.health = Math.max(0,Player.health)
    }

    static changeLuck(n){
        Player.luck = Player.luck+n;
        Player.luck = Math.min(Player.luckMax,Player.luck);
        Player.luck = Math.max(0,Player.luck)
    }

    static changeNourishment(n){
        Player.nourishment = Player.nourishment+n;
        if(Player.nourishment > Player.nourishmentMax){
            Player.changeLuck(1);
        }
        Player.nourishment = Math.min(Player.nourishmentMax,Player.nourishment);
        Player.nourishment = Math.max(0,Player.nourishment)
    }


    static setPlayerInfo(playerInfo){
        for (const [key, value] of Object.entries(playerInfo)) {
            Player[key] = value;
          }
    }

    static reset(){
        Player.staminaMax = 10;
        Player.stamina = Player.staminaMax;

        Player.healthMax = 10;
        Player.health = Player.healthMax;
    }

    static useItem(item){
        if(!item){
            return false;
        }
        if(item.fuel){
            Player.addFuel(item);
            return true;
        }else if(item.weapon && Player.equipped.slot == item.slot){
           Player.unequipWeapon();
           return true;
        }else if(item.weapon && !Player.equipped){
            Player.equipWeapon(item);
            return true;
        }

        return false;
    }

    static equipWeapon(weapon){
        if(Player.equipped){
            return;
        }
        Player.equipped = weapon
        EntityManager.equipWeapon(weapon);
    }

    static unequipWeapon(){
        if (!Player.equipped){
            return;
        }
        Player.equipped = false;
        EntityManager.unequipWeapon();
    }

    static addFuel(fuel){
        let slot = fuel.slot;
        Player.light += fuel.light;
        Player.light = Math.min(Player.lightMax, Player.light);
        Player.lightTime = 0;

        Player.consume(slot);
    }

    static consume(slot){
        let item = Player.inventory[slot];
        if(item.uses > 1){
            item.uses--;
        }else{
            Player.inventory[slot] = false;
        }
    }

    static lightDown(){
        if(Player.light < 1){
            return false;
        }
        Player.lightTime += Player.light;
        let random = Math.random()*1500;
        if (random < Player.lightTime-150){
            Player.light--;
            Player.lightTime = 0;
            Log.addMessage('Your light dims...');
        }
    }

    static inventoryCleanup(){
        let newInventory = [];
        let slot = 0;
        Player.inventory.forEach((item) =>{
            if(item){
                newInventory.push(item);
                item.slot = slot;
                slot++;
            }
        })
        Player.inventory = newInventory;
    }

    static dropItem(slot){
        if(!Player.inventory[slot]){
            return false;
        }
        if(Player.equipped.slot == slot){
            Player.unequipWeapon();
        }
        let playerEntity = EntityManager.getEntity('player');
        EntityManager.dropItem(Player.inventory[slot],playerEntity.x,playerEntity.y);
        Player.inventory[slot] = false;
    }

}