class Display{
    static entityManager;
    static customControls;

    static displayInit(){
        Display.customControls = EntityManager.gameMaster.customControls;
    }

    static showDungeonScreen(){
        console.log('showDungeonScreen');
        Display.hideAllScreens();
        $('#dungeon-screen').show();
        Display.boardDisplayInit();
        Display.displayInventory(true);
    }

    static showHomeScreen(gameMaster){
        Display.hideAllScreens();
        $('#home-screen').show();
        Display.populateLocations(gameMaster);
        Display.giveSaveButtonsBehavior(gameMaster);
    }

    static showTownScreen(gameMaster){
        Display.hideAllScreens();
        $('#hud-div').show();
        $('#town-screen').show();
        $('#day-div').text('day '+gameMaster.save.day);
        $('#town-inventory-wrapper').show();

        Display.populateLocations(gameMaster);
        Display.displayInventory(false);
        Display.displayShop();
        Display.restButton();
        Display.fillBars(gameMaster.player);
        Display.nourishmentDiv(gameMaster.player);
    }

    static hideAllScreens(){
        $('#town-screen').hide();
        $('#town-inventory-wrapper').hide();
        $('#home-screen').hide();
        $('#dungeon-screen').hide();
        $('#inventory-wrapper').hide();
    }

    static giveSaveButtonsBehavior(gameMaster){
        let save = gameMaster.save
        let display = this;
        $('#new-save-button').off().on('click',function(){
            save.newSave();
            display.showTownScreen(gameMaster);
        })

        $('#load-file-input').off().change(function(){
            save.loadSave($('#load-file-input').prop('files')[0])
            display.showTownScreen(gameMaster);
        })

        $('#download-save-button').off().on('click',function(){
            save.downloadSave(gameMaster);
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
                    $('<div>').addClass('board-grid-div').attr('id','board-grid-'+displayX+'-'+displayY)
                )                 
            }
        }
    }

    static printBoardGrid(){
        let boardArray = Board.boardArray;
        let player = EntityManager.player;
        let playerPos = EntityManager.getEntity('player');
        
        for(let displayY=0; displayY<17; displayY++){
            for(let displayX=0; displayX<17; displayX++){
                let gridDiv = $('#board-grid-'+displayX+'-'+displayY);
                gridDiv.removeClass('grid-dark grid-wall grid-exit grid-hint').off();
                let symbol = '';
                let x = (displayX-8) + playerPos.x;
                let y = (displayY-8) + playerPos.y;
                //out of bounds
                if(Board.hasPlayerLos({x:x, y:y})){
                    if(boardArray[y][x]){
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
                        }
                    }
                    if(!Board.isSpace(x,y)){
                        if(Board.hasAdjacentEmptySpace(x,y)){
                            gridDiv.addClass('grid-exit');
                        }else{
                            gridDiv.addClass('grid-dark')
                        }
                    }
                //out of sight
                }else{
                    gridDiv.addClass('grid-dark')
                }
                while(symbol.length < 2) symbol += ' ';
                gridDiv.text(symbol)
            }
        }
        //console.log(boardString);
    }
    
    static printBoard(){
        Display.printBoardGrid();
        return false;
        
    }

    static nourishmentDiv(player){
        let nourishmentLevels = {0:'starving',1:'hungry',2:'sated',3:'well fed'}
        let display = this;
        $('#nourishment-level-div').text('you are '+nourishmentLevels[player.nourishmentLevel]);

        let meals = [
            {name:'meager meal',cost:3,nourishment:3},
            {name:'proper meal',cost:4,nourishment:5},
            {name:'exquisite meal',cost:6,nourishment:8},
        ]

        $('#meals-div').html('');

        meals.forEach((meal)=>{
            $('#meals-div').append(
                $('<button>').text('buy '+meal.name+' - '+meal.cost).on('click',()=>{
                    if(player.gold >= meal.cost){
                        player.changeNourishment(meal.nourishment);
                        player.gold-= meal.cost;
                        display.nourishmentDiv(player);
                        display.displayGold();
                    }
                })
            )
        })
    }
    
    static fillBars(player){
        let staminaPercent = player.staminaPercent;
        $('#stamina-level').css('width',staminaPercent*1.5+"px");
        $('#stamina-level').text(player.stamina+"/"+player.staminaMax);

        let healthPercent = player.healthPercent;
        $('#health-level').css('width',healthPercent*1.5+"px");
        $('#health-level').text(player.health+"/"+player.healthMax);


        let luckPercent = player.luckPercent;
        $('#luck-level').css('width',luckPercent*1.5+"px");
        $('#luck-level').text(player.luck+"/"+player.luckMax);


    }
    
    static populateLocations(gameMaster){
        $('#travel-locations-div').html('');
        let maps = ['cave','trainingHall','trainingHallNoOgre','andyDungeon']
        maps.forEach((element) =>{
            $('#travel-locations-div').append(
                $("<div>").addClass('location-divs').append(
                    $("<button>").text(element).on('click',function(){
                        console.log(element);
                        gameMaster.getRoom(element+".json")
                    })
                )
            )
        })
    }

    static restButton(){
        let gameMaster = EntityManager.gameMaster;
        $('#rest-button').off().on('click',()=>{
            gameMaster.loadTown();
        })
    }

    static displayInventory(dungeonMode=true){
        let inventoryId = (dungeonMode) ? "dungeon-inventory" : "town-inventory";
        //$('#inventory-wrapper').show();
        $('#'+inventoryId+'-list').html('');
        let inventory = EntityManager.player.inventory;
        inventory.forEach((item) =>{
            Display.addInventoryItem(item, dungeonMode, inventoryId);
        })
        Display.displayGold();
    }

    static displayShop(){
        let shop = EntityManager.gameMaster.shop;
        console.log(shop);
        $('#shop-wrapper').show();
        $('#shop-list').html('');
        let inventory = shop.getInventory();
        inventory.forEach((item) =>{
            Display.addInventoryItem(item, false, 'shop');
        })
        Display.displayGold();
    }

    static displayGold(){
        let player = EntityManager.player;
        $('.gold-div').text(player.gold+" gold");
    }

    static addInventoryItem(item, dungeonMode, inventory){
        let slot = item.slot;
        let display = this;
        let player = EntityManager.player;
        let gameMaster = EntityManager.gameMaster;
        let shop = gameMaster.shop;
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

        if(item.uses){
            $('#'+inventory+'-item-name-'+slot).append("("+item.uses+")")
        }

        if(dungeonMode){
            if(item.weapon && !player.equipped){
                $('#'+inventory+'-item-buttons-'+slot).append(
                    $('<button>').addClass('item-button').text('equip').on('click',function(){
                        gameMaster.useItem({type:'item-'+(slot+1)});
                    })
                )
            }
            if(item.weapon && player.equipped && player.equipped.slot == slot){
                $('#'+inventory+'-item-buttons-'+slot).append(
                    $('<button>').addClass('item-button').text('unequip').on('click',function(){
                        gameMaster.useItem({type:'item-'+(slot+1)});
                    })
                )
            }
            if(item.usable){
                $('#'+inventory+'-item-buttons-'+slot).append(
                    $('<button>').addClass('item-button').text('use').on('click',function(){
                        gameMaster.useItem({type:'item-'+(slot+1)});
                    })
                )
            }
        }else if (inventory != 'shop'){
            $('#'+inventory+'-item-buttons-'+slot).append(
                $('<button>').addClass('item-button').text('sell - '+itemValue).on('click',function(){
                    shop.sellItem(slot);
                    display.displayShop();
                    display.displayInventory(false);
                })
            )
        }else if(inventory == 'shop'){
            $('#'+inventory+'-item-buttons-'+slot).append(
                $('<button>').addClass('item-button').text('buy - '+item.price).on('click',function(){
                    shop.buyItem(slot);
                    display.displayShop();
                    display.displayInventory(false);
                })
            )
        }
        
    }

    static displayItemInfo(item, inventory){
        console.log({
            item:item,
            inventory:inventory
        })
        let itemValue = item.value;
        if(!itemValue){
            itemValue = '0';
        }
        $('#'+inventory+'-description').html('').append(
            $('<div>').addClass('item-name').attr('id',inventory+'-description-title').addClass('inventory-description-title').text(item.name)
        ).append(
            $('<div>').attr('id',inventory+'-description-body').addClass('inventory-description-body')
        )

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
            console.log(val);
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
        let customControls = Display.customControls;
        let inputs = InputManager.inputs;
        //let defaultCustomControls = ['u','j','i','h','o','l','b','k','n'];
        
        $('#custom-controls-div').html('');
        inputs.forEach((input)=>{
            console.log(input);
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
    
}