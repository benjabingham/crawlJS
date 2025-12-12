class Save{

    static history = [];
    static future = [];
    static historyMax = 100;
    static mapName = 'untitled map';

    static load(json){
        Save.mapName = json.name;
        Controls.initNameInput();
        //Grid.load(JSON.parse(json.grid));
        EntityGroupManager.load(JSON.parse(json.entityGroups));
        Grid.placeEntities();
        if(json.floorMatrix){
            Grid.floorMatrix = JSON.parse(json.floorMatrix)
        }
        Grid.updateGrid();
        Controls.populateEntityGroupSelect();
        Controls.chooseGroup(EntityGroupManager.selectedEntityGroup);
    }

    static saveSnapshot(trimFuture = true){
        let snapshot = {
            name: Save.mapName,
            height: Grid.height,
            width: Grid.width,
            entityGroups: JSON.stringify(EntityGroupManager.getObject()),
            floorMatrix: JSON.stringify(Grid.floorMatrix)
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

    static getTopFrame(){
        return Save.history[Save.history.length-1];
    }

    static downloadMap(){
        //get deep copy of top frame
        let json = JSON.parse(JSON.stringify(Save.getTopFrame()));
        json.entityGroups = JSON.parse(json.entityGroups);
        let file = new File([JSON.stringify(json)], Save.mapName+'.json', {
            type:'text/plain'
        })

        //create invisible link and click on it for download
        const link = document.createElement('a');
        const url = URL.createObjectURL(file);

        link.href = url;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    }

    static loadMap(file){
        if(!file){
            return false;
        }
        Save.mapName = file.name.split('.json')[0];
        console.log(file);
        var reader = new FileReader();
        reader.readAsText(file,"UTF-8");
        reader.onload = function (evt) {
            console.log(evt);
            let fileString = evt.target.result;
            let fileJson = JSON.parse(fileString);
            //stringify so Save.load can load it like any snapshot
            fileJson.entityGroups = JSON.stringify(fileJson.entityGroups);
            Grid.load(fileJson);
            Save.load(fileJson);
            Save.saveSnapshot();
        }
        reader.onerror = function (evt) {
            $('#load-map-input').append("error reading file");
        }
    }
}