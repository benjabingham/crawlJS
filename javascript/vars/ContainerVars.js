let containerVars = {
    chest:{
        name:"chest",
        symbol:"⍞",
        behavior:"",
        hitDice:0,
        damage:4,
        inventorySlots: 10,
        isContainer: true,
        inventory:[
            
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
            },
            potion:{
                chance:5,
                tier:1
            },
            supplies:{
                chance:30,
                tier:1
            }
        },
        color:'gold'
    },
    foodChest:{
        name:"pantry",
        symbol:"⽬",
        behavior:"",
        hitDice:0,
        damage:4,
        inventorySlots: 3,
        isContainer: true,
        inventory:[
            {
                item: itemVars.food.morsel,
                chance:80
            },
            {
                item: itemVars.drops.pan,
                chance:5
            },
        ],
        loot:{
            food:{
                chance:80,
                maxNumber:2,
                tier:0
            },
            supplies:{
                chance:20,
                tier:0
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
        symbol:"⍞",
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
            potion:{
                chance:50,
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
        symbol:"⍞",
        behavior:"",
        hitDice:0,
        damage:4,
        inventorySlots: 2,
        isContainer: true,
        inventory:[
        ],
        loot:{
            treasure:{
                chance:50,
                tier:-1
            },
            weapon:{
                chance:15,
                tier:-2
            },
            gold:{
                chance:25,
                amount:1
            },
            supplies:{
                chance:30,
                tier:-1
            }
        },
        color:'gold'
    },
    goblinbedroll:{
        name:"bedroll",
        symbol:"▮",
        behavior:"",
        hitDice:0,
        damage:4,
        inventorySlots: 1,
        isContainer: true,
        spawnEntities:{
            occupiedChance:10,
            entities:[
                'goblin'
            ],
            spawnChance: 5,
            disturbChance:100,
            audioDisturbChance:20
        },
        loot:{
            treasure:{
                chance:5,
                tier:1
            },
            weapon:{
                chance:10,
                tier:0
            },
            gold:{
                chance:15,
                amount:3
            },
            food:{
                chance:20,
                tier:0
            },
            supplies:{
                chance:7,
                tier:0
            }
        },
        color:'brown'
    },
    ratstash:{
        name:"rat stash",
        symbol:"#",
        behavior:"",
        hitDice:0,
        damage:4,
        inventorySlots: 1,
        isContainer: true,
        spawnEntities:{
            maxCapacity:3,
            minSpawn:1,
            maxSpawn:3,
            occupiedChance:30,
            entities:[
                'rat'
            ],
            spawnChance: 10,
            disturbChance:100,
            audioDisturbChance:5
        },
        inventory:[
            {
                item: itemVars.food.morsel,
                chance:20
            },
            {
                item: itemVars.fuel.kindling,
                chance:10
            }
        ],
        loot:{
            treasure:{
                chance:35,
                tier:-1
            },
            supplies:{
                chance:5,
                tier:-2
            },
            gold:{
                chance:10,
                amount:1
            },
            food:{
                chance:10,
                tier:0
            }
        },
        color:'gray'
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
            },
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
            },
            potion:{
                chance:1,
                tier:0
            }
        },
        color:'woodBrown'
    },
    fence:{
        name:"fence",
        symbol:"⩸",
        behavior:"",
        hitDice:2,
        behaviorInfo:{sturdy:60},
        damage:4,
        inventorySlots: 0,
        isContainer: true,
        color:'woodBrown'
    },
    weaponChest:{
        name:"weapon rack",
        symbol:"⧦",
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
    slainAdventurer:{
        name:"slain adventurer",
        symbol:"x",
        behavior:"",
        hitDice:0,
        damage:4,
        inventorySlots: 10,
        isContainer: true,
        loot:{
            weapon:{
                chance:80,
                tier:2
            },
            gold:{
                chance:80,
                amount:10
            },
            potion:{
                chance:10,
                tier:2
            },
            treasure:{
                chance:10,
                tier:1
            },
            supplies:{
                chance:80,
                tier:2
            }
        },
        blood:1,
        color:'darkRed'
    },
    BadWeaponChest:{
        name:"bad weapon rack",
        symbol:"⧦",
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
        symbol:"⍞",
        behavior:"",
        hitDice:0,
        damage:4,
        inventorySlots: 10,
        isContainer: true,
        loot:{
            weapon:{
                chance:15,
                tier:1,
                allowedMaterials:['gold']
            },
            treasure:{
                chance:5,
                tier:3
            },
            gold:{
                chance:100,
                amount:30
            }
        },
        color:'gold'
    },
    potionChest:{
        name:"potion rack",
        symbol:"⧦",
        behavior:"",
        hitDice:0,
        damage:4,
        inventorySlots: 10,
        isContainer: true,
        inventory:[
            {
                item: itemVars.potions.unlabeled,
                chance: 50
            },
            {
                item: itemVars.potions.unlabeled,
                chance: 20
            }
        ],
        loot:{
            potion:{
                chance:100,
                tier:2
            },
        },
        color:'gold'
    },
    shrub:{
        name:"shrub",
        symbol:"❧",
        behavior:"",
        hitDice:0,
        damage:4,
        inventorySlots: 2,
        isContainer: true,
        inventory:[
            {
                item: itemVars.fuel.kindling,
                chance: 7
            },
            {
                item: itemVars.drops.branch,
                chance: 7
            },
            {
                item: itemVars.food.berries,
                chance: 7
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
    tomb:{
        name:"tomb",
        symbol:"▣",
        behavior:"",
        behaviorInfo:{sturdy:90},
        spawnEntities:{
            minCapacity:1,
            maxCapacity:1,
            entities:[
                'skeleton',
                'zombie',
                'infestedHusk',
                'headlessSkeleton',
                'ghoul'
            ],
            spawnChance: 10,
            disturbChance:100,
            audioDisturbChance:10
        },
        hitDice:3,
        damage:4,
        inventorySlots: 2,
        isContainer: true,
        inventory:[
            {
                item: itemVars.drops.sigiledBone,
                chance: 40
            },
            {
                item: itemVars.drops.sigiledSkull,
                chance: 15
            },
        ],
        loot:{
            treasure:{
                chance:15,
                tier:2
            },
            gold:{
                chance:50,
                amount:10
            },
            weapon:{
                chance:15,
                tier:2,
                allowedMaterials: ['bone','sigiledBone', 'obsidian','glass','crystal','lead','copper','bronze','iron','silver'],
                curseMultiplier: 3
            },
        },
        color:'darkGray'
    },
    sleepyTomb:{
        name:"sleepy tomb",
        symbol:"▣",
        behavior:"",
        spawnEntities:{
            occupiedChance:100,
            entities:[
                'skeleton',
                'zombie',
            ],
            spawnChance: 1,
            disturbChance:100,
            audioDisturbChance:8
        },
        behaviorInfo:{
            slow:60,
            sturdy:90
        },
        hitDice:3,
        damage:4,
        inventorySlots: 2,
        isContainer: true,
        inventory:[
            {
                item: itemVars.drops.sigiledBone,
                chance: 10
            },
            {
                item: itemVars.drops.sigiledSkull,
                chance: 3
            },
        ],
        loot:{
            treasure:{
                chance:8,
                tier:2
            },
            gold:{
                chance:50,
                amount:3
            },
            weapon:{
                chance:15,
                tier:2,
                allowedMaterials: ['bone','sigiledBone', 'obsidian','glass','crystal','lead','copper','bronze','iron','silver'],
                curseMultiplier: 3
            },
        },
        color:'darkGray'
    },
    sleepingTomb:{
        name:"sleeping tomb",
        symbol:"▣",
        behavior:"",
        spawnEntities:{
            occupiedChance:80,
            entities:[
                'skeleton',
                'zombie',
            ],
            spawnChance: 0,
            disturbChance:100,
            audioDisturbChance:5
        },
        behaviorInfo:{
            slow:70,
            sturdy:90
        },
        hitDice:3,
        damage:4,
        inventorySlots: 2,
        isContainer: true,
        inventory:[
            {
                item: itemVars.drops.sigiledBone,
                chance: 15
            },
            {
                item: itemVars.drops.sigiledSkull,
                chance: 3
            },
        ],
        loot:{
            treasure:{
                chance:15,
                tier:1
            },
            gold:{
                chance:25,
                amount:3
            },
            weapon:{
                chance:5,
                tier:1,
                allowedMaterials: ['bone','sigiledBone', 'obsidian','glass','crystal','lead','copper','bronze','iron','silver'],
                curseMultiplier: 3
            },
        },
        color:'darkGray'
    },
    ghoulTomb:{
        name:"ghoul tomb",
        symbol:"▣",
        behavior:"",
        behaviorInfo:{sturdy:90},
        spawnEntities:{
            entities:[
                'ghoul'
            ],
            spawnChance: 10,
            disturbChance:100,
            audioDisturbChance:10
        },
        hitDice:4,
        damage:4,
        inventorySlots: 3,
        isContainer: true,
        inventory:[],
        loot:{
            weapon:{
                chance:15,
                tier:3,
                allowedMaterials: ['sigiledBone', 'obsidian','glass','crystal','lead','silver'],
                curseMultiplier: 3
            },
            treasure:{
                chance:25,
                tier:2
            },
            gold:{
                chance:25,
                amount:10
            },
            potion:{
                chance:15,
                tier:1
            }
        },
        color:'darkGray'
    },
    ratTomb:{
        name:"rat tomb",
        symbol:"▣",
        behavior:"",
        behaviorInfo:{sturdy:90},
        spawnEntities:{
            minCapacity:0,
            maxCapacity:5,
            minSpawn:1,
            maxSpawn:3,
            entities:[
                'rat'
            ],
            spawnChance: 5,
            disturbChance:100,
            audioDisturbChance:2
        },
        hitDice:3,
        damage:4,
        inventorySlots: 1,
        isContainer: true,
        inventory:[
            {
                item: itemVars.drops.sigiledBone,
                chance: 2
            },
            {
                item: itemVars.drops.sigiledSkull,
                chance: 1
            },
        ],
        loot:{
            treasure:{
                chance:15,
                tier:0
            },
            gold:{
                chance:25,
                amount:3
            },
            weapon:{
                chance:5,
                tier:0,
                allowedMaterials: ['bone','sigiledBone', 'obsidian','glass','crystal','lead','copper','bronze','iron','silver']
            },
        },
        color:'darkGray'
    },
    emptyTomb:{
        name:"empty tomb",
        symbol:"▣",
        behavior:"",
        behaviorInfo:{sturdy:70},
        hitDice:3,
        damage:4,
        inventorySlots: 1,
        isContainer: true,
        spawnEntities:{
            occupiedChance:5,
            entities:[
                'rat'
            ],
            spawnChance: 0,
            disturbChance:100,
            audioDisturbChance:1
        },
        inventory:[
            {
                item: itemVars.drops.sigiledBone,
                chance: 2
            },
            {
                item: itemVars.drops.sigiledSkull,
                chance: 1
            },
        ],
        loot:{
            treasure:{
                chance:3,
                tier:2
            },
            gold:{
                chance:5,
                amount:6
            },
            weapon:{
                chance:4,
                tier:1,
                allowedMaterials: ['bone','sigiledBone', 'obsidian','glass','crystal','lead','copper','bronze','iron','silver'],
                curseMultiplier: 3
            },
        },
        color:'darkGray'
    },
    overflowingCrypt:{
        name:"overflowingCrypt",
        symbol:"▣",
        behavior:"",
        behaviorInfo:{sturdy:95},
        spawnEntities:{ 
            minCapacity:5,
            maxCapacity:8,
            minSpawn:1,
            maxSpawn:3,
            entities:[
                'skeleton',
                'zombie',
                'ghoul',
                'rat',
                'headlessSkeleton',
                'infestedHusk'
            ],
            spawnChance: 15,
            disturbChance:100,
            audioDisturbChance: 10
        },
        hitDice:5,
        damage:4,
        inventorySlots: 10,
        isContainer: true,
        inventory:[
            {
                item: itemVars.drops.sigiledBone,
                chance: 100
            },
            {
                item: itemVars.drops.sigiledBone,
                chance: 50
            },
            {
                item: itemVars.drops.sigiledSkull,
                chance: 50
            },
            {
                item: itemVars.drops.sigiledSkull,
                chance: 25
            },
        ],
        loot:{
            weapon:{
                chance:25,
                tier:3,
                allowedMaterials: ['sigiledBone', 'obsidian','glass','crystal','lead','silver'],
                curseMultiplier: 3
            },
            treasure:{
                chance:70,
                tier:2
            },
            gold:{
                chance:100,
                amount:20
            },
            potion:{
                chance:15,
                tier:2
            }
        },
    },
    altar:{
        name:"altar",
        symbol:"▣",
        behavior:"",
        hitDice:0,
        damage:4,
        inventorySlots: 2,
        isContainer: true,
        loot:{
            weapon:{
                chance:25,
                tier:1,
                allowedMaterials: ['sigiledBone', 'obsidian','glass','crystal','lead']
            },
            treasure:{
                chance:35,
                tier:1
            },
            gold:{
                chance:100,
                amount:5
            }
        },
        color:'gold'
    },
    goopile:{
        name:"pile of goo",
        symbol:"☁",
        behavior:"",
        behaviorInfo:{sturdy:20},
        isContainer:false,
        spawnEntities:{ 
            items:true,
            minCapacity:1,
            maxCapacity:3,
            entities:[
                'corrosiveOoze',
                'absorbentOoze',
                'mitoticOoze',
                'blackOoze',
            ],
            spawnChance: 2,
            disturbChance:70,
            audioDisturbChance:15
        },
        hitDice:3,
        damage:4,
        inventorySlots: 3,
        inventory:[
            {
                item: itemVars.drops.purpleGoo,
                chance: 100
            },
            {
                item: itemVars.drops.greenGoo,
                chance:25
            },
            {
                item: itemVars.drops.purpleGoo,
                chance: 25
            },
            {
                item: itemVars.drops.orangeGoo,
                chance:25
            },
            {
                item: itemVars.drops.blueGoo,
                chance:25
            },
            {
                item: itemVars.drops.blackGoo,
                chance:25
            },
        ],
        blood:2,
        bloodColor:{r:173,g:26,b:202},
        color:'darkPurple'
    },
    t0Treasure:{
        name:"t0 treasure",
        symbol:"⍞",
        behavior:"",
        hitDice:0,
        damage:4,
        inventorySlots: 10,
        isContainer: true,
        loot:{
            treasure:{
                chance:100,
                tier:0
            },
        },
    },
    t1Treasure:{
        name:"t1 treasure",
        symbol:"⍞",
        behavior:"",
        hitDice:0,
        damage:4,
        inventorySlots: 10,
        isContainer: true,
        loot:{
            treasure:{
                chance:100,
                tier:1
            },
        },
    },
    t2Treasure:{
        name:"t2 treasure",
        symbol:"⍞",
        behavior:"",
        hitDice:0,
        damage:4,
        inventorySlots: 10,
        isContainer: true,
        loot:{
            treasure:{
                chance:100,
                tier:2
            },
        },
    },
    t3Treasure:{
        name:"t3 treasure",
        symbol:"⍞",
        behavior:"",
        hitDice:0,
        damage:4,
        inventorySlots: 10,
        isContainer: true,
        loot:{
            treasure:{
                chance:100,
                tier:3
            },
        },
    },
    t4Treasure:{
        name:"t4 treasure",
        symbol:"⍞",
        behavior:"",
        hitDice:0,
        damage:4,
        inventorySlots: 10,
        isContainer: true,
        loot:{
            treasure:{
                chance:100,
                tier:4
            },
        },
    },
    t6Treasure:{
        name:"t6 treasure",
        symbol:"⍞",
        behavior:"",
        hitDice:0,
        damage:4,
        inventorySlots: 10,
        isContainer: true,
        loot:{
            treasure:{
                chance:100,
                tier:6
            },
        },
    },

}