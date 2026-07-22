class Travel{

    static worldMapIds = ['World Map 1']
    //on game start, all world maps should be searched for locations.
    //Then each world map should be added to worldMaps, as such:
    //worldMaps = {worldMapId: {locationId:{x:x,y:y,validExits:{left:true,right:true,etc...}},etc...},etc...}
    static worldMaps = {}
    
    //called when player walks off bounds of map. Sends them to correct new locaiton.
    //x and y are player's current x and y values.
    static exitLocation(x,y){
        let locationId = EntityManager.currentMap.name 
        let exitDirection = Travel.getExitDirection(x,y)
        if(!exitDirection){return false}

        let worldMapId = Travel.findWorldMapDestination(locationId,exitDirection)
        let locationCoords = Travel.getLocationCoords(worldMapId,locationId)
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


        GameMaster.getRoom(worldMapId,false,destinationCoords)
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
    static findWorldMapDestination(locationId, direction = Board.enteredDirection){
        let exitMap = false;
        for (const [mapId,locations] of Object.entries(Travel.worldMaps)){
            if(locations[locationId] && locations[locationId].validExits && locations[locationId].validExits[direction]){
                exitMap = mapId;
            }
        }

        return exitMap;
    }

    //looks for x,y coords of location locationId in map mapId
    static getLocationCoords(mapId, locationId){
        let location = Travel.worldMaps[mapId][locationId]
        return{x:location.x,y:location.y}
    }

    //pass locationEntity object
    static enterLocation(locationEntity){
        let direction = Travel.getEnterDirection(locationEntity)
        Board.enteredDirection = direction;
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
        let invert = (startingPosition.up || startingPosition.left)? -1:1;

        //without inverting, this function puts the highest position in [0].
        //so invert if down or right, which wants lowest at [0]
        let comparefn = function(a,b){
            if(a[axis] > b[axis]){
                return -1 * invert;
            }

            return 1 * invert;
        }

        playerSpawnPositions.sort(comparefn);

        return playerSpawnPositions[0];
    }

    //cycle through a map roster. Record
    static markValidExitsInRoster(mapData){
        let roster = mapData.roster;
        let mapId = mapData.name;
        let board = {}
        if(!Travel.worldMaps[mapId]){
            Travel.worldMaps[mapId] = {}
        }
        roster.forEach((entity)=>{
            let x = entity.x;
            let y = entity.x
            if(!board.x){
                board.x = {}
            }
            board.x.y = true
        })
        let translations = {
            left:{x:-1,y:0},
            right:{x:1,y:0},
            up:{x:0,y:-1},
            down:{x:0,y:1}
        }

        roster.forEach((entity)=>{
            let entityInfo = entity.entityGroupInfo;
            if(entityInfo.entityType == 'location'){
                console.log(entity)
                if(!Travel.worldMaps[mapId][entityInfo.locationId]){
                    Travel.worldMaps[mapId][entityInfo.locationId] = {x:entity.x,y:entity.y,validExits:{}}
                }
                for (const [direction,coords] of Object.entries(translations)){
                    //if direction is empty...
                    let targetPos = {x:entity.x+coords.x, y: entity.y+coords.y}
                    if(!board[targetPos.x] || !board[targetPos.x][targetPos.y]){
                        Travel.worldMaps[mapId][entityInfo.locationId].validExits[direction]=true
                    }
                }
            }
        })
        console.log(Travel.worldMaps)
    }

}