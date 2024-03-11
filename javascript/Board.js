class Board{
    static width;
    static height;

    static boardArray = [];
    static wallArray = [];
    static losArray = [];

    static destinations = {};

    static boardInit(){
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
        Board.boardInit();
        for (const [k,entity] of Object.entries(entities)){
            let x = entity.x;
            let y = entity.y;
            if(Board.entityAt(x,y).id != entity.id && Board.isSpace(x,y)){
                let itemCase = Board.entityAt(x,y).isItemPile || entity.isItemPile;
                if(entity.isWall && !entity.dead){
                    Board.wallArray[y][x] = true;
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

    static entityAt(x,y){
        if(Board.isSpace(x,y)){
            return Board.boardArray[y][x];
        }else{
            return false;
        }
    }

    static placeEntity(entity, x, y){

        if (Board.isSpace(x,y)){
            Board.boardArray[y][x] = entity;
        }
    }

    static clearSpace(x, y){
        Board.placeEntity(false, x, y);
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

    static getLine(point1,point2){
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

    //TRY - get light from sword's position, not player position
    static hasLight(pos){
        let sourceTile = EntityManager.getEntity('player').swordEntity.getSwordPosition();
        let lightDistance = Player.light+1;
        let distance = Board.getTrueDistance(pos,sourceTile);

        return lightDistance >= distance;
        
    }

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
    
}