//TODO - 'attackable' property
class Entity{
    name;
    symbol;
    color;
    id;
    x;
    y;
    inventory = {
        slots:0,
        items:[]
    }
    //index refers to an entity's index in its map's save array
    index;
    constructor(symbol='o', x=-1, y=-1, name=false, id=false){
        if (!id){
            id = EntityManager.entityCounter;
        }

        if(!name){
            name = id;
        }

        this.name = name;
        this.symbol = symbol;
        this.id = id;
        this.x = x;
        this.y = y;

        EntityManager.entityCounter++;
        EntityManager.setEntity(id,this);

        return this;
    }

    move(x, y){
        x += this.x;
        y += this.y;
    
        if(Board.isSpace(x,y) && Board.isOpenSpace(x,y)){
            this.setPosition(x,y);
            return true;
        }else if(Board.entityAt(x,y) && Board.entityAt(x,y).isContainer){
            this.lootContainer(Board.entityAt(x,y));
            return true;
        }else if(!Board.isSpace(x,y) && this.id == "player"){
            GameMaster.travel(x,y);
            return true;
        }

        return false;
    }

    //knocks this entity into another space.
    //Attempts to knock entity into space further from knocker's space in last frame than current space
    //If no such space is found, defaults to furthest space found.
    knock(knockerId){
        let knocker = EntityManager.getEntity(knockerId);
        let knockerPos;
        knockerPos = History.getSnapshotEntity(knockerId);
        
        //pick a random adjacent space
        let direction = Random.roll(0,7);
        let x = this.x + EntityManager.translations[direction].x;
        let y = this.y + EntityManager.translations[direction].y;
    
        let tries = 0;
        //space must be open AND further from attacker's last position
        let furtherSpace = (EntityManager.getOrthoDistance(knockerPos, this) < EntityManager.getOrthoDistance(knockerPos,{x:x, y:y}))
        let backupSpace = false;
        while((!Board.isOpenSpace(x,y) || !furtherSpace ) && tries <= 8){
            //backupSpacetracks the furthest space we've found so far
            if(Board.isOpenSpace(x,y) && (!backupSpace || EntityManager.getOrthoDistance(knockerPos,{x:x, y:y}) > EntityManager.getOrthoDistance(knockerPos,backupSpace))){
                backupSpace = {x:x, y:y};
            }

            //look at next adjacent space
            direction = (direction+1) % 8;
            x = this.x + EntityManager.translations[direction].x;
            y = this.y + EntityManager.translations[direction].y;

            //chek again if this space is further from attacker than original space
            furtherSpace = (EntityManager.getOrthoDistance(knockerPos, this) < EntityManager.getOrthoDistance(knockerPos,{x:x, y:y}))
            //only try this 8 times - then you've checked every space.
            tries++;
        }

        if(furtherSpace && Board.isOpenSpace(x,y)){
            this.setPosition(x,y)
        }else if (backupSpace){
            this.setPosition(backupSpace.x,backupSpace.y);
        }else{
            EntityManager.transmitMessage(this.name + " is cornered!", 'pos');
            if(knocker.isSword){
                let owner = EntityManager.getEntity(knocker.owner);
                owner.setToLastPosition();
                let lastSword = History.getSnapshotEntity(knocker.id)
                let lastSwordPos = knocker.getSwordPosition(lastSword.rotation);
                //should never happen... but just in case
                if(!knocker.findSwordMiddle(lastSwordPos,knocker)){
                    knocker.unequip();
                }
            }
        }
    }

    //rewind to a saved snapshot of this object
    rewind(entitySnapshot){
        if(!entitySnapshot){
            this.obliterate();
            return;
        }
        for (const [key, val] of Object.entries(entitySnapshot)) { 
            this[key] = val;
        }

        for (const [key, val] of Object.entries(this)) { 
            this[key] = entitySnapshot[key];
        }

    }

