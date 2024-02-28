$(document).ready(function(){
    let save = new Save();
    GameMaster.gameMasterInit(save);
    InputManager.setInputPreset('numpad');
    InputManager.addEventListeners()
    Display.setCustomControls();
    Display.showHomeScreen();  
});


