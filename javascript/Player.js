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
        stamina:{},
        hp:{},
        hunger:{},
        bulk:{},
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
        counterattack:{},
        sell:{},
        goblinoid:{},
        beast:{},
        undead:{},
        ooze:{},
        dark:{},
        fuel:{},
        durability:{},
        potions:{}
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
        console.log(JSON.parse(JSON.stringify(XP.skills)))
        console.log(XP.offeredPerks)
        let healthChange = Player.nourishmentLevel;
        let oldHealth = Player.health;
        if(healthChange + oldHealth > Player.healthMax){
            let excess = (healthChange + oldHealth) - Player.healthMax
            healthChange -= excess
        }
        let newHealth = oldHealth+healthChange
        if(Player.perks.hp.vitality){
            let vitalityAmount = Player.perks.hp.vitality.val * Player.perks.hp.vitality.amount;
            healthChange = Math.min(vitalityAmount,Player.healthMax-oldHealth);
        }
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
        if(Player.perks.hp.vitality){
            Player.changeHealth(Player.perks.hp.vitality.val * Player.perks.hp.vitality.amount);
        }

        let luck = Math.floor(Math.random()*2)
        Player.changeLuck(luck);

        Player.changeNourishment(-3);

        Player.setExertion(0);

        

        XP.checkLevelUp();

    }


    static gainStamina(){
        let stamina = 2;
        if(Player.perks.stamina.aerobics){
            stamina++;
        }
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
        if(Player.perks.potions.potionsExpert && item.unlabeled){
            while(item.unlabeled){item = LootManager.getPotionLoot(item.tier)}
            Log.addMessage("It's a "+item.name+"!")
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
        XP.gainFuelXP(1);
        Player.light += fuel.light;
        let kindler = Player.perks.fuel.kindler
        if(kindler && fuel.light == 1){
            Player.light += kindler.amount * kindler.val
        }
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
        Log.addMessage('You eat the '+item.name+".");
        let rotten = item.rotten || (Math.random() < item.rottenMultiplier * .2);
        let ironGut = Player.perks.hunger.ironGut
        if(rotten && ironGut){
            Player.changeNourishment(item.food);
            Player.changeLuck(ironGut.val * ironGut.amount);
            Display.flash($('body'),'darkGreen');
            Log.addMessage("It's rotten!",'win','rotten','Yum!')
            if(!item.rotten){LootManager.applyModifier(item, itemVars.foodModifiers.rotten)}
        }else if(rotten){
            Player.changeNourishment(item.food*-1);
            Log.addMessage("It's rotten!",'danger','rotten','This food item reduced your hunger level by 1 instead of increasing it.')
            Display.flash($('body'),'darkGreen');
            if(!item.rotten){LootManager.applyModifier(item, itemVars.foodModifiers.rotten)}
        }else{
            Player.changeNourishment(item.food);
        }
        
        //it is no longer in a quantum state
        item.rottenMultiplier = 0;
        
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
        let consumePotion = true;
        let littleSips = Player.perks.potions.littleSips
        if(littleSips){
            let consumeChance = (Math.pow(littleSips.amount,littleSips.val))
            consumePotion = Math.random() < consumeChance;
        }
        if(consumePotion){
            Player.consume(slot);
        }else{
            Log.addMessage("Such a tiny sip!",'pos',false,"You took such a tiny sip that the potion was not consumed.")
        }
        XP.gainPotionsXP(60);
        Display.fillBars();

        return true;
    }

    static consume(slot){
        let item = Player.inventory.items[slot];
        if(item.uses > 1){
            LootManager.expendUse(item);
        }else{
            if(Player.itemIsEquipped(item)){Player.unequipWeapon(slot)}
            Player.inventory.items[slot] = false;
        }

        Player.inventoryCleanup();
        return true;
    }

    static getBulk(){
        let bulkSum = 0;
        Player.inventory.items.forEach(item=>{
            if(Player.itemIsEquipped(item)){return}
            bulkSum += LootManager.getItemBulk(item);
        })
        //console.log(bulkSum);

        return bulkSum;
    }

    static lightDown(){
        if(Player.light < 1){
            XP.gainDarkXP(0.2)
            return false;
        }else if(Player.light < 2){
            XP.gainDarkXP(0.1)
        }
        Player.lightTime += Player.light;
        let random = Math.random()*1500;
        if (random < Player.lightTime-150){
            Player.light--;
            Player.lightTime -= 200;
            Player.lightTime = Math.max(Player.lightTime,0)
            Log.addMessage('Your light dims.');
            if(Player.light <= 0){
                XP.gainDarkXP(3)
            }
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
        let proficiencies = Player.getProficiencies(weaponItem);
        if(!proficiencies){return 0}
        let advantage = 0;
        proficiencies.forEach(skill=>{
            advantage += skill.level;
        })

        return advantage;
    }

    //returns an array of all the types of the weapon you have advantage in - {skill: , level: }
    static getProficiencies(weaponItem){
        let weaponTypes = weaponItem.type;  
        if(!weaponTypes){return false;}
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

    static getCritChance(weaponItem, strikeType, target){
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
        if(Player.perks.hunger.hangry && Player.hungerPercent <= 50){
            let pointsMissing = Player.nourishmentMax - Player.nourishment;
            pointsMissing *= Player.perks.hunger.hangry.val
            critChance += pointsMissing/10;
        }

        return critChance
    }

    static getCrit(weaponItem, strikeType,target){
        let crits = 0;
        let critChance = Player.getCritChance(weaponItem, strikeType, target);

        crits += Math.random() < critChance;

        if(target.stunned){crits++; console.log('stunned')}

        console.log(Player.perks)
        console.log(Player.stamina)
        if(Player.perks.stamina.finalPush && Player.stamina <= 0){crits++; console.log('LAST PUSH')}
        
        console.log(crits);
        return crits;
    }

    static getDamageMultiplier(weaponItem, strikeType, target, crit){
        let multiplier = 1;
        let burningFury = Player.perks.fuel.burningFury
        if(burningFury && crit){
            multiplier += burningFury.val * burningFury.amount * Player.light
        }

        return multiplier
    }

    static getBonusStun(weapon,entity){
        let bonus = 0;
        bonus += Player.getAnatomyBonus(entity);
        bonus += Player.getItemBonusStun(weapon);
        return bonus;
    }

    static getAnatomyBonus(entity){
        if(!entity.types){
            return 0;
        }
        let enemyTypes = Object.keys(entity.types);
        let bonus = 0;
        enemyTypes.forEach(type=>{
            if(Player.perks[type] && Player.perks[type].anatomy){
                bonus += Player.perks[type].anatomy.val * 2
            }
        })

        return bonus
    }

    static getItemBonusStun(item){
        if(!item){
            return false;
        }
        let bonus = 0;
        if(item.type.blunt && Player.perks.blunt.concussiveBlows){
            let percent = Player.perks.blunt.concussiveBlows.val * Player.perks.blunt.concussiveBlows.amount;
            bonus += item.damage * percent
            bonus = Math.floor(bonus);

        }

        return bonus
    }

    static getItemBonusStunSpanWithSpecial(item,special){
        return {
            normal:Player.getItemBonusStunSpan(item),
            special:Player.getItemBonusStunSpan(special)
        }
    }

    static getItemBonusStunSpan(item){
        if(!item){
            return false;
        }
        let bonus = Player.getItemBonusStun(item);

        if(bonus){
            let span = $('<span>').addClass('bonus-span').text('+'+bonus)
            return span
        }else{
            return $('<span>')
        }
    }

    static getItemBonusDamage(attack, item = false){
        if(!item){item = attack}
        if(!attack){return 0}
        let bonus = 0;
        if(attack.type.edged && Player.perks.edged.cuttingEdge && !item.worn){
            bonus += Player.perks.edged.cuttingEdge.val * Player.perks.edged.cuttingEdge.amount
        }
        let disposableBlows = Player.perks.durability.disposableBlows
        if(disposableBlows && item.flimsy){
            console.log('disposableblows')
            bonus += item.flimsy * disposableBlows.val * disposableBlows.amount
        }

        return Math.floor(bonus)
    }

    static getItemBonusDamageSpanWithSpecial(item,special){
        return {
            normal:Player.getItemBonusDamageSpan(item),
            special:Player.getItemBonusDamageSpan(special, item)
        }
    }

    static getItemBonusDamageSpan(attack, item = false){
        if(!attack){return false}
        let bonus = Player.getItemBonusDamage(attack, item);

        if(bonus){
            let span = $('<span>').addClass('bonus-span').text('+'+bonus)
            return span
        }else{
            return $('<span>')
        }
    }

    static getDegradeChanceModifier(item){
        let modifier = 0;
        let flimsy = item.flimsy;
        if(!flimsy){
            flimsy = 0;
        }
        let properCare = Player.perks.durability.properCare;
        if(properCare && Player.getAdvantage(item)){
            let properCareMultiplier = properCare.val * properCare.amount;
            let properCareModifier = Math.floor(item.flimsy * properCareMultiplier);
            properCareModifier = Math.max(properCareModifier,1 * properCare.val)
            modifier -= properCareModifier;
        }

        return modifier;
    }

    static getDegradeModifierSpan(item){
        let modifier = Player.getDegradeChanceModifier(item);
        if(!modifier){return ""}
        let spanClass = modifier > 0 ? "debuff-span" : "bonus-span";
        let symbol = modifier > 0 ? "+" : "-";
        let abs = Math.abs(modifier)

        return $('<span>').addClass(spanClass).text(symbol+abs+'%')
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
            case "bulk capacity":
                return Player.maxBulk;
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
            let perkCategory = Player.perks[key];
            Object.keys(perkCategory).forEach(perkKey=>{
                let perk = perkCategory[perkKey]
                if(perkKey == 'advantage'){
                    let dummyItem = {type:{}}
                    dummyItem.type[key] = perk;
                    let proficiencySpan = Display.getProficiencySpan(dummyItem)
                    let perkDiv = $('<div>').text(key).append(proficiencySpan).addClass('perk-divs')
                    let hintText = "You have proficiency "+perk+" with "+key+" weapons. Damage with those weapons is rerolled "+perk+" times, with the highest roll used."
                    Display.setHintText(perkDiv,hintText)
                    element.append(
                        perkDiv
                    )
                }else if(perkKey == 'critChance'){
                    let critChance = perk;
                    if(!critChance){critChance = 0}
                    critChance *= 100;
                    critChance = Number.parseFloat(critChance).toFixed(0);
                    critChance += "%";
                    let hintText = "You have a "+critChance+" critical hit chance on "+key+" attacks."
                    let perkDiv = $('<div>').text(critChance + " " + key+ " Crit").addClass('perk-divs')
                    Display.setHintText(perkDiv, hintText);
                    element.append(
                        perkDiv
                    )
                }else{
                    let perkDiv = $('<div>').text(perk.name).addClass('perk-divs');
                    let description = perk.description
                    if(perk.val > 1){
                        perkDiv.append(" X"+perk.val)
                        description +=" (x"+perk.val+")"
                    }
                    Display.setHintText(perkDiv, description)
                    element.append(perkDiv) 
                }
            })
            
         
        })

    }

    static itemIsEquipped(item){
        return Player.equipped && Player.equipped.slot == item.slot;
    }

    

}