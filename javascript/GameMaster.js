class GameMaster{
    static customControls = {};
    static dungeonId = 0;
    static quickStartMode = true;
    static dungeonMode = false;
    static currentTown;

    static gameMasterInit(){
        EntityManager.entityManagerInit();
        GameMaster.currentTown = mapVars['Sundun'];
        Shop.shopInit();
        Display.displayInit();
    }

    static quickStart(){
        let starterWeapon = LootManager.getStarterWeapon();
        Player.pickUpItem(starterWeapon);
        Player.pickUpItem(JSON.parse(JSON.stringify(itemVars.fuel.oilFlask)))
        
        /*starterWeapon = LootManager.getFoodLoot();
        Player.pickUpItem(starterWeapon);
        starterWeapon = LootManager.getStarterWeapon();
        Player.pickUpItem(starterWeapon);
        starterWeapon = LootManager.getStarterWeapon();
        Player.pickUpItem(starterWeapon);
        starterWeapon = LootManager.getStarterWeapon();
        Player.pickUpItem(starterWeapon);

        starterWeapon = LootManager.getStarterWeapon();
        Player.pickUpItem(starterWeapon);
        starterWeapon = LootManager.getStarterWeapon();
        Player.pickUpItem(starterWeapon);
        starterWeapon = LootManager.getStarterWeapon();
        Player.pickUpItem(starterWeapon);

        starterWeapon = LootManager.getStarterWeapon();
        Player.pickUpItem(starterWeapon);
        starterWeapon = LootManager.getStarterWeapon();
        Player.pickUpItem(starterWeapon);
        starterWeapon = LootManager.getStarterWeapon();
        Player.pickUpItem(starterWeapon);
        /*
        GameMaster.getRoom(
            'Abandoned Village',
            'You awake in the dead of night to the sounds of violence. Goblins have ransacked your village. There is nothing left for you here. Escape to a nearby town. (reach the checkered tiles at the edge of the map)',
            {x:1,y:42}
        );
        */
        GameMaster.getRoom(
            'Abandoned Village',
            'You awake in the dead of night to the sounds of violence. Goblins have ransacked your village. There is nothing left for you here. Escape to a nearby town. (reach the checkered tiles at the edge of the map)',
            {x:50,y:42}
        );

        XP.levelUp();

    }

    static reset(){
        EntityManager.updateSavedInventories();
        Player.unequipWeapon();
        Log.wipeLog();
        EntityManager.wipeEntities();
        GameMaster.stopDrop();
        Board.lightSourceIDs = [];
    }

    static startGame(message=false, position=false){
        $('#day-div').text('Day '+Save.day);
        GameMaster.dungeonMode = true;
        Log.wipeLog();
        Log.initialWarnings();
        Inventory.toggleInventory(false)
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
        $(document).off('click').on("click", (event)=>{
            InputManager.currentEvent = event;
            Inventory.displayInventory(this.dungeonMode);
            InputManager.lastEvent = event;

        });

        GameMaster.postPlayerAction();

    }

    static getRoom(roomString, message=false, startingPosition=false){
        if(Save.maps[roomString]){
            console.log('room cached')
            EntityManager.loadRoom(Save.maps[roomString]);
            Board.floorArray = Save.maps[roomString].floorMatrix;
            GameMaster.startGame(message, startingPosition);
        }else{
            console.log('loading room '+roomString);
            fetch('./rooms/'+roomString+'.json')
            .then((response) => response.json())
            .then((json) => {
                console.log(json);
                Save.mapInit(json);
                EntityManager.loadRoom(Save.maps[roomString]);
                Board.floorArray = Save.maps[roomString].floorMatrix;
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
        if (!GameMaster.dungeonMode){
            return false
        }
        if(Player.equipped && Player.equipped.unlucky){
            Log.addNotice("Can't Rewind")
            Log.addNotice("something you're holding is cursed!")
            Log.printLog();  
            Log.clearNotices();
            return false;
        }
        if(!History.canRewind()){
            Log.addNotice("Can't Rewind")
            if(!Player.luck){
                Log.addNotice('Out of luck!')
            }
            Log.printLog();  
            Log.clearNotices();
            return false;
        }
        console.log('rewind');
        History.rewind();
        EntityManager.skipBehaviors = true;
        Log.turnCounter--;
        Log.messages[log.turnCounter] = false;
        GameMaster.postPlayerAction();
        

    }

    static drop(event){
        if (!GameMaster.dungeonMode){
            return false
        }
        if(!GameMaster.dropMode){
            GameMaster.dropMode = true;
            Inventory.selectedInventory = "player-inventory";
            $('#drop-items-button').text('stop dropping');
        }else{
            GameMaster.stopDrop();
        }

        Inventory.displayInventory();
        /*
        EntityManager.skipBehaviors = true;
        GameMaster.postPlayerAction();
        */
    }

    static stopDrop(){
        GameMaster.dropMode = false;
        $('#drop-items-button').text('Drop Items');
    }

    static dropItem(slot){
        if(!Player.dropItem(slot)){
            //EntityManager.skipBehaviors = true;
            //GameMaster.dropMode = false;
        }
        GameMaster.postPlayerAction();
    }

    static dropBag(){
        Player.dropBag();
        GameMaster.postPlayerAction();
    }

    static inventoryOpenClose(event){
        //console.log('inventoryOpenClose');
        if(!GameMaster.dungeonMode){
            return false;
        }
        Inventory.toggleInventory();
        if(Inventory.playerInBag){
            if(Inventory.selectedContainer){
                Inventory.selectedInventory = "world-inventory"
            }
            GameMaster.postPlayerAction();
        }
    }

    //function for inventory slot hotkeys
    static slotKey(event){
        let slot = false;
        if(event.type){
            slot = parseInt(event.type.split('-')[1])-1;
        }

        if(GameMaster.dropMode){
            if(Player.inventory.items[slot].quickSlot){
                GameMaster.dropItem(slot);
                return true;
            }
            return false;
        }

        if(Inventory.playerInBag){
            let swapped = Inventory.swapSlot(slot);
            if(swapped){
                GameMaster.postPlayerAction();
            }
            return swapped;
        }

        //return false if not a quickslot or no item
        if(!Player.inventory.items[slot] || !Player.inventory.items[slot].quickSlot){
            return false;
        }

        if(InputManager.lastEvent && InputManager.lastEvent.type == event.type){
            console.log('lastevent: '+InputManager.lastEvent.type)
            GameMaster.useItem(event)
            InputManager.currentEvent.type = "forget"
            return true;
        }
        Inventory.displayedInventorySlots["player-inventory"] = slot;
        Inventory.displayInventory(GameMaster.dungeonMode)

    }

    //general case use item - will work for any item.
    static useItem(event){
        if(GameMaster.dungeonMode){
            let swordId = EntityManager.getProperty('player','sword')
            EntityManager.removeEntity(swordId);
        }
        
        let slot = parseInt(event.type.split('-')[1])-1;
        console.log(slot);
        if(GameMaster.dropMode){
            GameMaster.dropItem(slot);
        }else if(!Player.useItem(Player.inventory.items[slot]) && GameMaster.dungeonMode){
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

    static consumeSelectedItem(event){
        let item = Inventory.getSelectedItem();
        if(!Inventory.itemIsAccessible(item)){return false}
        if(Inventory.selectedInventory == 'world-inventory'){
            Inventory.take(item.slot);
        }
        let result = false
        if(item.food){
            result = Player.eatItem(item);
        }else if (item.potable){
            result = Player.drinkItem(item);
        }

        if(!result){
            return false;
        }

        Inventory
        GameMaster.postPlayerAction();

        return result;
    }

    static burnSelectedItem(event){
        let item = Inventory.getSelectedItem();
        if(!Inventory.itemIsAccessible(item)){return false}
        if(Inventory.selectedInventory == 'world-inventory'){
            Inventory.take(item.slot);
        }
        let result = false
        if(item.fuel){
            result = Player.addFuel(item);
        }

        if(!result){
            return false;
        }

        if(GameMaster.dungeonMode){
            GameMaster.postPlayerAction();
        }

        return result;
    }

    static equipSelectedItem(event){
        let item = Inventory.getSelectedItem();
        if(!Inventory.itemIsAccessible(item)){return false}
        
        let result = false
        if(Player.equipped){
            result = Player.unequipWeapon();
        }else if(Inventory.selectedInventory == 'world-inventory'){
            //Not necessary, player.equip handles this. Causes a bug.
            //Inventory.take(item.slot);
        }

        if(item.weapon && !Player.equipped && !result){
            result = Player.equipWeapon(item);
        }

        if(!result){
            return false;
        }

        if(GameMaster.dungeonMode){
            GameMaster.postPlayerAction();
        }

        return result;
    }

    static useSelectedItem(){
        if(!Inventory.itemIsAccessible(Inventory.getSelectedItem())){
            return false;
        }
        Inventory.selectItem();
        return true;
    }

    static navigateInventory(event){
        //navigate in inventory instead
        Inventory.navigate(event);
        return true;
    }

    static quickToggle(event){
        if(!Inventory.playerInBag){return false}
        if(Inventory.quickToggle()){
            GameMaster.postPlayerAction();
        }
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
        if(Inventory.playerInBag){
            return GameMaster.useSelectedItem();
            //navigate in inventory instead   
        }
        GameMaster.stopDrop();
        if (!GameMaster.dungeonMode){
            return false
        }
        Player.gainStamina();
        GameMaster.postPlayerAction();
    }

    static rotate(event){
        if(Inventory.playerInBag){
            return false;
        }
        GameMaster.stopDrop();
        if (!GameMaster.dungeonMode){
            return false
        }
        let direction = event.type == 'clockwise'? 1 : -1;
        let swordId = EntityManager.getProperty('player','sword')
        EntityManager.removeEntity(swordId);
        EntityManager.rotateSword(swordId,direction);
        GameMaster.postPlayerAction();
    }

    //should belong to input once classes are static
    static movePlayer(event){
        if(Inventory.playerInBag){
            //navigate in inventory instead
            GameMaster.navigateInventory(event);
            return false;
        }
        GameMaster.stopDrop();
        if (!GameMaster.dungeonMode){
            return false
        }
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
        Inventory.displayInventory(true);

        Display.fillBars(Player);
    }


    static postPlayerAction(){ 
        Display.hideHintDiv()
        if(!GameMaster.dungeonMode){
            Log.turnCounter++;
            Log.printLog();  
            Inventory.displayInventory();
            return false;
        }    
        EntityManager.placeSword('player');   
        if(!EntityManager.skipBehaviors){
            GameMaster.resolveEntityBehaviors();
        }
        Board.placeEntities();
        if(!EntityManager.skipBehaviors){
            Player.checkHungerModifiers();
            Player.checkChangeNourishment();
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