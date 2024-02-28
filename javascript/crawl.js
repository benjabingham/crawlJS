$(document).ready(function(){
    let save = new Save();
    GameMaster.gameMasterInit(save);
    InputManager.setInputPreset('numpad');
    InputManager.addEventListeners()
    Display.setCustomControls();
    Display.showHomeScreen();
    /*
    fetch('./rooms/ratnest.json')
        .then((response) => response.json())
        .then((json) => {
            entityManager.loadRoom(json)
            startGame();
        })*/
    
});


