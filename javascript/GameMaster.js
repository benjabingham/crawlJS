class GameMaster{
    constructor(save){
        this.player = save.player;
        this.log = new Log();
        this.save = save;
        EntityManager.entityManagerInit(this.player,this.log, this);
        this.customControls = {};
        this.dungeonId = 0;
        this.shop = new Shop(this);

        Display.displayInit();
    }

    reset(){
        EntityManager.updateSavedInventories();
        this.player.unequipWeapon(this);
        this.log.wipeLog();
        EntityManager.wipeEntities();
    }

    startGame(){
        console.log(this.save);
        let player = this.player;
        let log = this.log;
        let entityManager = EntityManager;
        let board = Board;
        let gm = this;

        entityManager.skipBehaviors = false;
        board.placeEntities(log);
        entityManager.saveSnapshot();

        board.calculateLosArray(entityManager.getEntity('player'));

        Display.showDungeonScreen();
        Display.printBoard();


        /*
        $(document).off().on("keydown", function(e){
            gm.resolvePlayerInput(e); 
        });
        */
        $(document).off('keydown').on("keydown", InputManager.recieveInput);
    }

    getRoom(roomString){
        if(this.save.maps[roomString]){
            console.log('room cached')
            EntityManager.loadRoom(this.save.maps[roomString]);
            this.startGame();
        }else{
            console.log('loading room '+roomString);
            fetch('./rooms/'+roomString)
            .then((response) => response.json())
            .then((json) => {
                this.save.mapInit(json);
                console.log(this.save);
                EntityManager.loadRoom(this.save.maps[roomString]);
                this.startGame();
            })
        }
    }

    travel(x,y){
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
        let destination = Board.destinations[direction]
        if(!destination){
            return false;
        }
        this.dungeonId++;
        console.log('travel');
        this.reset();

        if(destination.type == "town"){
            this.loadTown();
        }else if(destination.type == "dungeon"){
            this.getRoom(destination.name);
        }
    }

    loadTown(){
        this.nextDay();
        this.shop.restockInventory();
        Display.showTownScreen(this);
        this.player.changeStamina(100);
        this.player.light = 0;
    }

    nextDay(){
        this.save.day++
        this.player.rest();  
    }

    rewind(event){
        if(EntityManager.canRewind()){
            console.log('rewind');
            EntityManager.rewind();
            EntityManager.skipBehaviors = true;
            this.log.turnCounter--;
            this.log.messages[log.turnCounter] = false;
            console.log(EntityManager.entities);
        }

        this.postPlayerAction();
    }

    drop(event){
        if(!this.dropMode){
            this.dropMode = true;
        }else{
            this.dropMode = false;
        }
        /*
        EntityManager.skipBehaviors = true;
        this.postPlayerAction();
        */
    }

    useItem(event){
        console.log(event);
        let swordId = EntityManager.getProperty('player','sword')
        EntityManager.removeEntity(swordId);
        let slot = parseInt(event.type.split('-')[1])-1;
        if(this.dropMode){
            if(!this.player.dropItem(slot,this)){
                //EntityManager.skipBehaviors = true;
                this.dropMode = false;
            }
        }else if(!this.player.useItem(this.player.inventory[slot], this)){
            //skip behaviors if invalid item
            EntityManager.skipBehaviors = true;
        }

        this.postPlayerAction();
    }

    wait(event){
        this.player.gainStamina();
        this.postPlayerAction();
    }

    rotate(event){
        let direction = event.type == 'clockwise'? 1 : -1;
        let swordId = EntityManager.getProperty('player','sword')
        EntityManager.removeEntity(swordId);
        EntityManager.rotateSword(swordId,direction);
        this.postPlayerAction();
    }

    //should belong to input once classes are static
    movePlayer(event){
        let dungeonId = this.dungeonId;
        let direction = event.type;

        //remove sword so it doesn't interfere with player movement and LOS. TODO remove need for this
        let swordId = EntityManager.getProperty('player','sword')
        EntityManager.removeEntity(swordId);

        let translations = {
            right:{x:1,y:0}, left:{x:-1,y:0}, up:{x:0,y:-1}, down:{x:0,y:1}, upleft:{x:-1,y:-1}, upright:{x:1,y:-1}, downleft:{x:-1,y:1}, downright:{x:1,y:1}
        };

        let translation = translations[direction];
        EntityManager.movePlayer(translation.x,translation.y);

        if(dungeonId != this.dungeonId){
            return false;
        }
        this.postPlayerAction();
    }

    resolveEntityBehaviors(){
        EntityManager.reapWounded();
        EntityManager.triggerBehaviors();
        EntityManager.reapWounded();
        this.player.lightDown(this.log);
    }

    updateDisplay(){
        Display.printBoard(board.boardArray);
        this.player.inventoryCleanup();
        Display.displayInventory(true);

        Display.fillBars(this.player);
    }

    postPlayerAction(){     
        let swordId = EntityManager.getProperty('player','sword')
        EntityManager.placeSword(swordId);   
        console.log(EntityManager.getEntity(swordId));
        if(!EntityManager.skipBehaviors){
            this.resolveEntityBehaviors();
        }

        Board.placeEntities(this.log);
        EntityManager.saveSnapshot();
        Board.calculateLosArray(EntityManager.getEntity('player'));
        this.updateDisplay();
        if(!EntityManager.skipBehaviors){
            this.log.turnCounter++;
        }else{
            this.log.rewind();
        }
        this.log.printLog();  
        this.log.clearNotices();
        console.log(EntityManager.skipBehaviors);
        EntityManager.skipBehaviors = false;
    }
    
}