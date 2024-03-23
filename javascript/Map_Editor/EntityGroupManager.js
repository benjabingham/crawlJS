class EntityGroupManager{
    static EntityGroups = {};
    static groupCount = 0;
    static selectedEntityGroup = -1;

    static getGroup(id = -1){
        if(id == -1){
            id = EntityGroupManager.selectedEntityGroup;
        }
        return EntityGroupManager.EntityGroups[id];
    }

    static selectGroup(groupID){
        EntityGroupManager.selectedEntityGroup = groupID;
        return EntityGroupManager.getCurrentGroup();
    }

    static getCurrentGroup(){
        if(EntityGroupManager.selectedEntityGroup == -1){
            return false;
        }

        return EntityGroupManager.EntityGroups[EntityGroupManager.selectedEntityGroup];
    }

    static get currentEntityType(){
        let group = EntityGroupManager.getCurrentGroup();
        return group.entityType;
    }

    static get currentKey(){
        let group = EntityGroupManager.getCurrentGroup();
        return group.key;
    }

    static get currentSymbol(){
        let group = EntityGroupManager.getCurrentGroup();
        return group.symbol;
    }

    static get currentColor(){
        let group = EntityGroupManager.getCurrentGroup();
        return group.color;
    }

    static get currentEntityName(){
        let group = EntityGroupManager.getCurrentGroup();
        return group.entityName;
    }

    static get currentGroupName(){
        let group = EntityGroupManager.getCurrentGroup();
        return group.groupName;
    }

    static get currentSpawnChance(){
        let group = EntityGroupManager.getCurrentGroup();
        return group.spawnChance;
    }

    static get currentRespawnChance(){
        let group = EntityGroupManager.getCurrentGroup();
        return group.respawnChance;
    }

    static setEntityType(entityType){
        let group = EntityGroupManager.getCurrentGroup();
        group.setEntityType(entityType);
    }

    static setKey(key){
        let group = EntityGroupManager.getCurrentGroup();
        group.setKey(key);
    }

    static setColor(color){
        let group = EntityGroupManager.getCurrentGroup();
        group.color = color;
    }

    static setEntityName(entityName){
        let group = EntityGroupManager.getCurrentGroup();
        group.entityName = entityName;
    }

    static setSymbol(symbol){
        let group = EntityGroupManager.getCurrentGroup();
        group.symbol = symbol;
    }

    static setGroupName(groupName){
        let group = EntityGroupManager.getCurrentGroup();
        group.groupName = groupName;
    }

    static setSpawnChance(spawnChance){
        let group = EntityGroupManager.getCurrentGroup();
        group.spawnChance = spawnChance;
    }

    static setRespawnChance(respawnChance){
        let group = EntityGroupManager.getCurrentGroup();
        group.respawnChance = respawnChance;
    }
}