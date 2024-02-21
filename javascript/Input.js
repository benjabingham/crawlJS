//Creates an event called through name, which is called with onInput()
class Input {
    constructor(_name, _key) {
        this.name = _name
        this.key = _key
        //Constructs an event with the name of this input
        this.inputEvent = new Event(this.name)
    }

    setKey(newKey) {
        key = newKey
    }

    hasKey(keyToCheck) {
        //Allows for multiple keys to be added to one event
        if(Array.isArray(keyToCheck)) {
            return this.key.includes((currentKey) => currentKey == keyToCheck)
        }
        return this.key == keyToCheck
    }

    //Calls the event created by this input
    onInput() {
        $(document).trigger(this.name);
        //dispatchEvent(this.inputEvent);

    }
}

//Call "addEventListener("keydown", InputMaster.recieveInput)" to recieve key inputs
class InputManager{
    static inputs = []

    static setInputPreset(presetName){
        let preset = inputVars[presetName];
        InputManager.inputs = [];
        preset.forEach((input)=>{
            InputManager.addInput(input.inputName, input.inputKey);
        })
    }

    static addEventListeners(gameMaster){
        let directions = ['upleft','up','upright','left','right','downleft','down','downright'];
        directions.forEach((direction)=>{
            $(document).bind(direction,function(event){
                gameMaster.movePlayer(event);
            })
            //addEventListener(direction, gameMaster.movePlayer);
        })
    }

    //Adds a new input with the name and key
    static addInput(inputName, inputKey) {
        this.inputs.push(new Input(inputName, inputKey))
    }

    //Changes the key cooresponding to the input with that name
    static setInput(inputName, inputKey) {
        this.inputs.find((input) => input.name == inputName).key = inputKey
    }

    //Returns the Input class with this name
    static getInput(inputName) {
        return this.inputs.find((input) => input.name == inputName)
    }

    //When called it checks all inputs to see if they have the key pressed, and if they do, calls their event
    static recieveInput(newInput) {
        let inputCode = newInput.originalEvent.code;
        console.log(inputCode);
        let theInput = InputManager.inputs.find((input) => input.hasKey(inputCode));
        console.log(theInput);
        if(theInput){
            theInput.onInput();
        }
    }
}