    pickUpItemPile(itemPile){
        if(EntityManager.skipBehaviors || !this.inventory.slots){
            return false;
        }

        if(!this.isItemPile && itemPile.dropTurn >= Log.turnCounter){
            return false;
        }

        while(itemPile.inventory.items.length > 0 && this.inventory.items.length < this.inventory.slots){
            this.inventory.items.push(itemPile.inventory.items.pop());
        }

        if(ItemPile.prototype.isPrototypeOf(this)){
            this.sortInventory();
            this.dropTurn = Math.max(itemPile.dropTurn, this.dropTurn)
        }

        itemPile.checkIsEmpty();

    }

    dropItem(slot){
        if(!this.inventory.items[slot]){
            return false;
        }

        let item = this.inventory.items.splice(slot,1);

        new ItemPile(this.x, this.y, item);
    }

    dropInventory(){
        if(!this.inventory.items || this.inventory.items.length == 0){
            return false;
        }
        new ItemPile(this.x, this.y, this.inventory.items);
        this.inventory.items = [];
    }

    lootContainer(container){
        if (!container.inventory.items){
            return false;
        }
        if(!this.inventory.items){
            this.inventory.items = [];
        }

        while(container.inventory.items.length > 0 && this.inventory.items.length < this.inventory.slots){
            this.inventory.items.push(container.inventory.items.pop());
        }
    }

    obliterate(){
        this.obliterated = true;
        this.x = -1;
        this.y = -1;
    }

    removeFromBoard(){
        Board.updateSpace(this.x,this.y);
        this.setPosition(-1,-1);
    }

    setPosition(x,y){
        Board.clearSpace(this.x,this.y) 
        this.x = x;
        this.y = y;
        Board.placeEntity(this,x,y)
    }

    //returns false if last position is equal to current position.
    setToLastPosition(){
        let lastPosition = History.getSnapshotEntity(this.id);
        if (this.isSword){
            if(this.rotation != lastPosition.rotation){
                this.rotation = lastPosition.rotation;
                return true;
            }
        }else{
            if(!(this.x == lastPosition.x && this.y == lastPosition.y)){
                this.setPosition(lastPosition.x,lastPosition.y)
                return true;
            }
        }

        return false;
    }

    addMortality(mortal){
        if(!this.mortal){
            this.mortal = 0;
        }
        this.mortal += mortal;
    }

    kill(){
        if(this.isMonster){
            if(Board.hasPlayerLos(this)){
                EntityManager.transmitMessage(this.name+" is slain!", 'win');
            }
            this.name += " corpse";
            this.behavior = 'dead';
            this.dead = true;
            this.stunned = 0;
        }else{
            if(Board.hasPlayerLos(this)){
                EntityManager.transmitMessage(this.name+" is destroyed!")
            }
            this.name = "destroyed "+this.name;
        }
        this.tempSymbol = 'x';
        this.isContainer = true;
        /*
        if(this.tiny){
            this.item = true;
            this.walkable = true;
            this.tempSymbol = '*';
        }
        */
        let roster = EntityManager.currentMap.roster;
        if(roster[this.index]){
            roster[this.index].alive = false;
        }
    };

    //has beat% chance to beat sword out of way.
    //also beats sword out of way if damage exceeds player stamina.
    beat(targetSword){
        let knock = false;
        if(targetSword.owner == 'player'){
            EntityManager.transmitMessage(this.name+" attacks your weapon...");
            let damage = Random.roll(0,this.damage);
            Player.changeStamina(damage * -1);
            if(Player.stamina < 0){
                Player.stamina = 0;
                knock = true;
            }
            if(damage > 1){
                EntityManager.degradeItem(targetSword, damage*0.25, 1);
            }
        }
        //check if sword is still equipped
        if(!targetSword.item){
            return false
        }
        let beatChance = 0;
        if(this.behaviorInfo){
            beatChance = this.behaviorInfo.beat;
        }

        let random = Random.roll(1,100);
        if(random <= beatChance || knock){
            if (targetSword.knockSword()){
                EntityManager.transmitMessage(this.name+" knocks your weapon out of the way!", 'danger');
            }
            
        }else if(Player.equipped){
            EntityManager.transmitMessage("You hold steady!");
        }     
    };

