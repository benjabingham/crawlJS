class GameMaster{
    static customControls = {};
    static dungeonId = 0;
    static quickStartMode = true;
    static dungeonMode = false;

    static gameMasterInit(){
        EntityManager.entityManagerInit();
        Shop.shopInit();
        Display.displayInit();
    }

    static quickStart(){
        let starterWeapon = LootManager.getStarterWeapon();
        Player.pickUpItem(starterWeapon);
        GameMaster.getRoom(
            'Abandoned Village',
            'You awake in the dead of night to the sounds of violence. \Goblins have ransacked your village. There is nothing left for you here. Escape to a nearby town. (reach the checkered tiles at the edge of the map)',
            {x:50,y:42}
        );

    }

    static reset(){
        EntityManager.updateSavedInventories();
        Player.unequipWeapon();
        Log.wipeLog();
        EntityManager.wipeEntities();
    }

    static startGame(message=false, position=false){
        GameMaster.dungeonMode = true;
        Log.wipeLog();
        Log.initialWarnings();
        if(message){
            Log.addMessage(message,'urgent');
        }
        Log.addTip();
        Log.printLog();
        let entityManager = EntityManager;
        let board = Board;
        entityManager.skipBehaviors = false;
        Display.showDungeonScreen();
        if(position){
            EntityManager.playerEntity.setPosition(position.x,position.y);
        }
        EntityManager.reapWounded();
        board.placeEntities();
        History.saveSnapshot();

        board.calculateLosArray(entityManager.getEntity('player'));

        
        Display.printBoard();


        /*
        $(document).off().on("keydown", function(e){
            gm.resolvePlayerInput(e); 
        });
        */
        $(document).off('keydown').on("keydown", InputManager.recieveInput);
    }

    static getRoom(roomString, message=false, startingPosition=false){
        if(Save.maps[roomString]){
            console.log('room cached')
            EntityManager.loadRoom(Save.maps[roomString]);
            GameMaster.startGame(message, startingPosition);
        }else{
            console.log('loading room '+roomString);
            fetch('./rooms/'+roomString+'.json')
            .then((response) => response.json())
            .then((json) => {
                console.log(json);
                Save.mapInit(json);
                EntityManager.loadRoom(Save.maps[roomString]);
                GameMaster.startGame(message, startingPosition);
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
        let destination = false;
        if(Board.destinations){
            destination = Board.destinations[direction];
        }else{
            destination = {type: "town"};
        }
        if(!destination){
            return false;
        }
        EntityManager.currentMap.stains = Board.stainArray;
        GameMaster.dungeonId++;
        GameMaster.reset();
        EntityManager.currentMap = false;

        if(destination.type == "town"){
            Player.changeExertion(1);
            GameMaster.loadTown();
        }else if(destination.type == "dungeon"){
            GameMaster.getRoom(destination.name);
        }
    }

    static loadTown(){
        //GameMaster.nextDay();
        GameMaster.dungeonMode = false;
        Shop.restockInventory();
        Player.changeStamina(100);
        Display.showTownScreen();
        Player.light = 0;
    }

    static nextDay(){
        Save.day++
        Player.rest();  
    }

    static rewind(event){
        if(History.canRewind()){
            console.log('rewind');
            History.rewind();
            EntityManager.skipBehaviors = true;
            Log.turnCounter--;
            Log.messages[log.turnCounter] = false;
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

    //general case use item - will work for any item.
    static useItem(event){
        if(!GameMaster.dungeonMode){
            return false;
        }
        let swordId = EntityManager.getProperty('player','sword')
        EntityManager.removeEntity(swordId);
        let slot = parseInt(event.type.split('-')[1])-1;
        if(GameMaster.dropMode){
            if(!Player.dropItem(slot)){
                //EntityManager.skipBehaviors = true;
                GameMaster.dropMode = false;
            }
        }else if(!Player.useItem(Player.inventory.items[slot])){
            //skip behaviors if invalid item
            EntityManager.skipBehaviors = true;
        }

        GameMaster.postPlayerAction();
    }

    static useFuel(event){
        let slot = parseInt(event.type.split('-')[1])-1;
        if(!Player.addFuel(Player.inventory.items[slot])){
            //skip behaviors if invalid item
            EntityManager.skipBehaviors = true;
        }

        GameMaster.postPlayerAction();
    }

    static eatItem(event, dungeonMode=true){
        let slot = parseInt(event.type.split('-')[1])-1;
        if(!Player.eatItem(Player.inventory.items[slot])){
            //skip behaviors if invalid item
            EntityManager.skipBehaviors = true;
        }

        if(dungeonMode){
            GameMaster.postPlayerAction();
        }
    }

    static drinkItem(event, dungeonMode=true){
        let slot = parseInt(event.type.split('-')[1])-1;
        if(!Player.drinkItem(Player.inventory.items[slot])){
            //skip behaviors if invalid item
            EntityManager.skipBehaviors = true;
        }

        if(dungeonMode){
            GameMaster.postPlayerAction();
        }
    }

    static wait(event){
        Player.gainStamina();
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
        Player.lightDown();
    }

    static updateDisplay(){
        Display.printBoard(board.boardArray);
        Player.inventoryCleanup();
        Display.displayInventory(true);

        Display.fillBars(Player);
    }


    static postPlayerAction(){     
        EntityManager.placeSword('player');   
        if(!EntityManager.skipBehaviors){
            GameMaster.resolveEntityBehaviors();
        }
        Board.placeEntities();
        if(!EntityManager.skipBehaviors){
            Player.checkHungerModifiers();
        }
        History.saveSnapshot();
        Board.calculateLosArray(EntityManager.getEntity('player'));
        GameMaster.updateDisplay();
        if(!EntityManager.skipBehaviors){
            Log.turnCounter++;
        }else{
            Log.rewind();
        }
        Log.printLog();  
        Log.clearNotices();
        EntityManager.skipBehaviors = false;
    }
    
}