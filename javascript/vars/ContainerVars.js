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
                item: itemVars.potions.unlabeled,
                chance:5
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
            },
            potion:{
                chance:5,
                tier:1
            }
        },
        color:'gold'
    },
    foodChest:{
        name:"pantry",
        symbol:"Ch",
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
                item: itemVars.food.morsel,
                chance:50
            },
            {
                item: itemVars.food.provisions,
                chance:25
            },
            {
                item: itemVars.potions.unlabeled,
                chance: 5
            },
            {
                item: itemVars.food.baguette,
                chance: 10
            },
            {
                item: itemVars.food.cookingOil,
                chance: 10
            },
            {
                item: itemVars.food.berries,
                chance: 10
            },
        ],
        loot:{
            treasure:{
                chance:5,
                tier:-1
            },
            potion:{
                chance:10,
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
        symbol:"Ch",
        behavior:"",
        hitDice:0,
        damage:4,
        inventorySlots: 2,
        isContainer: true,
        inventory:[
            {
                item: itemVars.food.morsel,
                chance:25
            },
            {
                item: itemVars.fuel.kindling,
                chance:5
            },
            {
                item: itemVars.potions.unlabeled,
                chance:3
            }
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
    potionChest:{
        name:"potion chest",
        symbol:"Ch",
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
        symbol:"o",
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
        spawnEntities:{
            minCapacity:1,
            maxCapacity:1,
            entities:[
                'skeleton',
                'zombie',
                'infestedHusk',
                'headlessSkeleton'
            ],
            spawnChance: 20,
            disturbChance:100
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
                tier:0,
                allowedMaterials: ['bone','sigiledBone', 'obsidian','glass','crystal','lead','copper','bronze','iron']
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
                'headlessSkeleton'
            ],
            spawnChance: 1,
            disturbChance:100
        },
        behaviorInfo:{
            slow:70
        },
        hitDice:2,
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
                allowedMaterials: ['bone','sigiledBone', 'obsidian','glass','crystal','lead','copper','bronze','iron']
            },
        },
        color:'darkGray'
    },
    ghoulTomb:{
        name:"ghoul tomb",
        symbol:"▣",
        behavior:"",
        spawnEntities:{
            entities:[
                'ghoul'
            ],
            spawnChance: 10,
            disturbChance:100
        },
        hitDice:4,
        damage:4,
        inventorySlots: 3,
        isContainer: true,
        inventory:[],
        loot:{
            weapon:{
                chance:15,
                tier:2,
                allowedMaterials: ['sigiledBone', 'obsidian','glass','crystal','lead']
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
        spawnEntities:{
            minCapacity:0,
            maxCapacity:5,
            minSpawn:1,
            maxSpawn:3,
            entities:[
                'rat'
            ],
            spawnChance: 10,
            disturbChance:100
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
                allowedMaterials: ['bone','sigiledBone', 'obsidian','glass','crystal','lead','copper','bronze','iron']
            },
        },
        color:'darkGray'
    },
    emptyTomb:{
        name:"empty tomb",
        symbol:"▣",
        behavior:"",
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
                allowedMaterials: ['bone','sigiledBone', 'obsidian','glass','crystal','lead','copper','bronze','iron']
            },
        },
        color:'darkGray'
    },
    overflowingCrypt:{
        name:"overflowingCrypt",
        symbol:"▣",
        behavior:"",
        spawnEntities:{ 
            minCapacity:5,
            maxCapacity:8,
            minSpawn:1,
            maxSpawn:3,
            entities:[
                'skeleton',
                'zombie',
                'ghoul',
                'rat'
            ],
            spawnChance: 20,
            disturbChance:100,
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
                tier:2,
                allowedMaterials: ['sigiledBone', 'obsidian','glass','crystal','lead']
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
    }

}