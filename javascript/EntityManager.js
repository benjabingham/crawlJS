class EntityManager{

    static entities = {};
    static entityCounter = 0;
    static translations = [
        {x:0,y:-1},
        {x:1,y:-1},
        {x:1,y:0},
        {x:1,y:1},
        {x:0,y:1},
        {x:-1,y:1},
        {x:-1,y:0},
        {x:-1,y:-1}
    ];
    static history = [];
    static historyLimit = 10;

    static currentMap;
    
    static entityManagerInit(){
        Board.boardInit(this);
    }

    static wipeEntities(){
        EntityManager.entities = {};
        EntityManager.entityCounter = 0;
        EntityManager.history = [];
        EntityManager.historyLimit = 10;
    }

    static playerInit(x=0,y=0){
        EntityManager.entities.player = {
            x:x,
            y:y,
            symbol:"☺",
            id: "player"
        };
        EntityManager.swordInit("player");
    }
    

    static entityInit(symbol, behavior, x=0,y=0, hitDice=1, damage=0, behaviorInfo = {}, name = "", inventorySlots = 10){
        let threshold = Math.max(EntityManager.rollN(hitDice,1,8),1);
        let id = EntityManager.entityCounter;
        if (!name){
            name = id;
        }
        let entity = {
            x : x,
            y: y,
            symbol: symbol,
            behavior: behavior,
            behaviorInfo: behaviorInfo,
            id:id,
            stunned:0,
            mortal:0,
            threshold:threshold,
            damage:damage,
            name:name,
            inventorySlots:inventorySlots
        }
        EntityManager.entityCounter++;
        EntityManager.entities[id] = entity;
    
        return EntityManager.entities[id];
    }

    static swordInit(owner, rotation = 3){
        let sword = EntityManager.entityInit('*', 'sword', -1,-1);
        let id = sword.id;
        sword.owner = owner;
        sword.equipped = Player.equipped;
        sword.rotation = rotation;

        EntityManager.setEntity(id, sword);

        EntityManager.setProperty(owner,'sword', id);

        if(sword.equipped){
            //EntityManager.equipWeapon(Player.equipped);
        }
        
        //EntityManager.switchWeapon('stick');
        EntityManager.placeSword(id);
    
        return id;
    }

    static getSwordSymbol(rotation){
        let symbol = '|'
        if (rotation % 4 == 1){
            symbol = '/';
        }else if (rotation % 4 == 2){
            symbol = '—';
        }else if (rotation % 4 == 3){
            symbol = '\\';
        }
    
        return symbol;
    }

    static placeSword(id){
        let sword = EntityManager.getEntity(id);
        if(!sword.equipped){
            return;
        }
        let ownerId = sword.owner;
        let owner = EntityManager.getEntity(ownerId);
        let swordPosition = {x:sword.x, y:sword.y};

        let rotation = sword.rotation;
        EntityManager.setProperty(id, 'symbol', EntityManager.getSwordSymbol(rotation));
        
        let translation = EntityManager.translations[rotation];
        let x = owner.x + translation.x;
        let y = owner.y + translation.y;
    
        if(Board.isOccupiedSpace(x,y)){
            let target = Board.itemAt(x,y);
            if(target.id != id && target.behavior != 'wall'){
                EntityManager.attack(sword,target);
                if (ownerId == 'player'){
                    
                    let strikeType = EntityManager.getStrikeType(sword);
                    let weight;
                    if(sword[strikeType]){
                        weight = sword[strikeType].weight;
                    }else{
                        weight = sword.weight;
                    }
                    Player.changeStamina(weight * -1);
                    
                }
            }
        }
        //if sword hasn't been placed somewhere else as result of attack...
        if(rotation == sword.rotation && sword.x == swordPosition.x && sword.y == swordPosition.y && sword.equipped){
            EntityManager.setPosition(id,x,y);
        }
        if (Player.stamina < 0){
            EntityManager.cancelAction({insuficientStamina:true});
        }
    }

    static degradeItem(item, modifier = 0, multiplier = 1){
        let degradeChance = (item.flimsy) + modifier;
        let random = (Math.random()*100) * (1/multiplier);
        if(random < degradeChance){
            if(!item.worn){
                LootManager.applyModifier(Player.equipped,itemVars.weaponModifiers.worn);
                LootManager.applyModifier(item,itemVars.weaponModifiers.worn);

                EntityManager.transmitMessage(item.name + ' is showing wear!', 'urgent');
            }else{
                LootManager.breakWeapon(Player.equipped);
                Player.unequipWeapon();
                EntityManager.transmitMessage(item.name + ' has broken!', 'urgent');
                EntityManager.removeEntity(item.id);
            }
        }
    }

    static getStrikeType(sword){
        let owner = sword.owner;
        let ownerPos = EntityManager.getEntity(owner);
        let lastSwordPos = EntityManager.history[EntityManager.history.length-1].entities[sword.id];
        let lastOwnerPos = EntityManager.history[EntityManager.history.length-1].entities[owner];
        if(lastSwordPos.rotation != sword.rotation){
            return "swing";
        }
        if((lastSwordPos.x == ownerPos.x || lastSwordPos.y == ownerPos.y) || (lastOwnerPos.x == ownerPos.x && lastOwnerPos.y == ownerPos.y)){
            return "jab";
        }

        return "strafe";
    }

    static moveEntity(id, x, y){
        let entity = EntityManager.getEntity(id);
        x += entity.x;
        y += entity.y;
    
        if(Board.isSpace(x,y) && Board.isOpenSpace(x,y)){
            EntityManager.setPosition(id,x,y);
            return true;
        }else if(Board.itemAt(x,y) && Board.itemAt(x,y).container){
            EntityManager.lootContainer(entity,Board.itemAt(x,y));
            return true;
        }else if(!Board.isSpace(x,y) && id == "player"){
            GameMaster.travel(x,y);
            return true;
        }

        return false;
    }

    static movePlayer(x,y){
        if(!EntityManager.moveEntity('player',x,y)){
            EntityManager.cancelAction({blocked:true})
        }
    }

    static rotateSword(id, direction){
        let rotation = EntityManager.getProperty(id, 'rotation');
        rotation += 8 + direction;
        rotation %= 8;
    
        EntityManager.setProperty(id, 'rotation', rotation);
    }

    static chaseNatural(id, behaviorInfo){
        let entity = EntityManager.getEntity(id);
        let playerEntity = EntityManager.getEntity('player');
        //creature is less focused the further they are
        let focus = behaviorInfo.focus;
        focus -= EntityManager.getDistance(entity, playerEntity);
        if(!EntityManager.hasPlayerLos(entity)){
            focus -= 20;
        }
        focus =  Math.max(focus, 4);
        let x = 0;
        let y = 0;

        //the higher focus is, the less likely the creature is to move randomly
        let random = EntityManager.roll(1,focus);
        if(random == 1){
            x = -1;
        }else if (random == 2){
            x = 1;
        }else if (random == 3 || random == 4){
            //do nothing
        }else if(entity.x > playerEntity.x){
            x = -1;
        }else if (entity.x < playerEntity.x){
            x = 1;
        }
        
        random = EntityManager.roll(1,focus);
        if(random == 1){
            y = -1;
        }else if (random == 2){
            y = 1;
        }else if (random == 3 || random == 4){
            //do nothing
        }else if(entity.y > playerEntity.y){
            y = -1;
        }else if (entity.y < playerEntity.y){
            y = 1;
        }
    
        let targetX = entity.x+x;
        let targetY = entity.y+y
        let targetItem = Board.itemAt(targetX, targetY);

        if(targetItem.id == "player" || targetItem.behavior == "dead" || targetItem.behavior == "wall"){
            EntityManager.attack(entity,targetItem);
        }

        if(targetItem.behavior == "sword" && !Board.wallAt(targetX, targetY)){
            EntityManager.beat(entity,targetItem);
        }
    
        if(!EntityManager.moveEntity(id, x, y, Board)){
            EntityManager.moveEntity(id, 0, y, Board);
            EntityManager.moveEntity(id, x, 0, Board);
        }
        
    }

    static attack(attacker,target){
        let damage = attacker.damage;
        let stunTime = attacker.stunTime;
        if(attacker.behavior == 'sword'){
            let strikeType = EntityManager.getStrikeType(attacker);
            if(attacker[strikeType]){
                damage = attacker[strikeType].damage;
                stunTime = attacker[strikeType].stunTime;
            }
        }
        let damageDice = 1;
        if(target.stunned){
            damageDice=2;
        }
        let stunAdded = 0;
        if (stunTime){
            stunAdded = EntityManager.roll(1,stunTime);
        }
        let mortality = EntityManager.rollN(damageDice,0,damage);

        if (target.id == 'player'){
            EntityManager.transmitMessage(attacker.name+" attacks you!");
            Player.changeHealth(mortality * -1);
        }else if(target.behavior == 'wall'){
            EntityManager.addMortality(target.id, mortality);
        }else{
            if(!target.dead){
                EntityManager.transmitMessage(target.name+" is struck!");
            }
            EntityManager.addStunTime(target.id,stunAdded);
            EntityManager.addMortality(target.id, mortality);
            EntityManager.knock(target.id, attacker.id);
            EntityManager.enrageAndDaze(target);   
            EntityManager.sturdy(attacker,target);
        }

        if(attacker.owner == 'player'){
            EntityManager.degradeItem(attacker,0,0.25);
        }
        
    }

    static knock(knockedId, knockerId){
        let knocked = EntityManager.getEntity(knockedId);
        let knocker = EntityManager.getEntity(knockerId);
        let knockerPos;
        knockerPos = EntityManager.history[EntityManager.history.length-1].entities[knockerId];
        

        let direction = EntityManager.roll(0,7);
        let x = knockedId.x + EntityManager.translations[direction].x;
        let y = knockedId.y + EntityManager.translations[direction].y;
    
        let tries = 0;
        //space must be open AND further from attacker's last position
        let furtherSpace = (EntityManager.getOrthoDistance(knockerPos, knocked) < EntityManager.getOrthoDistance(knockerPos,{x:x, y:y}))
        let backupSpace = false;
        while((!Board.isOpenSpace(x,y) || !furtherSpace ) && tries <= 8){
            if(Board.isOpenSpace(x,y) && !backupSpace){
                backupSpace = {x:x, y:y};
            }

            direction = (direction+1) % 8;
            x = knocked.x + EntityManager.translations[direction].x;
            y = knocked.y + EntityManager.translations[direction].y;

            furtherSpace = (EntityManager.getOrthoDistance(knockerPos, knocked) < EntityManager.getOrthoDistance(knockerPos,{x:x, y:y}))
            tries++;
        }

        if(tries < 8){
            EntityManager.setPosition(knockedId,x,y)
        }else if (backupSpace){
            EntityManager.setPosition(knockedId,backupSpace.x,backupSpace.y);
        }else{
            EntityManager.transmitMessage(knocked.name + " is cornered!", 'pos');
            if(knocker.behavior == 'sword'){
                EntityManager.setToLastPosition(knocker.owner);
                EntityManager.setToLastPosition(knockerId);
                EntityManager.placeSword(knockerId)
                //EntityManager.knockSword(knockerId);
            }
        }
    }

    static knockSword(swordId){
        let sword = EntityManager.getEntity(swordId);
        let owner = EntityManager.getEntity(sword.owner);
        //direction is either 1 or -1
        let direction = (EntityManager.roll(0,1) * 2) - 1;
        let rotation = (sword.rotation + 8 + direction) % 8;
        let translation = EntityManager.translations[rotation];
        let x = owner.x + translation.x;
        let y = owner.y + translation.y;
        let counter = 1;
        while((Board.itemAt(x,y).behavior != 'wall' && Board.itemAt(x,y)) && counter < 3){
            rotation = (sword.rotation + 8 + direction) % 8;
            translation = EntityManager.translations[rotation];
            x = owner.x + translation.x;
            y = owner.y + translation.y;
        
            counter++;
        }

        if(Board.itemAt(x,y).behavior == 'wall' || !Board.itemAt(x,y)){
            EntityManager.transmitMessage('sword knocked!', 'danger');
            sword.rotation = rotation;
            EntityManager.placeSword(sword.id);
            
        }


    }

    static findSwordMiddle(sword,pos1,pos2){
        let owner = EntityManager.getEntity(sword.owner);
        //direction is either 1 or -1
        let direction = (EntityManager.roll(0,1) * 2) - 1;
        let rotation = (sword.rotation + 8 + direction) % 8;
        let translation = EntityManager.translations[rotation];
        let x = owner.x + translation.x;
        let y = owner.y + translation.y;

        let bestPos = {x:x, y:y};
        let bestRotation = rotation;
        let bestDistance = EntityManager.getOrthoDistance({x:x,y:y},pos1)+EntityManager.getOrthoDistance({x:x,y:y},pos2)

        for(let i = 0; i < 8; i++){
            let distance = EntityManager.getOrthoDistance({x:x,y:y},pos1)+EntityManager.getOrthoDistance({x:x,y:y},pos2);

            let validSpace = (Board.itemAt(x,y).behavior == 'wall' || !Board.itemAt(x,y))
            if(validSpace){
                if (distance < bestDistance){
                    bestDistance = distance;
                    bestPos = {x:x, y:y};
                    bestRotation = rotation;
                }
            }
            rotation = (rotation + 8 + direction) % 8;
            translation = EntityManager.translations[rotation];
            x = owner.x + translation.x;
            y = owner.y + translation.y;
        }

        sword.rotation = bestRotation;
        EntityManager.placeSword(sword.id);
    }

    static enrageAndDaze(entity){
        if(!entity.behaviorInfo || entity.dead){
            return;
        }
        let enrageChance = entity.behaviorInfo.enrage;
        let dazeChance = entity.behaviorInfo.daze;

        let random = EntityManager.roll(1,100);
        if(random <= enrageChance){
            EntityManager.transmitMessage(entity.name+" is enraged!", 'danger', ['enraged']);
            entity.behaviorInfo.focus += 5;
            entity.behaviorInfo.slow -= 3;
            if(!entity.behaviorInfo.beat){
                entity.behaviorInfo.beat = 0;
            }
            entity.behaviorInfo.beat += 5;
            if(!entity.behaviorInfo.sturdy){
                entity.behaviorInfo.sturdy = 0;
            }
            entity.sturdy += 5;
            entity.stunned -= Math.max(EntityManager.roll(0,entity.stunned),0);
        }
        random = EntityManager.roll(1,100);
        if(random <= dazeChance){
            EntityManager.transmitMessage(entity.name+" is dazed!", 'pos', ['dazed']);
            entity.behaviorInfo.focus -= 7;
            if(!entity.behaviorInfo.slow){
                entity.behaviorInfo.slow = 0;
            }
            entity.behaviorInfo.slow += 7;
            entity.sturdy -= 7;
            entity.beat -=7;
            entity.stunned ++;
        }
    }

    //has beat% chance to beat sword out of way.
    //also beats sword out of way if damage exceeds player stamina.
    static beat(entity, sword){
        if(sword.owner == 'player'){
            EntityManager.transmitMessage(entity.name+" attacks your weapon...");
            let damage = EntityManager.roll(0,entity.damage);
            Player.changeStamina(damage * -1);
            if(damage < 1){
                EntityManager.degradeItem(sword, damage*0.25, 1);
            }
        }
        let beatChance = 0;
        if(entity.behaviorInfor){
            beatChance = entity.behaviorInfo.beat;
        }

        let random = EntityManager.roll(1,100);
        if(random <= beatChance || Player.stamina < 0){
            Player.changeStamina(0);
            EntityManager.transmitMessage(entity.name+" knocks your weapon out of the way!", 'danger');
            EntityManager.knockSword(sword.id);
        }else if(Player.equipped){
            EntityManager.transmitMessage("You hold steady!");

        }
        
    }

    static sturdy(attacker,target){
        if(!target.behaviorInfor){
            return;
        }
        let sturdyChance = target.behaviorInfo.sturdy;

        let random = EntityManager.roll(1,100);
        if (random <= sturdyChance){
            /*
            EntityManager.setToLastPosition(attacker.owner);
            EntityManager.setToLastPosition(attacker.id);
            EntityManager.setToLastPosition(target.id);
            EntityManager.placeSword(attacker.id);
            */
            EntityManager.removeEntity(attacker.id);
            EntityManager.setToLastPosition(target.id);
            let lastSwordPos = EntityManager.history[EntityManager.history.length-1].entities[attacker.id];
            EntityManager.findSwordMiddle(attacker,target,lastSwordPos);
            if(!target.dead){
                EntityManager.transmitMessage(target.name+" holds its footing!", 'danger');
            }
        }
    }

    static triggerBehaviors(){
        for (const [k,entity] of Object.entries(EntityManager.entities)){
            let random = EntityManager.roll(1,100);
            let skip = entity.stunned
            if(entity.behaviorInfo){
                skip += (random <= entity.behaviorInfo.slow);
            }
            
            if (!skip){
                switch(entity.behavior){
                    case "chase":
                        EntityManager.chaseNatural(k, entity.behaviorInfo);
                        break;
                    case "sword":
                        //player = EntityManager.placeSword(k,board, player);
                        break;
                    case "dead":
                        //entity.tempSymbol = 'x';
                        break;
                    default:
                }
            }
            if (entity.behavior != 'dead'){
                if(entity.stunned > 0){
                    entity.stunned--;
                }
                if(entity.stunned > 0){
                    entity.tempSymbol = entity.symbol.toLowerCase();
                }else{
                    entity.tempSymbol = false;
                }
            }else{
                //entity.tempSymbol = 'x';
            }



            if((entity.mortal - entity.threshold) >= entity.threshold/2 && !entity.obliterated){
                EntityManager.dropItems(entity);
                entity.obliterated = true;
                EntityManager.setPosition(entity.id,-1,-1);

            }
        }
    }

    static reapWounded(){
        for (const [k,entity] of Object.entries(EntityManager.entities)){
            if (entity.mortal > entity.threshold && entity.behavior != 'dead'){
                EntityManager.kill(entity);
            }
        }
        if(Player.health <= 0){
            EntityManager.setProperty('player','symbol', 'x');
            EntityManager.setProperty('player','behavior', 'dead');
            EntityManager.transmitMessage('you are dead.', 'urgent');
        }
    }

    static kill(entity){
        EntityManager.transmitMessage(entity.name+" is slain!", 'win');
        entity.name += " corpse";
        entity.behavior = 'dead';
        entity.dead = true;
        entity.tempSymbol = 'x';
        entity.stunned = 0;
        entity.container = true;
        if(entity.tiny){
            entity.item = true;
            entity.walkable = true;
            entity.tempSymbol = '*';
        }
        let roster = EntityManager.currentMap.roster;
        roster[entity.index].alive = false;
    };

    static equipWeapon(weapon){
        let id = EntityManager.getProperty("player", "sword");
        let sword = EntityManager.getEntity(id);

        let x = sword.x;
        let y = sword.y;
        let rotation = sword.rotation;
        let owner = sword.owner;
        let symbol = sword.symbol;
        let behavior = sword.behavior;

        EntityManager.entities[id] = JSON.parse(JSON.stringify(weapon));
        sword = EntityManager.getEntity(id);
        sword.x = x;
        sword.y = y;
        sword.rotation = rotation;
        sword.owner = owner;
        sword.symbol = symbol;
        sword.id = id;
        sword.behavior = behavior;
        sword.equipped = true;
        
        EntityManager.transmitMessage('equipped weapon: '+weapon.name);
    }

    static unequipWeapon(){
        let sword = EntityManager.getEntity(EntityManager.entities.player.sword);
        sword.equipped = false;
    }

    static monsterInit(monsterName,x,y){
        let id = EntityManager.entityCounter;
        EntityManager.entityCounter++;
        let monster = JSON.parse(JSON.stringify(monsterVars[monsterName]));

        let threshold = Math.max(EntityManager.rollN(monster.hitDice,1,8),1);

        monster.x = x;
        monster.y = y;
        monster.id = id;
        monster.threshold = threshold;
        monster.stunned = 0;
        monster.mortal = 0;

        EntityManager.entities[id] = monster;

        return EntityManager.entities[id];
    }

    static dropItem(item,x,y){
        if(!item){
            return false;
        }
        item.x = x;
        item.y = y;
        item.item = true;
        item.walkable = true;
        item.id = EntityManager.entityCounter;
        item.dropTurn = Log.turnCounter;
        if (!item.symbol){
            item.symbol = '*';
        }
        EntityManager.entities[EntityManager.entityCounter] = item;
        EntityManager.entityCounter++;
    }

    static dropItems(entity){
        let inventory = entity.inventory
        if(!inventory){
            return false;
        }

        inventory.forEach((item) =>{
            EntityManager.dropItem(item, entity.x, entity.y);
        })
    }

    static lootContainer(looter,container){
        if(!container.inventory){
            return false;
        }
        if(looter.id == 'player'){
            looter = Player;
        }
        if(!looter.inventory){
            looter.inventory = [];
        }
        container.inventory.forEach((item,i) =>{
            if(item && (looter.inventory.length < looter.inventorySlots)){
                let obj = item;
                let obliterated = {id:obj.id, obliterated:true, x:-1, y:-1};
                EntityManager.entities[obj.id] = obliterated;
                obj.walkable = false;
                obj.inventory = false;
                obj.item = false;
                looter.inventory.push(obj);
                container.inventory[i] = false;
            }
        })
    }

    static pickUpItem(entity,item){
        if(!entity || entity.behavior == 'sword' || (item.dropTurn >= Log.turnCounter && !entity.item) || EntityManager.skipBehaviors){
            return false;
        }
        if(entity.id == 'player'){
            entity = Player;
        }
        let items = [];
        if(item.inventory){
            item.inventory.forEach((obj) =>{
                if(!obj.obliterated){
                    items.push(obj);
                }
            })
        }

        items.push(item);
        
        if(!entity.inventory){
            entity.inventory = [];
        }
        items.forEach((obj)=>{
            if(entity.inventory.length < entity.inventorySlots || entity.item){
                let obliterated = {id:obj.id, obliterated:true, x:-1, y:-1};
                EntityManager.entities[obj.id] = obliterated;
                obj.walkable = false;
                obj.inventory = false;
                obj.item = false;
                entity.inventory.push(obj);
            }
        })
    }

    static saveSnapshot(){
        let entities = JSON.parse(JSON.stringify(EntityManager.entities));
        let playerJson = Player.getPlayerJson();
        EntityManager.history.push({
            entities:entities,
            player:playerJson
        });
        if(EntityManager.history.length > EntityManager.historyLimit){
            EntityManager.history.shift();
        }
    }

    static canRewind(){
        return EntityManager.history.length > 1 && Player.luck > 0;
    }

    static rewind(){
        let luck = Player.luck-1;
        EntityManager.history.pop();
        let snapshot = EntityManager.history.pop();
        EntityManager.entities = snapshot.entities;
        Board.placeEntities();
        
        Player.setPlayerInfo(snapshot.player);
        if(Player.equipped){
            Player.equipped = Player.inventory[Player.equipped.slot];
        }
        Player.luck = Math.max(0,luck);
    }

    static cancelAction(reason){
        Log.addNotice('Action Halted');
        if(reason.insuficientStamina){
            Log.addNotice('Not Enough Stamina')
            Log.addNotice('Press NUMPAD5 to recover')

        }
        if(reason.blocked){
            Log.addNotice('Path Blocked')
        }
        let snapshot = EntityManager.history.pop();
        EntityManager.entities = snapshot.entities;
        Board.placeEntities();

        Player.setPlayerInfo(snapshot.player);  
        EntityManager.skipBehaviors = true; 

        let swordId = EntityManager.getEntity('player').sword;
        Board.calculateLosArray(EntityManager.getEntity('player'));
        EntityManager.placeSword(swordId);
    }

    static setToLastPosition(id){
        let lastPosition = EntityManager.history[EntityManager.history.length-1].entities[id];
        let entity = EntityManager.getEntity(id);
        if (entity.behavior == "sword"){
            entity.rotation = lastPosition.rotation;
        }else{
            EntityManager.setPosition(id,lastPosition.x,lastPosition.y)
        }
    }

    static roll(min,max){
        return Math.floor(Math.random()*(max-min+1))+min;
    }
    
    static rollN(n, min,max){
        let sum = 0;
        for(let i = 0; i < n; i++){
            sum += EntityManager.roll(min,max);
        }
        return sum;
    }

    static loadRoom(json){
        GameMaster.save.catchUpMap(json.name);
        Board.setDimensions(json.width,json.height)
        Board.boardInit();
        Board.destinations = json.destinations;
        json.roster.forEach((entity)=>{
            let value = entity.value;
            let entityObj;
            let x = entity.x;
            let y = entity.y;
            let random = EntityManager.roll(0,99);
            let spawn = (random < entity.spawnChance || !entity.spawnChance);
            if(value == "player"){
                EntityManager.playerInit(x, y)
            }else if(value.monster){
                if(entity.alive && spawn){
                    entityObj = EntityManager.monsterInit(value.monster,x,y);
                }
            }else{
                if(entity.alive && spawn){
                    entityObj = EntityManager.entityInit(value.symbol, value.behavior, x, y, value.hitDice,value.damage, value.behaviorInfo, value.name);
                }
            }
            if(entityObj){
                entityObj.index = entity.index;
                if(entityObj.behavior != 'wall'){
                    if(!entity.inventory || entity.inventory.length == 0){
                        LootManager.giveMonsterLoot(entityObj);
                        entity.inventory = entityObj.inventory;
                    }
                    entityObj.inventory = entity.inventory;
                    
                }
            }
        })

        EntityManager.currentMap = json;
        
    }

    static updateSavedInventories(){
        for (const [key, entity] of Object.entries(EntityManager.entities)) { 
            if(entity.index){
                let entitySave = EntityManager.currentMap.roster[entity.index];
                entitySave.inventory = entity.inventory;
            }
        }
    }

    static setProperty(id, Property, value){
        EntityManager.entities[id][Property] = value;
    }

    static setPosition(id,x,y){
        let entity = EntityManager.getEntity(id);
        Board.clearSpace(entity.x,entity.y)
        EntityManager.setProperty(id, 'x', x);
        EntityManager.setProperty(id, 'y', y);
        Board.placeEntity(EntityManager.getEntity(id),x,y)
    }

    static getPosition(id){
        let x = EntityManager.getProperty(id, 'x');
        let y = EntityManager.getProperty(id, 'y');

        return{
            x:x,
            y:y,
            positionString:x + ', '+y
        }
    }

    static getProperty(id, Property){
        return EntityManager.entities[id][Property];
    }

    static getEntity(id){
        return EntityManager.entities[id];
    }

    static setEntity(id, entity){
        EntityManager.entities[id] = entity;
    }

    static removeEntity(id){
        let entity = EntityManager.getEntity(id);
        let x = entity.x;
        let y = entity.y;
        Board.clearSpace(x, y);
        EntityManager.setPosition(id,-1,-1);
        Board.updateSpace(x,y);
    }



    static addStunTime(id, stunTime){
        stunTime +=EntityManager.getProperty(id, 'stunned');
        EntityManager.setProperty(id, 'stunned', stunTime);
    }

    static addMortality(id, mortal){
        mortal += Math.max(EntityManager.getProperty(id, 'mortal'),0);
        EntityManager.setProperty(id, 'mortal', mortal);
    }

    static getDistance(point1, point2){
        let xdif = Math.abs(point1.x - point2.x);
        let ydif = Math.abs(point1.y - point2.y);

        return Math.max(xdif, ydif);
    }

    static getOrthoDistance(point1, point2){
        let xdif = Math.abs(point1.x - point2.x);
        let ydif = Math.abs(point1.y - point2.y);

        return xdif + ydif;
    }

    static transmitMessage(message, messageClass = false, keywords = false){
        Log.addMessage(message, messageClass, keywords);
        console.log(message);
    }

    static hasPlayerLos(entity){
        return Board.getLineOfSight(entity.x,entity.y);
    }

}