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
        console.log('trigger '+this.name);
        //dispatchEvent(this.inputEvent);

    }
}

//Call "addEventListener("keydown", InputMaster.recieveInput)" to recieve key inputs
class InputManager{
    static inputs = []
    static locked = false;

    static setInputPreset(presetName){
        let preset = inputVars[presetName];
        //InputManager.inputs = [];
        preset.forEach((input)=>{
            InputManager.setInput(input.inputName, input.inputKey);
        })
    }

    static addEventListeners(gameMaster){
        /*
        let directions = ['upleft','up','upright','left','right','downleft','down','downright'];
        directions.forEach((direction)=>{
            $(document).bind(direction,function(event){
                gameMaster.movePlayer(event);
            })
            //addEventListener(direction, gameMaster.movePlayer);
        })*/

        inputVars.numpad.forEach((input)=>{
            $(document).bind(input.inputName,function(event){
                if(InputManager.locked) return false;
                InputManager.locked = true;
                if(input.movePlayer) gameMaster.movePlayer(event);
                if(input.wait) gameMaster.wait(event);
                if(input.rotate) gameMaster.rotate(event);
                if(input.useItem) gameMaster.useItem(event);
                if(input.drop) gameMaster.drop(event);
                if(input.rewind) gameMaster.rewind(event);
                InputManager.locked = false;
            })
        })
    }

    //Adds a new input with the name and key
    static addInput(inputName, inputKey) {
        this.inputs.push(new Input(inputName, inputKey))
    }

    //Changes the key cooresponding to the input with that name
    static setInput(inputName, inputKey) {
        let input =  this.inputs.find((input) => input.name == inputName)
        if(input){
            input.key = inputKey;
        }else{
            InputManager.addInput(inputName, inputKey);
        }
    }

    //Returns the Input class with this name
    static getInput(inputName) {
        return this.inputs.find((input) => input.name == inputName)
    }

    //When called it checks all inputs to see if they have the key pressed, and if they do, calls their event
    static recieveInput(newInput) {
        if($(':focus').is('input')){
            return;
        }
        newInput.preventDefault()
        let inputCode = newInput.originalEvent.code;
        console.log(inputCode);
        let theInput = InputManager.inputs.find((input) => input.hasKey(inputCode));
        console.log(theInput);
        if(theInput){
            theInput.onInput();
        }
    }
}
