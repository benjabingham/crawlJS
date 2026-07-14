class Location{

    static worldMapIds = ['World Map 1']
    //on game start, all world maps should be searched for locations.
    //Then each world map should be added to worldMaps, as such:
    //worldMaps = {worldMapId: {locationId:{x:x,y:y,validExits:{left:true,right:true,etc...}},etc...},etc...}
    static worldMaps = {}
    
    //called when player walks off bounds of map. Sends them to correct new locaiton.
    //x and y are player's current x and y values.
    static exitLocation(x,y){
        let locationId = EntityManager.currentMap.name 
        let exitDirection = Location.getExitDirection(x,y)
        if(!exitDirection){return false}

        let worldMapId = Location.findWorldMapDestination(locationId,exitDirection)
        let locationCoords = Location.getLocationCoords(worldMapId,locationId)
        let destinationCoords = locationCoords;
        switch (exitDirection){
            case "left":
                destinationCoords.x -= 1;
                break;
            case "right":
                destinationCoords.x += 1;
                break;
            case "up":
                destinationCoords.y -= 1;
                break;
            case "down":
                destinationCoords.y += 1;
                break;
            default:
                return false;
        }

        
        GameMaster.reset();
        GameMaster.getRoom(worldMapId,destinationCoords)
    }

    static getExitDirection(x,y){
        let direction = false;
        if (x < 0){
            direction = "left"
        }else if (x >= Board.width){
            direction = "right"
        }else if (y < 0){
            direction = "up";
        }else if (y >= Board.height){
            direction = "down"
        }

        return direction;
    }

    //takes id of a location and direction exiting location, returns the id of the world map which
    //has a valid exit location.
    static findWorldMapDestination(locationId, direction){
        let exitMap = false;
        for (const [mapId,locations] of Object.entries(Location.worldMaps)){
            if(locations[locationId] && locations[locationId].validExits && locations[locationId].validExits[direction]){
                exitMap = mapId;
            }
        }

        return exitMap;
    }

    //looks in saves for x,y coords of location locationId in map mapId
    static getLocationCoords(mapId, locationId){
        let entityGroups = Save.maps[locationId].entityGroups.entityGroups
        let locationEntity = false;
        for (const [id,entityGroup] of Object.entries(entityGroups)){
            if(entityGroup.locationId && entityGroup.locationId == locationId){
                //don't expect more than one instance... just use the first one.
                locationEntity = Object.values(entityGroup.instances)[0]
            }
        }

        return {x:locationEntity.x,y:locationEntity.y}
    }
}