class Controls{
    static ctrlDown;
    static floorMode = false;
    static entityMode = true;
    static selectedFloor;

    static init(){
        Controls.saveButtons();
        Controls.controlPanel();
        Controls.hotkeys();
        Controls.zoomControl();
        Controls.dragGrid();
        Controls.floorModeButton();
        Controls.entityModeButton();
    }

    static saveButtons(){
        Controls.newMapSection();
        Controls.saveMapButton();
        Controls.loadMapButton();
    }

    static saveMapButton(){
        $('#save-map-button').on('click',()=>{
            Save.downloadMap();
        })
    }

    static loadMapButton(){
        $('#load-map-button').on('click',()=>{
            $('#load-map-input').click();
        })

        $('#load-map-input').off().change(function(){
            Save.loadMap($('#load-map-input').prop('files')[0])
            Controls.initNameInput();
        })
    }

    static newMapSection(){
        $('#new-map-div').hide();
    
        $('#new-map-button').on('click',()=>{
            $('#save-buttons').hide();
            $('#new-map-div').show(); 
        })
    
        $('#create-map-button').on('click',()=>{
            let width = parseInt($('#new-map-width-input').val());
            let height = parseInt($('#new-map-height-input').val());
            Grid.init(width,height);
            Controls.initNameInput()
            $('#save-buttons').show();
            $('#new-map-div').hide(); 
        })
    
        $('#cancel-new-map-button').on('click',()=>{
            $('#save-buttons').show();
            $('#new-map-div').hide(); 
        })
    }

   

    static controlPanel(){
        Controls.eraseButtons();

        Controls.entityGroupSelect();
        Controls.groupNameInput();
        Controls.entityTypeSelect();
        Controls.entitySelectDropdown();
        Controls.entityNameInput();
        Controls.symbolInput();
        Controls.colorInput();
        Controls.wallTypeDropdown();
        Controls.spawnChanceInput();
        Controls.respawnChanceInput();
        Controls.waitInput();

        Controls.floorTypeSelect();
    }

    static eraseButtons(){
        $('#erase-selected-checkbox').change(function(){
            if(this.checked){
                $('#erase-all-checkbox').prop('checked',false);
                Grid.erase = {selected:true};
            }else{
                Grid.erase = false;
            }
            console.log(Grid.erase);
        })

        $('#erase-all-checkbox').change(function(){
            if(this.checked){
                $('#erase-selected-checkbox').prop('checked',false);
                Grid.erase = {all:true};
            }else{
                Grid.erase = false;
            }
            console.log(Grid.erase);
        })
    }

    static entityGroupSelect(){
        $('#entity-group-select').on('change',function(){
            if(this.value == 'new'){
                Controls.newGroup();
            }else{
                Controls.chooseGroup(this.value);
            }
        });
        Controls.populateEntityGroupSelect();
    }

    static populateEntityGroupSelect(){
        $('#entity-group-select').empty().append(
            $('<option>').prop('disabled','disabled').attr('value','').text('Select Entity Group')
        ).append(
            $('<option>').attr('value','new').text('New Entity Group')
        ).val('');
        for (const [key, value] of Object.entries(EntityGroupManager.entityGroups)){
            Controls.addEntityGroupOption(value);
        }

        if(EntityGroupManager.selectedEntityGroup != -1){
            $('#entity-group-select').val(EntityGroupManager.selectedEntityGroup)
            Controls.chooseGroup(EntityGroupManager.selectedEntityGroup)
        }
    }

    static addEntityGroupOption(group){
        $('#entity-group-select').append(
            $('<option>').attr('value',group.id).text(group.groupName).attr('id','group-select-option-'+group.id)
        )
    }

    static groupNameInput(){
        let input = $('#group-name-input');
        input.on('change',function(){
            EntityGroupManager.setGroupName(input.val());
            $('#group-select-option-'+EntityGroupManager.selectedEntityGroup).text(input.val());
            Save.saveSnapshot();
        })
    }

    static entityTypeSelect(){
        $('#entity-type-dropdown').on('change',function(){
            let entityType = this.value;
            EntityGroupManager.setEntityType(entityType);
            if(!Controls.populateEntitySelect(entityType)){
                $('#entity-options').hide();
                $('#entity-options-cosmetic').hide();
            }

            if(entityType == 'wall'){
                Controls.showWallOptions();
            }else{
                $('#wall-options').hide();
            }
             
            Grid.updateGrid();
            Save.saveSnapshot();
        })
    }

