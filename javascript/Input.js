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
    static lastEvent;
    static currentEvent;
    static currentKeydownEvent;

    static setInputPreset(presetName){
        let preset = inputVars[presetName];
        //InputManager.inputs = [];
        preset.forEach((input)=>{
            InputManager.setInput(input.inputName, input.inputKey);
        })
    }

    static addEventListeners(){
        /*
        let directions = ['upleft','up','upright','left','right','downleft','down','downright'];
        directions.forEach((direction)=>{
            $(document).bind(direction,function(event){
                GameMaster.movePlayer(event);
            })
            //addEventListener(direction, GameMaster.movePlayer);
        })*/

        inputVars.numpad.forEach((input)=>{
            //console.log(input)
            $(document).bind(input.inputName,function(event){
                InputManager.currentKeydownEvent.preventDefault();
                InputManager.currentEvent = event;
                if(InputManager.locked) return false;
                InputManager.locked = true;
                if(input.movePlayer) GameMaster.movePlayer(event);
                if(input.wait) GameMaster.wait(event);
                if(input.rotate) GameMaster.rotate(event);
                if(input.slotKey) GameMaster.slotKey(event);
                if(input.drop) GameMaster.drop(event);
                if(input.rewind) GameMaster.rewind(event);
                if(input.inventory) GameMaster.inventoryOpenClose(event);

                if(input.consume) GameMaster.consumeSelectedItem(event);
                if(input.equip) GameMaster.equipSelectedItem(event);
                if(input.burn) GameMaster.burnSelectedItem(event);
                if(input.sellStore) GameMaster.sellStoreSelectedItem(event);
                if(input.quickToggle) GameMaster.quickToggle(event);
                if(input.useItem) GameMaster.useSelectedItem();
                if(input.itemNav) GameMaster.navigateInventory(event);
                if(input.showBulks) GameMaster.showBulks(event);
                InputManager.locked = false;
                InputManager.lastEvent = JSON.parse(JSON.stringify(InputManager.currentEvent));
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
        InputManager.currentKeydownEvent = newInput
        if($(':focus').is('input')){
            return;
        }
        //console.log(newInput);
        //newInput.preventDefault()
        let inputCode = newInput.originalEvent.code;
        //console.log(inputCode);
        let theInputs = InputManager.inputs.filter((input) => input.hasKey(inputCode));
        //console.log(theInput);
        theInputs.forEach(input=>{
            if(input){
                input.onInput();
            }
        })
        
    }
}