    sturdy(attacker){
        if(!this.behaviorInfo || this.dead){
            return;
        }
        let sturdyChance = this.behaviorInfo.sturdy;

        let random = Random.roll(1,100);
        if (random <= sturdyChance){
            EntityManager.removeEntity(attacker.id);
            this.setToLastPosition();
            let attackerLastPos = History.getSnapshotEntity(attacker.id);
            if(attacker.isSword){
                attacker.findSwordMiddle(this,attackerLastPos);
            }else{
                EntityManager.setPosition(attacker.id,attackerLastPos.x, attackerLastPos.y) 
            }
            if(!this.dead){
                EntityManager.transmitMessage(this.name+" holds its footing!", 'danger');
            }
        }
    };
}

class PlayerEntity extends Entity{
    sword;
    isPlayer = true;

    constructor(x=0, y=0){
        super("☺", x, y, 'you', 'player')
        this.sword = new SwordEntity(this.id, Player.equipped).id;
        this.inventory = Player.inventory;
        this.inventory.slots = Player.inventory.slots;

        return this;
    }

    get rotation(){
        return this.swordEntity.rotation;
    }

    get swordEntity(){
        return EntityManager.getEntity(this.sword);
    }
}

class SwordEntity extends Entity{
    owner;
    rotation;
    //item is the item object the sword entity represents. Is false if no weapon equipped.
    item;
    isSword = true;

    constructor(ownerId, item=false){
        super(false, -1, -1)
        this.owner = ownerId;  
        this.rotation = 2;

        if(item){
            this.equip(item);
        }

        return this;
    }

    updateSymbol(){
        let symbol = '|'
        if (this.rotation % 4 == 1){
            symbol = '/';
        }else if (this.rotation % 4 == 2){
            symbol = '—';
        }else if (this.rotation % 4 == 3){
            symbol = '\\';
        }
    
        this.symbol = symbol;
    }

    equip(item){
        this.item = item;
        this.name = item.name;
    }

    unequip(){
        this.item = false;
        this.name = 'UNEQUIPPED';
        this.removeFromBoard();
    }

    //place the weapon. Should happen each frame. Triggers an attack if placed on another entity.
    place(){
        if (!this.item){
            return false;
        }
        let prevPosition = {x:this.x, y:this.y};
        let prevRotation = this.rotation;

        let position = this.getSwordPosition();
        let x = position.x;
        let y = position.y;

        if(Board.isOccupiedSpace(x,y)){
            let target = Board.entityAt(x,y);
            if(target.id != this.id && !target.isWall){
                if (this.owner == 'player'){  
                    let strikeType = this.getStrikeType();
                    let weight;
                    if(this.item[strikeType]){
                        weight = this.item[strikeType].weight;
                    }else{
                        weight = this.item.weight;
                    }
                    if(Player.stamina < weight){
                        EntityManager.cancelAction({insuficientStamina:true});
                        return false;
                    }else{
                        Player.changeStamina(weight * -1);
                    }
                }
                this.swordAttack(target);
            }
        }
        //if sword hasn't been placed somewhere else as result of attack...
        if(prevRotation == this.rotation && this.x == prevPosition.x && this.y == prevPosition.y && this.item){
            this.setPosition(x,y);
        }
        this.updateSymbol();
    }

    getStrikeType(){
        let ownerPos = EntityManager.getEntity(this.owner);
        let lastSwordPos = History.getSnapshotEntity(this.id);
        let lastOwnerPos = History.getSnapshotEntity(this.owner);
        if(lastSwordPos.rotation != this.rotation){
            return "swing";
        }
        if((lastSwordPos.x == ownerPos.x || lastSwordPos.y == ownerPos.y) || (lastOwnerPos.x == ownerPos.x && lastOwnerPos.y == ownerPos.y)){
            return "jab";
        }

        return "strafe";
    }

