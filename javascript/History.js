class History{
    static snapshots = [];
    static snapshotLimit = 10;
    static trackedEntities = [];

    static reset(){
        History.snapshots = [];
        History.trackedEntities = [];
    }

    //get snapshot of entities from n turn(s) ago 
    static getSnapshotEntities(n = 1){
        //return JSON.parse(History.snapshots[this.snapshots.length-n].entities);
        let snapshotEntities = History.snapshots[this.snapshots.length-n].entities
        return History.decodeSnapshotEntities(snapshotEntities);
    }

    static decodeSnapshotEntities(snapshotEntities){
        let entities = {};
        for (const [key, entity] of Object.entries(snapshotEntities)) { 
            entities[key] = JSON.parse(entity);
        }

        return entities;
    }

    static getSnapshotEntity(id, n=1){
        let snapshotEntity = History.snapshots[this.snapshots.length-n].entities[id];
        if (snapshotEntity){
            return JSON.parse(snapshotEntity);
        }

        console.log({
            id:id,
            entity:EntityManager.getEntity(id)
        });
        throw new Error('Entity does not exist in History.snapshots! ');

        return false;
    }

    static popSnapshot(){
        let snapshot = History.snapshots.pop();
        snapshot.entities = History.decodeSnapshotEntities(snapshot.entities);
        return snapshot;
    }

    static saveSnapshot(){
        //let entities = JSON.stringify(EntityManager.entities);
        let entities = {};
        for (const [key, entity] of Object.entries(EntityManager.entities)) { 
            if(!(entity.isWall && !entity.destructible)){
                entities[key] = JSON.stringify(entity);
            }
        }
        let playerJson = Player.getPlayerJson();
        History.snapshots.push({
            entities:entities,
            player:playerJson,
            stainArray:JSON.stringify(Board.stainArray)
        })

        History.trim();
    }

    static trim(){
        if(History.snapshots.length > History.snapshotLimit){
            History.snapshots.shift();
        }
    }

    static canRewind(){
        return History.snapshots.length > 1 && Player.luck > 0;
    }

    static rewind(){
        console.log('rewind');
        let luck = Player.luck-1;
        History.snapshots.pop();
        let snapshot = History.popSnapshot();
        EntityManager.loadSnapshot(snapshot);
        Board.stainArray = JSON.parse(snapshot.stainArray);
        Board.placeEntities();
        
        Player.setPlayerInfo(snapshot.player);
        EntityManager.syncPlayerInventory();
       
        Player.luck = Math.max(0,luck);
    }
}