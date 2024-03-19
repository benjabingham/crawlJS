$(document).ready(function(){
    newMapSection();
});

function newMapSection(){
    let button = $('#new-map-button');
    button.on('click',()=>{
        console.log('click');
        $('#new-map-dimensions').show();
        $('#create-map-button').show();
        button.hide();
    })
}