    swordAttack(target){
        let weapon = this.item;
        let damage = weapon.damage;
        let stunTime = weapon.stunTime;
        let strikeType = this.getStrikeType();
        if(weapon[strikeType]){
            damage = weapon[strikeType].damage;
            stunTime = weapon[strikeType].stunTime;
        }
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
            let owner = EntityManager.getEntity(this.owner);
            EntityManager.transmitMessage(owner.name+" strikes you with "+this.name+'!');
            Player.changeHealth(mortality * -1);
        }else{
            if(!target.dead){
                EntityManager.transmitMessage(target.name+" is struck!");
            }
            if(Monster.prototype.isPrototypeOf(target)){
                target.addStunTime(stunAdded);
            }
            target.addMortality(mortality);
            target.knock(this.id);
            if(target.enrageAndDaze){
                target.enrageAndDaze();   
            }
            target.sturdy(this);
        }

        if(this.owner == 'player'){
            EntityManager.degradeItem(this,0,0.25);
        }
    }

    rotate(direction){
        this.rotation += 8 + direction;
        this.rotation %= 8;
    }

    //tries to knock your sword either clockwise or counterclockwise, then the other. Will only knock one degree - if Both spots are taken, will not knock.
    //should sword be disarmed in failcase instead? Or just unequipped?
    knockSword(direction = false){
        let owner = EntityManager.getEntity(this.owner);
        //direction is either 1 or -1
        if(!direction){
            direction = (Random.roll(0,1) * 2) - 1;
        }
        let rotation = (this.rotation + 8 + direction) % 8;
        let position = this.getSwordPosition(rotation);
        let x = position.x;
        let y = position.y;

        if(!Board.entityAt(x,y).isWall && !Board.isOpenSpace(x,y)){
            direction *= -1;
            rotation = (this.rotation + 8 + direction) % 8;
            position = this.getSwordPosition(rotation);
            x = position.x;
            y = position.y;
        }

        if(Board.entityAt(x,y).isWall || Board.isOpenSpace(x,y)){
            this.rotation = rotation;
            this.place();
            return true;
        }

        return false;
    }

    //place sword in space closest to center between two points
    findSwordMiddle(pos1,pos2){
        let owner = EntityManager.getEntity(this.owner);
        //direction is either 1 or -1
        let direction = (Random.roll(0,1) * 2) - 1;
        let rotation = (this.rotation + 8 + direction) % 8;
        let position = this.getSwordPosition(rotation);
        let x = position.x;
        let y = position.y;

        let bestPos = {x:x, y:y};
        let bestRotation = rotation;
        let bestDistance = (Board.getTrueDistance({x:x,y:y},pos1,true)**2)+(Board.getTrueDistance({x:x,y:y},pos2,true)**2);
        let distance;

        for(let i = 0; i < 8; i++){
            distance = (Board.getTrueDistance({x:x,y:y},pos1,true)**2)+(Board.getTrueDistance({x:x,y:y},pos2,true)**2);
            let validSpace = (Board.entityAt(x,y).isWall|| !Board.entityAt(x,y))
            if(validSpace){
                if (distance < bestDistance){
                    bestDistance = distance;
                    bestPos = {x:x, y:y};
                    bestRotation = rotation;
                }
            }
            rotation = (rotation + 8 + direction) % 8;
            position = this.getSwordPosition(rotation);
            x = position.x;
            y = position.y;
        }

        let validSpace = (Board.entityAt(bestPos.x,bestPos.y).isWall|| !Board.entityAt(bestPos.x,bestPos.y))
        if(validSpace){
            this.rotation = bestRotation;
            this.place();
            return true;
        }

        return false; 
    }

    getSwordPosition(rotation = -1){
        if(rotation == -1){
            rotation = this.rotation;
        }
        let owner = EntityManager.getEntity(this.owner);
        let translation = EntityManager.translations[rotation];
        let x = owner.x + translation.x;
        let y = owner.y + translation.y;

        return {x:x, y:y}
    }
}

