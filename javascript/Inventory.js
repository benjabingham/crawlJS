class Inventory{
    static displayedInventorySlots = {
        "dungeon-inventory":0,
        "container-inventory":0
    };
    static nQuickSlots = 4;
    static playerInBag = false;
    static lastScrolledItem = 0;
    //player or container
    static selectedInventory = "dungeon-inventory"
    static selectedContainer = false;
    static itemPile = false;

    //displays player's inventory, either in the dungeon or in the town
    static displayInventory(dungeonMode=true){
        let inventoryId = (dungeonMode) ? "dungeon-inventory" : "town-inventory";
        //$('#inventory-wrapper').show();
        $('#'+inventoryId+'-list').html('');
        let inventory = Player.inventory.items;
        let bagTitle = false;
        inventory.forEach((item) =>{
            bagTitle = Inventory.checkAddBagTitle(item,bagTitle);
            Inventory.addInventoryItem(item, dungeonMode, inventoryId);
        })
        let displayedItem = Player.inventory.items[Inventory.displayedInventorySlots[inventoryId]]
        Inventory.displayItemInfo(displayedItem, inventoryId)
        
        Inventory.displayContainerInventory();
        
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
        let primed = Inventory.isPrimed(item.slot);
        let inSelectedInventory = inventory == Inventory.selectedInventory;
        let itemIsSelected = slot == Inventory.displayedInventorySlots[inventory] && inSelectedInventory;
        let symbolsSpan = $('<span>')
        let quickSlot = item.quickSlot;
        let available = quickSlot || Inventory.playerInBag;
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
        let element = $('<div>').addClass('inventory-slot fresh-'+item.fresh+' selected-'+itemIsSelected+' primed-'+primed+' drop-'+GameMaster.dropMode+' quickslot-'+quickSlot+' available-'+available ).attr('id',inventory+'-slot-'+slot).append(
                (inventory != 'shop') && quickSlot ? $('<div>').text(slot+1).addClass('item-slot-number') : ''
            ).append(
                $('<div>').attr('id',inventory+'-item-name-'+slot).addClass('item-name').text(item.name).append(symbolsSpan)
            ).on('click',function(){
                Inventory.displayItemInfo(item, inventory);
            }).append(
                $('<div>').addClass('item-buttons').attr('id',inventory+'-item-buttons-'+slot)
            )
        //add item
        $('#'+inventory+'-list').append(element)

        Display.applyColor(item, $('#'+inventory+'-item-name-'+slot));

        if(item.uses){
            $('#'+inventory+'-item-name-'+slot).append("("+item.uses+")")
        }

        //scroll
        if(itemIsSelected && Math.abs(this.lastScrolledItem - slot) > 7 ){
            $('#'+inventory+'-list').scrollTop(element.offset().top);
            this.lastScrolledItem = slot;
        }


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

        if(GameMaster.dropMode){
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
        if(inventory != 'shop' && inventory != "container-inventory"){
            Inventory.displayedInventorySlots[inventory] = item.slot;
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

        $('#dungeon-inventory-list').append(
            $('<div>').addClass('inventory-title').text('Bag')
        )

        return true
    }

    //'slot' is a quickslot. 'item' is item being swapped into that slot. If not specified, item defaults to selected item
    static swapSlot(slot, item = false){
        if (slot >= Inventory.nQuickSlots){
            return false;
        }

        if(!item){
            item = Player.inventory.items[Inventory.displayedInventorySlots[Inventory.selectedInventory]]
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
            Player.inventory.items.splice(slot,0,item)
            Player.inventory.items.splice(item.slot,1)
        }

        item.quickSlot = true;

        Player.inventoryCleanup();
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
        }else if(Inventory.itemPile && (EntityManager.getDistance(EntityManager.playerEntity, Inventory.itemPile)==0)){
            Inventory.selectedContainer = Inventory.itemPile;
            Inventory.selectedInventory = "container-inventory"
        }
        if(this.playerInBag && !this.selectedContainer){

        }
    
        this.bagOverlay();
        
        this.displayInventory();
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
                this.displayedInventorySlots[Inventory.selectedInventory]++
                break;
        }

        this.findValidSelect();

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
    static take(slot){
        let item = Inventory.selectedContainer.inventory.items[slot];
        Inventory.selectedContainer.inventory.items.splice(slot, 1)
        Player.pickUpItem(item);

        if(Inventory.itemPile && !Inventory.itemPile.checkIsEmpty()){
            Inventory.itemPile.sortInventory();
        }
        this.findValidSelect();
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
            this.toggleInventory(false);
            //Log.addMessage('empty');
        }
        items.forEach((item)=>{
            Inventory.addInventoryItem(item,true,"container-inventory")
        })
    }

    static clearContainerInventory(){
        $("#container-inventory-description").html("");
        $('#container-inventory-title').text("");
        Inventory.selectedInventory = "dungeon-inventory"

    }

    static openContainerInventory(container){
        Inventory.playerInBag = true;
        Inventory.selectedContainer = container;
        Inventory.selectedInventory = "container-inventory";
        Inventory.displayedInventorySlots["container-inventory"] = 0;
        $('#container-inventory-title').text(container.name);
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
}