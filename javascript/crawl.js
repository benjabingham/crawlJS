$(document).ready(function(){
    Save.saveInit();
    GameMaster.gameMasterInit();
    InputManager.setInputPreset('numpad');
    InputManager.addEventListeners()
    Display.setCustomControls();
    Display.showHomeScreen();  
    Stats.logStats();
});


