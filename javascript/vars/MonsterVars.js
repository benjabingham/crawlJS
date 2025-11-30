let monsterVars = {
    goblin:{
        name:"goblin",
        symbol:"G",
        behavior:"chase",
        behaviorInfo:{
            focus:20,
            enrage:10,
            daze:40,
            beat:10
        },
        hitDice:1,
        damage:4,
        inventorySlots: 1,
        loot:{
            weapon:{
                chance:5,
                tier:1
            },
            treasure:{
                chance:5,
                tier:0
            },
            gold:{
                chance:20,
                tier:3
            }
        },
        color:'darkGreen'
    },
    goblinBoss:{
        name:"goblin boss",
        symbol:"Gb",
        behavior:"chase",
        behaviorInfo:{
            focus:25,
            enrage:20,
            daze:30,
            beat:20
        },
        hitDice:3,
        damage:6,
        inventorySlots: 3,
        loot:{
            weapon:{
                chance:30,
                tier:2
            },
            treasure:{
                chance:30,
                tier:4
            },
            gold:{
                chance:50,
                tier:3
            }
        },
        color:'darkGreen'
    },
    ogre:{
        name:"ogre",
        symbol:"Og",
        behavior:"chase",
        behaviorInfo:{
            focus:10,
            enrage:75,
            slow:40,
            beat:30,
            sturdy:30
        },
        hitDice:5,
        damage:8,
        inventorySlots: 10,
        loot:{
            weapon:{
                chance:20,
                tier:1
            },
            treasure:{
                chance:30,
                tier:1
            },
            gold:{
                chance:45,
                amount:7
            }
        },
        color:'green'
    },
    rat:{
        name:"rat",
        symbol:"Ra",
        behavior:"chase",
        behaviorInfo:{
            focus:15,
        },
        hitDice:0,
        damage:1,
        inventorySlots: 0,
        tiny:true,
        color:'gray'
    },
    direRat:{
        name:"dire rat",
        symbol:"Dr",
        behavior:"chase",
        behaviorInfo:{
            focus:20,
            enrage:30,
            daze:20
        },
        hitDice:1,
        damage:4,
        inventorySlots: 0,
        inventory:[{
            name:"dire rat pelt",
            value:1,
            color:'brown'
        }],
        color:'gray'
    },
    kingRat:{
        name:"king rat",
        symbol:"Kr",
        behavior:"chase",
        behaviorInfo:{
            focus:25,
            enrage:30
        },
        hitDice:4,
        damage:6,
        inventorySlots: 0,
        inventory:[{
            name:"king rat's skull",
            value:15,
            color:'red'
        }],
        color:'darkRed'
    },
    wolf:{
        name:"wolf",
        symbol:"Wo",
        behavior:"chase",
        behaviorInfo:{
            focus:25,
            enrage:40,
            daze:15
        },
        hitDice:1,
        damage:5,
        inventorySlots: 0,
        inventory:[{
            name:"wolf pelt",
            value:2,
            color:'brown'
        }],
        color:'gray'
    },
    direWolf:{
        name:"dire wolf",
        symbol:"Dw",
        behavior:"chase",
        behaviorInfo:{
            focus:25,
            enrage:75,
            daze:10
        },
        hitDice:3,
        damage:8,
        inventorySlots: 0,
        inventory:[{
            name:"dire wolf pelt",
            value:4,
            color:'gray'
        }],
        color:'gray'
    },
    dummy:{
        name:"dummy",
        symbol:"Du",
        behavior:"",
        hitDice:100,
        damage:8,
        inventorySlots: 0,
    }
}