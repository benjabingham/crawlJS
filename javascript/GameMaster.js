class GameMaster{
    static player;
    static log;
    static save;
    static customControls = {};
    static dungeonId = 0;
    static shop;

    static gameMasterInit(save){
        GameMaster.player = save.player;
        GameMaster.log = new Log() ;
        GameMaster.save = save;
        EntityManager.entityManagerInit(GameMaster.player,GameMaster.log);
        GameMaster.shop = new Shop();
        Display.displayInit();
    }

    static reset(){
        EntityManager.updateSavedInventories();
        GameMaster.player.unequipWeapon();
        GameMaster.log.wipeLog();
        EntityManager.wipeEntities();
    }

    static startGame(){
        console.log(GameMaster.save);
        let player = GameMaster.player;
        let log = GameMaster.log;
        let entityManager = EntityManager;
        let board = Board;

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

    static getRoom(roomString){
        if(GameMaster.save.maps[roomString]){
            console.log('room cached')
            EntityManager.loadRoom(GameMaster.save.maps[roomString]);
            GameMaster.startGame();
        }else{
            console.log('loading room '+roomString);
            fetch('./rooms/'+roomString)
            .then((response) => response.json())
            .then((json) => {
                GameMaster.save.mapInit(json);
                console.log(GameMaster.save);
                EntityManager.loadRoom(GameMaster.save.maps[roomString]);
                GameMaster.startGame();
            })
        }
    }

    static travel(x,y){
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
        GameMaster.dungeonId++;
        console.log('travel');
        GameMaster.reset();

        if(destination.type == "town"){
            GameMaster.loadTown();
        }else if(destination.type == "dungeon"){
            GameMaster.getRoom(destination.name);
        }
    }

    static loadTown(){
        GameMaster.nextDay();
        GameMaster.shop.restockInventory();
        Display.showTownScreen();
        GameMaster.player.changeStamina(100);
        GameMaster.player.light = 0;
    }

    static nextDay(){
        GameMaster.save.day++
        GameMaster.player.rest();  
    }

    static rewind(event){
        if(EntityManager.canRewind()){
            console.log('rewind');
            EntityManager.rewind();
            EntityManager.skipBehaviors = true;
            GameMaster.log.turnCounter--;
            GameMaster.log.messages[log.turnCounter] = false;
            console.log(EntityManager.entities);
        }

        GameMaster.postPlayerAction();
    }

    static drop(event){
        if(!GameMaster.dropMode){
            GameMaster.dropMode = true;
        }else{
            GameMaster.dropMode = false;
        }
        /*
        EntityManager.skipBehaviors = true;
        GameMaster.postPlayerAction();
        */
    }

    static useItem(event){
        console.log(event);
        let swordId = EntityManager.getProperty('player','sword')
        EntityManager.removeEntity(swordId);
        let slot = parseInt(event.type.split('-')[1])-1;
        if(GameMaster.dropMode){
            if(!GameMaster.player.dropItem(slot)){
                //EntityManager.skipBehaviors = true;
                GameMaster.dropMode = false;
            }
        }else if(!GameMaster.player.useItem(GameMaster.player.inventory[slot])){
            //skip behaviors if invalid item
            EntityManager.skipBehaviors = true;
        }

        GameMaster.postPlayerAction();
    }

    static wait(event){
        GameMaster.player.gainStamina();
        GameMaster.postPlayerAction();
    }

    static rotate(event){
        let direction = event.type == 'clockwise'? 1 : -1;
        let swordId = EntityManager.getProperty('player','sword')
        EntityManager.removeEntity(swordId);
        EntityManager.rotateSword(swordId,direction);
        GameMaster.postPlayerAction();
    }

    //should belong to input once classes are static
    static movePlayer(event){
        let dungeonId = GameMaster.dungeonId;
        let direction = event.type;

        //remove sword so it doesn't interfere with player movement and LOS. TODO remove need for this
        let swordId = EntityManager.getProperty('player','sword')
        EntityManager.removeEntity(swordId);

        let translations = {
            right:{x:1,y:0}, left:{x:-1,y:0}, up:{x:0,y:-1}, down:{x:0,y:1}, upleft:{x:-1,y:-1}, upright:{x:1,y:-1}, downleft:{x:-1,y:1}, downright:{x:1,y:1}
        };

        let translation = translations[direction];
        EntityManager.movePlayer(translation.x,translation.y);

        if(dungeonId != GameMaster.dungeonId){
            return false;
        }
        GameMaster.postPlayerAction();
    }

    static resolveEntityBehaviors(){
        EntityManager.reapWounded();
        EntityManager.triggerBehaviors();
        EntityManager.reapWounded();
        GameMaster.player.lightDown(GameMaster.log);
    }

    static updateDisplay(){
        Display.printBoard(board.boardArray);
        GameMaster.player.inventoryCleanup();
        Display.displayInventory(true);

        Display.fillBars(GameMaster.player);
    }

    static postPlayerAction(){     
        let swordId = EntityManager.getProperty('player','sword')
        EntityManager.placeSword(swordId);   
        console.log(EntityManager.getEntity(swordId));
        if(!EntityManager.skipBehaviors){
            GameMaster.resolveEntityBehaviors();
        }

        Board.placeEntities(GameMaster.log);
        EntityManager.saveSnapshot();
        Board.calculateLosArray(EntityManager.getEntity('player'));
        GameMaster.updateDisplay();
        if(!EntityManager.skipBehaviors){
            GameMaster.log.turnCounter++;
        }else{
            GameMaster.log.rewind();
        }
        GameMaster.log.printLog();  
        GameMaster.log.clearNotices();
        console.log(EntityManager.skipBehaviors);
        EntityManager.skipBehaviors = false;
    }
    
}