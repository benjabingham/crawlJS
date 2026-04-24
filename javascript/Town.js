class Town{

    static showShop(){
        
    }

    static nourishmentDiv(){
        let display = this;
        //$('#nourishment-level-div').text('You are '+nourishmentLevels[Player.nourishmentLevel]);

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
}