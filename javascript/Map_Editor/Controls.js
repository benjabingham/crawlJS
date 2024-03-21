class Controls{
    static selectedEntityGroup = -1;

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
            Controls.selectedEntityGroup.groupName = input.val();
            $('#group-select-option-'+Controls.selectedEntityGroup.id).text(input.val());
        })
    }

    static newGroup(){
        let group = new EntityGroup();
        Controls.selectedEntityGroup = group;
        Controls.addEntityGroupOption(group);
        $('#entity-group-select').val(group.id);
        $('.control-panel-input-divs').hide();
        $('#entity-group-select-div').show();
        $('#group-name-div').show();
        $('#entity-type-div').show();
        $('#group-name-input').val(group.groupName)
    }

    static chooseGroup(groupID){
        let group = EntityGroupManager.getGroup(groupID);
        Controls.selectedEntityGroup = group;

        $('.control-panel-input-divs').show();
        $('#group-name-input').val(group.groupName);
        $('#entity-symbol-input').val(group.symbol);
        $('#entity-type-dropdown').val(group.entityType);
        $('#entity-select-dropdown').val(group.key);
        $('#spawn-chance-input').val(group.spawnChance);
        $('#respawn-chance-input').val(group.respawnChance);
    }

    
}