class Monster extends Entity{
    //behavior - string determing monster's behavior method
    behavior;
    //behaviorInfo - object containing parameters to be passed to behavior method
    behaviorInfo= {};
    //stunned - integer decreases when positive each turn, takes double damage and skips turn while positive.
    stunned = 0;
    //mortal - the amount of damage it has taken
    mortal = 0;
    //threshold - the amount of damage that will destroy it
    threshold = 1;
    //damage - determines the amount of damage done by this monsters attacks
    damage = 0;
    isMonster = true;
    //is used to temporarily change monster's symbol, ex. if stunned or killed
    tempSymbol;

    constructor(monsterKey,x,y, additionalParameters = {}){
        super(false, x, y);
        if(monsterVars[monsterKey]){
            let monster = JSON.parse(JSON.stringify(monsterVars[monsterKey]));
            //copy monster vars from template
            for (const [key, val] of Object.entries(monster)) { 
                //if legal key...
                if(!['inventory','id','x','y'].includes(key)){
                    this[key] = val;
                }
            }
        }
        
        //copy additional parameters...
        for (const [key, val] of Object.entries(additionalParameters)) { 
            //if legal key...
            if(!['inventory','id','x','y'].includes(key)){
                this[key] = val;
            }
        }

        if(this.hitDice){
            this.threshold = Math.max(Random.rollN(this.hitDice,1,8),1);
        }

        return this;
    }

    //base behavior for monsters - move straight toward player, with some randomness.
    //Randomness depends on creature's behaviorinfo.focus, and increases based on distance from the player and line of sight.
    chaseNatural(){
        let playerEntity = EntityManager.getEntity('player');
        //creature is less focused the further they are
        let focus = this.behaviorInfo.focus;
        focus -= EntityManager.getDistance(this, playerEntity);
        if(!EntityManager.hasPlayerLos(this)){
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
        }else if(this.x > playerEntity.x){
            x = -1;
        }else if (this.x < playerEntity.x){
            x = 1;
        }
        
        random = Random.roll(1,focus);
        if(random == 1){
            y = -1;
        }else if (random == 2){
            y = 1;
        }else if (random == 3 || random == 4){
            //do nothing
        }else if(this.y > playerEntity.y){
            y = -1;
        }else if (this.y < playerEntity.y){
            y = 1;
        }
    
        let targetX = this.x+x;
        let targetY = this.y+y
        let targetItem = Board.entityAt(targetX, targetY);

        if(targetItem.id == "player" || targetItem.dead || targetItem.destructible || (targetItem.owner == 'player' && !Board.wallAt(targetX, targetY))){
            this.attack(targetItem);
        }
    
        if(!this.move(x, y)){
            this.move(0, y);
            this.move(x, 0);
        }
        
    }

    attack(target){
        if(target.isSword){
            this.beat(target);
            return;
        }

        let damage = this.damage;
        let mortality = Random.roll(0,damage);

        if (target.id == 'player'){
            EntityManager.transmitMessage(this.name+" attacks you!");
            if(mortality == 0){
                EntityManager.transmitMessage(this.name+" misses!");
            }else{
                Player.changeHealth(mortality * -1);
            }
        }else if(target.isWall && target.destructible){
            EntityManager.addMortality(target.id, mortality);
        }

        if(target.dead){
            this.knock(target.id);
        }

    }

    addStunTime(stunTime){
        if(!this.stunned){
            this.stunned = 0;
        }
        this.stunned += stunTime;
    }

