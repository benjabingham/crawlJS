$(document).ready(function(){
    let save = new Save();
    let gameMaster = new GameMaster(save);
    let display = gameMaster.display;
    InputManager.setInputPreset('numpad');
    
    display.showHomeScreen(gameMaster);
    /*
    fetch('./rooms/ratnest.json')
        .then((response) => response.json())
        .then((json) => {
            entityManager.loadRoom(json)
            startGame();
        })*/
    
});


