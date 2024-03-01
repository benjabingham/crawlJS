class Entity{
    name;
    symbol;
    id;
    x;
    y;
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
            EntityManager.setPosition(id,x,y);
            return true;
        }else if(Board.itemAt(x,y) && Board.itemAt(x,y).isContainer){
            EntityManager.lootContainer(entity,Board.itemAt(x,y));
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
        knockerPos = EntityManager.history[EntityManager.history.length-1].entities[knockerId];
        
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
                EntityManager.setToLastPosition(knocker.owner);
                EntityManager.setToLastPosition(knockerId);
                knocker.place();
            }
        }
    }
}

class PlayerEntity extends Entity{
    sword;

    constructor(x=0, y=0){
        super("☺", x, y, 'you', 'player')
        this.sword = new SwordEntity(this.id, Player.equipped).id;

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

    get symbol(){
        let symbol = '|'
        if (this.rotation % 4 == 1){
            symbol = '/';
        }else if (this.rotation % 4 == 2){
            symbol = '—';
        }else if (this.rotation % 4 == 3){
            symbol = '\\';
        }
    
        return symbol;
    }

    equip(item){
        this.item = item;
        this.name = item.name;
    }

    unequip(){
        this.item = false;
        this.name = 'UNEQUIPPED';
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
            if(target.id != this.id && target.behavior != 'wall'){
                //TODO: Sword.attack()
                this.swordAttack(target);
                if (this.owner == 'player'){  
                    let strikeType = this.getStrikeType();
                    let weight;
                    if(this.item[strikeType]){
                        weight = this.item[strikeType].weight;
                    }else{
                        weight = this.item.weight;
                    }
                    Player.changeStamina(weight * -1);
                }
            }
        }
        //if sword hasn't been placed somewhere else as result of attack...
        if(prevRotation == this.rotation && this.x == prevPosition.x && this.y == prevPosition.y && this.item){
            EntityManager.setPosition(id,x,y);
        }
        //undo action if results in negative player stamina
        if (Player.stamina < 0){
            EntityManager.cancelAction({insuficientStamina:true});
        }
    }

    getStrikeType(){
        let ownerPos = EntityManager.getEntity(this.owner);
        let lastSwordPos = EntityManager.history[EntityManager.history.length-1].entities[this.id];
        let lastOwnerPos = EntityManager.history[EntityManager.history.length-1].entities[this.owner];
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
        let strikeType = attacker.getStrikeType();
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
            EntityManager.addStunTime(target.id,stunAdded);
            EntityManager.addMortality(target.id, mortality);
            EntityManager.knock(target.id, attacker.id);
            EntityManager.enrageAndDaze(target);   
            EntityManager.sturdy(attacker,target);
        }

        if(this.owner == 'player'){
            EntityManager.degradeItem(weapon,0,0.25);
        }
    }

    rotate(direction){
        this.rotation += 8 + direction;
        this.rotation %= 8;
    }

    static knockSword(){
        //direction is either 1 or -1
        let direction = (Random.roll(0,1) * 2) - 1;
        let rotation = (this.rotation + 8 + direction) % 8;
        let translation = EntityManager.translations[rotation];
        let x = this.owner.x + translation.x;
        let y = this.owner.y + translation.y;
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
            this.rotation = rotation;
            this.place();
        }
    }
}

class Monster extends Entity{
    //behavior - string determing monster's behavior method
    behavior;
    //behaviorInfo - object containing parameters to be passed to behavior method
    behaviorInfo;
    //stunned - integer decreases when positive each turn, takes double damage and skips turn while positive.
    stunned;
    //mortal - the amount of damage it has taken
    mortal = 0;
    //threshold - the amount of damage that will destroy it
    threshold;
    inventorySlots;
    //damage - determines the amount of damage done by this monsters attacks
    damage;
    isMonster = true;

    constructor(symbol, behavior, x=0, y=0, hitDice = 1, damage =0, behaviorInfo = {}, name = false, inventorySlots = 10){
        super(symbol, x, y, name);
        this.threshold = Math.max(Random.rollN(hitDice,1,8),1);
        this.behavior = behavior;
        this.behaviorInfo = behaviorInfo;
        this.damage = damage;
        this.inventorySlots = inventorySlots;

        return this;
    }
}

class Wall extends Entity{
    mortal = 0;
    threshold;
    isWall = true;

    constructor(x=0,y=0,hitDice = 10, name=false){
        super(false,x,y,name);
        this.threshold = Math.max(Random.rollN(hitDice,1,20),1);

        return this;
    }
}