    enrageAndDaze(){
        if(!this.behaviorInfo || this.dead){
            return;
        }
        let enrageChance = this.behaviorInfo.enrage;
        let dazeChance = this.behaviorInfo.daze;

        let random = Random.roll(1,100);
        if(random <= enrageChance){
            EntityManager.transmitMessage(this.name+" is enraged!", 'danger', ['enraged']);
            this.behaviorInfo.focus += 5;
            if(!this.behaviorInfo.slow){
                this.behaviorInfo.slow = 0;
            }
            this.behaviorInfo.slow -= 3;
            if(!this.behaviorInfo.beat){
                this.behaviorInfo.beat = 0;
            }
            this.behaviorInfo.beat += 5;
            if(!this.behaviorInfo.sturdy){
                this.behaviorInfo.sturdy = 0;
            }
            this.behaviorInfo.sturdy += 5;
            this.stunned -= Math.max(Random.roll(0,this.stunned),0);
        }
        random = Random.roll(1,100);
        if(random <= dazeChance){
            EntityManager.transmitMessage(this.name+" is dazed!", 'pos', ['dazed']);
            this.behaviorInfo.focus -= 7;
            if(!this.behaviorInfo.slow){
                this.behaviorInfo.slow = 0;
            }
            this.behaviorInfo.slow += 7;
            if(!this.behaviorInfo.sturdy){
                this.behaviorInfo.sturdy = 0;
            }
            this.behaviorInfo.sturdy -= 7;
            if(!this.behaviorInfo.beat){
                this.behaviorInfo.beat = 0;
            }
            this.behaviorInfo.beat -=7;
            this.stunned ++;
        }
    }

}

class Wall extends Entity{
    //an indestructible wall cannot be attacked, moved, or destroyed by ANY means, and isn't tracked in History.snapshots. Is set in map file.
    destructible;
    mortal = 0;
    threshold = 100;
    isWall = true;

    constructor(x,y,hitDice = 10, name=false, destructible = false){
        super('',x,y,name);
        this.threshold = Math.max(Random.rollN(hitDice,1,20),1);
        this.destructible = destructible;

        return this;
    }
}

class Container extends Entity{
    mortal = 0;
    threshold = 1;
    isContainer = true;

    constructor(containerKey, x, y, additionalParameters = {}){
        //console.log(additionalParameters);
        super('Ch',x,y, 'chest');
        if(containerVars[containerKey]){
            let container = JSON.parse(JSON.stringify(containerVars[containerKey]));
            //copy chest vars from template
            for (const [key, val] of Object.entries(container)) { 
                //if legal key...
                if(!['inventory','id','x','y'].includes(key)){
                    this[key] = val;
                }
            }
        }
        
        //copy additional parameters...
        for (const [key, val] of Object.entries(additionalParameters)) { 
            //if legal key...
            if(!['inventory','id','x','y'].includes(key)){
                this[key] = val;
            }
        }

        if(this.hitDice){
            this.threshold = Math.max(Random.rollN(this.hitDice,1,8),1);
        }

        return this;
    }

}

class ItemPile extends Entity{
    walkable = true;
    isItemPile = true;
    dropTurn;

    constructor(x,y,inventory = []){
        super('*', x, y);

        this.inventory = {
            slots:100,
            items:inventory
        }
        this.dropTurn = Log.turnCounter;
        this.sortInventory();
    }

    sortInventory(){
        this.inventory.items.sort((item1, item2)=>{
            if(item1.value < item2.value){
                return -1;
            }else if(item2. value < item1.value){
                return 1;
            }

            return 0;
        });

        let topItem = this.inventory.items[this.inventory.items.length-1];
        this.name = topItem.name;
        this.color = topItem.color;
    }

    addItems(itemArray){
        itemArray.forEach((item)=>{
            this.inventory.items.push(item);
        })
        this.sortInventory();
    }

    checkIsEmpty(){
        if(this.inventory.items.length == 0){
            this.obliterate();
        }
    }
}