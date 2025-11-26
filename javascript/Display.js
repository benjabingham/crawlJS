class Display{
    static entityManager;
    static customControls;
    static colorScheme = 0;
    static colorSchemes = [
        {scheme:'classic', name:'Classic'},
        {scheme:'dark-mode',name:'Dark Mode'},
        {scheme:'light-mode',name:'Light Mode'}
    ]

    static displayInit(){
        Display.customControls = GameMaster.customControls;
    }

    static showDungeonScreen(){
        console.log('showDungeonScreen');
        Display.hideAllScreens();
        $('#hud-div').show();
        Display.fillBars(Player);
        $('#dungeon-screen').show();
        Display.boardDisplayInit();
        Display.displayInventory(true);
        Display.scrollToTop();
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

        Display.populateLocations();
        Display.displayInventory(false);
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
        let devMode = false;
        let boardArray = Board.boardArray;
        let playerPos = EntityManager.getEntity('player');
        
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
                gridDiv.removeClass('grid-dark grid-wall grid-exit grid-hint').off('mouseleave mouseenter');
                Display.applyOpacity(0,stainDiv);
                if(devMode){
                    gridDiv.off('click');
                }
                let symbol = '';
                //out of bounds
                if(Board.hasPlayerLos({x:x, y:y})){
                    if(boardArray[y] && boardArray[y][x]){
                        if(Board.wallArray[y][x]){
                            gridDiv.addClass('grid-wall')
                        }
                        symbol = boardArray[y][x].tempSymbol ? boardArray[y][x].tempSymbol : boardArray[y][x].symbol;
                        if(boardArray[y][x].name){
                            gridDiv.addClass('grid-hint').off('mouseenter').on('mouseenter',()=>{
                                $('.hint-divs').html('').append(
                                    $('<p>').text(boardArray[y][x].name)
                                )
                            }).off('mouseleave').on('mouseleave',()=>{
                                $('.hint-divs').html('');
                            })
                            if(devMode){
                                gridDiv.on('click',()=>{
                                    console.log(boardArray[y][x]);
                                })
                            }                 
                        }
                        Display.applyColor(boardArray[y][x], entityDiv);
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
                        Display.applyBackgroundColor('red', stainDiv);
                        Display.applyOpacity(Board.getStain(x,y),stainDiv);
                    }
                //out of sight
                }else{
                    gridDiv.addClass('grid-dark')
                }
                while(symbol.length < 2) symbol += ' ';
                entityDiv.text(symbol)
            }
        }
    }
    
    static nourishmentDiv(){
        let nourishmentLevels = {0:'starving',1:'hungry',2:'sated',3:'well fed'}
        let display = this;
        $('#nourishment-level-div').text('You are '+nourishmentLevels[Player.nourishmentLevel]);

        let meals = [
            {name:'Morsel',cost:1,nourishment:1},
            {name:'Proper Meal',cost:5,nourishment:100},
        ]

        $('#meals-div').html('');

        meals.forEach((meal)=>{
            $('#meals-div').append(
                $('<button>').text('buy '+meal.name+' - '+meal.cost).on('click',()=>{
                    if(Player.gold >= meal.cost){
                        Player.changeNourishment(meal.nourishment);
                        Player.gold-= meal.cost;
                        display.nourishmentDiv();
                        display.displayGold();
                    }
                })
            )
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
        let maps = ['Rat Nest', 'Goblin Keep', 'Dark Forest']
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

    static restButton(){
        $('#rest-button').off().on('click',()=>{
            GameMaster.nextDay();
            GameMaster.loadTown();
        })
    }

    static displayInventory(dungeonMode=true){
        let inventoryId = (dungeonMode) ? "dungeon-inventory" : "town-inventory";
        //$('#inventory-wrapper').show();
        $('#'+inventoryId+'-list').html('');
        let inventory = Player.inventory.items;
        inventory.forEach((item) =>{
            Display.addInventoryItem(item, dungeonMode, inventoryId);
        })
        Display.displayGold();
    }

    static displayShop(){
        $('#shop-wrapper').show();
        $('#shop-list').html('');
        let inventory = Shop.getInventory();
        inventory.forEach((item) =>{
            Display.addInventoryItem(item, false, 'shop');
        })
        Display.displayGold();
    }

    static displayGold(){
        $('.gold-div').text(Player.gold+" gold");
    }

    static addInventoryItem(item, dungeonMode, inventory){
        let slot = item.slot;
        let display = this;
        let itemValue = item.value;
        if(!itemValue){
            itemValue = '0';
        }
        
        $('#'+inventory+'-list').append(
            $('<div>').addClass('inventory-slot fresh-'+item.fresh).attr('id',inventory+'-slot-'+slot).append(
                (inventory != 'shop') ? $('<div>').text(slot+1).addClass('item-slot-number') : ''
            ).append(
                $('<div>').attr('id',inventory+'-item-name-'+slot).addClass('item-name').text(item.name)
            ).on('click',function(){
                display.displayItemInfo(item, inventory);
            }).append(
                $('<div>').addClass('item-buttons').attr('id',inventory+'-item-buttons-'+slot)
            )
        )

        Display.applyColor(item, $('#'+inventory+'-item-name-'+slot));

        if(item.uses){
            $('#'+inventory+'-item-name-'+slot).append("("+item.uses+")")
        }

        if(dungeonMode){
            if(item.weapon && !Player.equipped){
                $('#'+inventory+'-item-buttons-'+slot).append(
                    $('<button>').addClass('item-button').text('equip').on('click',function(){
                        GameMaster.useItem({type:'item-'+(slot+1)});
                    })
                )
            }
            let itemIsEquipped = Player.equipped && Player.equipped.slot == slot;
            if(item.weapon && itemIsEquipped){
                $('#'+inventory+'-item-buttons-'+slot).append(
                    $('<button>').addClass('item-button').text('unequip').on('click',function(){
                        GameMaster.useItem({type:'item-'+(slot+1)});
                    })
                )
            }
            if(item.usable){
                let button;
                if(item.fuel && !itemIsEquipped){
                    button = $('<button>').addClass('item-button').text('burn').on('click',function(){
                        GameMaster.useFuel({type:'item-'+(slot+1)});
                    })
                }
                $('#'+inventory+'-item-buttons-'+slot).append(
                    button
                )
            }
        }else if (inventory != 'shop'){
            $('#'+inventory+'-item-buttons-'+slot).append(
                $('<button>').addClass('item-button').text('sell - '+itemValue).on('click',function(){
                    Shop.sellItem(slot);
                    display.displayShop();
                    display.displayInventory(false);
                })
            )
        }else if(inventory == 'shop'){
            $('#'+inventory+'-item-buttons-'+slot).append(
                $('<button>').addClass('item-button').text('buy - '+item.price).on('click',function(){
                    Shop.buyItem(slot);
                    display.displayShop();
                    display.displayInventory(false);
                })
            )
        }
        
    }

    static displayItemInfo(item, inventory){
        let itemValue = item.value;
        if(!itemValue){
            itemValue = '0';
        }
        $('#'+inventory+'-description').html('').append(
            $('<div>').addClass('item-name').attr('id',inventory+'-description-title').addClass('inventory-description-title').text(item.name)
        ).append(
            $('<div>').attr('id',inventory+'-description-body').addClass('inventory-description-body')
        )

        if(item.light && !item.weapon){
            $('#'+inventory+'-description').append(
                $('<div>').addClass('item-fuel-value').text('Fuel strength: '+item.light)
            )
        }

        if(item.flimsy){
            $('#'+inventory+'-description').append(
                $('<div>').addClass('item-break-chance').text('Degrade chance: '+item.flimsy+'%')
            )
        }

        if(itemValue){
            $('#'+inventory+'-description').append(
                $('<div>').addClass('item-value').append(
                    $('<div>').text('Sell Value:').append(itemValue)
                )
            )
        }

        if(item.weapon){
            $('#'+inventory+'-description-body').append(
                $('<div>').addClass('item-stats-normal').append(
                    $('<div>').addClass('item-title').text('Normal:')
                ).append(
                    $('<div>').addClass('item-damage').attr('id',inventory+'-item-damage-'+item.slot).text('Damage: '+item.damage)
                ).append(
                    $('<div>').addClass('item-stun').attr('id',inventory+'-item-stun-'+item.slot).text('stun: '+item.stunTime)
                ).append(
                    $('<div>').addClass('item-weight').attr('id',inventory+'-item-weight-'+item.slot).text('weight: '+item.weight)
                )
            )            
        }

        ['jab','swing','strafe'].forEach(function(val){
            if(item[val]){
                let special = item[val];
                $('#'+inventory+'-description-body').append(
                    $('<div>').addClass('item-stats-normal').append(
                        $('<div>').addClass('item-title').text(val+":")
                    ).append(
                        $('<div>').addClass('item-damage').text('Damage: '+special.damage)
                    ).append(
                        $('<div>').addClass('item-stun').text('stun: '+special.stunTime)
                    ).append(
                        $('<div>').addClass('item-weight').text('weight: '+special.weight)
                    )
                )
            }
        })
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
        if(object.color){
            element.css('color', 'var(--'+object.color+')')
        }else if(object.item && object.item.color){
            element.css('color', 'var(--'+object.item.color+')')
        }else{
            element.css('color', 'var(--defaultEntity)')
        }
    }

    static applyBackgroundColor(color, element){
        if(!color){
            return false;
        }
        element.css('background-color', 'var(--'+color+')')
    }

    //use integer 0-10
    static applyOpacity(opacity, element){
        opacity = Math.min(opacity,7);
        element.css('opacity',opacity/10)
    }
    
}