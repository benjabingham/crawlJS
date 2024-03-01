class Entity{
    name;
    symbol;
    id;
    x;
    y;
    constructor(symbol='o', x=-1, y=-1, name=false){
        let id = EntityManager.entityCounter;

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
}

class SwordEntity extends Entity{
    owner;
    rotation;
    //item is the item object the sword entity represents. Is false if no weapon equipped.
    item;
    constructor(ownerId, item=false){
        let id = EntityManager.entityCounter;
        this.symbol = false;
        this.id = id;
        this.owner = ownerId;  
        this.rotation = 3;

        if(item){
            this.equip(item);
        }
        EntityManager.entityCounter++;
        EntityManager.setEntity(id,this);

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
                this.attack(target);
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
}