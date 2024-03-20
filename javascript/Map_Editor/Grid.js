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
                    )
                )                 
            }
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

}