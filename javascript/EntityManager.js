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

    static currentMap;
    
    static entityManagerInit(){
        Board.boardInit(this);
    }

    static wipeEntities(){
        EntityManager.entities = {};
        EntityManager.entityCounter = 0;
        History.reset();
    }

    static playerInit(x=0, y=0){
        return new PlayerEntity(x,y);
    }

    static makeSword(ownerId, item){
        return new SwordEntity(ownerId, item);
    }

    static degradeItem(weapon, modifier = 0, multiplier = 1){
        let item = weapon.item;
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
                weapon.unequip();
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

    //TODO - give to monster
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

        if(targetItem.id == "player" || targetItem.dead || targetItem.destructible || (targetItem.owner == 'player' && !Board.wallAt(targetX, targetY))){
            entity.attack(targetItem);
        }
    
        if(!EntityManager.moveEntity(id, x, y, Board)){
            EntityManager.moveEntity(id, 0, y, Board);
            EntityManager.moveEntity(id, x, 0, Board);
        }
        
    }

    static knockSword(swordId){
        let sword = EntityManager.getEntity(swordId);
        sword.knockSword();
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
                entity.kill();
            }
        }
        if(Player.health <= 0){
            EntityManager.setProperty('player','symbol', 'x');
            EntityManager.setProperty('player','behavior', 'dead');
            EntityManager.transmitMessage('you are dead.', 'urgent');
        }
    }

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

    static getCopy(object){
        return JSON.parse(JSON.stringify(object));
        //return structuredClone(object);
    }

    static loadSnapshot(snapshot){
        let snapshotEntities = snapshot.entities;
        for (const [id, snapshotEntity] of Object.entries(snapshotEntities)) {
            let entity = EntityManager.getEntity(id);
            entity.rewind(snapshotEntity);
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
        let snapshot = History.popSnapshot();
        EntityManager.loadSnapshot(snapshot);
        Board.placeEntities();

        Player.setPlayerInfo(snapshot.player);  
        EntityManager.syncPlayerInventory();
        
        EntityManager.skipBehaviors = true; 

        Board.calculateLosArray(EntityManager.getEntity('player'));
        EntityManager.placeSword('player');
    }

    static syncPlayerInventory(){
        if(EntityManager.getEntity('player')){
            Player.inventory = EntityManager.getEntity('player').inventory;
        }
        if(Player.equipped){
            Player.equipped = Player.inventory.items[Player.equipped.slot];
        }
    }

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
                entityObj = new Wall(x, y, value.hitDice, value.name, value.destructible);
            }else if(value.isContainer){
                entityObj = new Container(value.containerKey,x,y,value);
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
        entity.setPosition(x,y);
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
        entity.removeFromBoard();
        let x = entity.x;
        let y = entity.y;
        
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