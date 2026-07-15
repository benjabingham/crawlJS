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
        //I don't know why I did it this way... I can just use Location.worldMaps
        /*
        let entityGroups = Save.maps[locationId].entityGroups.entityGroups
        let locationEntity = false;
        for (const [id,entityGroup] of Object.entries(entityGroups)){
            if(entityGroup.locationId && entityGroup.locationId == locationId){
                //don't expect more than one instance... just use the first one.
                locationEntity = Object.values(entityGroup.instances)[0]
            }
        }

        return {x:locationEntity.x,y:locationEntity.y}
        */
        let location = Location.worldMaps[mapId][locationId]
        return{x:location.x,y:location.y}
    }

    //pass locationEntity object
    static enterLocation(locationEntity){
        let direction = Location.getEnterDirection(locationEntity)

        GameMaster.reset();
        let startingPosition = {}
        startingPosition[direction] = true;
        GameMaster.getRoom(locationEntity.locationId,false,startingPosition)
    }

    //check player position against locationEntity position when player is entering that location
    //returns what side of the map player should spawn on.
    //for now, doesn't consider diagonals
    static getEnterDirection(locationEntity){
        let playerEntity = EntityManager.playerEntity
        if(playerEntity.x > locationEntity.x){
            return 'right';
        }
        if(playerEntity.x < locationEntity.x){
            return 'left';
        }
        if(playerEntity.y > locationEntity.y){
            return 'down';
        }
        return 'up'
    }

    //call after loading map, but before starting game.
    //pass startingPosition. May contain coords, may be false, in which case return as is.
    //may be {left:true},etc. In which case return {x: y: } coords of nearest possible player
    //spawn point to that edge of map
    //if passed totally empty startingPosition, defaults to 'down'.
    static getStartingPosition(startingPosition){
        if(!startingPosition || startingPosition.x){
            return startingPosition
        }
        let playerSpawnPositions = EntityManager.playerSpawnPositions;
        //up = lowest y, down = highest y, left = lowest x, right = highest x
        //check if we're lookign at x or y axis
        let axis = (startingPosition.left || startingPosition.right) ? "x":"y";
        //check if we want high or low value
        let invert = (startingPosition.down || startingPosition.right)? -1:1;

        //without inverting, this function puts the lowest position in [0].
        //so invert if down or right, which wants highest at [0]
        let comparefn = function(a,b){
            if(a[axis] > b[axis]){
                return -1 * invert;
            }

            return 1 * invert;
        }

        playerSpawnPositions.sort(comparefn);

        return playerSpawnPositions[0];
    }
}