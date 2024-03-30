class Controls{
    static ctrlDown;

    static init(){
        Controls.saveButtons();
        Controls.controlPanel();
        Controls.hotkeys();
        Controls.zoomControl();
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
        Controls.entitySelect();
        Controls.entityNameInput();
        Controls.symbolInput();
        Controls.colorInput();
        Controls.spawnChanceInput();
        Controls.respawnChanceInput();
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
        Controls.populateEntityGroupSelect();
        $('#entity-group-select').on('change',function(){
            if(this.value == 'new'){
                Controls.newGroup();
            }else{
                Controls.chooseGroup(this.value);
            }
        });
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
            $('#entity-type-dropdown-div').show();
            switch(entityType){
                case 'monster':
                    Controls.populateEntitySelect(monsterVars)
                    break;
                case 'container':
                    Controls.populateEntitySelect(containerVars)
                    break;
                default: 
                    $('#entity-type-dropdown-div').hide();
                    $('#entity-options').hide();
                    $('#entity-options-cosmetic').hide();
            }
            Grid.updateGrid();
            Save.saveSnapshot();
        })
    }

    static populateEntitySelect(entityVarsObj){
        $('#entity-select-dropdown').empty().append(
            $('<option>').prop('disabled','disabled').attr('value','').text('Select Entity')
        ).val('');
        for (const [key, value] of Object.entries(entityVarsObj)){
            $('#entity-select-dropdown').append(
                $('<option>').attr('value',key).text(value.name)
            )
        }
    }

    static entitySelect(){
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
    
    static showCosmeticOptions(){
        $('#entity-name-input').val(EntityGroupManager.currentEntityName);
        $('#entity-symbol-input').val(EntityGroupManager.currentSymbol);
        $('#entity-color-input').val(EntityGroupManager.currentColor);
        Controls.updateColorPreview();
        $('#entity-options-cosmetic').show();
    }

    static showSpawnOptions(){
        $('#entity-options').show();
        $('#spawn-chance-input').val(EntityGroupManager.currentSpawnChance);
        $('#respawn-chance-input').val(EntityGroupManager.currentRespawnChance);
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

        $('.control-panel-input-divs').show();
        $('#group-name-input').val(group.groupName);
        $('#entity-type-dropdown').val(group.entityType);
        if(group.entityType == 'container' || group.entityType == 'monster'){
            $('#entity-select-dropdown').val(group.key);
            Controls.showCosmeticOptions();
            Controls.showSpawnOptions();
        }else{
            $('#entity-type-dropdown-div').hide();
            $('#entity-options').hide();
            $('#entity-options-cosmetic').hide();
        }
    
    }

    static hotkeys(){
        let ctrlKey = 17,
            cmdKey = 91,
            zKey = 90,
            yKey = 89;
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
            let tileSize = 1/(Grid.width*Grid.height)
            if(e.originalEvent.wheelDelta /120 > 0) {
                e.preventDefault();
                Grid.gridScale += .01
            }
            else{
                e.preventDefault();
                Grid.gridScale -= .01
            }
            console.log('updateScale');
            Grid.updateScale();
            
        });
        
    }

    
}