    static populateEntitySelect(entityType){
        $('#entity-type-dropdown-div').show();
        let entityVarsObj = false;
        switch(entityType){
            case 'monster':
                entityVarsObj = monsterVars
                break;
            case 'container':
                entityVarsObj = containerVars
                break;
            default: 
                $('#entity-type-dropdown-div').hide();
                return false;
        }
        $('#entity-select-dropdown').empty().append(
            $('<option>').prop('disabled','disabled').attr('value','').text('Select Entity')
        ).val('');
        for (const [key, value] of Object.entries(entityVarsObj)){
            $('#entity-select-dropdown').append(
                $('<option>').attr('value',key).text(value.name)
            )
        }

        return true;
    }

    static entitySelectDropdown(){
        $('#entity-select-dropdown').on('change',function(){
            EntityGroupManager.setKey(this.value);
            if(EntityGroupManager.currentEntityType == 'container' || EntityGroupManager.currentEntityType == 'monster'){
                Controls.showCosmeticOptions();
                Controls.showSpawnOptions();
            }else{
                $('#entity-type-dropdown-div').hide();
                $('#entity-options').hide();
                $('#entity-options-cosmetic').hide();
            }
            Grid.updateGrid();
            Save.saveSnapshot();
        })
    }

    static entityNameInput(){
        let input = $('#entity-name-input');
        input.on('change',function(){
            EntityGroupManager.setEntityName(input.val());
            Save.saveSnapshot();
        })
    }

    static symbolInput(){
        let input = $('#entity-symbol-input');
        input.on('change',function(){
            EntityGroupManager.setSymbol(input.val());
            Grid.updateGrid();
            Save.saveSnapshot();
        })
    }

    static colorInput(){
        let input = $('#entity-color-input');
        input.on('change',function(){
            EntityGroupManager.setColor(input.val());
            Controls.updateColorPreview();
            Grid.updateGrid();
            Save.saveSnapshot();
        })
    }

    static wallTypeDropdown(){
        let input = $('#wall-type-dropdown');
        input.on('change',function(){
            console.log(this.value);
            EntityGroupManager.setWallType(this.value);
            Grid.updateGrid();
            Save.saveSnapshot();
        })

        Controls.populateWallTypeDropdown();
    }

    static populateWallTypeDropdown(){
        ['wall','tree','wood'].forEach((type)=>{
            $('#wall-type-dropdown').append(
                $('<option>').attr('value',type).text(type).attr('id','wall-type-option-'+type)
            )
        })
    }

    static updateColorPreview(){
        $('#entity-color-input').css('color', 'var(--'+EntityGroupManager.currentColor+')')
    }

    static spawnChanceInput(){
        let input = $('#spawn-chance-input');
        input.on('change',function(){
            EntityGroupManager.setSpawnChance(input.val());
            Save.saveSnapshot();
        })
    }

    static respawnChanceInput(){
        let input = $('#respawn-chance-input');
        input.on('change',function(){
            EntityGroupManager.setRespawnChance(input.val());
            Save.saveSnapshot();
        })
    }

    static waitInput(){
        let input = $('#wait-checkbox');
        input.on('change',function(){
            EntityGroupManager.setWait(input.is(':checked'));
            Save.saveSnapshot();
        })
    }
    
    static showCosmeticOptions(){
        $('#entity-name-input').val(EntityGroupManager.currentEntityName);
        $('#entity-symbol-input').val(EntityGroupManager.currentSymbol);
        $('#entity-color-input').val(EntityGroupManager.currentColor);
        Controls.updateColorPreview();
        $('#entity-options-cosmetic').show();
    }

    static showWallOptions(){
        $('#wall-type-dropdown').val(EntityGroupManager.currentWallType)
        $('#wall-options').show();
    }

    static showSpawnOptions(){
        $('#entity-options').show();
        $('#spawn-chance-input').val(EntityGroupManager.currentSpawnChance);
        $('#respawn-chance-input').val(EntityGroupManager.currentRespawnChance);
        $('#wait-checkbox').prop('checked',(EntityGroupManager.currentWait));
    }

    static newGroup(){
        let group = new EntityGroup();
        EntityGroupManager.selectGroup(group.id);
        Controls.addEntityGroupOption(group);
        $('#entity-group-select').val(group.id);
        $('.control-panel-input-divs').hide();
        $('#entity-type-dropdown-div').hide();
        $('#entity-group-select-div').show();
        $('#group-name-div').show();
        $('#entity-type-div').show();
        $('#entity-type-dropdown').val('');
        $('#group-name-input').val(group.groupName)
        Save.saveSnapshot();
    }

