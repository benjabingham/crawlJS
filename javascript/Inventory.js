class Inventory{
    static displayedInventorySlots = {
        "dungeon-inventory":0,
        "container-inventory":0
    };
    static nQuickSlots = 4;
    static playerInBag = false;
    //player or container
    static selectedInventory = "dungeon-inventory"
    static selectedContainer = false;
    static itemPile = false;
    static draggedItem = {inventoryId:false,slot:false};
    static lastHoveredSlot = {inventoryId:false,slot:false}

    //displays player's inventory, either in the dungeon or in the town
    static displayInventory(dungeonMode=true){
        let inventoryId = (dungeonMode) ? "dungeon-inventory" : "town-inventory";
        this.checkForItemPile();
        //$('#inventory-wrapper').show();
        $('#'+inventoryId+'-list').html('');
        let inventory = Player.inventory.items;
        let bagTitle = false;
        Inventory.findValidSelect();
        inventory.forEach((item) =>{
            Inventory.addBetweenDiv(item.slot,inventoryId,item.quickSlot);
            bagTitle = Inventory.checkAddBagTitle(item,bagTitle);
            Inventory.addInventoryItem(item, dungeonMode, inventoryId);
        })
        Inventory.addBetweenDiv(inventory.length,inventoryId);
        let displayedItem = Player.inventory.items[Inventory.displayedInventorySlots[inventoryId]]
        Inventory.displayItemInfo(displayedItem, inventoryId)
        
        Inventory.displayContainerInventory();

        Inventory.scrollInventories();
        
        Display.displayGold();
    }

    //checks if an inventory slot is primed.
    //should be primed if this slot's hotkey was just pressed, but not if it was last input as well
    static isPrimed(slot, inventory){
        if(slot >= Inventory.nQuickSlots && !this.playerInBag){
            return false;
        }
        if(inventory == 'shop'){
            return false;
        }

        if (InputManager.lastEvent && InputManager.currentEvent.type == InputManager.lastEvent.type){
            return false
        }

        return InputManager.currentEvent ? InputManager.currentEvent.type == "item-"+(slot+1) : false;
        
    }

    static addInventoryItem(item, dungeonMode, inventory){
        let slot = item.slot;
        let itemValue = item.value;
        let itemIsEquipped = Player.equipped && Player.equipped.slot == slot;
        let primed = inventory == "dungeon-inventory" && Inventory.isPrimed(item.slot);
        let inSelectedInventory = inventory == Inventory.selectedInventory;
        let itemIsSelected = slot == Inventory.displayedInventorySlots[inventory] && inSelectedInventory;
        let symbolsSpan = $('<span>')
        let quickSlot = item.quickSlot;
        let available = Inventory.itemIsAccessible(item);
        let dropMode = inventory == "dungeon-inventory" && GameMaster.dropMode
        let draggable = Inventory.itemIsAccessible(item);
        if(item.symbols){
            item.symbols.forEach((symbol)=>{
                let symbolSpan = $('<span>').text(" "+symbol);
                let hintText = Display.getSymbolHintText(symbol);
                Display.setHintText(symbolSpan,hintText)
                symbolsSpan.append(symbolSpan);
            })
        }
        
        if(!itemValue){
            itemValue = '0';
        }
        let element = $('<div>').addClass('inventory-slot fresh-'+item.fresh+' selected-'+itemIsSelected+' primed-'+primed+' drop-'+dropMode+' quickslot-'+quickSlot+' available-'+available ).attr('id',inventory+'-slot-'+slot).append(
                (inventory != 'shop') && quickSlot ? $('<div>').text(slot+1).addClass('item-slot-number') : ''
            ).append(
                $('<div>').attr('id',inventory+'-item-name-'+slot).addClass('item-name').text(item.name).append(symbolsSpan)
            ).on('click',function(){
                Inventory.displayedInventorySlots[inventory] = item.slot;
                Inventory.selectedInventory = inventory;
                Inventory.displayItemInfo(item, inventory);
            }).append(
                $('<div>').addClass('item-buttons').attr('id',inventory+'-item-buttons-'+slot)
            )
        if(draggable){
            Inventory.addDragBehavior(element, item, inventory);
        }
        //add item
        $('#'+inventory+'-list').append(element)

        Display.applyColor(item, $('#'+inventory+'-item-name-'+slot));

        if(item.uses){
            $('#'+inventory+'-item-name-'+slot).append("("+item.uses+")")
        }

        //scroll

        //add buttons
        if(!available){
            return;
        }

        if(inventory == "container-inventory"){
            element.append(
                $('<button>').addClass('item-button').text('take').on('click',function(){
                    Inventory.take(slot);
                })
            )

            return;
        }

        if(dropMode){
            $('#'+inventory+'-item-buttons-'+slot).append(
                $('<button>').addClass('item-button').text('drop').on('click',function(){
                    GameMaster.dropItem(slot);
                })
            )

            return;
        }

        if(item.usable){
            let button;
            if(item.food && !itemIsEquipped){
                button = $('<button>').addClass('item-button').text('eat').on('click',function(){
                    GameMaster.eatItem({type:'item-'+(slot+1)},dungeonMode);
                    Inventory.displayInventory(dungeonMode);
                })
            } else if(item.potable && !itemIsEquipped && inventory != "shop"){
                button = $('<button>').addClass('item-button').text('drink').on('click',function(){
                    GameMaster.drinkItem({type:'item-'+(slot+1)},dungeonMode);
                    Inventory.displayInventory(dungeonMode);
                })
            }
            $('#'+inventory+'-item-buttons-'+slot).append(
                button
            )
        }

        if(dungeonMode){
            if(item.weapon && !Player.equipped){
                $('#'+inventory+'-item-buttons-'+slot).append(
                    $('<button>').addClass('item-button').text('equip').on('click',function(){
                        GameMaster.useItem({type:'item-'+(slot+1)});
                    })
                )
            }
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
                    Display.displayShop();
                    Inventory.displayInventory(false);
                })
            )
        }else if(inventory == 'shop'){
            $('#'+inventory+'-item-buttons-'+slot).append(
                $('<button>').addClass('item-button').text('buy - '+item.price).on('click',function(){
                    Shop.buyItem(slot);
                    Display.displayShop();
                    Inventory.displayInventory(false);
                })
            )
        }
    }

    static displayItemInfo(item, inventory){
        if(!item){
            $('#'+inventory+'-description').html('')
            return false;
        }
        
        let itemValue = item.value;
        if(!itemValue){
            itemValue = '0';
        }
        let descriptionBodyElement;
        if(item.weapon || item.potable){
            descriptionBodyElement = $('<div>').attr('id',inventory+'-description-body').addClass('inventory-description-body');
        }else{
            descriptionBodyElement = '';
        }

        $('#'+inventory+'-description').html('').append(
            $('<div>').addClass('item-name').attr('id',inventory+'-description-title').addClass('inventory-description-title').text(item.name)
        ).append(
            descriptionBodyElement
        )

        let traits = keywordVars.traits;
        let hasTrait = false;
        let traitsDiv = $('<div>').addClass('traits-text')
        Object.keys(traits).forEach((key)=>{
            if(item[key]){
                let trait = keywordVars.traits[key]
                let text = trait.name
                if(hasTrait){
                    text = ", "+text
                }
                if(item[key] > 1){
                    text = text+" "+item[key]
                }
                let traitSpan = $('<span>').addClass('trait-spans').text(text);
                Display.setHintText(traitSpan, trait.hintText)
                traitsDiv.append(traitSpan)
                hasTrait = true;
            }
        })

        if(hasTrait){
            $('#'+inventory+'-description').append(traitsDiv);
        }

        if(item.light && item.fuel){
            $('#'+inventory+'-description').append(
                $('<div>').addClass('item-fuel-value').text('Fuel strength: '+item.light)
            )
        }

        if(item.food){
            $('#'+inventory+'-description').append(
                $('<div>').addClass('item-food-value').text('Nourishment: '+item.food)
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
                    $('<div>').text('Sell Value: ').append(itemValue)
                )
            )
        }

        if(item.potable){
            let effects = ['health','stamina','luck','hunger','light']
            effects.forEach((effect)=>{
                let power = item[effect]
                if(power){
                    let gainLose
                    if (power > 0){
                        gainLose = 'gain'
                    }else{
                        gainLose = 'lose'
                        power *= -1;
                    }
                    $('#'+inventory+'-description-body').append(
                        $('<div>').addClass('potion-description').text('On consumption: '+gainLose+' '+power+' '+effect+'.')
                    )
                }
            })

            if(item.unlabeled){
                $('#'+inventory+'-description-body').append(
                    $('<div>').addClass('potion-description').text('unknown effect...')
                )
            }
        }


        if(item.weapon){
            let attackTypes = ['jab','swing','strafe','draw']
            let special = false;
            let specialName = false;
            attackTypes.forEach(function(val){
                if(item[val]){
                    special = item[val];
                    specialName = val;
                }
            })

            $('#'+inventory+'-description-body').append(
                $('<div>').attr('id','#'+inventory+'-weapon-description').addClass('weapon-description').append(
                    $('<div>').addClass('item-stats-normal').append(
                        $('<div>').addClass('item-title').text('Normal:')
                    ).append(
                        $('<div>').addClass('item-damage').attr('id',inventory+'-item-damage-'+item.slot).text('Damage: '+item.damage)
                    ).append(
                        $('<div>').addClass('item-stun').attr('id',inventory+'-item-stun-'+item.slot).text('stun: '+item.stunTime)
                    ).append(
                        $('<div>').addClass('item-weight').attr('id',inventory+'-item-weight-'+item.slot).text('weight: '+item.weight)
                    )
                ).append(
                    special?($('<div>').addClass('item-stats-normal').append(
                        $('<div>').addClass('item-title').text(specialName+":")
                    ).append(
                        $('<div>').addClass('item-damage').text('Damage: '+special.damage)
                    ).append(
                        $('<div>').addClass('item-stun').text('stun: '+special.stunTime)
                    ).append(
                        $('<div>').addClass('item-weight').text('weight: '+special.weight)
                    )):false
                )
            ).append("<hr>")
             /*           
            attackTypes.forEach(function(val){
                if(item[val]){
                    let special = item[val];
                    $('#'+inventory+'-weapon-description').append(
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
            })    */
        }
    }

    static checkAddBagTitle(item, bagTitle){
        if(item.quickSlot || bagTitle){
            return bagTitle;
        }

        let bagTitleElement = $('<div>').addClass('inventory-title').text('Bag')

        if(GameMaster.dropMode){
            bagTitleElement.append(
                $('<button>').text('drop bag').addClass('inventory-title-buttons').on('click',e=>{
                    GameMaster.dropBag();
                })
            )
        }

        bagTitleElement.append(this.getRummageButton())

        $('#dungeon-inventory-list').append(bagTitleElement)

        Inventory.addBetweenDiv(item.slot,"dungeon-inventory",item.quickSlot);

        return true
    }

    static getRummageButton(){
        let text = this.playerInBag ? "Stop Rummaging" : "Rummage"
        return $('<button>').text(text).addClass('inventory-title-buttons').on('click',e=>{
            this.toggleInventory();
        })
    }

    static getSelectedItem(){
        if(this.selectedInventory == "dungeon-inventory"){
            return Player.inventory.items[Inventory.displayedInventorySlots[Inventory.selectedInventory]]
        }else{
            return Inventory.selectedContainer.inventory.items[Inventory.displayedInventorySlots[Inventory.selectedInventory]]
        }

        return false
    }

    //'slot' is a quickslot. 'item' is item being swapped into that slot. If not specified, item defaults to selected item
    static swapSlot(slot, item = false){
        if (slot >= Inventory.nQuickSlots){
            return false;
        }

        if(!item){
            item = Inventory.getSelectedItem();
        }
        let slotItem = Player.inventory.items[slot];

        if(Inventory.selectedInventory == 'container-inventory'){
            Inventory.take(item.slot)
            Player.inventoryCleanup();
        }
        //swap if slotitem is quickslot. Otherwise just insert.
        if(slotItem && slotItem.quickSlot){
            Player.inventory.items.splice(slot,1,item)
            Player.inventory.items.splice(item.slot,1,slotItem)
            slotItem.quickSlot = item.quickSlot;
        }else{
            Player.inventory.items.splice(item.slot,1)
            Player.inventory.items.splice(slot,0,item)
            
        }

        item.quickSlot = true;

        Player.inventoryCleanup();
        return true;
    }

    //selected item becomes quickslot
    static quickToggle(){
        if(Inventory.selectedInventory != 'dungeon-inventory'){
            return false;
        }

        let item = Inventory.getSelectedItem();

        if(item.quickSlot){
            item.quickSlot = false;
            return true
        }

        //if full of quickslots, remove item in highest slot
        if(Player.inventory.items[Inventory.nQuickSlots-1].quickSlot){
            Player.inventory.items[Inventory.nQuickSlots-1].quickSlot = false;
        }
        item.quickSlot = true;

        return true;
    }

    static toggleInventory(state = null){
        if(state===null){
            this.playerInBag = !this.playerInBag;
        }else{
            this.playerInBag = state;
        }
        if(!this.playerInBag){
            this.selectedContainer = false;
        }
        if(this.playerInBag && !this.selectedContainer){

        }
    
        this.bagOverlay();
        
        this.displayInventory();
    }

    static checkForItemPile(){
        if(!Inventory.playerInBag || !Inventory.itemPile){
            //return false;
        }
        //don't pull up item pile if already in another container
        if(Inventory.selectedContainer && !Inventory.selectedContainer.isItemPile){
            return false;
        }
        
        if(EntityManager.getDistance(EntityManager.playerEntity, Inventory.itemPile)==0){
            Inventory.selectedContainer = Inventory.itemPile;
            $('#container-inventory-title').text("Floor").append(this.getRummageButton());
            //Inventory.selectedInventory = "container-inventory"
        }else{
            Inventory.itemPile = false;
            Inventory.selectedContainer = false;
        }
    }

    
    //inventory can be player or container
    static getItemsInInventory(inventory = "dungeon-inventory"){
        if(inventory == "dungeon-inventory"){
            return Player.inventory.items.length;
        }else if (Inventory.selectedContainer && Inventory.selectedContainer.inventory){
            return Inventory.selectedContainer.inventory.items.length;
        }

        return 0;
    }

    static navigate(event){
        let direction = event.type;
        switch(direction){
            case "left":
                Inventory.selectedInventory = "dungeon-inventory"
                break;
            case "right":
                if(Inventory.selectedContainer){
                    Inventory.selectedInventory = "container-inventory";
                }
                break;
            case "up":
                this.displayedInventorySlots[Inventory.selectedInventory]--
                break;
            case "down":
                //use modulo to loop around
                this.displayedInventorySlots[Inventory.selectedInventory] = (this.displayedInventorySlots[Inventory.selectedInventory] + 1) % this.getItemsInInventory(Inventory.selectedInventory)
                
                break;
        }

        this.displayInventory();
    }

    static selectItem(event){
        if(Inventory.selectedInventory == "dungeon-inventory"){
            let slot = Inventory.displayedInventorySlots["dungeon-inventory"];
            GameMaster.useItem({type:"item-"+(slot+1)})
        }else{
            let slot = Inventory.displayedInventorySlots["container-inventory"]
            Inventory.take(slot);
            Inventory.displayInventory();
        }
    }

    //player takes item from container/pile
    static take(slot, skipPostAction = false){
        let item = Inventory.selectedContainer.inventory.items[slot];
        Inventory.selectedContainer.inventory.items.splice(slot, 1)
        Player.pickUpItem(item);

        if(Inventory.itemPile && !Inventory.itemPile.checkIsEmpty()){
            Inventory.itemPile.sortInventory();
        }

        if(!item.quickSlot && !skipPostAction){
            GameMaster.postPlayerAction();
        }
    }

    static findValidSelect(){
        let nItems = this.getItemsInInventory(this.selectedInventory);
        while(this.displayedInventorySlots[Inventory.selectedInventory] >= nItems){
            this.displayedInventorySlots[Inventory.selectedInventory]--
        }
        this.displayedInventorySlots[Inventory.selectedInventory] += nItems;
        this.displayedInventorySlots[Inventory.selectedInventory] %= nItems;
        this.displayedInventorySlots[Inventory.selectedInventory] = this.displayedInventorySlots[Inventory.selectedInventory] ? this.displayedInventorySlots[Inventory.selectedInventory] : 0;
    }

    static displayContainerInventory(){
        let container = Inventory.selectedContainer;
        $('#container-inventory-list').html('');
        if(!container){
            this.clearContainerInventory();
            return false;
        }
        Inventory.assignSlots();
        let items = container.inventory.items;
        let displayedItemSlot = Inventory.displayedInventorySlots['container-inventory']
        Inventory.displayItemInfo(Inventory.selectedContainer.inventory.items[displayedItemSlot],'container-inventory')
        if(!items.length){
            if (!container.isItemPile){
                this.toggleInventory(false);
            }else if (this.selectedInventory != "dungeon-inventory"){
                this.selectedInventory = "dungeon-inventory";
                this.displayInventory();
            }
            //Log.addMessage('empty');
        }
        items.forEach((item)=>{
            Inventory.addBetweenDiv(item.slot,'container-inventory',false)
            Inventory.addInventoryItem(item,true,"container-inventory")
        })
        Inventory.addBetweenDiv(items.length,'container-inventory',false)
    }

    static clearContainerInventory(){
        $("#container-inventory-description").html("");
        $('#container-inventory-title').html("");
        Inventory.selectedInventory = "dungeon-inventory"

    }

    static openContainerInventory(container){
        Inventory.playerInBag = true;
        Inventory.selectedContainer = container;
        Inventory.selectedInventory = "container-inventory";
        Inventory.displayedInventorySlots["container-inventory"] = 0;
        $('#container-inventory-title').text(container.name).append(this.getRummageButton());
        Inventory.displayInventory();
        this.bagOverlay();
    }

    static assignSlots(){
        let i = 0;
        Inventory.selectedContainer.inventory.items.forEach((item)=>{
            item.slot = i;
            i++;
        })
    }

    static bagOverlay(){
        if(this.playerInBag){
            $("#board").addClass('bag-board')
        }else{
            $("#board").removeClass('bag-board')
        }
    }

    static scrollToItem(element, containerElement){
        let scrollPos = element.offset().top - containerElement.offset().top;
        containerElement.scrollTop(scrollPos);
    }


    static scrollInventories(){
        Object.keys(this.displayedInventorySlots).forEach(inventory=>{
            let container = $('#'+inventory+'-list');
            let selectedSlot = this.displayedInventorySlots[inventory];
            let selectedElement = $("#"+inventory+"-slot-"+selectedSlot);
            if(!selectedElement.offset()){return false}
            var winTop =  $('#'+inventory+'-list').offset().top;
            var winBottom = winTop + $('#'+inventory+'-list').height();
            var elTop = selectedElement.offset().top;
            var elBottom = elTop + selectedElement.height();

            let inView = ((elBottom<= winBottom) && (elTop >= winTop));

            if(!inView){
                this.scrollToItem(selectedElement, container)            
            }
        })
    }

    static addDragBehavior(element, item, inventoryId){
        element.on('mousedown',e=>{
            if(e.originalEvent.button != 0){
                return false;
            }
            e.preventDefault();
            let follower = $('<div>').addClass('dragged-item follower').text(item.name)
            Display.applyColor(item, follower);
            let behaviorSet = false;
            $(element).on('mousemove', function(){
                $(element).off('mousemove');
                if(behaviorSet){return false}
                behaviorSet = true;
                if(follower){
                    $('body').append(
                        follower
                    )
                    Inventory.draggedItem.slot = item.slot;
                    Inventory.draggedItem.inventoryId = inventoryId;                    
                    $('.inventory-between-div').off('mouseenter').on('mouseenter',function(){
                        let slot = parseInt($(this).attr('slot'));
                        let hoveredInventoryId = $(this).attr('inventoryId');
                        $('.inventory-between-div').removeClass('lastSlot');
                        $(this).addClass('lastSlot');
                        Inventory.lastHoveredSlot.slot = slot;
                        Inventory.lastHoveredSlot.inventoryId = hoveredInventoryId;
                    })

                    $('.inventory').on('mouseenter',function(){
                        let inventoryId = $(this).attr('id')
                        Inventory.lastHoveredSlot.inventoryId = inventoryId;
                        Inventory.lastHoveredSlot.slot = Inventory.getItemsInInventory(inventoryId)
                    })
                }
            })
            
            
            Display.updateFollower(e);
        })
        
    }

    static initReleaseDragItems(){
        $(document).on('mouseup',e=>{
            if(e.originalEvent.button != 0){
                return false;
            }
            if(!Inventory.draggedItem.inventoryId){return false}
            $('.dragged-item').remove()
            $('.inventory-between-div').off('mouseenter');
            if(Display.mouseOverBoard && Inventory.draggedItem.inventoryId == 'dungeon-inventory'){
                GameMaster.dropItem(Inventory.draggedItem.slot);
                Inventory.lastHoveredSlot.inventoryId = false;
                Inventory.draggedItem.slot = false;
                Inventory.draggedItem.inventoryId = false;
                return true;
            }
            if(Inventory.lastHoveredSlot.inventoryId){
                if(Inventory.moveItem(Inventory.draggedItem.slot, Inventory.lastHoveredSlot.slot, Inventory.draggedItem.inventoryId, Inventory.lastHoveredSlot.inventoryId)){
                    GameMaster.postPlayerAction();
                }
            }
            Inventory.lastHoveredSlot.inventoryId = false;
            Inventory.draggedItem.slot = false;
            Inventory.draggedItem.inventoryId = false;
        })
    }

    static inventoryClickPreventDefault(){
        $('.inventory-list').on('mousedown',e=>{
            e.preventDefault();
        })
    }

    //add divs between slots for the purpose of dragging. Slot is the slot an item will enter if dragged here.
    static addBetweenDiv(slot, inventory, quickslot = false){
        let betweenDiv = $('<div>').addClass('inventory-between-div').attr('id','between-div-'+slot).attr('quickslot', quickslot).attr('slot',slot).attr('inventoryId',inventory)
        $('#'+inventory+'-list').append(betweenDiv)
    }

    static moveItem(fromSlot, toSlot, fromInventoryId, toInventoryId){
        let transfer = {
            from:{
                id:fromInventoryId,
                inventory:false
            },
            to:{
                id:toInventoryId,
                inventory:false
            }
        }

        let dropCase = false;

        Object.keys(transfer).forEach(key=>{
            let location = transfer[key];
            if(location.id == "dungeon-inventory"){
                location.inventory = Player.inventory.items;
            }else if (location.id == "container-inventory"){
                if(Inventory.selectedContainer){
                    location.inventory = Inventory.selectedContainer.inventory.items;
                }else{
                    GameMaster.dropItem(fromSlot)
                    dropCase = true;
                }
            }
        })

        if(dropCase){return false}

        if(!transfer.from.inventory || !transfer.to.inventory){
            throw new Error("inventory not found !!!");
        }

        let item = transfer.from.inventory[fromSlot];
        let quickSlot = item.quickSlot;
        transfer.from.inventory.splice(fromSlot,1);
        if(fromSlot < toSlot && fromInventoryId == toInventoryId){toSlot--}
        transfer.to.inventory.splice(toSlot,0,item);


        if(transfer.to.id == "dungeon-inventory" && toSlot < Inventory.nQuickSlots){
            item.quickSlot = true;
        }else{
            item.quickSlot = false
        }

        Player.inventoryCleanup();
        Inventory.displayInventory();

        //check if item actually moved ...
        if(item.quickSlot != quickSlot || fromInventoryId != toInventoryId){
            return true
        }else{
            return false;
        }

    }

    static itemIsAccessible(item){
        return item.quickSlot || Inventory.playerInBag;
    }
}