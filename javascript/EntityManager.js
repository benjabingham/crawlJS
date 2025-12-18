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
                EntityManager.transmitMessage(item.name + ' is showing wear!', 'urgent','showing wear','This item has degraded. It now has a chance to become broken. Use a point of luck to extend its life.',weapon.id);
                LootManager.applyModifier(Player.equipped,itemVars.weaponModifiers.worn);  
                if(!item.worn){
                    LootManager.applyModifier(item,itemVars.weaponModifiers.worn);
                }          
            }else{
                EntityManager.transmitMessage(item.name + ' has broken!', 'urgent','broken','This item can no longer be used. Use a point of luck to extend its life.');

                LootManager.breakWeapon(Player.equipped);
                Player.unequipWeapon();
                weapon.unequip();
            }
        }
    }

    static corrodeItem(weapon, n){
        let item = weapon.item;
        if(!weapon.item){
            return false;
        }
        if(item.resistant){
            return false;
        }
        n = Random.roll(0,n);
        if(!item.flimsy){
            item.flimsy = 0;
        }
        item.flimsy +=n;
        if(n){
            EntityManager.transmitMessage(item.name + ' is corroding...', 'danger',"corroding",false,weapon.id);
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

    static checkPlayerExertion(){
        if(Player.exertion > 1){
            if(Player.stamina){
                Player.changeStamina(-1);
            }else{
                EntityManager.cancelAction({insuficientStamina:true});
                return false;
            }
        }

        return true;
    }

    static checkUnwieldy(){
        if(Player.equipped && Player.equipped.unwieldy){
            if(Player.stamina){
                Player.changeStamina(Player.equipped.unwieldy*-1);
            }else{
                EntityManager.cancelAction({insuficientStamina:true});
                return false;
            }
        }

        return true;
    }

    static checkEther(){
        if(Player.equipped && Player.equipped.ether){
            Player.changeStamina(1);
        }
    }
    
    static movePlayer(x,y){
        if(!EntityManager.checkPlayerExertion()){
            return false;
        }
        if(!EntityManager.checkUnwieldy()){
            return false;
        }
        EntityManager.checkEther();

        let playerEntity = EntityManager.getEntity("player");
        let unarmedStrike = playerEntity.checkUnarmedStrike(x,y);
        if(!EntityManager.moveEntity('player',x,y) && !unarmedStrike){
            EntityManager.cancelAction({blocked:true})
        }
    }

    static rotateSword(id, direction){
        let sword = EntityManager.getEntity(id);
        sword.rotate(direction);
    }

    static triggerBehaviors(){
        for (const [k,entity] of Object.entries(EntityManager.entities)){
            let random = Math.random()*100;
            let skip = 0;
            if(entity.stunned){
                skip+= entity.stunned;
            }
            let slow = 0;
            if(entity.behaviorInfo){
                slow += (random <= entity.slow);
                skip += slow;
            }
            if(entity.wait){
                //wait until is within screen AND has player los
                if(!EntityManager.hasPlayerLos(entity)){
                    skip++;
                }else{
                    entity.wait = false;
                }
            }else
            
            if(!entity.wait && entity.wakeupChance && !entity.awake){
                if(Math.random()*100 < entity.wakeupChance){
                    entity.awake = true;
                }else{
                    skip++
                }
            }
            
            if (!skip){
                entity.parryable = false;
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

                if(entity.changeForms){
                    entity.checkTransform('perTurnChance')
                }
                
            }
            if(entity.decay && !slow){
                entity.triggerDecay();
            }
            //can still spawn if stunned
            if(entity.spawnEntities && !slow && !entity.wait){
                EntityManager.spawnEntity(entity);
            }
            entity.stunned = Math.max(entity.stunned-1, 0);
            if (!entity.dead){ 
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
            EntityManager.transmitMessage('equipped weapon: '+weapon.name, false, false, false, sword.id);
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
        console.log(json.roster)
        json.roster.forEach((entitySave)=>{
            let groupInfo = entitySave.entityGroupInfo;
            let entityObj;
            let x = entitySave.x;
            let y = entitySave.y;
            let random = Random.roll(0,99);
            let spawn = (random < groupInfo.spawnChance || !groupInfo.spawnChance);
            if(groupInfo.entityType == "player"){
                EntityManager.playerEntity = EntityManager.playerInit(x, y)
            }else if(groupInfo.entityType == "monster"){
                if(entitySave.alive && spawn){
                    entityObj = new Monster(groupInfo.key,x,y,groupInfo);
                }
            }else if(groupInfo.entityType == 'wall'){
                entityObj = new Wall(x, y, groupInfo.hitDice, groupInfo.name, groupInfo.destructible, groupInfo.wallType);
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
                if(entitySave.containedEntities){
                    entityObj.containedEntities = entitySave.containedEntities;
                }else{
                    entityObj.generateContainedEntities();
                }
            }
        })
        
        EntityManager.currentMap = json;
        
    }

    //function used for entities spawning other entities
    //if they live when you leave the dungeon, their loot is returned to their container
    static spawnEntity(spawner){
        let spawnEntities = spawner.spawnEntities;

        if(!spawner.containedEntities.length){
            return false
        }

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
            if(entityObj.spawnEntities){
                entityObj.generateContainedEntities();
            }
            entityObj.setPosition();
            entityObj.spawnerID = spawner.id;
            if(!entityObj){
                console.log('SPAWNER FAILED TO INSTANTIATE ENTITY')
                return false;
            }

            if(spawner.spawnEntities.items){
                LootManager.getEntityLoot(entityObj, 'monster');
            }else{
                //take items from spawner
                //cant take more than half the items because inventory length updates as they are taken
                //i like this
                for(let j = 0; j < spawner.inventory.items.length; j++){
                    if(Math.random()*100 < 100  && entityObj.inventory.items.length < entityObj.inventorySlots){
                        let item = spawner.inventory.items.splice(j,1)[0];
                        entityObj.inventory.items.push(item);
                    }
                }
            }
    
            
    
            if(EntityManager.hasPlayerLos(entityObj) && Board.hasLight(entityObj)){
                Log.addMessage(entityObj.name+" emerges from "+spawner.name+".",'danger', false, false, entityObj.id);
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
            if(typeof entity.spawnerID != 'undefined' ){
                if ((entity.dead && !entity.reconstitute) || entity.obliterated){
                    delete EntityManager.entities[key];
                }else{
                    let spawner = EntityManager.getEntity(entity.spawnerID)
                    let spawnerSave = false;
                    if(spawner){
                        spawner.returnContainedEntity(entity);
                        spawnerSave = EntityManager.currentMap.roster[spawner.index];
                    }
                    //if spawner was spawned, don't bother
                    if(spawnerSave && !spawnerSave.spawnerID && !spawner.spawnEntities.items){
                        spawnerSave.inventory.items = spawner.inventory.items;
                        spawnerSave.inventory.gold = spawner.inventory.gold;
                        spawnerSave.containedEntities = spawner.containedEntities;
                    }
                   
                }
                
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

    static transmitMessage(message, messageClass = false, keyword = false, tipText = false, id=-1){
        Log.addMessage(message, messageClass, keyword, tipText, id);
        console.log(message);
    }

    //does this entity have line of sight of player (DOES NOT INCLUDE LIGHT, BUT RETURNS FALSE IF OUTSIDE OF VIEW WINDOW)
    static hasPlayerLos(entity){
        return Board.getLineOfSight(entity.x,entity.y);
    }

    static transformEntity(entity, formInfo){
        let newEntity;
        if(formInfo.container){
            newEntity = new Container(formInfo.formKey,entity.x,entity.y)
        }else{
            newEntity = new Monster(formInfo.formKey,entity.x,entity.y);
        }
        let newID = newEntity.id;
        if(!formInfo.resetMortal){
            newEntity.mortal = entity.mortal;
        }
        newEntity.inventory = entity.inventory;
        newEntity.index = entity.index;
        newEntity.id = entity.id;
        newEntity.stunned = entity.stunned
        //its possible for new form to roll a lower threshold than current mortal.
        //this makes sure it's always alive if it was before.
        if(!formInfo.resetMortal && !entity.dead && newEntity.mortal >= newEntity.threshold){
            newEntity.threshold = newEntity.mortal+1
        }
        
        if(formInfo.name){
            newEntity.name = formInfo.name
        }
        if(formInfo.message){
            Log.addMessage(entity.name + formInfo.message, formInfo.messageClass, false, false, entity.id);
        }
        EntityManager.entities[entity.id] = newEntity;

        //otherwise entitymanager will have two pointers to the same entity
        delete EntityManager.entities[newID]
        Board.placeEntity(newEntity,newEntity.x,newEntity.y);
    }

    static sendStrikeMessage(strikeType, weapon, target){
        let message = '';
        let tipText = '';
        switch (strikeType){
            case "swing":
                message = 'you swing your weapon into the '+target.name+"."
                tipText = "A swing is a strike that has you rotating your weapon into a target."
                break;
            case "jab":
                message = "you jab the "+target.name+'.'
                tipText = "A target is jabbed when you strike them by advancing towards them."
                break;
            case "strafe":
                message = "you deliver a strafing strike to the "+target.name+"."
                strikeType = "strafing"
                tipText = "A strafing strike is one where you strike while moving sideways or backwards diagonally"
                break;
            case "draw":
                message = 'you draw your weapon, striking the '+target.name+"."
                tipText = "a draw strike occurs when you draw your weapon into a target."
                break;
            default:    
                message = "you strike the "+target.name+".";

        }
        EntityManager.transmitMessage(message,false,strikeType,tipText,target.id);
    }

    static getDamageText(target,damage){
        if(!damage){
            return 'a negligible strike...'
        }
        let ratio = damage/target.threshold

        if(ratio <= 0.2){
            return 'a pitiful strike...'
        }

        if(ratio <= 0.4){
            return 'a solid strike.'
        }

        if(ratio <= 0.7){
            return 'a powerful blow!'
        }

        return 'a devastating blow!'
    }

    static getPossibleStrikes(target){
        let playerPos = EntityManager.playerEntity;
        console.log(playerPos);
        let weaponPos = playerPos.swordEntity;
        let possibleStrikes = [];
        console.log(weaponPos,target);

        let swordToTarget = {
            x:target.x - weaponPos.x,
            y:target.y - weaponPos.y
        }

        let playerToWeapon = {
            x: weaponPos.x - playerPos.x,
            y: weaponPos.y - playerPos.y
        }


        if(Player.equipped && EntityManager.getDistance(weaponPos,target) == 1){
            console.log('equipped');
            //the space the player would have to move into to make a moving attack
            let moveSpace = {x: target.x - playerToWeapon.x, y: target.y - playerToWeapon.y}
            let canMoveStrike = Board.isOpenSpace(moveSpace.x, moveSpace.y) || Board.entityAt(moveSpace.x,moveSpace.y).id == playerPos.swordEntity.id
            //is target in same direction by any axis, and would that result in player stepping in open space?
            if(
                (swordToTarget.x == playerToWeapon.x || swordToTarget.y == playerToWeapon.y) &&
                canMoveStrike
            ){
                possibleStrikes.push('jab')
            }

            //if target has the same x or y as weapon and target is adjacent to player
            if(
                (!swordToTarget.x || !swordToTarget.y) &&
                EntityManager.getDistance(playerPos,target) == 1
            ){
                possibleStrikes.push('swing');
            }

            if(
                EntityManager.getDistance(playerPos,target) == 1 &&
                canMoveStrike
            ){
                possibleStrikes.push('strafe');
            }
        }else{
            if(!swordToTarget.x && !swordToTarget.y){
                possibleStrikes.push('draw');
            }

            if(playerPos.canUnarmedStrike){
                possibleStrikes.push('unarmed');
            }
        }

        return possibleStrikes
    }

    static emitSound(pos,volume){
        let entity;
        for(let x = pos.x-volume; x <= pos.x+volume; x++){
            for(let y = pos.y-volume; y <= pos.y+volume; y++){
                //check for true distance - this way it's a circle, not a square.
                let trueDistance = Board.getTrueDistance({x:x,y:y},pos);
                if(trueDistance > volume){
                    continue;
                }
                entity = Board.entityAt(x,y);
                if(!entity || entity.isWall || !Board.hasLos({x:x,y:y},pos)){
                    continue;
                }

                entity.hearSound(volume - trueDistance);
            }
        }
    }

}