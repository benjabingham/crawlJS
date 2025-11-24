class EntityGroup{
    id;
    //monster, player, container, wall
    entityType;
    //connects entity to entity from vars file
    key;
    symbol;
    color;
    entityName;
    groupName;
    spawnChance = 100;
    respawnChance = 100;
    wait = false;
    instances = {};
    count = 0;

    constructor(empty = false){
        if(empty){
            return false;
        }
        this.id = EntityGroupManager.groupCount;
        EntityGroupManager.groupCount++;
        EntityGroupManager.entityGroups[this.id] = this;

        this.groupName = "group"+this.id;
    }

    load(json){
        for(const [key,val] of Object.entries(json)){
            this[key] = val;
        }
        this.classifyInstances();
    }

    classifyInstances(){
        for(const [key, val] of Object.entries(this.instances)){
            let instance = new EntityInstance(false, false, false, true);
            instance.load(val);
            this.instances[key] = instance;
        }
    }

    setKey(key){
        let template;
        if(this.entityType == 'monster'){
            template = monsterVars[key];
        }else if(this.entityType == 'container'){
            template = containerVars[key];
            this.respawnChance = 0;
        }else{
            return false;
        }

        this.key = key;
        this.entityName = template.name;
        this.symbol = template.symbol;
        this.color = template.color;
    }

    setEntityType(type){
        this.entityType = type;
        if(type == 'player'){
            this.symbol = '☺';
        }else if(type == 'wall'){
            this.symbol = '';
        }
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

    constructor(x,y,entityGroupId, empty = false){
        if(empty){
            return false;
        }
        let entityGroup = EntityGroupManager.getGroup(entityGroupId);
        this.id = entityGroup.count;
        entityGroup.count++;
        entityGroup.instances[this.id] = this;

        this.entityGroupId = entityGroupId;
        this.x = x;
        this.y = y;
    }

    load(json){
        for(const [key,val] of Object.entries(json)){
            this[key] = val;
        }
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