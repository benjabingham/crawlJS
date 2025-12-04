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
        if(random < degradeChance){
            if(!item.worn){
                LootManager.applyModifier(Player.equipped,itemVars.weaponModifiers.worn);  
                if(!item.worn){
                    LootManager.applyModifier(item,itemVars.weaponModifiers.worn);
                }          
                EntityManager.transmitMessage(item.name + ' is showing wear!', 'urgent');
            }else{
                LootManager.breakWeapon(Player.equipped);
                Player.unequipWeapon();
                EntityManager.transmitMessage(item.name + ' has broken!', 'urgent');
                weapon.unequip();
            }
        }
    }

    static corrodeItem(weapon, n){
        let item = weapon.item;
        if(!weapon.item){
            return false;
        }
        n = Random.roll(0,n);
        if(!item.flimsy){
            item.flimsy = 0;
        }
        console.log(item.flimsy)
        item.flimsy +=n;
        console.log(item.flimsy)
        console.log(item);
        if(n){
            EntityManager.transmitMessage(item.name + ' is corroding...', 'danger',["corrode"]);
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
                //wait until is within screen AND has player los
                if(!EntityManager.hasPlayerLos(entity) || EntityManager.getDistance(entity,EntityManager.playerEntity) > 8){
                    skip++;
                }else{
                    entity.wait = false;
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
            Player.updateEquippedEntityReference();
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
                console.log(JSON.parse(JSON.stringify(entityObj)))
            }
            if(entityObj.spawnEntities){
                if(entitySave.containedEntities){
                    entityObj.containedEntities = entitySave.containedEntities;
                }else{
                    entityObj.generateContainedEntities();
                }
                console.log(entityObj.containedEntities);
            }
        })
        
        EntityManager.currentMap = json;
        
    }

    //function used for entities spawning other entities
    //if they live when you leave the dungeon, their loot is returned to their container
    static spawnEntity(spawner){
        let spawnEntities = spawner.spawnEntities;
        if(Math.random()*100 > spawnEntities.spawnChance && !spawner.disturbed){
            return false;
        }

        let minSpawn = 1, maxSpawn = 1;
        if(spawner.spawnEntities.minSpawn){
            minSpawn = spawner.spawnEntities.minSpawn;
        }
        if(spawner.spawnEntities.maxSpawn){
            maxSpawn = Math.max(spawner.spawnEntities.maxSpawn,minSpawn);
        }

        let nSpawn = Random.roll(minSpawn,maxSpawn);
        if(!nSpawn){
            return false;
        }

        //check if we should wait a turn... Use average slow value of spawned entities
        let keysToSpawn = spawner.containedEntities.slice(nSpawn*-1)
        if(Math.random()*100 < EntityManager.getAverageSlow(keysToSpawn)){
            if(!spawner.disturbed){
                spawner.disturbed = 1;
            }
            return false;
        }

        for(let i = 0; i < nSpawn; i++){
            if(!spawner.seeNextContainedEntity()){
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
            let j = 0;
            //while we haven't checked every space, and current space is not open
            while(j < 8 && !foundSpace){
                j++;
                directionIndex = (directionIndex+1)%8
                //console.log(directionIndex);
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
            
            //spawn it
            let monsterKey = spawner.removeContainedEntity();
            let entityObj = new Monster(monsterKey,space.x,space.y);
            entityObj.setPosition();
            entityObj.spawnerID = spawner.id;
            if(!entityObj){
                console.log('SPAWNER FAILED TO INSTANTIATE ENTITY')
                return false;
            }
    
            //cant take more than half the items because inventory length updates as they are taken
            //i like this
            for(let j = 0; j < spawner.inventory.items.length; j++){
                if(Math.random()*100 < 100  && entityObj.inventory.items.length < entityObj.inventorySlots){
                    let item = spawner.inventory.items.splice(j,1)[0];
                    entityObj.inventory.items.push(item);
                }
            }
    
            if(EntityManager.hasPlayerLos(entityObj) && Board.hasLight(entityObj)){
                Log.addMessage(entityObj.name+" emerges from "+spawner.name+".",'danger');
            }

            
        }

        if(spawner.disturbed){
            spawner.disturbed--;
        }

        return true;

    }

    //get the average slow value from an array of monster keys
    static getAverageSlow(keyArr){
        let total = 0;
        keyArr.forEach((monsterKey)=>{
            if(monsterVars[monsterKey] && monsterVars[monsterKey].behaviorInfo && monsterVars[monsterKey].behaviorInfo.slow){
                total += monsterVars[monsterKey].behaviorInfo.slow
            }
        })

        return total/keyArr.length;
    }

    static updateSavedInventories(){
        for (const [key, entity] of Object.entries(EntityManager.entities)) { 
            if((typeof entity.spawnerID != 'undefined' )&& !entity.dead && !entity.obliterated){
                let spawner = EntityManager.getEntity(entity.spawnerID)
                spawner.returnContainedEntity(entity);
                let spawnerSave = EntityManager.currentMap.roster[spawner.index];
                spawnerSave.inventory.items = spawner.inventory.items;
                spawnerSave.inventory.gold = spawner.inventory.gold;
                spawnerSave.containedEntities = spawner.containedEntities;
            }else if(typeof entity.index != 'undefined'){
                let entitySave = EntityManager.currentMap.roster[entity.index];
                entitySave.inventory.items = entity.inventory.items;
                entitySave.inventory.gold = entity.inventory.gold;
                if(entity.spawnEntities){
                    entitySave.containedEntities = entity.containedEntities;
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