$(document).ready(function(){
    Save.saveInit();
    Sound.soundInit();
    GameMaster.gameMasterInit();
    InputManager.setInputPreset('numpad');
    InputManager.addEventListeners()
    Display.setCustomControls();
    Display.showHomeScreen();  
    //Stats.logStats();
});


