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

    static getTopFrame(){
        return Save.history[Save.history.length-1];
    }

    static downloadMap(){
        let file = new File([JSON.stringify(Save.getTopFrame())], 'my-map.txt', {
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
        var reader = new FileReader();
        reader.readAsText(file,"UTF-8");
        reader.onload = function (evt) {
            let fileString = evt.target.result;
            let fileJson = JSON.parse(fileString);
            Grid.load(JSON.parse(fileJson.grid));
            Save.load(fileJson);
            Save.saveSnapshot();
        }
        reader.onerror = function (evt) {
            $('#load-map-input').append("error reading file");
        }
    }
}