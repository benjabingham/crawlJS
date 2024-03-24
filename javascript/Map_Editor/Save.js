class Save{

    static history = [];
    static future = [];
    static historyMax = 100;

    static load(json){
        //Grid.load(JSON.parse(json.grid));
        EntityGroupManager.load(JSON.parse(json.entityGroups));
        Grid.placeEntities();
        Grid.updateGrid();
        Controls.populateEntityGroupSelect();
        Controls.chooseGroup(EntityGroupManager.selectedEntityGroup);
    }

    static saveSnapshot(trimFuture = true){
        let snapshot = {
            grid: JSON.stringify(Grid.getObject()),
            entityGroups: JSON.stringify(EntityGroupManager.getObject())
        }

        Save.history.push(snapshot);
        if(Save.history.length > Save.historyMax){
            Save.history.shift();
        }

        if(trimFuture){
            Save.future = [];
        }
    }

    static rewind(){
        if(Save.history.length > 1){
            Save.future.push(Save.history.pop())
            Save.load(Save.history.pop());
            Save.saveSnapshot(false);
        }
    }

    static fastForward(){
        if(Save.future.length > 0){
            let snapshot = Save.future.pop()
            Save.load(snapshot);
            Save.history.push(snapshot);
        }
    }
}