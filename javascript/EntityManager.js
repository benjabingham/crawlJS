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

    static playerEntity;
    
    static entityManagerInit(){
        Board.boardInit();
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
        console.log(random)
        console.log(degradeChance);
        if(random < degradeChance){
            if(!item.worn){

                LootManager.applyModifier(Player.equipped,itemVars.weaponModifiers.worn);  
                if(!item.worn){
                    LootManager.applyModifier(item,itemVars.weaponModifiers.worn);
                }          
                EntityManager.transmitMessage(item.name + ' is showing wear!', 'urgent');
                console.log(item);
                console.log(Player.equipped);
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
        if(Player.exertion > 1){
            if(Player.stamina){
                Player.changeStamina(-1);
            }else{
                EntityManager.cancelAction({insuficientStamina:true});
                return false;
            }

        }
        if(!EntityManager.moveEntity('player',x,y)){
            EntityManager.cancelAction({blocked:true})
        }
    }

    static rotateSword(id, direction){
        let sword = EntityManager.getEntity(id);
        sword.rotate(direction);
    }

    static triggerBehaviors(){
        for (const [k,entity] of Object.entries(EntityManager.entities)){
            let random = Random.roll(1,100);
            let skip = 0;
            if(entity.stunned){
                skip+= entity.stunned;
            }
            if(entity.behaviorInfo){
                skip += (random <= entity.behaviorInfo.slow);
            }
            if(entity.wait){
                if(!EntityManager.hasPlayerLos(entity)){
                    skip++;
                    console.log('waiting')
                }else{
                    entity.wait = false;
                    console.log('found you!');
                }
            }
            
            if (!skip){
                switch(entity.behavior){
                    case "chase":
                        entity.chaseNatural();
                        break;
                    case "chaseBinary":
                        entity.chaseBinary();
                    default:
                }
                if(entity.dead && entity.reconstitute && Monster.prototype.isPrototypeOf(entity)){
                    entity.reconstituteFn(entity.reconstitute);
                }
                if(entity.spawnEntities){
                    EntityManager.spawnEntity(entity);
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
        }
    }

    static reapWounded(){
        for (const [k,entity] of Object.entries(EntityManager.entities)){
            entity.checkDead();
        }
        if(Player.health <= 0){
            EntityManager.setProperty('player','symbol', 'x');
            EntityManager.setProperty('player','behavior', 'dead');
            EntityManager.transmitMessage('you are dead.', 'urgent');
        }
    }

    static equipWeapon(wielderId, weapon, verbose=true){
        let id = EntityManager.getProperty(wielderId, "sword");
        let sword = EntityManager.getEntity(id);
        sword.equip(weapon); 
        if(verbose){
            EntityManager.transmitMessage('equipped weapon: '+weapon.name);
        }
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
        for (const [id, entity] of Object.entries(EntityManager.entities)) {
            if(!(entity.isWall && !entity.destructible)){
                let entity = EntityManager.getEntity(id);
                entity.rewind(snapshotEntities[id]);
            }
            
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
        console.log(json);
        Save.catchUpMap(json.name);
        Board.setDimensions(json.width,json.height)
        Board.boardInit(json);

        Board.destinations = json.destinations;
        json.roster.forEach((entitySave)=>{
            let groupInfo = entitySave.entityGroupInfo;
            let entityObj;
            let x = entitySave.x;
            let y = entitySave.y;
            let random = Random.roll(0,99);
            let spawn = (random < entitySave.spawnChance || !entitySave.spawnChance);
            if(groupInfo.entityType == "player"){
                EntityManager.playerEntity = EntityManager.playerInit(x, y)
            }else if(groupInfo.entityType == "monster"){
                if(entitySave.alive && spawn){
                    entityObj = new Monster(groupInfo.key,x,y,groupInfo);
                }
            }else if(groupInfo.entityType == 'wall'){
                entityObj = new Wall(x, y, groupInfo.hitDice, groupInfo.name, groupInfo.destructible);
            }else if(groupInfo.entityType == 'container'){
                if(entitySave.alive){
                    entityObj = new Container(groupInfo.key,x,y,groupInfo);
                    console.log(groupInfo);
                    console.log(entityObj);
                }
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
                entityObj.inventory.items = entitySave.inventory.items;
                entityObj.inventory.gold = entitySave.inventory.gold;
            }

            if(entityObj.spawnEntities){
                entityObj.setSpawnCapacity(entitySave.spawnCapacity);
                if(entitySave.containedEntity){
                    entityObj.spawnEntities.entities = [entitySave.containedEntity];
                }
            }
        })
        
        EntityManager.currentMap = json;
        
    }

    //function used for entities spawning other entities
    //if they live when you leave the dungeon, their loot is returned to their container
    static spawnEntity(spawner, chance = undefined){
        let spawnEntities = spawner.spawnEntities;
        if(typeof chance == 'undefined'){
            chance = spawnEntities.spawnChance;
        }
        if(Math.random()*100 > chance){
            return false;
        }

        if(!spawner.spawnCapacity){
            return false
        }

        //find spawn location
        let directionIndex = Random.roll(0,7);
        let translations = EntityManager.translations;
        let space = {
            x : spawner.x + translations[directionIndex].x,
            y: spawner.y + translations[directionIndex].y
        }
        let foundSpace = (Board.isSpace(space.x,space.y) && Board.isOpenSpace(space.x,space.y));
        let i = 0;
        //while we haven't checked every space, and current space is not open
        while(i < 8 && !foundSpace){
            i++;
            directionIndex = (directionIndex+1)%8
            console.log(directionIndex);
            space = {
                x : spawner.x + translations[directionIndex].x,
                y: spawner.y + translations[directionIndex].y
            }
            foundSpace = (Board.isSpace(space.x,space.y) && Board.isOpenSpace(space.x,space.y));
        }

        //no valid spaces
        if(!foundSpace){
            return false;
        }

        let monsterKey = spawnEntities.entities[Random.roll(0,spawnEntities.entities.length-1)]
        //remember monsterkey for later
        EntityManager.currentMap.roster[spawner.index].containedEntity = monsterKey;
        let entityObj = new Monster(monsterKey,space.x,space.y);
        entityObj.spawnerID = spawner.id;
        if(!entityObj){
            console.log('SPAWNER FAILED TO INSTANTIATE ENTITY')
            return false;
        }

        for(let i = 0; i < spawner.inventory.items.length; i++){
            if(Math.random()*100 < 50){
                let item = spawner.inventory.items.splice(i,1)[0];
                entityObj.inventory.items.push(item);
            }
        }

        if(EntityManager.hasPlayerLos(entityObj) && Board.hasLight(entityObj)){
            Log.addMessage(entityObj.name+" emerges from "+spawner.name+".",'danger');
        }

        spawner.setSpawnCapacity(spawner.spawnCapacity-1);


        return true;

    }

    static updateSavedInventories(){
        for (const [key, entity] of Object.entries(EntityManager.entities)) { 
            if(entity.spawnerID && !entity.dead){
                let spawner = EntityManager.getEntity(entity.spawnerID)
                //get back into spawner
                spawner.spawnCapacity++;
                //give items and gold back
                spawner.inventory.items = spawner.inventory.items.concat(entity.inventory.items);
                spawner.inventory.gold += entity.inventory.gold;
                let spawnerSave = EntityManager.currentMap.roster[spawner.index];
                spawnerSave.inventory.items = spawner.inventory.items;
                spawnerSave.inventory.gold = spawner.inventory.gold;
                spawnerSave.spawnCapacity = spawner.spawnCapacity;
            }else if(entity.index){
                let entitySave = EntityManager.currentMap.roster[entity.index];
                entitySave.inventory.items = entity.inventory.items;
                entitySave.inventory.gold = entity.inventory.gold;
                if(entity.spawnEntities){
                    console.log(entitySave);
                }
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