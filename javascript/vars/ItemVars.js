let itemVars = {
    weapons:{
        rod:{
            weapon:true,
            name:"rod",
            damage:2,
            stunTime:3,
            weight:2,
            type:{
                blunt:true,
                long:true
            },
            value:3
        },
        club:{
            weapon:true,
            name:"club",
            damage:4,
            stunTime:3,
            weight:2,
            type:{
                blunt:true
            },
            jab:{
                damage:2,
                stunTime:2,
                weight:2,
                type:{
                    blunt:true
                }
            },
            value:2
        },
        mace:{
            weapon:true,
            name:"mace",
            damage:5,
            stunTime:3,
            weight:2,
            type:{
                blunt:true
            },
            jab:{
                damage:2,
                stunTime:2,
                weight:2,
                type:{
                    blunt:true
                }
            },
            value:4
        },
        hammer:{
            weapon:true,
            name:"hammer",
            damage:8,
            stunTime:5,
            weight:3,
            type:{
                blunt:true
            },
            jab:{
                damage:2,
                stunTime:4,
                weight:2,
                type:{
                    blunt:true
                }
            },
            value:5
        },
        maul:{
            weapon:true,
            name:"maul",
            damage:12,
            stunTime:7,
            weight:4,
            type:{
                blunt:true
            },
            jab:{
                damage:2,
                stunTime:5,
                weight:3,
                type:{
                    blunt:true
                }
            },
            value:7
        },
        rapier:{
            weapon:true,
            name:"rapier",
            damage:2,
            stunTime:2,
            weight:1,
            type:{
                sword:true,
            },
            jab:{
                damage:8,
                stunTime:2,
                weight:2,
                type:{
                    sword:true,
                },
            },
            value:7
        },
        scimitar:{
            weapon:true,
            name:"scimitar",
            damage:6,
            stunTime:2,
            weight:3,
            strafe:{
                damage:7,
                stunTime:2,
                weight:2,
                type:{
                    sword:true,
                    edged:true
                },
            },
            type:{
                sword:true,
                edged:true
            },
            value:7
        },
        shortsword:{
            weapon:true,
            name:"shortsword",
            damage:4,
            stunTime:2,
            weight:2,
            type:{
                sword:true,
                edged:true
            },
            value:4
        },
        longsword:{
            weapon:true,
            name:"longsword",
            damage:8,
            stunTime:3,
            weight:3,
            type:{
                sword:true,
                edged:true
            },
            value:7
        },
        katana:{
            weapon:true,
            name:"katana",
            damage:8,
            stunTime:1,
            weight:3,
            type:{
                sword:true,
                edged:true
            },
            draw:{
                damage:8,
                stunTime:5,
                weight:3,
                type:{
                    sword:true,
                    edged:true
                },
            },
            flimsy:1,
            value:10
        },
        greatsword:{
            weapon:true,
            name:"greatsword",
            damage:12,
            stunTime:4,
            weight:4,
            type:{
                sword:true,
                edged:true
            },
            value:10
        },
        handaxe:{
            weapon:true,
            name:"handaxe",
            damage:1,
            stunTime:2,
            weight:2,
            type:{
                edged:true
            },
            swing:{
                damage:6,
                stunTime:4,
                weight:2,
                type:{
                    edged:true
                }
            },
            value:4
        },
        greataxe:{
            weapon:true,
            name:"greataxe",
            damage:2,
            stunTime:3,
            weight:3,
            type:{
                edged:true
            },
            swing:{
                damage:15,
                stunTime:6,
                weight:4,
                type:{
                    edged:true
                }
            },
            value:9
        },
        halberd:{
            weapon:true,
            name:"halberd",
            damage:10,
            stunTime:3,
            weight:3,
            type:{
                edged:true,
                long:true
            },
            swing:{
                damage:15,
                stunTime:4,
                weight:5,
                type:{
                    edged:true,
                    long:true
                }
            },
            value:8
        },
    },
    fuel:{
        oilFlask:{
            usable:true,
            name: "oil flask",
            fuel:true,
            light:2,
            uses:3,
            value:5
        },
        kindling:{
            usable:true,
            name: "kindling",
            fuel:true,
            light:1,
            value:0,
            color:'woodBrown'
        }
    },
    drops:{
        direRatPelt:{
            name:"dire rat pelt",
            value:1,
            color:'brown'
        },
        wolfPelt:{
            name:"wolf pelt",
            value:2,
            color:'brown'
        },
        direWolfPelt:{
            name:"dire wolf pelt",
            value:4,
            color:'gray'
        },
        kingRatSkull:{
            name:"king rat's skull",
            value:15,
            color:'red'
        },
        branch:{
            weapon:true,
            name:"branch",
            damage:1,
            stunTime:1,
            weight:1,
            type:{
                blunt:true
            },
            value:0,
            wood:true,
            usable:true,
            fuel:true,
            light:1,
            color:'woodBrown',
            flimsy:30
        },
        sigiledBone:{
            name:"sigiled bone",
            value:1,
            color:'bone'
        },
        sigiledSkull:{
            name:"sigiled skull",
            value:3,
            color:'bone'
        },
        blueGoo:{
            name:'blue goo',
            usable: true,
            food:1,
            fuel:1,
            light:1,
            color:'blue',
            value:1
        },
        blackGoo:{
            name:'black goo',
            usable: true,
            fuel:1,
            light:-3,
            color:'black',
            value:4
        },
        orangeGoo:{
            name:'orange goo',
            usable: true,
            food:2,
            fuel:1,
            light:1,
            color:'orange',
            value:2
        },
        greenGoo:{
            name:'green goo',
            usable: true,
            fuel:1,
            light:2,
            color:'green',
            value:3
        },
        purpleGoo:{
            name:'purple goo',
            usable: true,
            fuel:3,
            light:3,
            color:'brightPurple',
            value:4
        },
    },
    treasure:{
        thimble:{
            name:"thimble",
            value:1
        },
        bead:{
            name:"bead",
            value:1.5
        },
        ring:{
            name:"ring",
            value:4
        },
        cup:{
            name:"cup",
            value:6
        },
        pendant:{
            name:"pendant",
            value:6
        },
        plate:{
            name:"plate",
            value:8
        },
        bowl:{
            name:"bowl",
            value:9
        },
        vase:{
            name:"vase",
            value:10
        },
        coinPouch:{
            name:"coin pouch",
            value:10
        },
        statuette:{
            name:"statuette",
            value:12
        },
        tiara:{
            name:"tiara",
            value:12
        },
        crown:{
            name:"crown",
            value:20
        }
    },
    weaponMaterials:{
        wood:{
            name:'wooden',
            flimsy:6,
            stunTime: -2,
            weight:-1,
            blunt:{
                damage:-1
            },
            edged:{
                damage:-2,
                flimsy:2
            },            
            value:.25,
            color:'woodBrown',

            usable:true,
            fuel:true,
            light:1,

            frequency:5

        },
        bone:{
            name:'bone',
            blunt:{
                flimsy:4,
                damage: -1,
            },
            edged:{
                flimsy:8,
            },
            stunTime:-1,
            weight:-1,
            value:.15,
            color:'bone',

            frequency:2

        },
        limestone:{
            name:'limestone',
            flimsy:6,
            weight:2,
            stunTime:3,
            blunt:{
                damage:4
            },
            edged:{
                damage:2
            },
            value:.2,
            color:'silver',

            frequency:1

        },

        
        flint:{
            name:'flint',
            blunt:{
                flimsy:6,
            },
            sharp:{
                flimsy:4,
            },
            value:.3,
            color:'darkGray',

            frequency:3
        },
        obsidian:{
            name:'obsidian',
            blunt:{
                flimsy:9,
            },
            edged:{
                damage:2,
                flimsy:6
            },
            value:.5,

            frequency:1
        },
        lead:{
            name:'lead',
            flimsy:3,
            weight:1,
            stunTime:2,
            blunt:{
                damage:2
            },
            edged:{
                damage:1
            },
            value:2,
            color:'darkgray',

            frequency:2

        },
        rubber:{
            name:'rubber',
            blunt:{
                damage:-5,
                stunTime:2
            },
            edged:{
                damage:-8
            },
            value:.5,

            frequency:1
        },
        copper:{
            name:'copper',
            flimsy:3,
            value:2,
            color:'redBrown',

            frequency:4
        },
        bronze:{
            name:'bronze',
            flimsy:2,
            edged:{
                damage:1
            },
            value:3,
            color:'brown',

            frequency:3
        },
        iron:{
            name:'iron',
            flimsy:1,
            edged:{
                damage:1
            },
            value:2.5,
            color:'gray',
            frequency:5
        },
        steel:{
            name:'steel',
            edged:{
                damage:2
            },
            value:2,
            color:'lightGray',
            frequency:4
        },
        glass:{
            name:'glass',
            flimsy:40,
            value:3,
            edged:{
                damage:6
            },
            color:'clearBlue',
            frequency:1
        },
        sigiledBone:{
            name:'sigiled bone',
            flimsy:10,
            weight:-1,
            value:3,
            color:'bone',
            frequency:1
        },
        ironwood:{
            name:'ironwood',
            stunTime:2,
            blunt:{
                damage:2
            },
            edged:{
                damage:-1
            },
            value:3,
            color:'redBrown',
            frequency:2
        },
        crystal:{
            name:'crystal',
            flimsy:20,
            value:8,
            edged:{
                damage:8
            },
            color:'darkPurple',
            frequency:1
        },
        meteorite:{
            name:'meteorite',
            damage:1,
            edged:{
                damage:1,
            },
            value:7,
            resistant:true,
            color:'gray',
            frequency:1
        },
        lightsteel:{
            name:'lightsteel',
            weight:-1,
            stunTime:-2,
            blunt:{
                damage:-2
            },
            edged:{
                damage:2
            },
            value:8,
            color:'silver',
            frequency:1
        },
        coldsteel:{
            name:'coldsteel',
            stunTime:2,
            edged:{
                damage:2
            },
            value:10,
            color:'silver',
            frequency:1
        },
        silver:{
            name:'silver',
            flimsy:5,
            edged:{
                damage:-1
            },
            value:10,
            color:'silver',
            frequency:3
        },
        gold:{
            name:'gold',
            weight:1,
            stunTime:2,
            flimsy:8,
            edged:{
                damage:-2
            },
            blunt:{
                damage:2
            },
            value:12,
            color:'gold',
            frequency:3
        },
        platinum:{
            name:'platinum',
            weight:2,
            stunTime:4,
            flimsy:1,
            edged:{
                damage:4
            },
            blunt:{
                damage:6
            },
            value:19,
            color:'silver',
            frequency:2,
        },
        adamantine:{
            name:'adamantine',
            weight:-1,
            edged:{
                damage:2
            },
            value:20,
            color:'blue',
            frequency:1
        }
    },
    treasureMaterials:{
        paper:{
            name:"paper",
            value:.05,
            color:"bone",

            usable:true,
            fuel:true,
            light:2,
        },
        bone:{
            name:"bone",
            value:0.2,
            color:"bone"
        },
        wood:{
            name:'wooden',
            value:0.3,
            color:"woodBrown",

            usable:true,
            fuel:true,
            light:1,
        },
        stone:{
            name:'stone',
            value:0.4,
            color:"gray"
        },
        
        iron:{
            name:'iron',
            value:.6,
            color:"gray"
        },
        steel:{
            name:'steel',
            value:1,
            color:"lightGray"
        },
        bronze:{
            name:'bronze',
            value:1.2,
            color:"brown"
        },
        lead:{
            name:'lead',
            value:2,
            color:"darkgray"
        },
        sigiledBone:{
            name:"sigiled bone",
            value:2.5,
            color:"bone"
        },
        copper:{
            name:'copper',
            value:3,
            color:"redBrown"
        },
        nickel:{
            name:'nickel',
            value:3.5,
            color:"lightGray"
        },
        tin:{
            name:'tin',
            value:4,
            color:"lightGray"
        },
        sterling:{
            name:'sterling silver',
            value:5,
            color:'silver'
        },
        silver:{
            name:'silver',
            value:8,
            color:"silver"
        },
        gold:{
            name:'gold',
            value:10,
            color:"gold"
        },
        platinum:{
            name:'platinum',
            value:20,
            color:"silver"
        }
    },
    weaponModifiers:{
        worn:{
            name:'worn',
            flimsy:1,
            edged:{
                damage:-1
            },
            value:.4
        },
        craftTiers:{
            poor:{
                name:'poor',
                flimsy:3,
                variance:{
                    positive:0,
                    negative:50
                },
                value:.4
            },
            rustic:{
                name:'rustic',
                flimsy:1,
                variance:{
                    positive:20,
                    negative:50
                },
                value:.7
            },
            artisan:{
                name:'artisan',
                variance:{
                    positive:30,
                    negative:30
                },
                value:1.2
            },
            masterwork:{
                name:'masterwork',
                variance:{
                    positive:50,
                    negative:10
                },
                value:5
            }
        }
    },
    treasureModifiers:{
        decrepit:{
            name:'decrepit',
            value:.4
        },
        distressed:{
            name:'distressed',
            value:.6
        },
        pristine:{
            name:'pristine',
            value:1.5
        } 
    },
    food:{
        morsel:{
            name:'morsel',
            usable: true,
            food:1,
            color:'brown',
            value:0
        },
        berries:{
            name:'berries',
            usable: true,
            food:1,
            value:1,
            color:'red'
        },
        provisions:{
            name:'provisions',
            usable:true,
            food:1,
            value:1,
            uses:3,
            color:'brown'
        },
        baguette:{
            name:'stale baguette',
            usable: true,
            food:1,
            color:'bone',

            weapon:true,
            damage:1,
            stunTime:1,
            weight:1,
            type:{
                blunt:true,
                long:true
            },
            value:1
        },
        cookingOil:{
            name:'cooking oil',
            uses:3,
            usable: true,
            food:1,
            light:1,
            fuel:1,
            color:'gold',
            value:5
        },
    },
    potions:{
        poison:{
            name:'potion of poison',
            usable: true,
            potable: true,
            color: 'darkGreen',
            health: -4,
            value: 3,
            negative:true,
            message:'your life force weakens.',
            tip: 'You lost health'
        },
        darkness:{
            name:'potion of darkness',
            usable: true,
            potable: true,
            color: 'black',
            light: -10,
            value: 3,
            negative:true,
            message:'your light is extinguished.'
        },
        illFortune:{
            name:'potion of ill fortune',
            usable: true,
            potable: true,
            color: 'darkPurple',
            luck: -3,
            value: 3,
            negative:true,
            message: 'Your luck drains away.'
        },
        fatigue:{
            name:'potion of fatigue',
            usable: true,
            potable: true,
            color: 'orange',
            stamina: -5,
            value: 3,
            negative:true,
            message: 'Your energy is sapped.',
            tip: 'You lost stamina'
        },
        vomitingPotion:{
            name:'potion of vomiting',
            usable: true,
            potable: true,
            color: 'darkGreen',
            stamina: -2,
            hunger: -6,
            value: 3,
            negative:true,
            message: 'You empty your stomach onto the floor.',
            tip: 'You lost hunger'

        },
        unlabeled:{
            name:'unlabeled potion',
            usable: true,
            potable: true,
            color:'darkPurple',
            unlabeled: true,
            value: 5,
            tier: 3
        },
        healthTincture:{
            name:'health tincture',
            usable: true,
            potable: true,
            health: 2,
            value: 8,
            color: 'red',
            message:'Your wounds close.'
        },
        healthPotion:{
            name:'health potion',
            usable: true,
            potable: true,
            health: 5,
            value: 20,
            color: 'red',
            message:'Your wounds close.'
        },
        greaterHealthPotion:{
            name:'greater health potion',
            usable: true,
            potable: true,
            health: 10,
            value: 40,
            color: 'red',
            message:'Your wounds close.'
        },
        staminaTincture:{
            name:'stamina tincture',
            usable: true,
            potable: true,
            stamina: 4,
            value: 10,
            color: 'darkYellow',
            message:'You feel a surge of energy.',
            tip: 'You gained stamina'
        },
        staminaPotion:{
            name:'stamina potion',
            usable: true,
            potable: true,
            stamina: 6,
            value: 20,
            color: 'darkYellow',
            message:'You feel a surge of energy.',
            tip: 'You gained stamina'
        },
        greaterStaminaPotion:{
            name:'greater stamina potion',
            usable: true,
            potable: true,
            stamina: 10,
            value: 40,
            color: 'darkYellow',
            message:'You feel a surge of energy.',
            tip: 'You gained stamina'
        },
        luckTincture:{
            name:'luck tincture',
            usable: true,
            potable: true,
            luck: 1,
            value: 10,
            color: 'green',
            message:'Your luck returns to you.'
        },
        luckPotion:{
            name:'luck potion',
            usable: true,
            potable: true,
            luck: 3,
            value: 30,
            color: 'green',
            message:'Your luck returns to you.'
        },
        greaterLuckPotion:{
            name:'greater luck potion',
            usable: true,
            potable: true,
            luck: 6,
            value: 110,
            color: 'green',
            message:'Your luck returns to you.'
        },
        metabolismPotion:{
            name:'metabolism potion',
            usable: true,
            potable: true,
            stamina: 10,
            health: 3,
            hunger: -6,
            value: 10,
            color: 'orange',
            message:"You digest your stomach's contents in an instant.",
            tip: 'You gained stamina and health, at the cost of hunger.'
        },
        unHallowedStrength:{
            name:'potion of unhallowed strength',
            usable: true,
            potable: true,
            stamina: 10,
            luck: -3,
            light:-1,
            value: 9,
            color: 'orange',
            message:"You feel reinvigorated, but something's wrong...",
            tip: 'You gained stamina at the cost of luck.'
        },
        unHallowedHealth:{
            name:'potion of unhallowed health',
            usable: true,
            potable: true,
            health: 10,
            luck: -5,
            light:-1,
            value: 10,
            color: 'darkRed',
            message:"Your wounds close, but something's wrong...",
            tip: 'You gained health at the cost of luck.'
        },   
        unHallowedNourishment:{
            name:'potion of unhallowed nourishment',
            usable: true,
            potable: true,
            hunger: 10,
            luck: -2,
            light:-1,
            value: 3,
            color: 'darkOrange',
            message:"Your stomach fills, but still you feel empty...",
            tip: 'You gained hunger at the cost of luck.'
        },
        fatestealerElixir:{
            name:'fatestealer elixir',
            usable: true,
            potable: true,
            stamina: 10,
            health: 10,
            luck: -10,
            hunger: 10,
            value: 75,
            color: 'brightPurple',
            message:"You feel fully renewed, but something's wrong...",
            tip: 'You gained hunger, stamina, and health at the cost of luck.'
        },
        nectar:{
            name:'nectar',
            usable: true,
            potable: true,
            stamina: 10,
            health: 10,
            luck: 10,
            value: 150,
            hunger: 10,
            light:2,
            color: 'gold',
            message:"You feel reinvigorated.",
            tip: 'You gained stamina, health, luck, and hunger.'
        },
        ritualBrew:{
            name:'ritual brew',
            usable: true,
            potable: true,
            stamina: -5,
            health: -5,
            luck: 10,
            value: 55,
            hunger: -10,
            color: 'darkOrange',
            message:"Your life force is rended from you. You feel reborn.",
            tip: 'You gained luck at the cost of stamina, health, and hunger'
        },
        nourishmentPotion:{
            name:'nourishment potion',
            usable: true,
            potable: true,
            value: 4,
            hunger: 10,
            color: 'darkOrange',
            message:"Your stomach fills."
        },
        lightPotion:{
            name:'potion of light',
            usable: true,
            potable: true,
            value: 8,
            light: 10,
            color: 'gold',
            message:"Your lantern roars to life."
        },
        darkVigor:{
            name:'potion of dark vigor',
            usable: true,
            potable: true,
            value: 8,
            light: -10,
            stamina: 10,
            color: 'darkPurple',
            message:"You feel a surge of strength as your lantern is extinguished.",
            tip: 'You gained stamina.'
        }
    }
}