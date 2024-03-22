class Controls{

    static init(){
        Controls.newMapSection();
        Controls.controlPanel();
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
            $('#save-buttons').show();
            $('#new-map-div').hide(); 
        })
    
        $('#cancel-new-map-button').on('click',()=>{
            $('#save-buttons').show();
            $('#new-map-div').hide(); 
        })
    }

    static controlPanel(){
        Controls.entityGroupSelect();
        Controls.groupNameInput();
        Controls.entityTypeSelect();
        Controls.entitySelect();
        Controls.entityNameInput();
        Controls.symbolInput();
        Controls.spawnChanceInput();
        Controls.respawnChanceInput();
    }

    static entityGroupSelect(){
        $('#entity-group-select').on('change',function(){
            if(this.value == 'new'){
                Controls.newGroup();
            }else{
                Controls.chooseGroup(this.value);
            }
        });
    }

    static populateEntityGroupSelect(){
        for (const [key, value] of Object.entries(EntityGroupManager.EntityGroups)){
            Controls.addEntityGroupOption(value);
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
            }
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
            Controls.showCosmeticOptions();
            Controls.showSpawnOptions();
            
        })
    }

    static entityNameInput(){
        let input = $('#entity-name-input');
        input.on('change',function(){
            EntityGroupManager.setEntityName(input.val());
        })
    }

    static symbolInput(){
        let input = $('#entity-symbol-input');
        input.on('change',function(){
            EntityGroupManager.setSymbol(input.val());
        })
    }

    static spawnChanceInput(){
        let input = $('#spawn-chance-input');
        input.on('change',function(){
            EntityGroupManager.setSpawnChance(input.val());
        })
    }

    static respawnChanceInput(){
        let input = $('#respawn-chance-input');
        input.on('change',function(){
            EntityGroupManager.setRespawnChance(input.val());
        })
    }
    


    static showCosmeticOptions(){
        $('#entity-name-input').val(EntityGroupManager.currentEntityName);
        $('#entity-symbol-input').val(EntityGroupManager.currentSymbol);
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
        $('#entity-group-select-div').show();
        $('#group-name-div').show();
        $('#entity-type-div').show();
        $('#group-name-input').val(group.groupName)
    }

    static chooseGroup(groupID){
        let group = EntityGroupManager.selectGroup(groupID)

        $('.control-panel-input-divs').show();
        $('#group-name-input').val(group.groupName);
        $('#entity-name-input').val(group.entityName);
        $('#entity-symbol-input').val(group.symbol);
        $('#entity-type-dropdown').val(group.entityType);
        $('#entity-select-dropdown').val(group.key);
        $('#spawn-chance-input').val(group.spawnChance);
        $('#respawn-chance-input').val(group.respawnChance);
    }

    
}