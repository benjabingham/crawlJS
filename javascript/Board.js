class Board{
    static width;
    static height;

    static boardArray = [];
    static wallArray = [];
    static losArray = [];
    static stainArray = [];
    static floorArray = [];
    static lightSourceIDs = [];

    static destinations = {};

    static boardInit(roomJson = false){
        Board.setBoard();

        if(roomJson && roomJson.stains){
            Board.stainArray = roomJson.stains;
        }else{
            Board.stainArray = new Array(Board.height).fill().map( ()=>
                Array(Board.width).fill({color:{r:0,g:0,b:0}, level:0})
            )
        }
    }

    //this is called each frame
    static setBoard(){
        Board.boardArray = [];
        Board.wallArray = [];
        for(let i=0;i<Board.height;i++){
            Board.boardArray[i] = [];
            Board.wallArray[i] = [];
            for(let j=0;j<Board.width;j++){
                Board.boardArray[i][j] = false;
                Board.wallArray[i][j] = false;
            }
        }
    }

    static placeEntities(){
        let entities = EntityManager.entities;
        //TODO: does boardinit have to happen every time?
        Board.setBoard();
        for (const [k,entity] of Object.entries(entities)){
            let x = entity.x;
            let y = entity.y;
            if(Board.entityAt(x,y).id != entity.id && Board.isSpace(x,y)){
                let itemCase = Board.entityAt(x,y).isItemPile || entity.isItemPile;
                if(entity.isWall && !entity.dead){
                    Board.wallArray[y][x] = {wallType:entity.wallType};
                }
                if(!Board.isOccupiedSpace(x,y) || entity.isSword || itemCase){
                    if(itemCase){
                        if(Board.entityAt(x,y).isItemPile){
                            entity.pickUpItemPile(Board.entityAt(x,y));
                            Board.placeEntity(entity, x, y);
                        }else if(entity.isItemPile && Board.entityAt(x,y)){
                            Board.entityAt(x,y).pickUpItemPile(entity);
                        }else{
                            Board.placeEntity(entity, x, y);
                        }
                    }else{
                        Board.placeEntity(entity, x, y);
                    }
                } 
            } 
        };
    }

    static updateSpace(x,y){
        let entities = EntityManager.entities;
        for (const [k,entity] of Object.entries(entities)){
            if(entity.x == x && entity.y == y){
                Board.placeEntity(entity,x,y);
            }
        }
    }

    static isOpenSpace(x,y){
        return (Board.isSpace(x,y) && !Board.wallAt(x,y) && (!Board.entityAt(x,y) || Board.entityAt(x,y).walkable));
    }

    static isOccupiedSpace(x,y){
        return (Board.isSpace(x,y) && Board.entityAt(x,y) && !Board.entityAt(x,y).walkable);
    }

    //check if a tile is a valid space within the board
    static isSpace(x,y){
        return (y >= 0 && x >= 0 && y < Board.height && x < Board.width);
    }

    static isValidSwordSpace(x,y){
        return (!Board.entityAt(x,y) || Board.entityAt(x,y).walkable || Board.entityAt(x,y).isWall)
    }

    static entityAt(x,y){
        if(Board.isSpace(x,y)){
            return Board.boardArray[y][x];
        }else{
            return false;
        }
    }

    static getFloor(x,y){
        if ( Board.floorArray && Board.floorArray[y] && Board.floorArray[y][x]){
            return Board.floorArray[y][x]
        }

        return false;
    }

    static placeEntity(entity, x, y){

        if (Board.isSpace(x,y)){
            Board.boardArray[y][x] = entity;
        }
    }

    static clearSpace(x, y){
        Board.placeEntity(false, x, y);
    }

    //does one point have line of sight to another
    static hasLos(pos1,pos2, maxDistance = 8){
        if( !Board.isSpace(pos1.x,pos1.y) || !Board.isSpace(pos2.x,pos2.y)){
            return false;
        }
        if(EntityManager.getDistance(pos1,pos2) > maxDistance){
            return false;
        }
        let lineOfSight = true;

        let line = Board.getLine(pos1,pos2);
        //remove the last item - walls shouldnt block los to themselves
        line.pop();

        line.forEach((point) =>{
            if(lineOfSight){
                if(Board.wallAt(point.x,point.y)){
                    lineOfSight = false;
                }
            }
        })

        return lineOfSight;
    }

    static drawLos(playerx,playery,x,y){
        let lineOfSight = true;
        let fromPoint = {x:playerx, y:playery};
        let targetPoint = {x:x, y:y};

        let line = Board.getLine(fromPoint,targetPoint);
        
        line.forEach((point) =>{
            if(lineOfSight){
                Board.setLineOfSight(point.x, point.y, lineOfSight);
                if(Board.wallAt(point.x,point.y)){
                    lineOfSight = false;
                }
            }
        })

        if(lineOfSight){
            Board.setLineOfSight(targetPoint.x, targetPoint.y, lineOfSight);
        }

        return lineOfSight;
    }

    static pointCompare(point1, point2){
        return (point1.x == point2.x && point1.y == point2.y);
    }

    static LosInit(){
        for(let i=-1;i<Board.height+1;i++){
            Board.losArray[i] = [];
            for(let j=0;j<Board.width;j++){
                Board.losArray[i][j] = false;
            }
        }
    }

    static calculateLosArray(playerPos){
        Board.LosInit();
        let losDistance = 25
        let losMin = 8-losDistance
        let losMax = 8+losDistance
        //for each edge of the view window, draw a line from the player to that edge.
        for(let displayY=losMin;displayY<=losMax;displayY++){
            for(let displayX=losMin;displayX<=losMax;displayX++){
                if(displayX == losMin || displayY == losMin || displayX == losMax || displayY == losMax){
                    let x = (displayX-8) + playerPos.x;
                    let y = (displayY-8) + playerPos.y;
                    Board.drawLos(playerPos.x, playerPos.y, x, y);
                }
            }
        }
    }

    static getLine(point1,point2, nPoints = false){
        let xdif = point2.x - point1.x;
        let ydif = point2.y - point1.y;
        
        let steps = Math.max(
            Math.abs(xdif),
            Math.abs(ydif)
        )

        let line = [point1];

        let xIncrement = xdif/steps;
        let yIncrement = ydif/steps;
        
        let x = point1.x;
        let y = point1.y;

        for(let i = 0; i < steps; i++){
            x += xIncrement;
            y += yIncrement;

            line.push({
                x:Math.floor(x+.5), y:Math.floor(y+.5)
            });

            if(line.length == nPoints){
                return line;
            }
        }

        return line;

    }

    static wallAt(x,y){
        if(!Board.isSpace(x,y)){
            return false;
        }
        return Board.wallArray[y][x];
    }

    static setLineOfSight(x,y, los){
        if(!Board.losArray[y]){
            return false;
        }
        Board.losArray[y][x] = los;
    }

    static getLineOfSight(x,y){
        if(Board.losArray[y]){
            return Board.losArray[y][x];
        }
    }

    static setDimensions(width,height){
        Board.width = width;
        Board.height = height;
    }

    static getTrueDistance(pos1, pos2, float=false){
        let a2 = Math.abs(pos1.x - pos2.x)**2;
        let b2 = Math.abs(pos1.y - pos2.y)**2;
        let distance = Math.sqrt(a2+b2);

        return float ? distance : Math.floor(distance);
    }

    static hasLight(pos){
        let hasLight = false
        let playerLightPos = EntityManager.getEntity('player').swordEntity.getSwordPosition();
        let sources = [{
            x:playerLightPos.x,
            y:playerLightPos.y,
            lightStrength:Player.light+1,
            isPlayerSource: true
        }]
        Board.lightSourceIDs.forEach((id)=>{
            sources.push(EntityManager.getEntity(id))
        })
           
        sources.forEach((source)=>{
            if(source.obliterated){
                return false;
            }
            let distance = Board.getTrueDistance(pos,source);
            let entity = Board.entityAt(pos.x,pos.y);
            
            if (source.lightStrength < distance){
                return false;
            }

            // if is wall, get direction from wall to source. Look at tile next to wall in the direction. If player doesnt have los of that tile, should not have los of wall.
            //this stops light from shining through walls.
            if(entity.isWall && !source.isPlayerSource){
            
                let line = Board.getLine(entity, source, 2);
                let betweenTile = line[1];
                if(!EntityManager.hasPlayerLos(betweenTile) || Board.entityAt(betweenTile.x,betweenTile.y).isWall){
                    
                    return false;
                }
            }

            let hasLos = false;
            if(source.isPlayerSource){
                hasLos = EntityManager.hasPlayerLos(pos)
            }else{
                hasLos = Board.hasLos(source,pos)
            }

            if(hasLos){
                hasLight = true;
            }
        
        })

        return hasLight;        
    }

    //can the player see this position (INCLUDES LIGHT)
    static hasPlayerLos(pos){
        return Board.hasLight(pos) && Board.getLineOfSight(pos.x, pos.y);
    }

    static hasAdjacentEmptySpace(x,y){
        let result = false;
        EntityManager.translations.forEach((translation)=>{
            let xToCheck = x+translation.x;
            let yToCheck = y+translation.y;
            if(Board.isSpace(xToCheck,yToCheck) && !Board.wallArray[y+translation.y][x+translation.x]){
                result = true;
            }
        })

        return result;
    }

    static setStain(x,y, level = 1, color = {r:185, g:80, b:53}){
        if(!Board.stainArray[y]){
            Board.stainArray[y] = [];
        }
        if(!Board.stainArray[y][x]){
            Board.stainArray[y][x] = {
                level:0,
                color:{r:0,g:0,b:0}
            };
        }
        if(level < 0){
            Board.stainArray[y][x].level += level;    
        }else{
            Board.stainArray[y][x] = Board.getCombinedStain({level:level, color:color},Board.stainArray[y][x]);
        }

        Board.expandPuddle(x,y, level);
    }

    static expandPuddle(x,y, level){
        let direction = Random.roll(0,7);
        let counter = 0;
        while(counter < 8 && level > 0){
            let translation = EntityManager.translations[direction]
            let x2 = x + translation.x;
            let y2 = y + translation.y;
            let stain1 = Board.getStain(x,y)
            let stain2 = Board.getStain(x2,y2)
            if(stain1 && stain2){
                let diff =  stain1.level - stain2.level;
                if(diff > Random.roll(1,7) && !Board.wallAt(x2,y2)){
                    Board.setStain(x,y, -1);
                    Board.setStain(x2,y2, 1, Board.stainArray[y][x].color);
                    level--;
                }    
            }
            direction = (direction+1) %8
            counter++;
        }
    }

    static getStain(x,y){
        if(!Board.stainArray[y]){
            return false;
        }
        if(Board.stainArray[y][x]){
            return Board.stainArray[y][x]
        }

        return false;
    }

    static smearStain(pos1,pos2){
        let stain1 = Board.getStain(pos1.x,pos1.y)
        let level1 = stain1 ? stain1.level : 0;
        level1 = level1 ? level1 : 0;
        let stain2 = Board.getStain(pos2.x,pos2.y)
        let level2 = stain2 ? stain2.level : 0;
        level2 = level2 ? level2 : 0;
        let amt = Math.floor(((level1 - level2)/2.0)+.5);
        if(!amt || amt <= 0){
            return false;
        }
        let random = Random.roll(1,3);
        if(random < Board.getStain(pos1.x,pos1.y).level){
            console.log('smear');
            Board.setStain(pos1.x,pos1.y,amt*-1);
            Board.setStain(pos2.x,pos2.y,amt, Board.stainArray[pos1.y][pos1.x].color);
        }
    }

    //get two stains in the form of {level:n, color:{r:x, g:y, b:z}}.
    //returns a color with averaged values and combined levels
    static getCombinedStain(stain1, stain2){
        let totalLevel = stain1.level + stain2.level
        let emptyStain = {level:0, color:{r:0,g:0,b:0}}
        let result = JSON.parse(JSON.stringify(emptyStain));
        result.level = totalLevel;
        if(!stain1 || stain1 == -1 || !stain1.color || !stain1.color.r){
            stain1 = JSON.parse(JSON.stringify(emptyStain));
        }
        if(!stain2 || stain2 == -1 || !stain2.color || !stain2.color.r){
            stain2 = JSON.parse(JSON.stringify(emptyStain));
        }
        console.log({
            1:stain1,
            2:stain2
        })
        const colors = ['r','g','b'];
        colors.forEach((key)=>{
            console.log(key);
            let sum = (stain1.color[key]*stain1.level) + (stain2.color[key]*stain2.level);
            let avg = Math.floor(sum/totalLevel);
            result.color[key] = avg;
        })

        return result;
    }
    
}