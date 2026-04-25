class Town{

    static showTownScreen(){
        $('#town-screen').show();
        $('#board').hide();
        $('#day-div').text('Day '+Save.day);
        $('#drop-items-button').hide();
        Town.populateLocations();
        Inventory.displayInventory(false);
        Town.displayShop();
        Town.restButton();
        Display.fillBars(Player);
        Town.nourishmentDiv(Player);
        Display.scrollToTop();

        Log.wipeLog();
        Log.printLog();
        GameMaster.postPlayerAction();
    }

    static showShop(){
        
    }

    static nourishmentDiv(){
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
                    let oldNourishment = Player.nourishment
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
                    let nourishmentGained = Player.nourishment - oldNourishment;
                    Player.gold-= meal.cost;
                    Town.nourishmentDiv();
                    Display.displayGold();
                    Inventory.displayInventory(false);

                    Log.addMessage("Purchased "+meal.name+" for "+meal.cost+" gold.")
                    if(nourishmentGained > 0){
                        Log.addMessage("Gained "+nourishmentGained+" hunger.", 'pos') 
                    }
                    GameMaster.postPlayerAction()
                }else{
                    Log.addMessage("Too poor!",'danger')
                    GameMaster.postPlayerAction()
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
            let restInfo = Player.getRestInfo();
            Log.printDayToLog(false);
            let oldLuck = Player.luck;
            GameMaster.nextDay();
            $('#day-div').text('Day '+Save.day);
            //GameMaster.loadTown();
            //Inventory.displayInventory();
            Shop.restockInventory();
            Log.addMessage('You rested.')
            if(restInfo.healthChange > 0){
                Log.addMessage("Gained "+restInfo.healthChange+" health.",'pos')
            }
            if(oldLuck < Player.luck){
                Log.addMessage("Gained "+(Player.luck-oldLuck)+ " luck!","win")
            }
            if(restInfo.nourishmentChange < 0){
                Log.addMessage("Lost "+restInfo.nourishmentChange*-1+" hunger.",'danger')
            }
            Log.addMessage('You are now well rested.','pos')
            GameMaster.postPlayerAction();
            $('.hint-divs').text(Town.getRestHintText());
        })
        
        restButton.on('mouseenter',()=>{
            let restInfo = Player.getRestInfo();
            let hintText = Town.getRestHintText(restInfo);
            Town.previewRestBars(restInfo);
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

    static displayShop(){
        $('#shop-wrapper').show();
        $('#shop-list').html('');
        let inventory = Shop.inventory;
        let shopContainer = {
            inventory:{items:inventory},
            shop:true,
            name:"Shop"
        }
        Inventory.openContainerInventory(shopContainer);
        /*
        inventory.forEach((item) =>{
            Inventory.addInventoryItem(item, false, 'shop');
        })*/
        Display.displayGold();
    }

    
}