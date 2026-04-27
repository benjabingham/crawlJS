class Player {
    static staminaMax = 10;
    static stamina;

    static healthMax = 10;
    static health;

    static luckMax = 10;
    static luck;

    static nourishmentMax = 10;
    static nourishment;

    static maxBulk = 10;

    static exertion = 0;

    static light = 0;
    static lightMax = 8;
    static lightTime = 0;

    static perks ={
        sword:{},
        axe:{},
        blunt:{},
        long: {},
        edged:{},
        improvised:{},
        simple:{},
        unarmed:{},
        swing:{},
        strafe:{},
        jab:{},
        draw:{},
        counterattack:{}
    }
        
    
    static inventory = {
        slots: 10,
        items:[
        ]
    }

    static gold = 0;
    //points to equipped object
    static equipped = false;
    static level=1;

    static playerInit(){
        Player.stamina = Player.staminaMax;
        Player.health = Player.healthMax
        Player.luck = Player.luckMax
        //Player.nourishment = Math.floor(Player.nourishmentMax/2)
        Player.nourishment = 7;
        Player.inventoryCleanup();
        XP.XPInit();
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
        let hungerPercent = Player.hungerPercent;
        if(hungerPercent == 0){
            level = 0;
        }else if(hungerPercent < 40){
            level = 1;
        }else if (hungerPercent == 100){
            level = 3;
        }else{
            level = 2;
        }

        return level;
    }

    static getRestInfo(){
        let healthChange = Player.nourishmentLevel;
        let oldHealth = Player.health;
        if(healthChange + oldHealth > Player.healthMax){
            let excess = (healthChange + oldHealth) - Player.healthMax
            healthChange -= excess
        }
        let newHealth = oldHealth+healthChange

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

        XP.checkLevelUp();

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
        //gaining uses percentage, losing uses flat value.
        let gainChance = (Player.hungerPercent - 80)/2;
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

        if(n < 0){
            XP.gainStaminaXP(n*-1);
        }
    }

    static changeHealth(n){
        Player.health = Player.health+n;
        Player.health = Math.min(Player.healthMax,Player.health);
        Player.health = Math.max(0,Player.health)

        if(n < 0){
            XP.gainHPXP(n*-1);
            Display.flash($('body'),'deepRed');
            Display.flash($('#health-level'),'lightRed');
        }
    }

    static changeLuck(n){
        console.log("changeluck "+n)
        Player.luck = Player.luck+n;
        Player.luck = Math.min(Player.luckMax,Player.luck);
        Player.luck = Math.max(0,Player.luck)

        if(n < 0){
            //this happens in history instead.
            //XP.gainLuckXP(n*-1);
        }
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
            Log.addMessage('You are starving! ' + Player.nourishment +" health!", 'urgent');
        }
        Player.nourishment = Math.min(Player.nourishmentMax,Player.nourishment);
        Player.nourishment = Math.max(0,Player.nourishment)
        Display.fillBars();

        if(n < 0){
            XP.gainHungerXP(n*-1);
        }
    }

    static setNourishment(n){
        Player.nourishment = n;
    }


    static setPlayerInfo(playerInfo){
        for (const [key, value] of Object.entries(playerInfo)) {
            Player[key] = value;
        }
        
    }

    static checkChangeNourishment(hungerChance = 0.25){
        let random = Math.random()*100;
        hungerChance *= (Player.hungerPercent/150)+.66
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
        console.log('useItem')
        console.log(item);
        if(!item){
            return false;
        }

        let dungeonMode = GameMaster.dungeonMode;
        
        if(dungeonMode && item.weapon && Player.equipped && Player.equipped.slot == item.slot){
           return Player.unequipWeapon();
        }else if(dungeonMode && item.weapon && !Player.equipped){
            return Player.equipWeapon(item);
        }else if(dungeonMode && item.fuel){
            return Player.addFuel(item);
        }else if(item.food){
            return Player.eatItem(item);
        }else if (item.potable){
            return Player.drinkItem(item);
        }else if(!dungeonMode){
            let result = Shop.sellItem(item.slot);
            Inventory.displayInventory();
            return result;
        }else if(!Player.equipped){
            return Player.equipWeapon(item);
        }
        return false;
    }

    static pickUpItem(item){
        let quickSlot = true;
        let nQuickSlots = Inventory.nQuickSlots;
        //if item N exists and is quickslotted, new item is not quickslotted. Otherwise it is.
        if(Player.inventory.items[nQuickSlots-1] && Player.inventory.items[nQuickSlots-1].quickSlot){
            quickSlot = false;
        }
        item.quickSlot = quickSlot
        Player.inventory.items.push(item);
        Player.inventoryCleanup();
    }

    static equipWeapon(weapon, verbose=true){
        if(Player.equipped || !GameMaster.dungeonMode){
            return false;
        }
        Player.equipped = weapon;
        if(!weapon.quickSlot){
            Inventory.swapSlot(0,weapon);
        }
        if(weapon.weapon){
            EntityManager.equipWeapon('player', weapon, verbose);
        }else{
            Log.addMessage('Equipped item: '+weapon.name)
        }
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
        let weapon = Player.equipped;
        Player.equipped = false;
        if(weapon.weapon){
            EntityManager.unequipWeapon('player');
        }
        return true;
    }

    static addFuel(fuel, consume=true){
        if(!fuel.light){return false}
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
        if(!item.food){return false}
        if(Player.itemIsEquipped(item)){Player.unequipWeapon()}
        let slot = item.slot;
        Player.changeNourishment(item.food);
        Log.addMessage('You eat the '+item.name+".");
        Player.consume(slot);

        return true;
    }

    static drinkItem(item){
        let slot = item.slot;
        if(!item.potable){return false}
        if(Player.itemIsEquipped(item)){Player.unequipWeapon()}

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

        Display.fillBars();

        return true;
    }

    static consume(slot){
        let item = Player.inventory.items[slot];
        if(item.uses > 1){
            LootManager.expendUse(item);
        }else{
            Player.unequipWeapon(slot);
            Player.inventory.items[slot] = false;
        }

        Player.inventoryCleanup();
        return true;
    }

    static getBulk(){
        let bulkSum = 0;
        Player.inventory.items.forEach(item=>{
            if(Player.itemIsEquipped(item)){return}
            let bulk = 0
            if(item.bulk){bulk = item.bulk}
            
            //if(item.quickSlot){bulk /=2}

            bulk*= 10
            bulk = Math.floor(bulk)
            bulk /= 10;
            bulkSum += bulk;
        })
        //console.log(bulkSum);

        return bulkSum;
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
        let quickSlots = [];
        let newInventory = [];

        while(Player.inventory.items.length > 0){
            let item = Player.inventory.items.shift();
            if(!item){
                continue;
            }
            if(item.quickSlot && quickSlots.length < Inventory.nQuickSlots){
                quickSlots.push(item);
            }else{
                newInventory.push(item)
                item.quickSlot = false;
            }
        }

        newInventory = quickSlots.concat(newInventory);
        let slot = 0;

        while(newInventory.length > 0){
            let item = newInventory.shift();
            if(item){
                Player.inventory.items.push(item);
                item.slot = slot;
                slot++;
            }

        }
        console.log(Player.inventory.items);
    }

    static dropItem(slot){
        if(!Player.inventory.items[slot]){
            return false;
        }
        if(Player.equipped && Player.equipped.slot == slot){
            Player.unequipWeapon();
        }
        Player.inventory.items[slot].quickSlot = false;
        let playerEntity = EntityManager.getEntity('player');
        playerEntity.dropItem(slot);
    }

    static dropBag(){
        console.log('dropbag')
        let slot = 0;
        //find first nonquickslot item
        while(Player.inventory.items[slot] && Player.inventory.items[slot].quickSlot){
            slot++
        }
        //drop everything 
        while(Player.inventory.items[slot]){
            Player.dropItem(slot);
        }
        
    }

    //TODO - make work like crit, so strike types can have advantage too?
    static getAdvantage(weaponItem){
        //console.log(weaponItem);
        let proficiencies = Player.getProficiencies(weaponItem);
        let advantage = 0;
        proficiencies.forEach(skill=>{
            advantage += skill.level;
        })

        return advantage;
    }

    //returns an array of all the types of the weapon you have advantage in - {skill: , level: }
    static getProficiencies(weaponItem){
        let weaponTypes = weaponItem.type;  
        let proficiencies = [];
        //for each perk category...
        Object.keys(Player.perks).forEach(skill =>{
            //if the player has advantage in that category, and the weapon has that category as a type...
            if(weaponTypes && Player.perks[skill].advantage && weaponTypes[skill]){
                proficiencies.push({
                    skill:skill,
                    level: Player.perks[skill].advantage
                })
            }
        })

        return proficiencies;
    }

    static getCrit(weaponItem, strikeType,target){
        let attackTypes = {};
        if(weaponItem.type){
            attackTypes = JSON.parse(JSON.stringify(weaponItem.type));
        }
        attackTypes[strikeType] = true;
        if(target.parryable){
            attackTypes['counterattack'] = true;
        }
        let critChance = 0;
        Object.keys(Player.perks).forEach(skill =>{
            if(Player.perks[skill].critChance && attackTypes[skill]){
                critChance += Player.perks[skill].critChance;
            }
        })
        let isCrit = Math.random() < critChance;
        return isCrit;
    }

    //take hp, luck, stamina, hunger, return associated max value
    static getMaxResource(resourceString){
        switch(resourceString){
            case "hp":
                return Player.healthMax;
            case "stamina":
                return Player.staminaMax;
            case "luck":
                return Player.luckMax;
            case "hunger":
                return Player.nourishmentMax;
            default:
                return 0;
        }
    }

    static getEncumbranceLevel(){
        let level = Math.floor(Player.getBulk()/Player.maxBulk);
        level *= level;
        return level;
    }

    static changeGold(n){
        Player.gold += n;
        Player.gold = Math.max(Player.gold,0)
        Display.flash($('.gold-div'),'goldDivs')
        Display.displayGold()
    }

    static updatePlayerInfo(){
        $('#level-div').text('Level '+Player.level)

        let element = $('#character-perks-div');
        element.html('');

        Object.keys(Player.perks).forEach(key=>{
            let perk = Player.perks[key];
            if(perk.advantage){
                console.log(perk);
                let dummyItem = {type:{}}
                dummyItem.type[key] = perk.advantage;
                let proficiencySpan = Display.getProficiencySpan(dummyItem)
                element.append(
                    $('<div>').text(key).append(proficiencySpan)
                )
            }
            if(perk.critChance){
                let critChance = perk.critChance;
                if(!critChance){critChance = 0}
                critChance *= 100;
                critChance = Number.parseFloat(critChance).toFixed(0);
                critChance += "%";
                element.append(
                    $('<div>').text(key+" - "+critChance)
                )
            }
        })

    }

    static itemIsEquipped(item){
        return Player.equipped && Player.equipped.slot == item.slot;
    }

}