    static chooseGroup(groupID){
        let group = EntityGroupManager.selectGroup(groupID)
        console.log(group);
        $('.control-panel-input-divs').show();
        $('#group-name-input').val(group.groupName);
        $('#entity-type-dropdown').val(group.entityType);
        if(group.entityType == 'container' || group.entityType == 'monster'){
            Controls.populateEntitySelect(group.entityType);
            $('#entity-select-dropdown').val(group.key);
            Controls.showCosmeticOptions();
            Controls.showSpawnOptions();
        }else{
            $('#entity-type-dropdown-div').hide();
            $('#entity-options').hide();
            $('#entity-options-cosmetic').hide();
        }

        if(group.entityType == 'wall'){
            Controls.showWallOptions();
        }else{
            $('#wall-options').hide();
        }
    
    }

    static floorModeButton(){
        $('#floor-controls-button').on('click',()=>{
            $('#entity-group-controls').hide();
            $('#draw-options-div').hide();

            $('#floor-controls').show();
            Controls.entityMode = false;
            Controls.floorMode = true;
        })
    }

    static entityModeButton(){
        $('#entity-controls-button').on('click',()=>{
            $('#floor-controls').hide();
            $('#entity-group-controls').show();
            $('#draw-options-div').show();

            Controls.floorMode = false;
            Controls.entityMode = true;
        })
    }

    static floorTypeSelect(){
        ['stone','grass','dirt'].forEach((type)=>{
            $('#floor-type-dropdown').append(
                $('<option>').attr('value',type).text(type).attr('id','floor-type-option-'+type)
            )
        })

        $('#floor-type-dropdown').on('change',function(){
            Controls.selectedFloor = this.value;
            console.log(Controls.selectedFloor);
        })
    }

    static hotkeys(){
        let ctrlKey = 17,
            cmdKey = 91,
            zKey = 90,
            yKey = 89,
            spaceBar = 32;
        $(document).keydown(function(e) {
            if (e.keyCode == ctrlKey || e.keyCode == cmdKey) Controls.ctrlDown = true;
        }).keyup(function(e) {
            if (e.keyCode == ctrlKey || e.keyCode == cmdKey) Controls.ctrlDown = false;
        });
        $(document).on('keydown',(e)=>{
            if (Controls.ctrlDown && (e.keyCode == zKey)){
                e.preventDefault();
                Save.rewind();
            }else if(Controls.ctrlDown && (e.keyCode == yKey)){
                Save.fastForward();  
            }else if(e.keyCode == spaceBar && !$('input').is(":focus")){
                Grid.translateX = 0;
                Grid.translateY = 0;
                Grid.updateTransform();
            }
        })

    }

    static initNameInput(){
        $('#map-name-input').show().val(Save.mapName).off().on('change',()=>{
            Save.mapName = $('#map-name-input').val();
            Save.saveSnapshot();
        })
    }

    static zoomControl(){
        $('#map-grid-container').bind('mousewheel', function(e){
            if(e.originalEvent.wheelDelta /120 > 0) {
                e.preventDefault();
                Grid.adjustScale(1);
            }
            else{
                e.preventDefault();
                Grid.adjustScale(-1);
            }
            
        });
        
    }

    static dragGrid() {
        let element = $('#map-grid-container');
        var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        //prevent contextmenu
        element.on('contextmenu',function(){
            return false;
        })
        
        element.on('mousedown', function(e){
            //only trigger on right click
            if(e.originalEvent.buttons != 2){
                return false;
            }
            e.preventDefault();
            // get the mouse cursor position at startup:
            pos3 = e.clientX;
            pos4 = e.clientY;
            $(document).on('mouseup',function(e){
                console.log(e);
                if(e.originalEvent.button != 2){
                    return false;
                }
                console.log('up');
                e.preventDefault();
                
                $(document).off('mouseup');
                $(document).off('mousemove');
            })
            // call a function whenever the cursor moves:
            $(document).on('mousemove',function(e){
                e.preventDefault();
                // calculate the new cursor position:
                pos1 = pos3 - e.clientX;
                pos2 = pos4 - e.clientY;
                pos3 = e.clientX;
                pos4 = e.clientY;
                // set the element's new position:
                //elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
                //elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
                Grid.pan(pos1*-1,pos2*-1);
                //element.css('transform','translate('+pos2+'px,'+pos1+'px)')
            })
        })
    }

    
}