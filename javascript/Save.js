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


        //create invisible link and cause click on it for download
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

    static mapInit(json){

        let roomString = json.name;
        console.log('initializing map - '+roomString);
        let entityGroups = json.entityGroups.entityGroups;
        let roster = [];
        let counter = 0;
        for(const [key, entityGroup] of Object.entries(entityGroups)){
            let instances = entityGroup.instances;
            for(const [key2, instance] of Object.entries(instances)){
                let entitySave = {
                    entityGroupId: instance.entityGroupId,
                    entityGroupInfo:entityGroup,
                    index:counter,
                    alive:true,
                    x:instance.x,
                    y:instance.y,
                    inventory:{
                        items:[]
                    }
                }
                LootManager.getEntityLoot(entitySave);
                roster.push(entitySave)
                counter++;
            }
        }
        json.roster = roster;
        Save.maps[roomString] = json;
        console.log(Save.maps);
        console.log('loaded');
    }

    static catchUpMap(mapString){
        let day = Save.day;
        let map = Save.maps[mapString];
        for(let i = map.lastDay; i < day; i++){
            console.log(i);
            Save.mapRespawn(mapString);
            Save.degradeStains(mapString);
        }
        map.lastDay = day;
    }

    static degradeStains(mapString){
        let stains = Save.maps[mapString].stains;
        console.log(stains);
        let y = 0;
        stains.forEach((row)=>{
            let x = 0;
            row.forEach((tile)=>{
                if(tile){
                    if(Random.roll(0,1)){
                        stains[y][x]--;
                    }
                    x++;
                }
            })
            y++;
        })
    }

    static mapRespawn(mapString){
        let map = Save.maps[mapString];
        console.log(map)
        map.roster.forEach((entity)=>{
            console.log(entity);
            if((!entity.alive || entity.entityGroupInfo.entitytype == 'container') && entity.entityGroupInfo.respawnChance){
                let random = Random.roll(0,99);
                if(random < entity.entityGroupInfo.respawnChance){
                    entity.alive = true;
                    entity.inventory.items = [];
                    LootManager.getEntityLoot(entity);
                    //reset spawner...
                    if(entity.spawnEntities){
                        entity.containedEntities = false;
                    }
                }
            }
        })
    }
}