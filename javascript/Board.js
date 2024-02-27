class Board{
    constructor(entityManager, width = 20,height = 20){
        this.width = width;
        this.height = height;

        this.boardArray = [];
        this.wallArray = [];
        this.losArray = [];
        this.boardInit();

        this.entityManager = entityManager;
        this.destinations = {};
    }

    boardInit(){
        this.boardArray = [];
        this.wallArray = [];
        //this.LosInit();
        for(let i=0;i<this.height;i++){
            this.boardArray[i] = [];
            this.wallArray[i] = [];
            for(let j=0;j<this.width;j++){
                this.boardArray[i][j] = false;
                this.wallArray[i][j] = false;
            }
        }
    }

    placeEntities(){
        console.log('placeEntities');
        let entities = this.entityManager.entities;
        this.boardInit();
        for (const [k,entity] of Object.entries(entities)){
            //console.log(entity);
            
            let x = entity.x;
            let y = entity.y;
            if(this.itemAt(x,y).id != entity.id && this.isSpace(x,y)){
                let itemCase = this.itemAt(x,y).item  || entity.item;
                if(entity.behavior == 'wall'){
                    this.wallArray[y][x] = true;
                }else{
                    //this.wallArray[y][x] = false;
                }
                if(!this.isOccupiedSpace(x,y) || entity.behavior == 'sword' || itemCase){
                    if(itemCase){
                        if(this.itemAt(x,y).item){
                            this.entityManager.pickUpItem(entity,this.itemAt(x,y));
                            this.placeEntity(entity, x, y);
                        }else if(entity.item && this.itemAt(x,y)){
                            this.entityManager.pickUpItem(this.itemAt(x,y),entity);
                        }else{
                            this.placeEntity(entity, x, y);
                        }
                    }else{
                        this.placeEntity(entity, x, y);
                    }
                }else{
                    console.log("ENTITY OVERWRITE");
                    console.log(entity);
                    console.log(this.itemAt(x,y));
                }   
            } 
        };
    }

    updateSpace(x,y){
        let entities = this.entityManager.entities;
        for (const [k,entity] of Object.entries(entities)){
            //console.log(entity);
            if(entity.x == x && entity.y == y){
                this.placeEntity(entity,x,y);
            }
        }
    }

    isOpenSpace(x,y){
        return (this.isSpace(x,y) && (!this.itemAt(x,y) || this.itemAt(x,y).item));
    }

    isOccupiedSpace(x,y){
        return (this.isSpace(x,y) && this.itemAt(x,y) && !this.itemAt(x,y).item);
    }

    isSpace(x,y){
        return (y >= 0 && x >= 0 && y < this.height && x < this.width);
    }

    itemAt(x,y){
        if(this.isSpace(x,y)){
            return this.boardArray[y][x];
        }else{
            return false;
        }
    }

    placeEntity(entity, x, y){

        if (this.isSpace(x,y)){
            if(this.isOccupiedSpace(x,y) && !this.itemAt(x,y).item){
                //console.log('ENTITY OVERWRITE');
                //console.log(entity);
                //console.log(this.itemAt(x,y));
            }
            this.boardArray[y][x] = entity;
        }
    }

    clearSpace(x, y){
        this.placeEntity(false, x, y);
    }

    drawLos(playerx,playery,x,y){
        //console.log('NEW SPACE');

        let lineOfSight = true;

        let fromPoint = {x:playerx, y:playery};
        let targetPoint = {x:x, y:y};

        let line = this.getLine(fromPoint,targetPoint);
        
        line.forEach((point) =>{
            //console.log(point);
            if(lineOfSight){
                this.setLineOfSight(point.x, point.y, lineOfSight);
                if(this.wallAt(point.x,point.y)){
                    lineOfSight = false;
                }
            }
            
            

        })

        if(lineOfSight){
            this.setLineOfSight(targetPoint.x, targetPoint.y, lineOfSight);
        }

        return lineOfSight;
    }

    pointCompare(point1, point2){
        return (point1.x == point2.x && point1.y == point2.y);
    }

    LosInit(){
        for(let i=-1;i<this.height+1;i++){
            this.losArray[i] = [];
            for(let j=0;j<this.width;j++){
                this.losArray[i][j] = false;
            }
        }
    }

    calculateLosArray(player){
        this.LosInit();
        let losDistance = 25
        let losMin = 8-losDistance
        let losMax = 8+losDistance
        for(let displayY=losMin;displayY<=losMax;displayY++){
            for(let displayX=losMin;displayX<=losMax;displayX++){
                if(displayX == losMin || displayY == losMin || displayX == losMax || displayY == losMax){
                    let x = (displayX-8) + player.x;
                    let y = (displayY-8) + player.y;
                    this.drawLos(player.x, player.y, x, y);
                }
            }
        }
    }

    getLine(point1,point2){
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

    wallAt(x,y){
        if(!this.isSpace(x,y)){
            return false;
        }
        return this.wallArray[y][x];
    }

    setLineOfSight(x,y, los){
        this.losArray[y][x] = los;
    }

    getLineOfSight(x,y){
        if(this.losArray[y]){
            return this.losArray[y][x];
        }
    }

    setDimensions(width,height){
        this.width = width;
        this.height = height;
    }

    getTrueDistance(pos1, pos2){
        let a2 = Math.abs(pos1.x - pos2.x)**2;
        let b2 = Math.abs(pos1.y - pos2.y)**2;
        let distance = Math.sqrt(a2+b2);
        //let line = this.getLine(pos1,pos2);
        //return line.length;
        return Math.floor(distance);
    }

    hasLight(pos){
        let playerEntity = this.entityManager.getEntity('player');
        let player = this.entityManager.player
        let lightDistance = player.light+1;
        let distance = this.getTrueDistance(pos,playerEntity);

        return lightDistance >= distance;
        
    }

    hasPlayerLos(pos){
        return this.hasLight(pos) && this.getLineOfSight(pos.x, pos.y);
    }

    hasAdjacentEmptySpace(x,y){
        let result = false;
        this.entityManager.translations.forEach((translation)=>{
            let xToCheck = x+translation.x;
            let yToCheck = y+translation.y;
            if(this.isSpace(xToCheck,yToCheck) && !this.wallArray[y+translation.y][x+translation.x]){
                result = true;
            }
        })

        return result;
    }
    
}