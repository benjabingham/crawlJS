class EntityGroup{
    id;
    //monster, player, container, wall
    entityType;
    //connects entity to entity from vars file
    key;
    symbol = 'O';
    color;
    entityName;
    groupName;
    spawnChance = 100;
    respawnChance = 100;
    instances = {};
    count = 0;

    constructor(){
        this.id = EntityGroupManager.groupCount;
        EntityGroupManager.groupCount++;
        EntityGroupManager.EntityGroups[this.id] = this;

        this.groupName = "group"+this.id;
    }

    setKey(key){
        this.key = key;
        let template = monsterVars[key];

        this.entityName = template.name;
        this.symbol = template.symbol;
        this.color = template.color;
    }

    newInstance(x,y){
        return new EntityInstance(x,y,this.id);
    }
}

class EntityInstance{
    entityGroupId;
    id;
    x;
    y;

    constructor(x,y,entityGroupId){
        let entityGroup = EntityGroupManager.getGroup(entityGroupId);
        this.id = entityGroup.count;
        entityGroup.count++;
        entityGroup.instances[this.id] = this;

        this.entityGroupId = entityGroupId;
        this.x = x;
        this.y = y;
    }

    get entityGroup(){
        return EntityGroupManager.getGroup(this.entityGroupId);
    }

    get symbol(){
        return this.entityGroup.symbol;
    }

    get color(){
        return this.entityGroup.color;
    }

    get entityName(){
        return this.entityGroup.entityName;
    }

    get groupName(){
        return this.entityGroup.groupName;
    }

    delete(){
        delete this.entityGroup.instances[this.id];
    }

}