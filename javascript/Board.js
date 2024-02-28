class Board{
    static width;
    static height;

    static boardArray = [];
    static wallArray = [];
    static losArray = [];

    static entityManager;
    static destinations = {};

    static boardInit(entityManager){
        if(entityManager){
            Board.entityManager = entityManager;
        }
        Board.boardArray = [];
        Board.wallArray = [];
        //Board.LosInit();
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
        console.log('placeEntities');
        let entities = Board.entityManager.entities;
        Board.boardInit();
        for (const [k,entity] of Object.entries(entities)){
            //console.log(entity);
            
            let x = entity.x;
            let y = entity.y;
            if(Board.itemAt(x,y).id != entity.id && Board.isSpace(x,y)){
                let itemCase = Board.itemAt(x,y).item  || entity.item;
                if(entity.behavior == 'wall'){
                    Board.wallArray[y][x] = true;
                }else{
                    //Board.wallArray[y][x] = false;
                }
                if(!Board.isOccupiedSpace(x,y) || entity.behavior == 'sword' || itemCase){
                    if(itemCase){
                        if(Board.itemAt(x,y).item){
                            Board.entityManager.pickUpItem(entity,Board.itemAt(x,y));
                            Board.placeEntity(entity, x, y);
                        }else if(entity.item && Board.itemAt(x,y)){
                            Board.entityManager.pickUpItem(Board.itemAt(x,y),entity);
                        }else{
                            Board.placeEntity(entity, x, y);
                        }
                    }else{
                        Board.placeEntity(entity, x, y);
                    }
                }else{
                    console.log("ENTITY OVERWRITE");
                    console.log(entity);
                    console.log(Board.itemAt(x,y));
                }   
            } 
        };
    }

    static updateSpace(x,y){
        let entities = Board.entityManager.entities;
        for (const [k,entity] of Object.entries(entities)){
            //console.log(entity);
            if(entity.x == x && entity.y == y){
                Board.placeEntity(entity,x,y);
            }
        }
    }

    static isOpenSpace(x,y){
        return (Board.isSpace(x,y) && (!Board.itemAt(x,y) || Board.itemAt(x,y).item));
    }

    static isOccupiedSpace(x,y){
        return (Board.isSpace(x,y) && Board.itemAt(x,y) && !Board.itemAt(x,y).item);
    }

    static isSpace(x,y){
        return (y >= 0 && x >= 0 && y < Board.height && x < Board.width);
    }

    static itemAt(x,y){
        if(Board.isSpace(x,y)){
            return Board.boardArray[y][x];
        }else{
            return false;
        }
    }

    static placeEntity(entity, x, y){

        if (Board.isSpace(x,y)){
            if(Board.isOccupiedSpace(x,y) && !Board.itemAt(x,y).item){
                //console.log('ENTITY OVERWRITE');
                //console.log(entity);
                //console.log(Board.itemAt(x,y));
            }
            Board.boardArray[y][x] = entity;
        }
    }

    static clearSpace(x, y){
        Board.placeEntity(false, x, y);
    }

    static drawLos(playerx,playery,x,y){
        //console.log('NEW SPACE');

        let lineOfSight = true;

        let fromPoint = {x:playerx, y:playery};
        let targetPoint = {x:x, y:y};

        let line = Board.getLine(fromPoint,targetPoint);
        
        line.forEach((point) =>{
            //console.log(point);
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

    static calculateLosArray(player){
        Board.LosInit();
        let losDistance = 25
        let losMin = 8-losDistance
        let losMax = 8+losDistance
        for(let displayY=losMin;displayY<=losMax;displayY++){
            for(let displayX=losMin;displayX<=losMax;displayX++){
                if(displayX == losMin || displayY == losMin || displayX == losMax || displayY == losMax){
                    let x = (displayX-8) + player.x;
                    let y = (displayY-8) + player.y;
                    Board.drawLos(player.x, player.y, x, y);
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

    static getTrueDistance(pos1, pos2){
        let a2 = Math.abs(pos1.x - pos2.x)**2;
        let b2 = Math.abs(pos1.y - pos2.y)**2;
        let distance = Math.sqrt(a2+b2);
        //let line = Board.getLine(pos1,pos2);
        //return line.length;
        return Math.floor(distance);
    }

    static hasLight(pos){
        let playerEntity = Board.entityManager.getEntity('player');
        let player = Board.entityManager.player
        let lightDistance = player.light+1;
        let distance = Board.getTrueDistance(pos,playerEntity);

        return lightDistance >= distance;
        
    }

    static hasPlayerLos(pos){
        return Board.hasLight(pos) && Board.getLineOfSight(pos.x, pos.y);
    }

    static hasAdjacentEmptySpace(x,y){
        let result = false;
        Board.entityManager.translations.forEach((translation)=>{
            let xToCheck = x+translation.x;
            let yToCheck = y+translation.y;
            if(Board.isSpace(xToCheck,yToCheck) && !Board.wallArray[y+translation.y][x+translation.x]){
                result = true;
            }
        })

        return result;
    }
    
}