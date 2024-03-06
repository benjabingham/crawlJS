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
        return JSON.parse(History.snapshots[this.snapshots.length-n].entities);
    }

    static popSnapshot(){
        let snapshot = History.snapshots.pop();
        snapshot.entities = JSON.parse(snapshot.entities);
        return snapshot;
    }

    static saveSnapshot(){
        let entities = JSON.stringify(EntityManager.entities);
        let playerJson = Player.getPlayerJson();
        History.snapshots.push({
            entities:entities,
            player:playerJson
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
        Board.placeEntities();
        
        Player.setPlayerInfo(snapshot.player);
        EntityManager.syncPlayerInventory();
       
        Player.luck = Math.max(0,luck);
    }
}