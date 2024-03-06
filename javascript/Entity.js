//TODO - make Creature class which includes player and monster
//TODO - 'attackable' property
class Entity{
    name;
    symbol;
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
            EntityManager.setPosition(this.id,x,y);
            return true;
        }else if(Board.itemAt(x,y) && Board.itemAt(x,y).isContainer){
            this.lootContainer(Board.itemAt(x,y));
            return true;
        }else if(!Board.isSpace(x,y) && this.id == "player"){
            GameMaster.travel(x,y);
            return true;
        }

        return false;
    }

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
            //find a backup space, in case none of the other options is further from knocker than current position.
            //TODO - should keep looking for furthest possible backupspace, not stop after finding one.
            if(Board.isOpenSpace(x,y) && !backupSpace){
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
            EntityManager.setPosition(this.id,x,y)
        }else if (backupSpace){
            EntityManager.setPosition(this.id,backupSpace.x,backupSpace.y);
        }else{
            EntityManager.transmitMessage(this.name + " is cornered!", 'pos');
            if(knocker.isSword){
                let owner = EntityManager.getEntity(knocker.owner);
                owner.setToLastPosition();
                knocker.setToLastPosition();
                knocker.place();
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

    setToLastPosition(){
        let lastPosition = History.getSnapshotEntity(this.id);
        if (this.isSword){
            this.rotation = lastPosition.rotation;
        }else{
            EntityManager.setPosition(this.id,lastPosition.x,lastPosition.y)
        }
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
        let beatChance = 0;
        if(this.behaviorInfo){
            beatChance = this.behaviorInfo.beat;
        }

        let random = Random.roll(1,100);
        if(random <= beatChance || knock){
            EntityManager.transmitMessage(this.name+" knocks your weapon out of the way!", 'danger');
            EntityManager.knockSword(targetSword.id);
        }else if(Player.equipped){
            EntityManager.transmitMessage("You hold steady!");
        }     
    };

    sturdy(attacker){
        if(!this.behaviorInfo){
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
        this.rotation = 3;

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
        let owner = EntityManager.getEntity(this.owner);
        let prevPosition = {x:this.x, y:this.y};
        let prevRotation = this.rotation;

        let translation = EntityManager.translations[this.rotation];
        let x = owner.x + translation.x;
        let y = owner.y + translation.y;

        if(Board.isOccupiedSpace(x,y)){
            let target = Board.itemAt(x,y);
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
            EntityManager.setPosition(this.id,x,y);
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
            console.log(target);
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

    knockSword(){
        //direction is either 1 or -1
        let direction = (Random.roll(0,1) * 2) - 1;
        let rotation = (this.rotation + 8 + direction) % 8;
        let translation = EntityManager.translations[rotation];
        let x = this.owner.x + translation.x;
        let y = this.owner.y + translation.y;
        let counter = 1;
        while((!Board.itemAt(x,y).isWall && Board.itemAt(x,y)) && counter < 3){
            rotation = (sword.rotation + 8 + direction) % 8;
            translation = EntityManager.translations[rotation];
            x = owner.x + translation.x;
            y = owner.y + translation.y;
        
            counter++;
        }

        if(Board.itemAt(x,y).isWall || !Board.itemAt(x,y)){
            EntityManager.transmitMessage('sword knocked!', 'danger');
            this.rotation = rotation;
            this.place();
        }
    }

    //place sword in space closest to center between two points
    findSwordMiddle(pos1,pos2){
        let owner = EntityManager.getEntity(this.owner);
        //direction is either 1 or -1
        let direction = (Random.roll(0,1) * 2) - 1;
        let rotation = (this.rotation + 8 + direction) % 8;
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

        this.rotation = bestRotation;
        this.place();
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
            this.sturdy -= 7;
            if(!this.behaviorInfo.beat){
                this.behaviorInfo.beat = 0;
            }
            this.beat -=7;
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

        this.name = this.inventory.items[this.inventory.items.length-1].name;
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