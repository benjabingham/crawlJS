class Grid{

    static height;
    static width;
    static matrix = [];
    static rectangleStart = false;
    static drawing = false;
    static erase = false;
    static selectedTiles = [];

    static gridScale = 1.0;
    static translateX = 0;
    static translateY = 0;

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
                        $('<div>').addClass('map-highlight-div').attr('id','map-highlight-' + x + '-' + y).append(
                            $('<div>').addClass('map-entity-div').attr('id','map-entity-' + x + '-' + y)
                        )
                    ).on('click',(e)=>{
                        /*
                        e.preventDefault();
                        if(EntityGroupManager.selectedEntityGroup == -1){
                            
                        }else if(Grid.getTile(x,y) && Grid.getTile(x,y).entityGroupId == EntityGroupManager.selectedEntityGroup){
                            Grid.eraseEntity(x,y);
                        }else{
                            Grid.placeEntity(x,y);
                        }
                        */
                    }).on('mousedown',(e)=>{
                        e.preventDefault();
                        //only count left click
                        /*
                        if(e.originalEvent.buttons != 1){
                            return false;
                        }
                        */
                        $(':focus').trigger('blur');
                        if(e.shiftKey){
                            Grid.rectangleStart = {x:x,y:y};
                        }else{
                            Grid.drawing = true;
                            Grid.draw(x,y);
                        }
                    }).on('mouseup',(e)=>{
                        if(Grid.rectangleStart){
                            Grid.drawRectangle(Grid.rectangleStart,{x:x,y:y});
                            Grid.rectangleStart = false;
                        }
                        if(Grid.drawing){
                            Grid.drawing = false;
                        }
                        Save.saveSnapshot();
                    }).on('mouseenter',(e)=>{
                        if(Grid.drawing){
                            Grid.draw(x,y);
                        }else if(Grid.rectangleStart){
                            Grid.previewRectangle(Grid.rectangleStart,{x:x,y:y})
                        }else{

                        }
                    })
                )                 
            }
        }
        Grid.updateTransform();
    }

    static draw(x,y){
        if(!Grid.erase){
            Grid.placeEntity(x,y);
        }else if(Grid.erase.all){
            Grid.eraseEntity(x,y);
        }else if (Grid.erase.selected && Grid.getTile(x,y).entityGroupId == EntityGroupManager.selectedEntityGroup){
            Grid.eraseEntity(x,y);
        }
    }

    static placeEntity(x,y){
        let group = EntityGroupManager.getCurrentGroup();
        if(!group){
            return false;
        }
        let instance = group.newInstance(x,y);
        let oldInstance = Grid.getTile(x,y);
        if(oldInstance){
            oldInstance.delete();
        }
        Grid.setTile(x,y,instance);
        Grid.updateTileDisplay(x,y);
    }

    static placeEntities(){
        Grid.matrix = new Array(Grid.height).fill().map( ()=>
            Array(Grid.width).fill(false)
        )
        let groups = EntityGroupManager.entityGroups;
        for(const [groupKey,group] of Object.entries(groups)){
            let instances = group.instances;
            for(const [instanceKey,instance] of Object.entries(instances)){
                Grid.setTile(instance.x,instance.y,instance);
                Grid.updateTileDisplay(instance.x,instance.y);
            } 
        }
    }

    static drawRectangle(point1, point2){
        let x1 = Math.min(point1.x, point2.x);
        let x2 = Math.max(point1.x, point2.x);
        let y1 = Math.min(point1.y, point2.y);
        let y2 = Math.max(point1.y, point2.y);

        for(let x = x1; x <= x2; x++){
            for(let y = y1; y <= y2; y++){
                Grid.draw(x,y);
                Grid.updateTileDisplay(x,y);
            }
        }
    }

    static previewRectangle(point1, point2){
        Grid.deSelectTiles();
        let x1 = Math.min(point1.x, point2.x);
        let x2 = Math.max(point1.x, point2.x);
        let y1 = Math.min(point1.y, point2.y);
        let y2 = Math.max(point1.y, point2.y);

        for(let x = x1; x <= x2; x++){
            for(let y = y1; y <= y2; y++){
                Grid.selectTile(x,y);
            }
        }
    }

    static selectTile(x,y){
        let tileDiv = $('#map-highlight-' + x + '-' + y);
        tileDiv.addClass('selected');
        Grid.selectedTiles.push({x:x,y:y});
    }

    static deSelectTiles(){
        while(Grid.selectedTiles.length > 0){
            let tile = Grid.selectedTiles.pop();
            let highlightDiv = $('#map-highlight-' + tile.x + '-' + tile.y);
            highlightDiv.removeClass('selected');
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
        let highlightDiv = $('#map-highlight-' + x + '-' + y);
        highlightDiv.removeClass('selected');
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
            tileDiv.removeClass('grid-wall')
        }
    }

    static getTile(x,y){
        return Grid.matrix[y][x]
    }

    static setTile(x,y,val){
        Grid.matrix[y][x] = val;
    }

    static updateGroup(entityGroup){
        let instances = entityGroup.instances;
        for(const[key, instance] of Object.entries(instances)){
            Grid.updateTileDisplay(instance.x, instance.y);
        }
        
    }

    static updateGrid(){
        console.log('updateGrid');
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

    static load(json){
        Grid.init(json.width,json.height);
        /*
        for(const [key,val] of Object.entries(json)){
            EntityGroupManager[key] = val;
        }*/
    }

    static getObject(){
        return {
            height:Grid.height,
            width:Grid.width,
            //matrix:Grid.matrix
        }
    }

    static updateTransform(){
        let scale = Grid.gridScale / Grid.width * 20;
        $('#map-grid').css(
            'transform','scale('+scale+') translate('+Grid.translateX+'px,'+Grid.translateY+'px)'
        );
    }

    static adjustScale(n){
        console.log('adjustScale')
        let increment = .1 * n * Grid.gridScale;
        Grid.gridScale += increment;

        Grid.gridScale = Math.min(Grid.gridScale,10);
        Grid.gridScale = Math.max(Grid.gridScale,1.1);

        console.log(Grid.gridScale);

        Grid.updateTransform();

    }

    static pan(x,y){
        Grid.translateX += x;
        Grid.translateY += y;

        /*
        let maxTranslateX = Grid.gridScale * Grid.width;
        let maxTranslateY = Grid.gridScale * Grid.height;

        Grid.translateX = Math.min(Grid.translateX, maxTranslateX);
        Grid.translateX = Math.max(Grid.translateX, maxTranslateX*-1);

        Grid.translateY = Math.min(Grid.translateY, maxTranslateY);
        Grid.translateY = Math.max(Grid.translateY, maxTranslateY*-1);

        console.log({
            maxX:maxTranslateX,
            maxY:maxTranslateY,
            X:Grid.translateX,
            Y:Grid.translateY
        })
*/

console.log({
    X:Grid.translateX,
    Y:Grid.translateY
})
        Grid.updateTransform();
    }



}
