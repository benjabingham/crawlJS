class Controls{

    static init(){
        Controls.newMapSection();
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
}