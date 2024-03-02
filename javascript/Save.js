class Save{
    static maps = {};
    static day = 0;

    static saveInit(){
        Player.playerInit();
    }

    static newSave(){
        Player.reset();
    }

    static loadSave(file){
        if (file) {
            var reader = new FileReader();
            reader.readAsText(file, "UTF-8");
            reader.onload = function (evt) {
                let fileString = evt.target.result;
                let fileJson = JSON.parse(fileString);
                Save.maps = fileJson.maps;
                for (const [key, value] of Object.entries(fileJson.player)) {
                    Save.player[key] = value;
                    console.log({
                        k:key,
                        v:value
                    })
                }
                console.log(Save.player);
            }
            reader.onerror = function (evt) {
                $('#load-file-input').append("error reading file");
            }
        }
    }

    static downloadSave(){
        let file = new File([JSON.stringify(this)], 'crawlJS-save.txt', {
            type: 'text/plain',
        })
        
        const link = document.createElement('a')
        const url = URL.createObjectURL(file)
        
        link.href = url
        link.download = file.name
        document.body.appendChild(link)
        link.click()
        
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)

        console.log(this);
    }

    //TODO: this should be where we give monsters their loot
    static mapInit(json){
        let roomString = json.name;
        let board = json.board;
        let values = json.values;
        json.roster = [];
        let roster = json.roster;
        let counter = 0;
        let x = 0;
        let y = 0;
        //get roster
        board.forEach((row)=>{
            row.forEach((item)=>{
                if(item){
                    roster.push({
                        code:item,
                        value:values[item],
                        index:counter,
                        alive:true,
                        x:x,
                        y:y
                    })
                    counter++;
                }
                x++;
            })
            y++;
            x=0;
        })
        Save.maps[roomString] = json;
        console.log('loaded');
    }

    static catchUpMap(mapString){
        let day = Save.day;
        let map = Save.maps[mapString];
        for(let i = map.lastDay; i < day; i++){
            console.log(i);
            Save.mapRespawn(mapString);
        }
        map.lastDay = day;
    }

    //TODO: this should be where we give monsters their loot
    static mapRespawn(mapString){
        let map = Save.maps[mapString];
        map.roster.forEach((entity)=>{
            if(!entity.alive && entity.value.respawnChance){
                let random = Random.roll(0,99);
                if(random < entity.value.respawnChance){
                    entity.alive = true;
                }
            }
        })
    }

}