class Grid{

    static height;
    static width;
    static matrix = [];
    static rectangleStart = false;

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
                        if(EntityGroupManager.selectedEntityGroup == -1){
                            
                        }else if(Grid.getTile(x,y) && Grid.getTile(x,y).entityGroupId == EntityGroupManager.selectedEntityGroup){
                            Grid.eraseEntity(x,y);
                        }else{
                            Grid.placeEntity(x,y);
                        }
                    }).on('mousedown',(e)=>{
                        e.preventDefault();
                        if(e.shiftKey){
                            Grid.rectangleStart = {x:x,y:y};
                        }
                    }).on('mouseup',(e)=>{
                        if(Grid.rectangleStart){
                            Grid.drawRectangle(Grid.rectangleStart,{x:x,y:y});
                            Grid.rectangleStart = false;
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

    static drawRectangle(point1, point2){
        let x1 = Math.min(point1.x, point2.x);
        let x2 = Math.max(point1.x, point2.x);
        let y1 = Math.min(point1.y, point2.y);
        let y2 = Math.max(point1.y, point2.y);

        for(let x = x1; x <= x2; x++){
            for(let y = y1; y <= y2; y++){
                Grid.placeEntity(x,y);
            }
        }
    }

    static eraseEntity(x,y){
        let instance = Grid.getTile(x,y);
        if(instance){
            instance.delete();
        }
        Grid.setTile(x,y,false);
        Grid.updateTileDisplay(x,y);
    }

    static updateTileDisplay(x,y){
        let tile = Grid.getTile(x,y)
        let tileDiv = $('#map-grid-' + x + '-' + y);
        let entityDiv = $('#map-entity-' + x + '-' + y);
        if(tile){
            let group = tile.entityGroup;
            entityDiv.text(tile.symbol);
            entityDiv.css('color', 'var(--'+tile.color+')');
            if(group.entityType == "wall"){
                tileDiv.addClass('grid-wall');
            }else{
                tileDiv.removeClass('grid-wall')
            }
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