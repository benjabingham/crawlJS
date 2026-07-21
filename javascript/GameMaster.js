class GameMaster{
    static customControls = {};
    static dungeonId = 0;
    static quickStartMode = true;
    static currentTown;
    static startTime;

    static get scale(){
        if(!EntityManager.currentMap || !EntityManager.currentMap.mapTypes){
            return false;
        }
        return EntityManager.currentMap.mapTypes.scale
    }

    static gameMasterInit(){
        EntityManager.entityManagerInit();
        GameMaster.currentTown = mapVars['Sundun'];
        Display.displayInit();
        Save.loadMaps();
    }

    static quickStart(){
        GameMaster.startTime = new Date().getTime();
        let starterWeapon = LootManager.getStarterWeapon();
        Player.pickUpItem(starterWeapon);
        Player.pickUpItem(JSON.parse(JSON.stringify(itemVars.fuel.oilFlask)))
       
        /*
        GameMaster.getRoom(
            'Sundun',
            'You awake in the dead of night to the sounds of violence. Goblins have ransacked your village. There is nothing left for you here. Escape to a nearby town. (reach the checkered tiles at the edge of the map)',
            
        );
        */
       
        GameMaster.getRoom(
            'Abandoned Village',
            'You awake in the dead of night to the sounds of violence. Goblins have ransacked your village. There is nothing left for you here. Escape to a nearby town. (reach the checkered tiles at the edge of the map)',
            //{x:50,y:42}
        );

        XP.levelUp(false);
        

    }

    //call when leaving a map
    static reset(resetLog = true){
        if(!EntityManager.currentMap){return false}
        EntityManager.currentMap.stains = Board.stainArray;
        GameMaster.dungeonId++;
        EntityManager.updateSavedInventories();
        if(GameMaster.scale=='world'){
            Board.saveWorldMapArray();
        }
        Player.unequipWeapon();
        if(resetLog){
            Log.wipeLog();
        }else{
            Log.resetTurn = Log.turnCounter;
        }
        EntityManager.wipeEntities();
        GameMaster.stopDrop();
        EntityManager.playerEntity = false;
        Board.lightSourceIDs = [];
        EntityManager.currentMap = false;
        Player.fillStamina();
        Player.light = 0;
        Player.lightTime = 0;
    }

    static startGame(message=false, position=false){
        $('#day-div').text('Day '+Save.day);
        Sound.playRandomTrack();
        Inventory.selectedInventory = "player-inventory";
       // Log.wipeLog();
        Log.initialWarnings();
        Inventory.toggleInventory(false)
        if(message){
            Log.addMessage(message,'urgent');
        }
        Log.addTip();
        Player.applyDelayedFatigue();
        Log.printLog();
        let entityManager = EntityManager;
        let board = Board;
        entityManager.skipBehaviors = false;
        Display.showDungeonScreen();
        if(position){
            EntityManager.playerEntity.setPosition(position.x,position.y);
        }
        if(GameMaster.scale == 'dungeon'){
            EntityManager.playerEntity.pointTowardsCenter();
        }
        if(GameMaster.scale == 'town'){
            GameMaster.checkWin();
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
            Inventory.displayInventory();
            InputManager.lastEvent = event;

        });

        GameMaster.postPlayerAction(false,false);

    }

    static getRoom(roomString, message=false, startingPosition=false, resetLog = true){
        GameMaster.reset(resetLog);
        if(Save.maps[roomString]){
            console.log('room cached')
            EntityManager.loadRoom(Save.maps[roomString]);
            //startingPosition may be x/y coords, or may be 'left','right',etc. Pass to getStartingPosition to translate to coords.
            startingPosition = Travel.getStartingPosition(startingPosition);
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
                startingPosition = Travel.getStartingPosition(startingPosition);
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
            Player.changeFatigue(1);
            GameMaster.loadTown();
        }else if(destination.type == "dungeon"){
            GameMaster.getRoom(destination.name);
        }
        Sound.playRandomTrack();
    }

    /*
    static loadTown(){
        //GameMaster.nextDay();
        Shop.restockInventory();
        Player.changeStamina(100);
        Display.showTownScreen();
        Player.light = 0;
    }
        */

    static nextDay(rest = true){
        Save.day++
        if(rest){
            Player.rest();
        }
          
    }

    static rewind(event){
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
        Sound.playRewind();
        EntityManager.skipBehaviors = true;
        Log.turnCounter--;
        Log.messages[log.turnCounter] = false;
        GameMaster.postPlayerAction();
        

    }

    static drop(event){
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

        //better without swapping...
        /*
        if(Inventory.playerInBag){
            let swapped = Inventory.swapSlot(slot);
            if(swapped){
                GameMaster.postPlayerAction();
            }
            return swapped;
        }
        */
        //return false if not a quickslot or no item
        if(!Player.inventory.items[slot] || !Player.inventory.items[slot].quickSlot){
            return false;
        }

        Inventory.displayedInventorySlots["player-inventory"] = slot;
        Inventory.selectedInventory = "player-inventory"

        if(InputManager.lastEvent && InputManager.lastEvent.type == event.type){
            console.log('lastevent: '+InputManager.lastEvent.type)
            GameMaster.useItem(event)
            InputManager.currentEvent.type = "forget"
            return true;
        }
        Inventory.displayedInventorySlots["player-inventory"] = slot;
        Inventory.displayInventory()

    }

    //general case use item - will work for any item.
    static useItem(event){
        let swordId = EntityManager.getProperty('player','sword')
        EntityManager.removeEntity(swordId);
        
        
        let slot = parseInt(event.type.split('-')[1])-1;
        console.log(slot);
        if(GameMaster.dropMode){
            GameMaster.dropItem(slot);
        }else if(!Player.useItem(Player.inventory.items[slot])){
            //skip behaviors if invalid item
            EntityManager.skipBehaviors = true;
        }

        GameMaster.postPlayerAction('useItem');
    }

    static useFuel(event){
        if(Board.getScale()!='dungeon'){return false}
        let slot = parseInt(event.type.split('-')[1])-1;
        if(!Player.addFuel(Player.inventory.items[slot])){
            //skip behaviors if invalid item
            EntityManager.skipBehaviors = true;
        }

        GameMaster.postPlayerAction();
    }

    static consumeSelectedItem(event){
        let item = Inventory.getSelectedItem();
        if(
            !Inventory.itemIsAccessible(item) ||
            (!item.food && !item.potable)
        ){
            return false
        }
        let selectSlot
        if(Inventory.selectedInventory == 'world-inventory'){
            Inventory.take(item.slot);
            selectSlot = item.slot
        }
        let result = false
        if(item.food){
            result = Player.eatItem(item);
        }else if (item.potable){
            result = Player.drinkItem(item);
        }
        //if consumed one use of multiuse item, reselect it.
        if(typeof Player.inventory.items[selectSlot] != 'undefined'){
            Inventory.selectedInventory = "player-inventory";
            Inventory.displayedInventorySlots["player-inventory"] = selectSlot;
        }

        if(!result){
            return false;
        }

        GameMaster.postPlayerAction();

        return result;
    }

    static burnSelectedItem(event){
        let item = Inventory.getSelectedItem();
        if(!Inventory.itemIsAccessible(item) || !item.fuel){return false}
        let selectSlot
        if(Inventory.selectedInventory == 'world-inventory'){
            Inventory.take(item.slot);
            selectSlot = item.slot
        }
        let result = Player.addFuel(item);
        //if consumed one use of multiuse item, reselect it.
        if(typeof Player.inventory.items[selectSlot] != 'undefined'){
            Inventory.selectedInventory = "player-inventory";
            Inventory.displayedInventorySlots["player-inventory"] = selectSlot;
        }

        if(!result){
            return false;
        }

        GameMaster.postPlayerAction();
        

        return result;
    }

    //if slot is defined, uses that slot instead of selected item
    static equipSelectedItem(event,slot = null){
        if(Board.getScale() != 'dungeon'){
            return false;
        }
        let item;
        if(slot == null){
            item = Inventory.getSelectedItem();
        }else{
            item = Player.inventory.items[slot];
        }
        if(!Inventory.itemIsAccessible(item)){return false}
        
        let result = false
        if(Player.equipped){
            result = Player.unequipWeapon();
        }else if(Inventory.selectedInventory == 'world-inventory'){
            //Not necessary, player.equip handles this. Causes a bug.
            //Inventory.take(item.slot);
        }

        if(!Player.equipped && !result){
            result = Player.equipWeapon(item);
        }

        if(!result){
            return false;
        }

        GameMaster.postPlayerAction();
        

        return result;
    }

    static useSelectedItem(){
        if(!Inventory.itemIsAccessible(Inventory.getSelectedItem())){
            return false;
        }
        Inventory.selectItem();
        return true;
    }

    static sellStoreSelectedItem(){
        if(!Inventory.itemIsAccessible(Inventory.getSelectedItem(), "player-inventory")){
            return false;
        }

        if(Inventory.selectedInventory != "player-inventory" || !Inventory.selectedContainer){
            return false;
        }

        if(Inventory.selectedContainer.shop){
            ShopManager.sellItem(Inventory.getSelectedItem().slot)
        }else{
            Inventory.moveItem(Inventory.getSelectedItem().slot, Inventory.getItemsInInventory("world-inventory"),"player-inventory","world-inventory")
        }

        GameMaster.postPlayerAction();
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


    static eatItem(event){
        let slot = parseInt(event.type.split('-')[1])-1;
        if(!Player.eatItem(Player.inventory.items[slot])){
            //skip behaviors if invalid item
            EntityManager.skipBehaviors = true;
        }

        GameMaster.postPlayerAction();
        
    }

    static drinkItem(event){
        
        let slot = parseInt(event.type.split('-')[1])-1;
        if(!Player.drinkItem(Player.inventory.items[slot])){
            //skip behaviors if invalid item
            EntityManager.skipBehaviors = true;
        }

        GameMaster.postPlayerAction();
        
    }

    static showBulkAndGold(event){
        if(Inventory.showBulkAndGold){
            Inventory.endShowBulkAndGold();
        }else{
            Inventory.startShowBulkAndGold();
        }

        return true;
        /*
        code for holding button down
        let keyCode = InputManager.currentKeydownEvent.originalEvent.code;
        $(document).on("keyup",e=>{
            if(e.originalEvent.code == keyCode){
                Inventory.endShowBulkAndGold();
                $(document).off("keyup");
            }
        })
            */
    }

    static viewWorldMap(event){
        if(!Board.worldMapArray){return false}
        //currently uses the last entered direction... Would be better to cycle through possible visited maps
        if(!Display.viewingWorldMap){
            Display.printBoard(Travel.findWorldMapDestination(EntityManager.currentMap.name,Board.enteredDirection))
        }else{
            console.log('exit map')
            Display.printBoard()
        }
    }

    static wait(event){
        if(Inventory.playerInBag){
            return GameMaster.useSelectedItem();
            //navigate in inventory instead   
        }
        GameMaster.stopDrop();
        if(GameMaster.scale =='dungeon'){
            Player.gainStamina();
        }
        GameMaster.postPlayerAction("wait");
    }

    static rotate(event){
        if(Inventory.playerInBag){
            return false;
        }
        GameMaster.stopDrop();
        if (Board.getScale()!='dungeon'){
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

        //detects if moved off of map, so no postPlayerAction
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

    static checkWin(){
        Player.inventory.items.forEach(item=>{
            
            if(item.win){
                let timeTaken = new Date().getTime() - GameMaster.startTime;
                let minutes = Math.floor(timeTaken / 1000 / 60);
                timeTaken %= 1000 * 60
                let seconds = Math.floor(timeTaken / 1000)
                alert("Congratulations. You have won the game by obtaining the "+item.name+", and it only took you "+minutes+" minutes and "+seconds+" seconds! Tell Ben \""+item.secretCode+"\" and he will add something simple to the game, of your request.")
                item.win = false;
            }
        })
    }

    static postPlayerAction(action=false,snapshot = true){ 
        //console.trace();
        Display.hideHintDiv()
        
        EntityManager.placeSword('player');
        let swordId = EntityManager.getProperty('player','sword')
        let sword = EntityManager.getEntity(swordId);
        console.log(sword.getStrikeType());
        if(!EntityManager.skipBehaviors && sword.getStrikeType() == 'swing'){
            Sound.playRotate();
        }   
        if(!EntityManager.skipBehaviors){
            GameMaster.resolveEntityBehaviors();
        }
        Board.placeEntities();
        if(!EntityManager.skipBehaviors){
            Player.checkHungerModifiers();
            Player.checkChangeNourishment();
        }
        if(snapshot){
            History.saveSnapshot();
        }
        Board.calculateLosArray(EntityManager.getEntity('player'));
        if(GameMaster.scale=='world' && action != 'wait'){
            Player.changeFatigue(1)
        }
        GameMaster.updateDisplay();
        Board.updateSeenTiles();
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