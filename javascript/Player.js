class Player {
    static staminaMax = 10;
    static stamina;

    static healthMax = 10;
    static health;

    static luckMax = 10;
    static luck;

    static nourishmentMax = 10;
    static nourishment;

    static exertion = 0;

    static light = 0;
    static lightMax = 8;
    static lightTime = 0;
        
    
    static inventory = {
        slots: 10,
        items:[
            JSON.parse(JSON.stringify(itemVars.fuel.oilFlask)),
        ]
    }

    static gold = 0;
    //points to equipped object
    static equipped = false;

    static playerInit(){
        Player.stamina = Player.staminaMax;
        Player.health = Player.healthMax
        Player.luck = Player.luckMax
        //Player.nourishment = Math.floor(Player.nourishmentMax/2)
        Player.nourishment = 7;
        Player.inventoryCleanup();
    }

    static getPlayerJson(){
        return JSON.parse(JSON.stringify({
            stamina:Player.stamina,
            health:Player.health,
            luck:Player.luck,
            nourishment:Player.nourishment,
            light:Player.light,
            lightTime:Player.lightTime,
            inventory:Player.inventory,
            gold:Player.gold,
            equipped:Player.equipped
        }))
            
        
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

    static get hungerPercent(){
        return Math.floor((Player.nourishment/Player.nourishmentMax)*100)
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

    static getRestInfo(){
        let healthChange = Player.nourishmentLevel;
        let oldHealth = Player.health;
        let newHealth = Math.min(oldHealth+healthChange,Player.healthMax)

        let nourishmentChange = (newHealth - oldHealth)*-1;
        nourishmentChange -=3;

        if((nourishmentChange*-1) > Player.nourishment){
            healthChange += (Player.nourishment + nourishmentChange)
        }

        let exertionChange = Player.exertion*-1

        if((Player.health+healthChange) > Player.healthMax){
            healthChange = Player.healthMax - Player.health;
        }

        if((Player.health + healthChange) < 0){
            healthChange = Player.health*-1;
        }

        if((Player.nourishment + nourishmentChange) < 0){
            nourishmentChange = Player.nourishment*-1;
        }

        return{
            healthChange:healthChange,
            nourishmentChange:nourishmentChange,
            exertionChange:exertionChange
        }
    }

    static rest(){
        let health = Player.nourishmentLevel;
        let oldHealth = Player.health;
        Player.changeHealth(health);
        Player.changeNourishment((Player.health-oldHealth)*-1);

        let luck = Math.floor(Math.random()*2)
        Player.changeLuck(luck);

        Player.changeNourishment(-3);

        Player.setExertion(0);

        console.log(Player.nourishment);
        console.log(Player.nourishmentLevel);
    }


    static gainStamina(){
        let stamina = 2;
        if(Player.exertion){
            stamina--;
        }
        Player.changeStamina(stamina);
    }

    static checkHungerModifiers(){
        let stamina = 0;
        let random = Math.random()*100;
        let gainChance = (Player.nourishment - 8)*5;
        let loseChance = (4 - Player.nourishment)*8;

        if (random < gainChance){
            if(Player.stamina < Player.staminaMax){
                Log.addMessage('Your full stomach lends you strength.', 'pos',false,"You have a chance to gain stamina each turn.");
                stamina++;
            }
        }else if(random < loseChance){
            stamina--;
            Log.addMessage('Your hunger weakens you...', 'danger',false,"You have a chance to lose stamina each turn. Refill your hunger bar to end this effect.");
        }

        Player.changeStamina(stamina);
    }

    static changeStamina(n){
        let oldStamina = Player.stamina;

        Player.stamina = Math.max(0,Player.stamina)
        Player.stamina = Player.stamina+n;
        Player.stamina = Math.max(0,Player.stamina)
        Player.stamina = Math.min(Player.staminaMax,Player.stamina);

        let hungerChance = (Player.stamina - oldStamina)*2;
        Player.checkChangeNourishment(hungerChance);
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

    static changeExertion(n){
        n += Player.exertion;
        Player.setExertion(n);
        
    }

    static setExertion(n){
        Player.exertion = n;
        Player.exertion = Math.min(Player.exertion, 2);
        Player.exertion = Math.max(Player.exertion, 0);
    }

    static changeNourishment(n){
        Player.nourishment = Player.nourishment+n;
        /*
        if(Player.nourishment > Player.nourishmentMax){
            Player.changeLuck(1);
        }
        */
        if(Player.nourishment < 0){
            Player.changeHealth((Player.nourishment));
            Log.addMessage('You are starving.', 'urgent');
        }
        Player.nourishment = Math.min(Player.nourishmentMax,Player.nourishment);
        Player.nourishment = Math.max(0,Player.nourishment)
        Display.fillBars();
    }

    static setNourishment(n){
        Player.nourishment = n;
    }


    static setPlayerInfo(playerInfo){
        for (const [key, value] of Object.entries(playerInfo)) {
            Player[key] = value;
        }
        
    }

    static checkChangeNourishment(hungerChance){
        let random = Math.random()*100;
        console.log((Player.hungerPercent/150)+.66);
        hungerChance *= (Player.hungerPercent/150)+.66
        console.log(hungerChance);
        if(random < hungerChance){
            Player.changeNourishment(-1);
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
        
        if(item.weapon && Player.equipped && Player.equipped.slot == item.slot){
           return Player.unequipWeapon();
        }else if(item.weapon && !Player.equipped){
            return Player.equipWeapon(item);
        }else if(item.fuel){
            return Player.addFuel(item);
        }else if(item.food){
            return Player.eatItem(item);
        }else if (item.potable){
            return Player.drinkItem(item);
        }
        return false;
    }

    static pickUpItem(item){
        Player.inventory.items.push(item);
        Player.inventoryCleanup();
    }

    static equipWeapon(weapon, verbose=true){
        if(Player.equipped){
            return false;
        }
        Player.equipped = weapon;
        EntityManager.equipWeapon('player', weapon, verbose);
        return true;
    }

    static updateEquippedEntityReference(){
        let slot = Player.equipped.slot;
        let weaponEntity = EntityManager.playerEntity.swordEntity;
        let equippedItem = Player.inventory.items[slot];
        console.log(weaponEntity);
        weaponEntity.equip(equippedItem);
    }

    static unequipWeapon(){
        if (!Player.equipped){
            return false;
        }
        Player.equipped = false;
        EntityManager.unequipWeapon('player');
        return true;
    }

    static addFuel(fuel, consume=true){
        let slot = fuel.slot;
        let previousLight = Player.light;
        Player.light += fuel.light;
        Player.light = Math.min(Player.lightMax, Player.light);
        Player.light = Math.max(Player.light,0);
        if(fuel.paper){
            Player.lightTime += 400;
        }else{
            Player.lightTime -= 200;
            Player.lightTime = Math.max(Player.lightTime,0);
        }

        if(!consume){
            return false;
        }
        Log.addMessage('you feed '+fuel.name+' into your lantern.')

        if(!previousLight){
            if(fuel.light > 1){
                Log.addMessage('your lantern roars to life.')
            }else if (fuel.light > 0){
                Log.addMessage('your lantern comes alive')
            }
        }

        if(!Player.lightTime){
            Log.addMessage('the burn is steady.')
        }

        if(Player.lightTime > 95){
            Log.addMessage('the fuel is burning fast.')
        }
        

        if(consume){
            return Player.consume(slot);
        }
    }

    static eatItem(item){
        let slot = item.slot;
        Player.changeNourishment(item.food);
        Log.addMessage('You eat the '+item.name+".");
        Player.consume(slot);

        return true;
    }

    static drinkItem(item){
        let slot = item.slot;

        Log.addMessage('You drink the '+item.name+".");
        while(item.unlabeled){
            item = LootManager.getPotionLoot(item.tier);
        }
        if(item.stamina){
            Player.changeStamina(item.stamina);
        }
        if(item.health){
            Player.changeHealth(item.health);
        }
        if(item.luck){
            Player.changeLuck(item.luck);
        }
        if(item.hunger){
            Player.changeNourishment(item.hunger);
        }
        if(item.light){
            Player.addFuel(item,false);
        }
        if(item.message){
            Log.addMessage(item.message,false,false,item.tip);
        }
        Player.consume(slot);

        return true;
    }

    static consume(slot){
        let item = Player.inventory.items[slot];
        if(item.uses > 1){
            LootManager.expendUse(item);
        }else{
            Player.inventory.items[slot] = false;
        }

        Player.inventoryCleanup();
        return true;
    }

    static lightDown(){
        if(Player.light < 1){
            return false;
        }
        Player.lightTime += Player.light;
        let random = Math.random()*1500;
        if (random < Player.lightTime-150){
            Player.light--;
            console.log(Player.lightTime);
            Player.lightTime -= 200;
            Player.lightTime = Math.max(Player.lightTime,0)
            Log.addMessage('Your light dims.');
        }

        if(random < Player.lightTime-100){
            Log.addMessage('your light flickers...',false,['flickers'])
        }
    }

    
    static inventoryCleanup(){
        let newInventory = [];

        while(Player.inventory.items.length > 0){
            newInventory.push(Player.inventory.items.pop())
        }
        let slot = 0;

        while(newInventory.length > 0){
            let item = newInventory.pop();
            if(item){
                Player.inventory.items.push(item);
                item.slot = slot;
                slot++;
            }

        }

    }

    static dropItem(slot){
        if(!Player.inventory.items[slot]){
            return false;
        }
        if(Player.equipped && Player.equipped.slot == slot){
            Player.unequipWeapon();
        }
        let playerEntity = EntityManager.getEntity('player');
        playerEntity.dropItem(slot);
    }

}