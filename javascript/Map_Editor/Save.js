class Save{

    static history = [];
    static historyMax = 100;

    static load(json){
        //Grid.load(JSON.parse(json.grid));
        EntityGroupManager.load(JSON.parse(json.entityGroups));
        Grid.placeEntities();
        Grid.updateGrid();
        Controls.populateEntityGroupSelect();
        Controls.chooseGroup(EntityGroupManager.selectedEntityGroup);
    }

    static saveSnapshot(){
        let snapshot = {
            grid: JSON.stringify(Grid.getObject()),
            entityGroups: JSON.stringify(EntityGroupManager.getObject())
        }

        Save.history.push(snapshot);
        if(Save.history.length > Save.historyMax){
            Save.history.shift();
        }
    }

    static rewind(){
        if(Save.history.length > 1){
            Save.history.pop()
            Save.load(Save.history.pop());
            Save.saveSnapshot();
        }

    }
}