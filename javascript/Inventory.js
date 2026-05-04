class Inventory{
    static displayedInventorySlots = {
        "player-inventory":0,
        "world-inventory":0
    };
    static nQuickSlots = 4;
    static playerInBag = false;
    //player or container
    static selectedInventory = "player-inventory"
    static selectedContainer = false;
    static itemPile = false;
    static draggedItem = {inventoryId:false,slot:false};
    static lastHoveredSlot = {inventoryId:false,slot:false}
    static showBulkAndGold = false;

    //displays player's inventory, either in the dungeon or in the town
    static displayInventory(dungeonMode=true){
        this.checkForItemPile();
        //$('#inventory-wrapper').show();
        $('#player-inventory-list').html('');
        let inventory = Player.inventory.items;
        let bagTitle = false;
        Inventory.findValidSelect();
        inventory.forEach((item) =>{
            Inventory.addBetweenDiv(item.slot,"player-inventory",item.quickSlot);
            bagTitle = Inventory.checkAddBagTitle(item,bagTitle);
            Inventory.addInventoryItem(item, "player-inventory");
        })
        Inventory.addBetweenDiv(inventory.length,"player-inventory");
        let displayedItem = Player.inventory.items[Inventory.displayedInventorySlots["player-inventory"]]
        Inventory.displayItemInfo(displayedItem, "player-inventory")
        
        if(Inventory.selectedContainer){
            Inventory.displayContainerInventory();
        }else{
            $('#right-menu-tabs').hide();
            Inventory.selectCharacterInfoTab();
        }

        Inventory.scrollInventories();
        Inventory.setBulkDiv();
        Inventory.checkEncumbered();
        
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

    static addInventoryItem(item, inventory){
        if(item.purchased){
            return false;
        }
        let dungeonMode = GameMaster.dungeonMode;
        let slot = item.slot;
        let itemValue = item.value;
        //let itemValue = LootManager.getValue(item);
        let itemIsEquipped = Player.equipped && Player.equipped.slot == slot && inventory=="player-inventory";
        let primed = inventory == "player-inventory" && Inventory.isPrimed(item.slot);
        let inSelectedInventory = inventory == Inventory.selectedInventory;
        let itemIsSelected = slot == Inventory.displayedInventorySlots[inventory] && inSelectedInventory;
        let quickSlot = item.quickSlot;
        let available = Inventory.itemIsAccessible(item, inventory);
        let dropMode = inventory == "player-inventory" && GameMaster.dropMode && dungeonMode
        let shopItem = (inventory=="world-inventory") && (Inventory.selectedContainer.shop==true);
        let draggable = available || shopItem;
        let availableStyling = available || shopItem;   
        let symbolsSpan = LootManager.getItemSymbolsSpan(item);

        let proficiencySpan = Display.getProficiencySpan(item);
        
        if(!itemValue){
            itemValue = '0';
        }
        let element = $('<div>').addClass('inventory-slot fresh-'+item.fresh+' selected-'+itemIsSelected+' primed-'+primed+' drop-'+dropMode+' quickslot-'+quickSlot+' available-'+availableStyling+ ' equipped-'+itemIsEquipped ).attr('id',inventory+'-slot-'+slot).append(
                quickSlot ? $('<div>').text(slot+1).addClass('item-slot-number') : ''
            ).append(
                $('<div>').attr('id',inventory+'-item-name-'+slot).addClass('item-name').text(item.name).append(proficiencySpan).append(symbolsSpan)
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

        if(Inventory.showBulkAndGold){
            Inventory.addBulkAndGoldInfo(item,element,shopItem)
            return;
        }

        //add buttons
        if(!available && !shopItem){
            return;
        }

        let buttons = {}

        //eatDrink
        if(item.usable){
            if(item.food && !itemIsEquipped){
                buttons.eat = true;
            }else if(item.potable && !itemIsEquipped && inventory != "shop"){
                buttons.drink = true;
            }
        }

        //equip/unequip/burn
        if(dungeonMode){
            if(item.weapon && !Player.equipped){
                buttons.equip = true;
            }
            if(itemIsEquipped){
                buttons.unequip = true;
            }
            if(item.usable && item.fuel && !itemIsEquipped){
                buttons.burn = true;
            }
            
        }
        if(!dungeonMode && inventory == "player-inventory"){
            buttons.sell = LootManager.getValue(item);
        }
        
        //these buttons appear only on their own
        if(inventory == "world-inventory" && !shopItem){
            buttons = {take: true};
        }else if(dropMode){
           buttons = {drop: true}
        }else if(shopItem){
            buttons = {buy:item.price};
        }

        Inventory.addButtons(slot, inventory, buttons);
    }

    static addBulkAndGoldInfo(item, element, shopItem = false){
        let bulk = LootManager.getItemBulk(item);
        let gold = shopItem ? item.price : item.value;
        //if(quickSlot){bulk /=2}
        if(typeof gold !== 'undefined'){
            element.append(
                $('<div>').addClass('item-gold-div').append(gold+"g").addClass('item-values')
            )
        }
        if(typeof bulk !== 'undefined'){
            element.append(
                $('<div>').addClass('item-bulk-div').append(bulk+"b").addClass('item-values')
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

        let description = $('#'+inventory+'-description');
        let header = Inventory.getItemDescriptionHeader(item, inventory);

        description.html('').append(
            header
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
                let noDisplayNumber = ['food','fuel']
                if(hasTrait){
                    text = ", "+text
                }
                if(item[key] > 1 && !noDisplayNumber.includes(key)){
                    text = text+" "+item[key]
                }
                let traitSpan = $('<span>').addClass('trait-spans').text(text);
                Display.setHintText(traitSpan, trait.hintText)
                traitsDiv.append(traitSpan)
                hasTrait = true;
            }
        })

        if(hasTrait){
            description.append(traitsDiv);
        }

        if(item.light && item.fuel){
            let fuelStrengthDiv = $('<div>').addClass('item-fuel-value').text('Fuel strength: '+item.light)
            Display.setHintText(fuelStrengthDiv,"Burn this item to increase your light level by this amount.")
            description.append(fuelStrengthDiv)
        }

        if(item.food){
            let foodDiv = $('<div>').addClass('item-food-value').text('Nourishment: '+item.food)
            Display.setHintText(foodDiv,"Eat this item to fill your hunger bar this much.")
            description.append(foodDiv)
        }

        if(item.flimsy){
            let getDegradeModifierSpan = Player.getDegradeModifierSpan(item)
            let flimsyDiv = $('<div>').addClass('item-break-chance').text('Degrade chance: '+item.flimsy+'%').append(getDegradeModifierSpan)
            Display.setHintText(flimsyDiv, "This is the base chance this item has to degrade when attacked by an enemy. It also has a quarter of this chance to degrade when used to attack an enemy.")
            description.append(flimsyDiv)
        }

        if(item.flavorText){
            let flavorWrapper = $('<div>').addClass('flavor-wrapper')
            flavorWrapper.append(
                $('<hr>')
            ).append(
                $('<div>').addClass('item-flavor-text').text(item.flavorText)
            )

            description.append(flavorWrapper)
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

            let bonusDamageSpans = Player.getItemBonusDamageSpanWithSpecial(item,special);
            let bonusStunSpans = Player.getItemBonusStunSpanWithSpecial(item,special);

            $('#'+inventory+'-description-body').append(
                $('<div>').attr('id','#'+inventory+'-weapon-description').addClass('weapon-description').append(
                    $('<div>').addClass('item-stats-normal').append(
                        $('<div>').addClass('item-title').text('Normal:')
                    ).append(
                        $('<div>').addClass('item-damage').attr('id',inventory+'-item-damage-'+item.slot).append('Damage: '+item.damage).append(bonusDamageSpans.normal)
                    ).append(
                        $('<div>').addClass('item-stun').attr('id',inventory+'-item-stun-'+item.slot).text('stun: '+item.stunTime).append(bonusStunSpans.normal)
                    ).append(
                        $('<div>').addClass('item-weight').attr('id',inventory+'-item-weight-'+item.slot).text('weight: '+item.weight)
                    )
                ).append(
                    special?($('<div>').addClass('item-stats-normal').append(
                        $('<div>').addClass('item-title').text(specialName+":")
                    ).append(
                        $('<div>').addClass('item-damage').text('Damage: '+special.damage).append(bonusDamageSpans.special)
                    ).append(
                        $('<div>').addClass('item-stun').text('stun: '+special.stunTime).append(bonusStunSpans.special)
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

    static getItemDescriptionHeader(item, inventory){
        let proficiencySpan = Display.getProficiencySpan(item);
        let shopItem = (inventory=="world-inventory") && (Inventory.selectedContainer.shop==true);
        let goldValue;
        let goldHint;
        let bulk = LootManager.getItemBulk(item);
        let symbolsSpan = LootManager.getItemSymbolsSpan(item);
        if(shopItem){
            goldValue = item.price
            goldHint = "This item can be purchased for "+goldValue+" gold."
        }else{
            goldValue = item.value
            goldHint = "This item can be sold for "+goldValue+" gold."
        }

        let header = $('<div>').addClass('item-description-header');
        let goldDiv = $('<div>').addClass('item-gold-div').text(goldValue+'g')
        Display.setHintText(goldDiv,goldHint,'info')
        let nameDiv = $('<div>').addClass('item-name').attr('id',inventory+'-description-title').addClass('inventory-description-title').text(item.name).append(proficiencySpan).append(symbolsSpan)
        Display.applyColor(item,nameDiv)
        let bulkDiv = $('<div>').addClass('item-bulk-div').text(bulk+"b");
        Display.setHintText(bulkDiv, "This item has a bulk of "+bulk+".","info")

        header.append(goldDiv).append(nameDiv).append(bulkDiv)

        return header;
    }

    static setBulkDiv(){
        let bulk = Number.parseFloat(Player.getBulk()).toFixed(2);

        //trim trailing 0 and .
        while(bulk.includes('.') && bulk[bulk.length-1] == '0' || bulk[bulk.length-1] == '.'){
            bulk = bulk.slice(0,bulk.length-1)
        }
        $('.bulk-div').text(bulk+" / "+Player.maxBulk+" bulk")
    }

    static checkEncumbered(){
        if(Player.getEncumbranceLevel()){
            $('#player-inventory').addClass('encumbered')
            return true
        }else{
            $('#player-inventory').removeClass('encumbered')
            return false;
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

        $('#player-inventory-list').append(bagTitleElement)

        Inventory.addBetweenDiv(item.slot,"player-inventory",item.quickSlot);

        return true
    }

    static getRummageButton(){
        if(!GameMaster.dungeonMode){
            return false;
        }
        let text = this.playerInBag ? "Stop Rummaging" : "Rummage"
        return $('<button>').text(text).addClass('inventory-title-buttons').on('click',e=>{
            this.toggleInventory();
        })
    }

    static getSelectedItem(){
        if(this.selectedInventory == "player-inventory"){
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

        if(Inventory.selectedInventory == 'world-inventory'){
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
        if(Inventory.selectedInventory != 'player-inventory'){
            return false;
        }

        let item = Inventory.getSelectedItem();

        if(item.quickSlot){
            item.quickSlot = false;
            if(Player.equipped && Player.equipped.slot == item.slot){
                Player.unequipWeapon();
            }
            Player.inventoryCleanup()
            return true
        }

        //if full of quickslots, remove item in highest slot
        if(Player.inventory.items[Inventory.nQuickSlots-1] && Player.inventory.items[Inventory.nQuickSlots-1].quickSlot){
            Player.inventory.items[Inventory.nQuickSlots-1].quickSlot = false;
        }
        item.quickSlot = true;
        Player.inventoryCleanup()
        return true;
    }

    static toggleInventory(state = null){
        GameMaster.stopDrop();
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
        if(!Inventory.itemPile){
            return false;
        }
        //don't pull up item pile if already in another container
        if(Inventory.selectedContainer && !Inventory.selectedContainer.isItemPile){
            return false;
        }
        
        if(EntityManager.getDistance(EntityManager.playerEntity, Inventory.itemPile)==0){
            Inventory.selectedContainer = Inventory.itemPile;
            if(!$('#right-menu-tabs').is(':visible')){
                $('#right-menu-tabs').show();
                Inventory.selectWorldInventoryTab();
            }
            $('#world-inventory-title').text("Floor").append(this.getRummageButton());
            $('#world-inventory-tab').text("Floor")
            //Inventory.selectedInventory = "world-inventory"
        }else{
            Inventory.itemPile = false;
            Inventory.selectedContainer = false;
        }
    }

    
    //inventory can be player or container
    static getItemsInInventory(inventory = "player-inventory"){
        if(inventory == "player-inventory"){
            return Player.inventory.items.length;
        }else if (Inventory.selectedContainer && Inventory.selectedContainer.inventory){
            return Inventory.selectedContainer.inventory.items.length;
        }

        return 0;
    }

    static navigate(event){
        console.log(event)

        //this way "up" and "item-up" both work.
        let splitEventType = event.type.split('-')
        let direction = splitEventType[splitEventType.length-1];
        console.log(splitEventType);
        console.log(direction)

        switch(direction){
            case "left":
            case "right":
                if(Inventory.selectedInventory == "world-inventory"){
                    Inventory.selectedInventory = "player-inventory"
                }else if(Inventory.selectedInventory == "player-inventory"){
                    Inventory.selectedInventory = "world-inventory";
                    Inventory.selectWorldInventoryTab();
                }
                GameMaster.stopDrop();
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

    static selectItem(){
        if(Inventory.selectedInventory == "player-inventory"){
            let slot = Inventory.displayedInventorySlots["player-inventory"];
            GameMaster.useItem({type:"item-"+(slot+1)})
        }else{
            let slot = Inventory.displayedInventorySlots["world-inventory"]
            if(Inventory.selectedContainer.shop){
                Shop.buyItem(slot)
            }else{
                Inventory.take(slot);
                GameMaster.postPlayerAction();
            }
            Inventory.displayInventory();
        }
    }

    //player takes item from container/pile
    static take(slot, skipPostAction = false, removeItem = true){
        let item = Inventory.selectedContainer.inventory.items[slot];
        if(removeItem){
            Inventory.selectedContainer.inventory.items.splice(slot, 1)
        }
        Player.pickUpItem(item);

        if(Inventory.itemPile && !Inventory.itemPile.checkIsEmpty()){
            Inventory.itemPile.sortInventory();
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
        $('#world-inventory-list').html('');
        if(!container){
            this.clearContainerInventory();
            return false;
        }
        Inventory.assignSlots();
        let items = container.inventory.items;
        let displayedItemSlot = Inventory.displayedInventorySlots['world-inventory']
        Inventory.displayItemInfo(Inventory.selectedContainer.inventory.items[displayedItemSlot],'world-inventory')
        if(!items.length){
            if (!container.isItemPile){
                //should containers close when empty?
                //this.toggleInventory(false);
            }
            if (this.selectedInventory != "player-inventory"){
                this.selectedInventory = "player-inventory";
                this.displayInventory();
            }
            //Log.addMessage('empty');
        }
        let lastCategory
        items.forEach((item)=>{
            let category = (item.weapon?"weapon":item.tier)
            if(container.shop && lastCategory && lastCategory != category){
                $('#world-inventory-list').append($('<hr>'))
            }
            Inventory.addBetweenDiv(item.slot,'world-inventory',false)
            Inventory.addInventoryItem(item,"world-inventory")
            
            lastCategory = category;
        })
        Inventory.addBetweenDiv(items.length,'world-inventory',false)
    }

    static clearContainerInventory(){
        $("#world-inventory-description").html("");
        $('#world-inventory-title').html("");
        Inventory.selectedInventory = "player-inventory"

    }

    static openContainerInventory(container){
        Inventory.playerInBag = true;
        Inventory.selectedContainer = container;
        if(!GameMaster.dropMode){Inventory.selectedInventory = "world-inventory"}
        Inventory.displayedInventorySlots["world-inventory"] = 0;
        $('#right-menu-tabs').show();
        Inventory.selectWorldInventoryTab();
        $('#world-inventory-title').text(container.name).append(this.getRummageButton());
        $('#world-inventory-tab').text(container.name)
        Inventory.displayInventory();
        this.bagOverlay();
    }

    static assignSlots(){
        if(!Inventory.selectedContainer.inventory){
            Inventory.selectedContainer.inventory = {items:[],gold:0}
        }
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
            Sound.playClick();
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
                        if(inventoryId == "right-menu"){inventoryId = "world-inventory"}
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
            if(Display.mouseOverBoard && Inventory.draggedItem.inventoryId == 'player-inventory'){
                GameMaster.dropItem(Inventory.draggedItem.slot);
                Inventory.lastHoveredSlot.inventoryId = false;
                Inventory.draggedItem.slot = false;
                Inventory.draggedItem.inventoryId = false;
                return true;
            }
            if(Inventory.lastHoveredSlot.inventoryId){
                let shopItem = Inventory.draggedItem.inventoryId == "world-inventory" && Inventory.selectedContainer.shop;
                if(Inventory.lastHoveredSlot.inventoryId == "world-inventory" && Inventory.draggedItem.inventoryId == "player-inventory" && Inventory.selectedContainer.shop){
                    //sell item
                    Shop.sellItem(Inventory.draggedItem.slot);
                }else if(Inventory.lastHoveredSlot.inventoryId == "player-inventory" && shopItem){
                    //buy item
                    let item = Inventory.selectedContainer.inventory.items[Inventory.draggedItem.slot]
                    if(Shop.buyItem(Inventory.draggedItem.slot)){
                        Inventory.moveItem(item.slot,Inventory.lastHoveredSlot.slot,"player-inventory","player-inventory")
                    };
                }else if(!shopItem && Inventory.moveItem(Inventory.draggedItem.slot, Inventory.lastHoveredSlot.slot, Inventory.draggedItem.inventoryId, Inventory.lastHoveredSlot.inventoryId)){
                    GameMaster.postPlayerAction();
                }
            }
            Inventory.lastHoveredSlot.inventoryId = false;
            Inventory.draggedItem.slot = false;
            Inventory.draggedItem.inventoryId = false;
        })
    }

    static initTabBehavior(){
        $('#world-inventory-tab').on('click',Inventory.selectWorldInventoryTab)
        $('#character-info-tab').on('click',Inventory.selectCharacterInfoTab)
        Inventory.selectCharacterInfoTab();
    }

    static selectWorldInventoryTab(){
        $('#character-info').hide();
        $('#world-inventory').show();
        $('#character-info-tab').removeClass('selected');
        $('#world-inventory-tab').addClass('selected');
        //Inventory.selectedInventory="world-inventory"
    }

    static selectCharacterInfoTab(){
        $('#character-info').show();
        $('#world-inventory').hide();
        $('#character-info-tab').addClass('selected');
        $('#world-inventory-tab').removeClass('selected');
        Inventory.selectedInventory="player-inventory"
        Player.updatePlayerInfo();
        
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
        if(Player.equipped && fromSlot == Player.equipped.slot && fromInventoryId == "player-inventory"){
            Player.unequipWeapon();
        }
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
            if(location.id == "player-inventory"){
                location.inventory = Player.inventory.items;
            }else if (location.id == "world-inventory"){
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


        if(transfer.to.id == "player-inventory" && toSlot < Inventory.nQuickSlots){
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

    static itemIsAccessible(item, inventory = false){
        if(inventory == "world-inventory" && this.selectedContainer.shop){
            return false;
        }
        return ((item.quickSlot || Inventory.playerInBag) || !GameMaster.dungeonMode);
    }

    static addButtons(slot,inventory,buttons){
        let buttonOrder = ['equip','unequip','burn','eat','drink','take','drop','buy','sell'];
        buttonOrder.forEach(buttonName=>{
            if(typeof buttons[buttonName] !== 'undefined'){
                let button;
                switch(buttonName){
                    case 'equip':
                        button = this.getEquipButton(slot)
                        Inventory.addButton(inventory, slot, button)
                        break;
                    case 'unequip':
                        button = this.getUnequipButton(slot)
                        Inventory.addButton(inventory, slot, button)
                        break;
                    case 'burn':
                        button = this.getBurnButton(slot)
                        Inventory.addButton(inventory, slot, button)
                        break;
                    case 'eat':
                        button = this.getEatButton(slot)
                        Inventory.addButton(inventory, slot, button)
                        break;
                    case 'drink':
                        button = this.getDrinkButton(slot)
                        Inventory.addButton(inventory, slot, button)
                        break;
                    case 'take':
                        button = this.getTakeButton(slot)
                        Inventory.addButton(inventory, slot, button)
                        break;
                    case 'drop':
                        button = this.getDropButton(inventory, slot)
                        Inventory.addButton(inventory, slot, button)
                        break;
                    case 'buy':
                        button = this.getBuyButton(slot,buttons[buttonName])
                        Inventory.addButton(inventory, slot, button)
                        break;
                    case 'sell':
                        button = this.getSellButton(slot,buttons[buttonName])
                        Inventory.addButton(inventory, slot, button)
                        break;
                    default:
                }
            }
        })
    }

    static addButton(inventory,slot,button){
        $('#'+inventory+'-item-buttons-'+slot).append(button)
    }

    static getTakeButton(slot){
        return $('<button>').addClass('item-button').text('take').on('click',function(){
            Inventory.take(slot);
        })
    }

    static getDropButton(inventory,slot){
        return $('#'+inventory+'-item-buttons-'+slot).append(
            $('<button>').addClass('item-button').text('drop').on('click',function(){
                GameMaster.dropItem(slot);
            })
        )
    }

    static getEatButton(slot){
        return $('<button>').addClass('item-button').text('eat').on('click',function(){
            GameMaster.eatItem({type:'item-'+(slot+1)},GameMaster.dungeonMode);
            Inventory.displayInventory();
        })
    }

    static getDrinkButton(slot){
        return $('<button>').addClass('item-button').text('drink').on('click',function(){
            GameMaster.drinkItem({type:'item-'+(slot+1)});
            Inventory.displayInventory();
        })
    }

    static getEquipButton(slot){
        return  $('<button>').addClass('item-button').text('equip').on('click',function(){
            GameMaster.useItem({type:'item-'+(slot+1)});
        })
    }

    static getUnequipButton(slot){
        return $('<button>').addClass('item-button').text('unequip').on('click',function(){
            GameMaster.useItem({type:'item-'+(slot+1)});
        })
    }

    static getBurnButton(slot){
        return $('<button>').addClass('item-button').text('burn').on('click',function(){
            GameMaster.useFuel({type:'item-'+(slot+1)});
        })
    }

    static getSellButton(slot, value){
        return $('<button>').addClass('item-button').text('sell - '+value).on('click',function(){
            Shop.sellItem(slot);
            Inventory.displayInventory();
        })
    }

    static getBuyButton(slot,price){
        return $('<button>').addClass('item-button').text('buy - '+price).on('click',function(){
            Shop.buyItem(slot);
            Inventory.displayInventory();
        })
    }

    static getSnapshot(){
        let attributes = [
            //'displayedInventorySlots',
            'playerInBag',
            'selectedContainer',
            //'itemPile'
        ]
        let snapshot = {}
        attributes.forEach(attribute=>{
            snapshot[attribute] = Inventory[attribute];
        })

        return JSON.stringify(snapshot);
    }

    static loadSnapshot(snapshotString){
        let snapshot = JSON.parse(snapshotString);
        Object.keys(snapshot).forEach(attribute=>{
            Inventory[attribute] = snapshot[attribute];
        })
        //the selected container is a copy of the one in the world
        if(Inventory.selectedContainer){
            Inventory.selectedContainer = EntityManager.getEntity(Inventory.selectedContainer.id)
            if(Inventory.playerInBag){Inventory.selectWorldInventoryTab()}
        }
        this.checkForItemPile();
        Inventory.bagOverlay();
    }

    static startShowBulkAndGold(){
        Inventory.showBulkAndGold = true;
        Inventory.displayInventory();
    }

    static endShowBulkAndGold(){
        Inventory.showBulkAndGold = false;
        Inventory.displayInventory();
    }
}