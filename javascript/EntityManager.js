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

    static playerInit(x=0, y=0){
        return new PlayerEntity(x,y);
    }
    

    /*
    static entityInit(symbol, behavior, x=0,y=0, hitDice=1, damage=0, behaviorInfo = {}, name = "", inventorySlots = 10){
        let threshold = Math.max(Random.rollN(hitDice,1,8),1);
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
    }*/

    static makeSword(ownerId, item){
        return new SwordEntity(ownerId, item);
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
                item.unequip();
            }
        }
    }

    static placeSword(ownerId){
        let owner = EntityManager.getEntity(ownerId);
        let swordId = owner.sword;
        let sword = EntityManager.getEntity(swordId);

        sword.place();
    }

    static moveEntity(id, x, y){
        let entity = EntityManager.getEntity(id);
        return entity.move(x,y);
    }

    
    static movePlayer(x,y){
        if(!EntityManager.moveEntity('player',x,y)){
            EntityManager.cancelAction({blocked:true})
        }
    }

    static rotateSword(id, direction){
        let sword = EntityManager.getEntity(id);
        sword.rotate(direction);
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
        let random = Random.roll(1,focus);
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
        
        random = Random.roll(1,focus);
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

        if(targetItem.id == "player" || targetItem.behavior == "dead" || targetItem.isWall){
            EntityManager.attack(entity,targetItem);
        }

        if(targetItem.isSword && !Board.wallAt(targetX, targetY)){
            EntityManager.beat(entity,targetItem);
        }
    
        if(!EntityManager.moveEntity(id, x, y, Board)){
            EntityManager.moveEntity(id, 0, y, Board);
            EntityManager.moveEntity(id, x, 0, Board);
        }
        
    }

    //TODO - move to monster class
    static attack(attacker,target){
        let damage = attacker.damage;
        let stunTime = attacker.stunTime;
        let damageDice = 1;
        if(target.stunned){
            damageDice=2;
        }
        let stunAdded = 0;
        if (stunTime){
            stunAdded = Random.roll(1,stunTime);
        }
        let mortality = Random.rollN(damageDice,0,damage);

        if (target.id == 'player'){
            EntityManager.transmitMessage(attacker.name+" attacks you!");
            Player.changeHealth(mortality * -1);
        }else if(target.isWall){
            EntityManager.addMortality(target.id, mortality);
        }else{
            if(!target.dead){
                EntityManager.transmitMessage(target.name+" is struck!");
            }
            EntityManager.addStunTime(target.id,stunAdded);
            EntityManager.addMortality(target.id, mortality);
            target.knock(attacker.id);
            EntityManager.enrageAndDaze(target);   
            EntityManager.sturdy(attacker,target);
        }

    }

    /*
    static knock(knockedId, knockerId){
        let knocked = EntityManager.getEntity(knockedId);
        let knocker = EntityManager.getEntity(knockerId);
        let knockerPos;
        knockerPos = EntityManager.history[EntityManager.history.length-1].entities[knockerId];
        

        let direction = Random.roll(0,7);
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
            if(knocker.isSword){
                EntityManager.setToLastPosition(knocker.owner);
                EntityManager.setToLastPosition(knockerId);
                knocker.place();
                //EntityManager.knockSword(knockerId);
            }
        }
    }*/

    static knockSword(swordId){
        let sword = EntityManager.getEntity(swordId);
        sword.knockSword();
    }

    //place sword in space closest to center between two points
    //TODO - give to SwordEntity
    static findSwordMiddle(sword,pos1,pos2){
        let owner = EntityManager.getEntity(sword.owner);
        //direction is either 1 or -1
        let direction = (Random.roll(0,1) * 2) - 1;
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
        sword.place();
    }

    //TODO - give to Monster
    static enrageAndDaze(entity){
        if(!entity.behaviorInfo || entity.dead){
            return;
        }
        let enrageChance = entity.behaviorInfo.enrage;
        let dazeChance = entity.behaviorInfo.daze;

        let random = Random.roll(1,100);
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
            entity.stunned -= Math.max(Random.roll(0,entity.stunned),0);
        }
        random = Random.roll(1,100);
        if(random <= dazeChance){
            EntityManager.transmitMessage(entity.name+" is dazed!", 'pos', ['dazed']);
            entity.behaviorInfo.focus -= 7;
            if(!entity.behaviorInfo.slow){
                entity.behaviorInfo.slow = 0;
            }
            entity.behaviorInfo.slow += 7;
            if(!entity.behaviorInfo.sturdy){
                entity.behaviorInfo.sturdy = 0;
            }
            entity.sturdy -= 7;
            if(!entity.behaviorInfo.beat){
                entity.behaviorInfo.beat = 0;
            }
            entity.beat -=7;
            entity.stunned ++;
        }
    }

    //has beat% chance to beat sword out of way.
    //also beats sword out of way if damage exceeds player stamina.
    //TODO - give to Entity
    static beat(entity, sword){
        let knock = false;
        if(sword.owner == 'player'){
            EntityManager.transmitMessage(entity.name+" attacks your weapon...");
            let damage = Random.roll(0,entity.damage);
            Player.changeStamina(damage * -1);
            if(Player.stamina < 0){
                Player.stamina = 0;
                knock = true;
            }
            if(damage > 1){
                EntityManager.degradeItem(sword, damage*0.25, 1);
            }
        }
        let beatChance = 0;
        if(entity.behaviorInfor){
            beatChance = entity.behaviorInfo.beat;
        }

        let random = Random.roll(1,100);
        if(random <= beatChance || knock){
            EntityManager.transmitMessage(entity.name+" knocks your weapon out of the way!", 'danger');
            EntityManager.knockSword(sword.id);
        }else if(Player.equipped){
            EntityManager.transmitMessage("You hold steady!");
        }

        
        
    }

    //TODO - give to Monster (or to Creature???)
    static sturdy(attacker,target){
        if(!target.behaviorInfor){
            return;
        }
        let sturdyChance = target.behaviorInfo.sturdy;

        let random = Random.roll(1,100);
        if (random <= sturdyChance){
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
            let random = Random.roll(1,100);
            let skip = entity.stunned
            if(entity.behaviorInfo){
                skip += (random <= entity.behaviorInfo.slow);
            }
            
            if (!skip){
                switch(entity.behavior){
                    case "chase":
                        EntityManager.chaseNatural(k, entity.behaviorInfo);
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



            if((entity.mortal - entity.threshold) >= entity.threshold/2 && !entity.obliterated && !entity.isSword){
                entity.dropInventory();
                entity.obliterate();
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

    //give to Entity
    static kill(entity){
        EntityManager.transmitMessage(entity.name+" is slain!", 'win');
        entity.name += " corpse";
        entity.behavior = 'dead';
        entity.dead = true;
        entity.tempSymbol = 'x';
        entity.stunned = 0;
        entity.isContainer = true;
        if(entity.tiny){
            entity.item = true;
            entity.walkable = true;
            entity.tempSymbol = '*';
        }
        let roster = EntityManager.currentMap.roster;
        roster[entity.index].alive = false;
    };

    static equipWeapon(wielderId, weapon){
        let id = EntityManager.getProperty(wielderId, "sword");
        let sword = EntityManager.getEntity(id);
        sword.equip(weapon);
        
        EntityManager.transmitMessage('equipped weapon: '+weapon.name);
    }

    static unequipWeapon(wielderId){
        let id = EntityManager.getProperty(wielderId, "sword");
        let sword = EntityManager.getEntity(id);

        sword.unequip();
    }

/*
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
        let inventory = entity.inventory.items
        if(!inventory){
            return false;
        }

        inventory.forEach((item) =>{
            EntityManager.dropItem(item, entity.x, entity.y);
        })
    }*/

    /*
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
                console.log('OBLITERATING ' + item.name)

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
    */

    /*
    static pickUpItem(entity,item){
        if(!entity || !item.isItem || entity.isSword || (item.dropTurn >= Log.turnCounter && !entity.item) || EntityManager.skipBehaviors){
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
        
        if(!entity.inventory.items){
            entity.inventory.items = [];
        }
        items.forEach((obj)=>{
            if(entity.inventory.items.length < entity.inventory.itemsSlots || entity.item){
                console.log('OBLITERATING ' + obj.name)

                let obliterated = {id:obj.id, obliterated:true, x:-1, y:-1};
                EntityManager.entities[obj.id] = obliterated;
                obj.walkable = false;
                obj.inventory = false;
                obj.item = false;
                entity.inventory.items.push(obj);
            }
        })
    }*/

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
        console.log('rewind');
        let luck = Player.luck-1;
        EntityManager.history.pop();
        let snapshot = EntityManager.history.pop();
        EntityManager.loadSnapshot(snapshot);
        Board.placeEntities();
        
        Player.setPlayerInfo(snapshot.player);
        if(Player.equipped){
            Player.equipped = Player.inventory[Player.equipped.slot];
        }
        Player.luck = Math.max(0,luck);
    }

    static loadSnapshot(snapshot){
        for (const [id, entity] of Object.entries(EntityManager.entities)) { 
            entity.rewind(snapshot.entities[id]);
        }
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
        EntityManager.loadSnapshot(snapshot);
        Board.placeEntities();

        Player.setPlayerInfo(snapshot.player);  
        EntityManager.skipBehaviors = true; 

        Board.calculateLosArray(EntityManager.getEntity('player'));
        EntityManager.placeSword('player');
    }

    //TODO - move to entity
    static setToLastPosition(id){
        let lastPosition = EntityManager.history[EntityManager.history.length-1].entities[id];
        let entity = EntityManager.getEntity(id);
        if (entity.isSword){
            entity.rotation = lastPosition.rotation;
        }else{
            EntityManager.setPosition(id,lastPosition.x,lastPosition.y)
        }
    }

    //TODO - containers not getting index. Monster index is same as id?
    static loadRoom(json){
        Save.catchUpMap(json.name);
        Board.setDimensions(json.width,json.height)
        Board.boardInit();
        Board.destinations = json.destinations;
        json.roster.forEach((entitySave)=>{
            let value = entitySave.value;
            let entityObj;
            let x = entitySave.x;
            let y = entitySave.y;
            let random = Random.roll(0,99);
            let spawn = (random < entitySave.spawnChance || !entitySave.spawnChance);
            if(value == "player"){
                EntityManager.playerInit(x, y)
            }else if(value.isMonster){
                if(entitySave.alive && spawn){
                    entityObj = new Monster(value.monsterKey,x,y,value);
                }
            }else if(value.isWall){
                entityObj = new Wall(x, y, value.hitDice, value.name);
            }else if(value.isContainer){
                entityObj = new Container(value.containerKey,x,y,value);
            }else{
                /*
                if(entity.alive && spawn){
                    entityObj = EntityManager.entityInit(value.symbol, value.behavior, x, y, value.hitDice,value.damage, value.behaviorInfo, value.name);
                }
                */
            }
            if(entityObj){
                entityObj.index = entitySave.index;
            }else{
                console.log({
                    message:'entityObj = false',
                    entitySave:entitySave
                })
                return false;
            }
            if(entitySave.inventory){
                entityObj.inventory.items = entitySave.inventory;
            }
        })

        EntityManager.currentMap = json;
        
    }

    static updateSavedInventories(){
        for (const [key, entity] of Object.entries(EntityManager.entities)) { 
            if(entity.index){
                let entitySave = EntityManager.currentMap.roster[entity.index];
                entitySave.inventory = entity.inventory.items;
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


    //TODO - give to entity
    static addStunTime(id, stunTime){
        stunTime +=EntityManager.getProperty(id, 'stunned');
        EntityManager.setProperty(id, 'stunned', stunTime);
    }
    //TODO - give to entity
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