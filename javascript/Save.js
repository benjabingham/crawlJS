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
                }
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

    }

    static mapInit(json){
        console.log(json);
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
        if(json.floorMatrix){
            json.floorMatrix = JSON.parse(json.floorMatrix);
        }
        Save.maps[roomString] = json;
    }

    static catchUpMap(mapString){
        let day = Save.day;
        let map = Save.maps[mapString];
        for(let i = map.lastDay; i < day; i++){
            console.log(i);
            Save.mapRespawn(mapString);
            Save.degradeStains(mapString);
            Save.scatterItems(mapString);
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
            //console.log(entity);
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

    static scatterItems(mapString){
        let map = Save.maps[mapString];
        let stealers = 0
        let nMisc = 0;
        //console.log(map);
        let nTiles = map.height * map.width;
        //itempiles are at the end of the roster... so just one loop is enough
        map.roster.forEach((entity)=>{
            if(entity.entityGroupInfo.entityType == "monster" && entity.alive){
                stealers++;
            }else if(entity.entityGroupInfo.entityType == "itemPile"){

                //total number of map tiles minus walls and such
                let mapSpace = nTiles - nMisc;
                let percentMonsters = stealers/mapSpace;
                let stealChance = percentMonsters;
                //take first (most valuable) item first
                if(entity.inventory.gold){
                    let rand = Math.random()
                    rand = 0;
                    if(rand < stealChance*entity.inventory.gold){
                        Save.scatterGold(entity.inventory.gold, mapString)
                        entity.inventory.gold = 0;
                    }
                }
                let stolenIndexes = [];
                for(let i = 0; i < entity.inventory.items.length; i++){
                    let item = entity.inventory.items[i]
                    let itemStealChance = stealChance;
                    itemStealChance *= item.value+1;
                    if(item.food){
                        itemStealChance *= item.value+1;
                        itemStealChance+=.05
                    }
                    let rand = Math.random();
                    if(rand < itemStealChance){
                        Save.scatterItem(item, mapString)  
                        stolenIndexes.push(i);
                    }
                }
                stolenIndexes.reverse();
                stolenIndexes.forEach(i=>{
                    entity.inventory.items.splice(i,1)
                })

                if(!entity.inventory.gold && !entity.inventory.items.length){
                    entity.alive = false;
                }
                
            }else{
                nMisc++;
            }
        })
    }

    //gives item to a random monster or container
    static scatterItem(item, mapString){
        let entities = Save.getEntitiesWithSpace(mapString);
        let entity = entities[Random.roll(0,entities.length-1)]
        entity.inventory.items.push(item);
    }

    //gives gold to a random monster or container
    static scatterGold(gold, mapString){
        let entities = Save.getEntitiesWithSpace(mapString);
        let entity = entities[Random.roll(0,entities.length-1)]
        if(!entity.inventory.gold){
            entity.inventory.gold = 0;
        }
        entity.inventory.gold += gold
    }

    static getEntitiesWithSpace(mapString){
        let map = Save.maps[mapString];
        let entities = []
        map.roster.forEach((entity)=>{
            if(Save.entityHasSpace(entity)){
                entities.push(entity);
            }
        })

        return entities;
    }

    static entityHasSpace(entity){
        let inventory = entity.inventory.items
        let key = entity.entityGroupInfo.key;
        let template
        if(entity.entityGroupInfo.entityType == "monster"){
            template = monsterVars[key]
        }else if(entity.entityGroupInfo.entityType == "container"){
            template = containerVars[key]
        }else{
            return false;
        }
            
        if(template){
            return inventory.length <= template.inventorySlots
        }else{
            return false
        }
    }
}