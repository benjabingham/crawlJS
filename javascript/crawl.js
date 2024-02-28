$(document).ready(function(){
    let save = new Save();
    let gameMaster = new GameMaster(save);
    InputManager.setInputPreset('numpad');
    InputManager.addEventListeners(gameMaster)
    Display.setCustomControls();
    Display.showHomeScreen(gameMaster);
    /*
    fetch('./rooms/ratnest.json')
        .then((response) => response.json())
        .then((json) => {
            entityManager.loadRoom(json)
            startGame();
        })*/
    
});


