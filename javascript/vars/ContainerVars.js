let containerVars = {
    chest:{
        name:"chest",
        symbol:"Ch",
        behavior:"",
        hitDice:0,
        damage:4,
        inventorySlots: 10,
        isContainer: true,
        inventory:[
            {
                item: itemVars.food.morsel,
                chance:10
            },
            {
                item: itemVars.food.provisions,
                chance:5
            },
            {
                item: itemVars.fuel.kindling,
                chance:15
            }
        ],
        loot:{
            weapon:{
                chance:25,
                tier:1
            },
            treasure:{
                chance:45,
                tier:1
            },
            gold:{
                chance:100,
                amount:5
            }
        },
        color:'gold'
    },
    foodChest:{
        name:"chest",
        symbol:"Ch",
        behavior:"",
        hitDice:0,
        damage:4,
        inventorySlots: 10,
        isContainer: true,
        inventory:[
            {
                item: itemVars.food.morsel,
                chance:80
            },
            {
                item: itemVars.food.morsel,
                chance:50
            },
            {
                item: itemVars.food.provisions,
                chance:25
            }
        ],
        loot:{
            treasure:{
                chance:5,
                tier:-1
            },
            gold:{
                chance:10,
                amount:5
            }
        },
        color:'woodBrown'
    },
    rareChest:{
        name:"rare chest",
        symbol:"Ch",
        behavior:"",
        hitDice:0,
        damage:4,
        inventorySlots: 10,
        isContainer: true,
        inventory:[
            {
                item: itemVars.food.provisions,
                chance:20
            }
        ],
        loot:{
            weapon:{
                chance:15,
                tier:5
            },
            treasure:{
                chance:75,
                tier:3
            },
            gold:{
                chance:100,
                amount:20
            }
        },
        color:'gold'
    },
    garbageChest:{
        name:"garbage chest",
        symbol:"Ch",
        behavior:"",
        hitDice:0,
        damage:4,
        inventorySlots: 1,
        isContainer: true,
        inventory:[
            {
                item: itemVars.food.morsel,
                chance:15
            },
            {
                item: itemVars.fuel.kindling,
                chance:15
            }
        ],
        loot:{
            treasure:{
                chance:50,
                tier:-1
            },
            weapon:{
                chance:40,
                tier:-2
            },
            gold:{
                chance:25,
                amount:1
            }
        },
        color:'gold'
    },
    Prop:{
        name:"prop",
        symbol:"▤",
        behavior:"",
        hitDice:0,
        damage:4,
        inventorySlots: 1,
        isContainer: true,
        inventory:[
            {
                item: itemVars.food.morsel,
                chance:2
            }
        ],
        loot:{
            weapon:{
                chance:2,
                tier:-2
            },
            treasure:{
                chance:5,
                tier:-1
            },
            gold:{
                chance:5,
                amount:1
            }
        },
        color:'woodBrown'
    },
    weaponChest:{
        name:"weapon chest",
        symbol:"Ch",
        behavior:"",
        hitDice:0,
        damage:4,
        inventorySlots: 10,
        isContainer: true,
        loot:{
            weapon:{
                chance:100,
                tier:2
            }
        },
        color:'gold'
    },
    BadWeaponChest:{
        name:"bad weapon chest",
        symbol:"Ch",
        behavior:"",
        hitDice:0,
        damage:4,
        inventorySlots: 10,
        isContainer: true,
        loot:{
            weapon:{
                chance:100,
                tier:-1
            }
        },
        color:'gold'
    },
    goldChest:{
        name:"gold chest",
        symbol:"Ch",
        behavior:"",
        hitDice:0,
        damage:4,
        inventorySlots: 10,
        isContainer: true,
        loot:{
            weapon:{
                chance:2,
                tier:-2
            },
            treasure:{
                chance:2,
                tier:-1
            },
            gold:{
                chance:100,
                amount:30
            }
        },
        color:'gold'
    },
    shrub:{
        name:"shrub",
        symbol:"o",
        behavior:"",
        hitDice:0,
        damage:4,
        inventorySlots: 2,
        isContainer: true,
        inventory:[
            {
                item: itemVars.fuel.kindling,
                chance: 10
            },
            {
                item: itemVars.fuel.kindling,
                chance: 10
            },
            {
                item: itemVars.food.berries,
                chance: 10
            }
        ],
        loot:{
            treasure:{
                chance:1,
                tier:-1
            },
            gold:{
                chance:1,
                amount:1
            }
        },
        color:'darkGreen'
    },
}