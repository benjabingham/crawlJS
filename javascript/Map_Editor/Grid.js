class Grid{

    static height;
    static width;
    static matrix = [];

    static init(width, height){
        Grid.width = width;
        Grid.height = height;
        Grid.matrix = new Array(Grid.height).fill().map( ()=>
            Array(Grid.width).fill(false)
        )

        $('#map-grid').html('').css('grid-template-columns','repeat('+Grid.width+',1fr)');        
        for(let y=0; y < Grid.height; y++){
            for(let x=0; x < Grid.width; x++){
                $('#map-grid').append(
                    $('<div>').addClass('map-grid-div').attr('id','map-grid-' + x + '-' + y).append(
                        $('<div>').addClass('map-entity-div').attr('id','map-entity-' + x + '-' + y)
                    ).on('click',(e)=>{
                        e.preventDefault();
                        if(EntityGroupManager.selectedEntityGroup != -1){
                            Grid.placeEntity(x,y);
                        }
                    })
                )                 
            }
        }
    }

    static placeEntity(x,y){
        let group = EntityGroupManager.getCurrentGroup();
        let instance = group.newInstance(x,y);
        let oldInstance = Grid.getTile(x,y);
        if(oldInstance){
            oldInstance.delete();
        }
        Grid.setTile(x,y,instance);
        Grid.updateTileDisplay(x,y);
    }

    static updateTileDisplay(x,y, group = false){
        if(!group){
            group = EntityGroupManager.getCurrentGroup();
        }
        let tile = Grid.getTile(x,y)
        let tileDiv = $('#map-grid-' + x + '-' + y);
        let entityDiv = $('#map-entity-' + x + '-' + y);
        if(tile){
            entityDiv.text(tile.symbol);
            entityDiv.css('color', 'var(--'+tile.color+')');
        }else{
            entityDiv.text('');
        }
    }

    static getTile(x,y){
        return Grid.matrix[y][x]
    }

    static setTile(x,y,val){
        Grid.matrix[y][x] = val;
    }

    static renderGrid(){
        let entityGroups = EntityGroupManager.EntityGroups;
    }

    static updateGroup(entityGroup){
        let instances = entityGroup.instances;
        console.log(instances);
        for(const[key, instance] of Object.entries(instances)){
            Grid.updateTileDisplay(instance.x, instance.y);
        }
        
    }

    static updateGrid(){
        let x = 0;
        let y = 0;
        Grid.matrix.forEach((row)=>{
            row.forEach((tile)=>{
                Grid.updateTileDisplay(x,y);
                x++;
            })
            x = 0;
            y++;
        })
    }

}