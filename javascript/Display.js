class Display{
    static entityManager;
    static customControls;
    static colorScheme = 0;
    static colorSchemes = [
        {scheme:'classic', name:'Classic'},
        {scheme:'dark-mode',name:'Dark Mode'},
        {scheme:'light-mode',name:'Light Mode'}
    ]
    static highlightedCells=[];
    static mouseOverBoard = false;

    static displayInit(){
        Display.customControls = GameMaster.customControls;
        Display.followerInit();
        Inventory.initReleaseDragItems();
    }

    static showDungeonScreen(){
        console.log('showDungeonScreen');
        Display.hideAllScreens();
        $('#hud-div').show();
        Display.fillBars(Player);
        $('#dungeon-screen').show();
        $('#town-hint-div').hide().html('');
        Display.boardDisplayInit();
        Inventory.displayInventory(true);
        Display.scrollToTop();
        Display.dropButton();
        Log.logInit();
    }

    static showHomeScreen(){
        Display.hideAllScreens();
        $('#home-screen').show();
        Display.populateLocations();
        Display.giveSaveButtonsBehavior();
        Display.setColorSchemeButton();
        Display.scrollToTop();
    }

    static showTownScreen(){
        Display.hideAllScreens();
        $('#hud-div').show();
        $('#town-screen').show();
        $('#day-div').text('Day '+Save.day);
        $('#town-inventory-wrapper').show();
        $('#town-hint-div').show().html('');

        Display.populateLocations();
        Inventory.displayInventory(false);
        Display.displayShop();
        Display.restButton();
        Display.fillBars(Player);
        Display.nourishmentDiv(Player);
        Display.scrollToTop();
    }

    static hideAllScreens(){
        $('#town-screen').hide();
        $('#town-inventory-wrapper').hide();
        $('#home-screen').hide();
        $('#dungeon-screen').hide();
        Display.scrollToTop();
    }

    static scrollToTop(){
        document.body.scrollTop = document.documentElement.scrollTop = 0;
    }

    static giveSaveButtonsBehavior(){
        $('#new-save-button').off().on('click',function(){
            Save.newSave();
            if(GameMaster.quickStartMode){
                GameMaster.quickStart();
            }else{
                Display.showTownScreen();
            }
        })

        $('#load-file-input').off().change(function(){
            Save.loadSave($('#load-file-input').prop('files')[0])
            display.showTownScreen();
        })

        $('#download-save-button').off().on('click',function(){
            Save.downloadSave();
        })
    }

    static boardDisplayInit(){
        let boardDiv = $("#board");
       // boardDiv.css('width',17*1.8+"rem");
        Display.generateBoardGrid();
        Display.mouseOverBoardInit();
        let gameWindow = $("#game-window");
        //gameWindow.css('height',17*2+"rem");
        //$('#log').css('height',17*2-2.5+"rem");
    }

    static generateBoardGrid(){
        $('#board').html('');
        let boardArray = Board.boardArray;
        
        for(let displayY=0; displayY<17; displayY++){
            for(let displayX=0; displayX<17; displayX++){
                $('#board').append(
                    $('<div>').addClass('board-grid-div').attr('id','board-grid-'+displayX+'-'+displayY).append(
                        $('<div>').addClass('board-stain-div').attr('id','board-stain-'+displayX+'-'+displayY)
                    ).append(
                        $('<div>').addClass('board-entity-div').attr('id','board-entity-'+displayX+'-'+displayY)
                    )
                )                 
            }
        }

        Display.addClickControls();
    }

    static addClickControls(){
        let playerPos = {x:8,y:8};
        let translations = {
            right:{x:1,y:0}, left:{x:-1,y:0}, up:{x:0,y:-1}, down:{x:0,y:1}, upleft:{x:-1,y:-1}, upright:{x:1,y:-1}, downleft:{x:-1,y:1}, downright:{x:1,y:1}, wait:{x:0,y:0}
        };

        for (const [key, value] of Object.entries(translations)) {
            let x = playerPos.x + value.x;
            let y = playerPos.y + value.y;
            let gridSquare = $('#board-grid-'+x+'-'+y);

            gridSquare.addClass('control-grid').on('click',(e)=>{
                e.preventDefault();
                let event = {type:key}
                if(key == 'wait'){
                    GameMaster.wait(event);
                    return;
                }
                GameMaster.movePlayer(event);
            })
        }

    }

    static printBoard(){
        let devMode = true;
        let boardArray = Board.boardArray;
        let playerPos = EntityManager.getEntity('player');
        Display.addDirectionHighlight();
        for(let displayY=0; displayY<17; displayY++){
            for(let displayX=0; displayX<17; displayX++){
                let gridDiv = $('#board-grid-'+displayX+'-'+displayY);
                let stainDiv = $('#board-stain-'+displayX+'-'+displayY);
                let entityDiv = $('#board-entity-'+displayX+'-'+displayY);
                let x = (displayX-8) + playerPos.x;
                let y = (displayY-8) + playerPos.y;
                //don't bother if spot was dark before and is still dark
                if (!Board.hasPlayerLos({x:x, y:y}) && gridDiv.hasClass('grid-dark')) { 
                    continue;
                }
                gridDiv.removeClass('grid-dark grid-exit grid-hint stoneFloor grassFloor dirtFloor woodFloor').off('mouseleave mouseenter');
                entityDiv.removeClass('grid-highlighted highlight-up grid-tree grid-wall grid-wood highlight-down highlight-left highlight-right highlight-clockwise highlight-counterclockwise parryable');
                Display.applyOpacity(0,stainDiv);
                if(devMode){
                    gridDiv.off('click');
                }
                let symbol = '';
                //out of bounds
                if(Board.hasPlayerLos({x:x, y:y})){
                    if(boardArray[y] && boardArray[y][x]){
                        if(Board.wallArray[y][x]){
                            let wallType = Board.wallArray[y][x].wallType;
                            if(!wallType){
                                wallType = 'wall'
                            }
                            entityDiv.addClass('grid-'+wallType)
                            
                        }
                        symbol = boardArray[y][x].tempSymbol ? boardArray[y][x].tempSymbol : boardArray[y][x].symbol;
                        if(boardArray[y][x].name){
                            gridDiv.addClass('grid-hint').off('mouseenter')
                            Display.setHintText(gridDiv, boardArray[y][x].name);
                            if(devMode){
                                gridDiv.on('click',()=>{
                                    console.log(boardArray[y][x]);
                                })
                            }                 
                        }
                        Display.applyColor(boardArray[y][x], entityDiv);
                        let highlighted = boardArray[y][x].highlighted;
                        let highlightedAdjacents = boardArray[y][x].highlightedAdjacents;
                        if(highlighted || highlightedAdjacents){
                            Display.addHighlights({x:displayX,y:displayY}, highlighted,highlightedAdjacents)
                            //reset each frame
                            boardArray[y][x].highlighted = false;
                            boardArray[y][x].highlightedAdjacents = [];
                        }
                        Display.showParryHighlight(x,y, entityDiv);
                    }
                    if(Board.isSpace(x,y)){
                        //floor stuff
                        let floorType = Board.getFloor(x,y);
                        if(!floorType){
                            floorType = 'stone';
                        }
                        gridDiv.addClass(floorType+'Floor')
                    }
                    if(!Board.isSpace(x,y)){
                        if(Board.hasAdjacentEmptySpace(x,y)){
                            gridDiv.addClass('grid-exit');
                        }else{
                            gridDiv.addClass('grid-dark');
                        }
                    }
                    if(Board.getStain(x,y)){
                        //stainDiv.text('౷');
                        Display.applyBackgroundColorRGB(Board.getStain(x,y).color, stainDiv);
                        Display.applyOpacity(Board.getStain(x,y).level,stainDiv);
                    }
                //out of sight
                }else{
                    gridDiv.addClass('grid-dark')
                }
                while(symbol.length < 2) symbol += ' ';
                entityDiv.text(symbol)       
            }
        }
        Display.applyHighlights();
        Display.setHintText($('.grid-exit'),'EXIT')
    }

    static showParryHighlight(x,y, entityDiv){
        if(
            Board.boardArray[y][x].parryable && Display.parryInRange(x,y)
        ){
            entityDiv.addClass('parryable')
        }
    }

    static parryInRange(x,y){
        //console.log({x:x,y:y})
        let playerEntity = EntityManager.playerEntity;
        //x,y difference between player and target
        let playerToTarget = {x:x-playerEntity.x, y:y-playerEntity.y}
        if(EntityManager.getDistance({x,y},EntityManager.playerEntity.swordEntity) != 1 && !EntityManager.playerEntity.canUnarmedStrike(playerToTarget.x,playerToTarget.y)){
            //console.log('not in range')
            //console.log(EntityManager.playerEntity.canUnarmedStrike(x,y))
            return false
        }

        let possibleStrikes = EntityManager.getPossibleStrikes({x,y})
        if(!possibleStrikes.length){
            return false;
        }
        console.log(possibleStrikes);
        let weaponItem = EntityManager.playerEntity.swordEntity.item
        let weight = 99999
        
        possibleStrikes.forEach((strike)=>{
            if (weaponItem && weaponItem[strike]){
                weight = Math.min(weight, weaponItem[strike].weight);
            }else if(weaponItem){
                weight = Math.min(weight,weaponItem.weight)
            }

            if(strike == 'unarmed'){
                weight = Math.min(weight,3);
            }
        })

        //because parrys cost 1 less...
        weight-=1;

        return weight <= Player.stamina;
    }

    //pos is coords of display grid. Highlighted is bool, if that grid is highlighted. Highlighted adjacents is array of directions (ex. {x:1,y:-1}) of adjacent highlighted cells
    static addHighlights(pos,highlighted = false,highlightedAdjacents = []){
        let highlight = {
            x:pos.x,
            y:pos.y,
            highlighted:highlighted,
            highlightedAdjacents:highlightedAdjacents
        }
        Display.highlightedCells.push(highlight)
    }

    static addDirectionHighlight(){
        let playerEntity = EntityManager.getEntity('player');
        let swordEntity = playerEntity.swordEntity;
        //this is how we tell if it's equipped, or outside of the map
        if(Board.isSpace(swordEntity.x,swordEntity.y)){
            playerEntity.highlightedAdjacents = [];
            return false;
        }
        let direction = EntityManager.translations[swordEntity.rotation];
        playerEntity.highlightedAdjacents = [direction]
    }

    //directional highlights are just for showing player where they are looking. Will need to be different for walls.
    static applyHighlights(){
        Display.highlightedCells.forEach((cell)=>{
            let cellElement = $('#board-entity-'+cell.x+'-'+cell.y)
            if(cell.highlighted){
                cellElement.addClass('grid-highlighted')
            }
            if(cell.highlightedAdjacents){
                cell.highlightedAdjacents.forEach((direction)=>{
                    if(direction.x == 1){
                        cellElement.addClass('highlight-right')
                        if(direction.y == 1){
                            cellElement.addClass('highlight-clockwise')
                        }
                        if(direction.y == -1){
                            cellElement.addClass('highlight-counterclockwise')
                        }
                    }else if(direction.x == -1){
                        cellElement.addClass('highlight-left')
                        if(direction.y == 1){
                            cellElement.addClass('highlight-counterclockwise')
                        }
                        if(direction.y == -1){
                            cellElement.addClass('highlight-clockwise')
                        }
                    }else if(direction.y == 1){
                        cellElement.addClass('highlight-down')
                    }else if(direction.y == -1){
                        cellElement.addClass('highlight-up')          
                    }
                })
            }
        })

        Display.highlightedCells = [];
    }
    
    static nourishmentDiv(){
        let nourishmentLevels = {0:'starving',1:'hungry',2:'sated',3:'well fed'}
        let display = this;
        $('#nourishment-level-div').text('You are '+nourishmentLevels[Player.nourishmentLevel]);

        let meals = [
            {
                name:'Morsel',
                cost:1,
                item: itemVars.food.morsel
            },
            {name:'Proper Meal',cost:6,nourishment:100},
        ]

        $('#meals-div').html('');

        meals.forEach((meal)=>{
            let button = $('<button>');
            button.text('buy '+meal.name+' - '+meal.cost).on('click',()=>{
                if(Player.gold >= meal.cost){
                    if(meal.item){
                        if(Player.inventory.items.length < Player.inventory.slots){
                            let itemCopy = JSON.parse(JSON.stringify(meal.item));
                            Player.pickUpItem(itemCopy);
                        }else{
                            Player.changeNourishment(item.food);
                        }
                    }else{
                        Player.changeNourishment(meal.nourishment);
                    }
                    Player.gold-= meal.cost;
                    display.nourishmentDiv();
                    display.displayGold();
                    Inventory.displayInventory(false);
                }
            })
            if(!meal.item){
                Display.setHintText(button,"Fully refils your hunger bar")
                button.on('mouseenter',()=>{
                    $('#hunger-level').css('width',"150px").addClass('preview');
                    $('#hunger-level').text(Player.nourishmentMax+"/"+Player.nourishmentMax);                    
                }).on('mouseleave',()=>{
                    $('#hunger-level').removeClass('preview');
                    Display.fillBars();
                })  
            }
             
            $('#meals-div').append(button)
        })
    }

    static exertionDiv(){
        let exertionLevels = {0:'rested', 1:'exerted',2:'exhausted'};
        let exertionColors = {0:'black', 1:'darkOrange',2:'red'}
        
        $('#exertion-level-div').text('You are '+exertionLevels[Player.exertion]+'.').css('color', 'var(--'+exertionColors[Player.exertion]+')');
    }
    
    static fillBars(){
        let staminaPercent = Player.staminaPercent;
        $('#stamina-level').css('width',staminaPercent*1.5+"px");
        $('#stamina-level').text(Player.stamina+"/"+Player.staminaMax);

        let healthPercent = Player.healthPercent;
        $('#health-level').css('width',healthPercent*1.5+"px");
        $('#health-level').text(Player.health+"/"+Player.healthMax);

        let luckPercent = Player.luckPercent;
        $('#luck-level').css('width',luckPercent*1.5+"px");
        $('#luck-level').text(Player.luck+"/"+Player.luckMax);

        let hungerPercent = Player.hungerPercent;
        $('#hunger-level').css('width',hungerPercent*1.5+"px");
        $('#hunger-level').text(Player.nourishment+"/"+Player.nourishmentMax);

        Display.exertionDiv();

    }
    
    static populateLocations(){
        $('#travel-locations-div').html('');
        let maps = ['Abandoned Village','Rat Nest', 'Goblin Keep', 'Dark Forest', 'Forgotten Cemetery', 'Catacombs']
        maps.forEach((element) =>{
            $('#travel-locations-div').append(
                $("<div>").addClass('location-divs').append(
                    $("<button>").text(element).on('click',function(){
                        GameMaster.getRoom(element)
                    })
                )
            )
        })
    }

    static getRestHintText(restInfo){
        if(!restInfo){
            restInfo = Player.getRestInfo();
        }
        let hintText = 'You will gain: '+restInfo.healthChange+" health, "+restInfo.nourishmentChange+" hunger, "+restInfo.exertionChange+" exertion. 50% change to gain 1 luck.";

        return hintText;
    }

    static previewRestBars(restInfo){
        console.log(restInfo);
        let newHealth = Player.health+restInfo.healthChange
        let newLuck = Math.min(Player.luck+0.5,Player.luckMax)
        let newHunger = Player.nourishment+restInfo.nourishmentChange
        let healthPercent = Math.floor(newHealth/Player.healthMax*100);
        let luckPercent = Math.floor(newLuck/Player.luckMax*100);
        let hungerPercent = Math.floor(newHunger/Player.nourishmentMax*100);
        console.log(healthPercent)

        $('#health-level').css('width',healthPercent*1.5+"px").addClass('preview');
        $('#health-level').text(newHealth+"/"+Player.healthMax);

        $('#luck-level').css('width',luckPercent*1.5+"px").addClass('preview');
        $('#luck-level').text(newLuck+"/"+Player.luckMax);

        $('#hunger-level').css('width',hungerPercent*1.5+"px").addClass('preview');
        $('#hunger-level').text(newHunger+"/"+Player.nourishmentMax);

        $('#exertion-level-div').addClass('preview').text('You are rested').css('color', 'var(--dark)');
    }

    static restButton(){
        let restButton = $('#rest-button')
        restButton.off().on('click',()=>{
            GameMaster.nextDay();
            GameMaster.loadTown();
            $('.hint-divs').text(Display.getRestHintText());
        })
        
        restButton.on('mouseenter',()=>{
            let restInfo = Player.getRestInfo();
            let hintText = Display.getRestHintText(restInfo);
            Display.previewRestBars(restInfo);
            $('.hint-divs').text(hintText)
        }).on('mouseleave',()=>{
            $('.hint-divs').html('');
            Display.fillBars();
            Display.exertionDiv();
            $('#exertion-level-div').removeClass('preview');
            $('#health-level').removeClass('preview');

            $('#luck-level').removeClass('preview');

            $('#hunger-level').removeClass('preview');
        })   
    }

    static setHintText(element, hintText){
        element.on('mouseenter',()=>{
            $('.hint-divs').text(hintText)
        }).on('mouseleave',()=>{
            $('.hint-divs').html('');
        })
    }

    

    static displayShop(){
        $('#shop-wrapper').show();
        $('#shop-list').html('');
        let inventory = Shop.getInventory();
        inventory.forEach((item) =>{
            Inventory.addInventoryItem(item, false, 'shop');
        })
        Display.displayGold();
    }

    static displayGold(){
        $('.gold-div').text(Player.gold+" gold");
    }

    
    static getSymbolHintText(symbol){
        let charCode = symbol.charCodeAt(0)
        return keywordVars.symbols[charCode].name
    }
    
    static setCustomControls(){
        let display = this;
        let inputs = InputManager.inputs;

        $('#custom-controls-div').html('');
        inputs.forEach((input)=>{
            $('#custom-controls-div').append(
                $('<div>').addClass('custom-input-divs').append(
                    $('<label>').text(input.name)
                ).append(
                    $('<input>').attr('id',input.name+'-input').addClass('control-inputs').val(input.key).click(()=>{
                        $('#'+input.name+'-input').select();
                    }).on('keydown',(e)=>{
                        e.preventDefault();
                        InputManager.setInput(input.name,e.originalEvent.code)
                        display.setCustomControls();
                        $('#'+input.name+'-input').select().focus();
                    })
                )
            )
        })

        $('#preset-div').html('');

        for(const [k,v] of Object.entries(inputVars)){
            $('#preset-div').append(
                $('<button>').text(k).on('click',()=>{
                    InputManager.setInputPreset(k);
                    display.setCustomControls();
                })
            )
        }
    }

    static setColorSchemeButton(){
        Display.applyColorScheme(Display.getColorScheme());
        $('#color-scheme-button').on('click',()=>{
            $('html').removeClass(Display.colorSchemes[Display.colorScheme].scheme);
            Display.colorScheme = Display.getNextColorSchemeIndex();
            Display.applyColorScheme(Display.getColorScheme());
        })
    }

    static getColorScheme(){
        return Display.colorSchemes[Display.colorScheme]
    }

    static getNextColorSchemeIndex(){
        return (Display.colorScheme+1) % Display.colorSchemes.length;
    }

    static applyColorScheme(scheme){
        $('html').addClass(scheme.scheme);
        $('#color-scheme-button').text(Display.colorSchemes[Display.getNextColorSchemeIndex()].name)
    }

    static applyColor(object, element){
        let colorString;
        if(object.color){
            colorString = 'var(--'+object.color+')'
        }else if(object.item && object.item.color){
            colorString =  'var(--'+object.item.color+')'
        }else{
            colorString =  'var(--defaultEntity)'        }

        element.css('color', colorString)
        element.css('text-decoration-color', colorString)
    }

    static applyBackgroundColor(color, element){
        if(!color){
            return false;
        }
        element.css('background-color', 'var(--'+color+')')
    }

    static applyBackgroundColorRGB(color, element){
        if(!color){
            return false;
        }
        element.css('background-color', 'rgb('+color.r+','+color.g+','+color.b+')')
    }

    //use integer 0-10
    static applyOpacity(opacity, element){
        opacity = Math.min(opacity,7);
        element.css('opacity',opacity/10)
    }

    static dropButton(){
        $('#drop-items-button').off().on('click',(event)=>{
            GameMaster.drop(event);
        })
    }

    static followerInit(){
        $(document).on('mousemove', function(e){
            Display.updateFollower(e);
        })
    }

    static updateFollower(e){
        $('.follower').css({
                left: e.pageX,
                top: e.pageY
            });
    }

    static mouseOverBoardInit(){
        console.log('boardinit')
        $('#board').on('mouseenter',e=>{
            Display.mouseOverBoard = true;
            $('.inventory-between-div').removeClass('lastSlot');
        })
        $('#board').on('mouseleave',e=>{
            Display.mouseOverBoard = false;
            console.log(false)
        })
        console.log( $('#board'))
    }
    
}