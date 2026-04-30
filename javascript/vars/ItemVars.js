let itemVars = {
    weapons:{
        club:{
            weapon:true,
            name:"club",
            damage:3,
            stunTime:3,
            weight:2,
            flimsy:-2,
            type:{
                blunt:true,
                simple:true
            },
            bulk:1.3,
            jab:{
                damage:2,
                stunTime:2,
                weight:2,
                type:{
                    blunt:true,
                    simple:true
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
            flimsy:-1,
            type:{
                blunt:true,
                sharp:true,
            },
            bulk:1.2,
            jab:{
                damage:2,
                stunTime:2,
                weight:2,
                type:{
                    blunt:true,
                    sharp:true,
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
            flimsy:-1,
            bulk:3,
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
            weight:5,
            flimsy:-1,
            bulk:6,
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
            disallowedMaterials:["ceramic","flint"],

            value:7
        },
        rapier:{
            weapon:true,
            name:"rapier",
            damage:2,
            stunTime:2,
            weight:1,
            bulk:2,
            type:{
                sword:true,
                sharp:true,
            },
            jab:{
                damage:8,
                stunTime:2,
                weight:2,
                type:{
                    sword:true,
                    sharp:true,
                },
            },
            disallowedMaterials:["flint","limestone","obsidian","rubber"],
            value:7
        },
        scimitar:{
            weapon:true,
            name:"scimitar",
            damage:7,
            stunTime:2,
            weight:3,
            bulk:2,
            strafe:{
                damage:6,
                stunTime:2,
                weight:2,
                type:{
                    sword:true,
                    edged:true,
                    sharp:true,
                },
            },
            type:{
                sword:true,
                edged:true,
                sharp:true,
            },
            disallowedMaterials:["flint","limestone","rubber","ceramic","bone"],
            value:7
        },
        shortsword:{
            weapon:true,
            name:"shortsword",
            damage:4,
            stunTime:1,
            weight:2,
            bulk:1.2,
            type:{
                sword:true,
                edged:true,
                sharp:true,
                simple:true,
            },
            draw:{
                damage:4,
                stunTime:3,
                weight:1,
                type:{
                    sword:true,
                    edged:true,
                    sharp:true,
                    simple:true
                },
            },
            value:4
        },
        longsword:{
            weapon:true,
            name:"longsword",
            damage:8,
            stunTime:2,
            weight:3,
            bulk:3,
            type:{
                sword:true,
                edged:true,
                sharp:true,
            },
            disallowedMaterials:["flint","bone"],
            value:7
        },
        katana:{
            weapon:true,
            name:"katana",
            damage:8,
            stunTime:1,
            weight:3,
            bulk:3,
            type:{
                sword:true,
                edged:true,
                sharp:true,
            },
            draw:{
                damage:8,
                stunTime:5,
                weight:3,
                type:{
                    sword:true,
                    edged:true,
                    sharp:true,
                },
            },
            flimsy:1,
            disallowedMaterials:["flint","limestone","obsidian","rubber","bone","wood","ceramic","obsidian","lead","copper","bronze","glass","sigiledBone","ironwood","crystal","gold","platinum"],
            value:10
        },
        greatsword:{
            weapon:true,
            name:"greatsword",
            damage:12,
            stunTime:4,
            weight:5,
            bulk:5,
            type:{
                sword:true,
                edged:true,
                sharp:true,
            },
            disallowedMaterials:["ceramic", "flint","bone"],

            value:10
        },
        goliathSword:{
            weapon:true,
            name:"goliath sword",
            damage:20,
            stunTime:6,
            weight:7,
            bulk:7,
            draw:{
                damage:25,
                stunTime:8,
                weight:9,
                type:{
                    sword:true,
                    edged:true,
                    sharp:true,
                },
            },
            type:{
                sword:true,
                edged:true,
                sharp:true,
            },
            disallowedMaterials:["wood","bone","ceramic","flint","bone", "rubber", "lightsteel"],
            unwieldy:1,

            value:14
        },
        handaxe:{
            weapon:true,
            name:"handaxe",
            damage:1,
            stunTime:2,
            weight:2,
            bulk:1.3,
            type:{
                edged:true,
                axe:true,
                sharp:true,
            },
            swing:{
                damage:6,
                stunTime:4,
                weight:2,
                type:{
                    edged:true,
                    axe:true,
                    sharp:true,
                }
            },
            value:4
        },
        pickaxe:{
            weapon:true,
            name:"pickaxe",
            wrecking:true,
            damage:2,
            stunTime:3,
            weight:3,
            bulk:3.5,
            type:{
                axe:true,
                improvised:true,
                sharp:true,
            },
            swing:{
                damage:8,
                stunTime:3,
                weight:3,
                type:{
                    axe:true,
                    improvised:true,
                    sharp:true,
                }
            },
            disallowedMaterials:["ceramic","limestone","obsidian","rubber","glass"],
            value:5
        },
        greataxe:{
            weapon:true,
            name:"greataxe",
            damage:2,
            stunTime:3,
            weight:3,
            bulk:6,
            type:{
                edged:true,
                axe:true,
                sharp:true,
            },
            swing:{
                damage:15,
                stunTime:6,
                weight:5,
                type:{
                    edged:true,
                    axe:true,
                    sharp:true,
                }
            },
            disallowedMaterials:["flint","ceramic","bone"],
            value:9
        },
        halberd:{
            weapon:true,
            name:"halberd",
            damage:8,
            stunTime:3,
            weight:4,
            bulk:7,
            type:{
                edged:true,
                long:true,
                sharp:true,
            },
            swing:{
                damage:15,
                stunTime:4,
                weight:6,
                type:{
                    edged:true,
                    long:true,
                    axe:true
                }
            },
            disallowedMaterials:["flint","limestone","rubber","ceramic","bone"],
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
            value:5,
            bulk:1,
        },
        kindling:{
            usable:true,
            name: "kindling",
            fuel:true,
            light:1,
            value:0,
            color:'woodBrown',
            bulk:0.5,
        }
    },
    drops:{
        direRatPelt:{
            name:"dire rat pelt",
            value:1,
            color:'brown',
            bulk:1,
            pelt:true
        },
        wolfPelt:{
            name:"wolf pelt",
            value:2,
            color:'brown',
            bulk:1.5,
            pelt:true
        },
        direWolfPelt:{
            name:"dire wolf pelt",
            value:4,
            color:'gray',
            bulk:2,
            pelt:true
        },
        kingRatSkull:{
            name:"king rat's skull",
            value:15,
            color:'red',
            bulk:1,
            treasure:true
        },
        branch:{
            weapon:true,
            name:"branch",
            damage:1,
            stunTime:1,
            weight:1,
            bulk:0.7,
            type:{
                blunt:true,
                improvised:true
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
            color:'bone',
            bulk:0.5,
            treasure:true
        },
        sigiledSkull:{
            name:"sigiled skull",
            value:3,
            color:'bone',
            bulk:1,
            treasure:true
        },
        blueGoo:{
            name:'blue goo',
            usable: true,
            food:1,
            fuel:1,
            light:1,
            color:'blue',
            value:1,
            bulk:0.5,
        },
        blackGoo:{
            name:'black goo',
            usable: true,
            fuel:1,
            light:-3,
            color:'black',
            value:4,
            bulk:0.5,
        },
        orangeGoo:{
            name:'orange goo',
            usable: true,
            food:2,
            fuel:1,
            light:1,
            color:'orange',
            value:2,
            bulk:0.5,
        },
        greenGoo:{
            name:'green goo',
            usable: true,
            fuel:1,
            light:2,
            color:'green',
            value:3,
            bulk:0.5,
        },
        purpleGoo:{
            name:'purple goo',
            usable: true,
            fuel:3,
            light:3,
            color:'brightPurple',
            value:4,
            bulk:0.5,
        },
        pan:{
            weapon:true,
            name:"cast iron pan",
            iron:true,
            damage:1,
            stunTime:2,
            weight:2,
            flimsy:2,
            bulk:1.8,
            type:{
                blunt:true,
                improvised:true,
            },
            swing:{
                damage:5,
                stunTime:4,
                weight:2,
                type:{
                    blunt:true,
                    improvised:true,
                }
            },
            value:2
        },
        scrollOfUndeath:{
            name:'Scroll Of Undeath',
            color:'bone',
            value:999,
            bulk:0.5,
            win:true,
            secretCode:"I have conquered death at great cost."
        },
        greedHeart:{
            name:'Greed Heart',
            color:'darkRed',
            value:999,
            bulk:1,
            win:true,
            secretCode: "I have defeated greed, and all I got was endless riches."
        }
    },
    tools:{
        rollingPin:{
            weapon:true,
            name:"rolling pin",
            wood:true,
            damage:2,
            stunTime:2,
            weight:1,
            flimsy:8,
            bulk:0.7,
            type:{
                blunt:true,
                improvised:true,
                simple:true
            },
            jab:{
                damage:1,
                stunTime:1,
                weight:1,
                type:{
                    blunt:true,
                    improvised:true,
                    simple:true
                }
            },
            usable:true,
            fuel:true,
            light:1,
            color:'woodBrown',
            value:0
        },
        woodenShovel:{
            weapon:true,
            name:"wooden shovel",
            wood:true,
            damage:1,
            stunTime:2,
            weight:2,
            flimsy:8,
            bulk:4.5,
            type:{
                blunt:true,
                improvised:true,
                simple:true
            },
            swing:{
                damage:5,
                stunTime:3,
                weight:3,
                type:{
                    blunt:true,
                    improvised:true,
                    simple:true
                }
            },
            usable:true,
            fuel:true,
            light:1,
            color:'woodBrown',
            value:0
        },
        woodenPitchfork:{
            weapon:true,
            name:"wooden pitchfork",
            wood:true,
            damage:1,
            stunTime:2,
            weight:2,
            flimsy:8,
            bulk:4,
            type:{
                improvised:true,
                long:true,
                simple:true,
                sharp:true,
            },
            jab:{
                damage:4,
                stunTime:2,
                weight:2,
                type:{
                    improvised:true,
                    long:true,
                    simple:true,
                    sharp:true,
                }
            },
            usable:true,
            fuel:true,
            light:1,
            color:'woodBrown',
            value:0
        }

    },
    treasure:{
        button:{
            name:"button",
            value:0.9,
            bulk:0.1,
        },
        thimble:{
            name:"thimble",
            value:1,
            bulk:0.1,
        },
        bead:{
            name:"bead",
            value:1.5,
            bulk:0.1,
            scalable:true,
        },
        ring:{
            name:"ring",
            value:4,
            bulk:0.1,
            scalable:true,
        },
        cup:{
            name:"cup",
            value:6,
            bulk:0.4,
            scalable:true,
        },
        pendant:{
            name:"pendant",
            value:6,
            bulk:0.15,
            scalable:true,
        },
        dish:{
            name:"dish",
            value:8,
            bulk:1,
            scalable:true,
        },
        bowl:{
            name:"bowl",
            value:9,
            bulk:1.5,
            scalable:true,
        },
        vase:{
            name:"vase",
            value:10,
            bulk:3,
            scalable:true,
        },
        coinPouch:{
            name:"coin pouch",
            value:10,
            bulk:0.2,
            scalable:true,
        },
        statuette:{
            name:"statuette",
            value:12,
            bulk:1,
            scalable:true,
        },
        tiara:{
            name:"tiara",
            value:12,
            bulk:0.75,
            scalable:true,
        },
        decorativePlate:{
            name:"decorative plate",
            value:15,
            bulk:3,
            scalable:true,
        },
        crown:{
            name:"crown",
            value:20,
            bulk:1.2,
            scalable:true,
        }
    },
    weaponMaterials:{
        wood:{
            name:'wooden',
            flimsy:6,
            stunTime: -2,
            weight:-1,
            damage:-1,
            bulk:0.8,
            sharp:{
                damage:-1,
                flimsy:2
            },            
            value:.25,
            color:'woodBrown',

            usable:true,
            fuel:true,
            light:1,

            frequency:7

        },
        bone:{
            name:'bone',
            flimsy:4,
            blunt:{
                damage: -1,
            },
            sharp:{
                flimsy:4,
            },
            stunTime:-1,
            weight:-1,
            value:.15,
            color:'bone',

            frequency:1

        },
        limestone:{
            name:'limestone',
            flimsy:6,
            weight:2,
            stunTime:3,
            damage:2,
            bulk:2,
            blunt:{
                damage:2
            },
            value:.2,
            color:'silver',

            frequency:1

        },
        flint:{
            name:'flint',
            flimsy:4,
            blunt:{
                flimsy:4,
            },
            value:.3,
            color:'darkGray',

            frequency:4
        },
        ceramic:{
            name:'ceramic',
            flimsy:10,
            blunt:{
                flimsy:10,
            },
            value:.8,
            color:'brown',

            frequency:1
        },
        obsidian:{
            name:'obsidian',
            flimsy:6,
            blunt:{
                flimsy:3,
            },
            sharp:{
                damage:2,
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
                damage:1
            },
            value:2,
            color:'darkgray',
            bulk:3,

            frequency:3

        },
        rubber:{
            name:'rubber',
            damage:-5,
            blunt:{
                stunTime:2
            },
            sharp:{
                damage:-3
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
            sharp:{
                damage:1
            },
            value:3,
            color:'brown',

            frequency:3
        },
        iron:{
            name:'iron',
            flimsy:1,
            sharp:{
                damage:1
            },
            value:2.5,
            color:'gray',
            frequency:5
        },
        steel:{
            name:'steel',
            sharp:{
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
            sharp:{
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
            sharp:{
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
            sharp:{
                damage:8
            },
            color:'darkPurple',
            frequency:1
        },
        meteorite:{
            name:'meteorite',
            damage:1,
            sharp:{
                damage:1,
            },
            value:7,
            resistant:true,
            color:'gray',
            frequency:1
        },
        gravsteel:{
            name:'gravsteel',
            weight:3,
            stuntime:6,
            damage:8,
            blunt:{
                damage: 4
            },
            bulk:5,
            unwieldy:1,
            value:8,
            color:'black',
            frequency:1
        },
        lightsteel:{
            name:'lightsteel',
            weight:-1,
            stunTime:-2,
            blunt:{
                damage:-2
            },
            sharp:{
                damage:2
            },
            bulk:0.5,
            value:8,
            color:'silver',
            frequency:1
        },
        coldsteel:{
            name:'coldsteel',
            stunTime:2,
            sharp:{
                damage:2
            },
            value:10,
            color:'silver',
            frequency:1
        },
        silver:{
            name:'silver',
            flimsy:5,
            sharp:{
                damage:-1
            },
            bulk:1.5,
            value:10,
            color:'silver',
            frequency:3
        },
        gold:{
            name:'gold',
            weight:1,
            stunTime:2,
            flimsy:8,
            sharp:{
                damage:-2
            },
            blunt:{
                damage:2
            },
            value:12,
            color:'gold',
            bulk:3,
            frequency:3
        },
        platinum:{
            name:'platinum',
            weight:2,
            stunTime:4,
            flimsy:1,
            damage:4,
            bulk:5,
            blunt:{
                damage:2
            },
            value:19,
            color:'silver',
            frequency:2,
        },
        
        adamantine:{
            name:'adamantine',
            weight:-1,
            sharp:{
                damage:2
            },
            bulk:0.75,
            value:20,
            color:'blue',
            frequency:1
        },
        ethersteel:{
            name:'ethersteel',
            sharp:{
                damage:2
            },
            ether:true,
            value:23,
            color:'clearBlue',
            frequency:1
        },
    },
    treasureMaterials:{
        paper:{
            name:"paper",
            value:.05,
            color:"bone",

            usable:true,
            fuel:true,
            light:2,
            bulk:0.1,
            scalable:false
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
            color:"gray",
            bulk:2,
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
            color:"darkgray",
            bulk:3,
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
            color:"lightGray",
            bulk:0.7,
        },
        sterling:{
            name:'sterling silver',
            value:5,
            color:'silver',
            bulk:1.2,
        },
        silver:{
            name:'silver',
            value:8,
            color:"silver",
            bulk:1.5,
        },
        gold:{
            name:'gold',
            value:10,
            color:"gold",
            bulk:3,
        },
        platinum:{
            name:'platinum',
            value:20,
            color:"silver",
            bulk:4,
        }
    },
    treasureSizes:{
        tiny:{
            name:"tiny",
            value:0.3,
            bulk:0.2
        },
        small:{
            name:"small",
            value:0.5,
            bulk:0.5
        },
        large:{
            name:"large",
            value:1.5,
            bulk:2
        },
        huge:{
            name:"huge",
            value:2.5,
            bulk:4
        }
    },
    weaponModifiers:{
        worn:{
            name:'worn',
            symbol:'⤓',
            flimsy:1,
            sharp:{
                damage:-1
            },
            value:.4
        },
        cursed:{
            name: 'cursed',
            symbol:'⚶',
            unlucky:true,
            value: .3
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
        hardboiledEgg:{
            name:'hard boiled egg',
            usable: true,
            food:1,
            color:'bone',
            value:0,
            bulk:0.15,
            perishable:true
        },
        nuts:{
            name:'nuts',
            usable: true,
            food:1,
            color:'bone',
            value:0,
            bulk:0.15,
            preserved:true
        },
        apple:{
            name:'apple',
            usable: true,
            food:1,
            color:'darkRed',
            value:0,
            bulk:0.3,
        },
        morsel:{
            name:'morsel',
            usable: true,
            food:1,
            color:'brown',
            value:0,
            bulk:0.3,
        },  
        berries:{
            name:'berries',
            usable: true,
            food:1,
            value:1,
            color:'red',
            bulk:0.1,
        },
        provisions:{
            name:'provisions',
            usable:true,
            food:1,
            value:2,
            uses:3,
            color:'brown',
            bulk:0.5,
            preserved: true
        },
        fineCheese:{
            name:'fine cheese',
            usable: true,
            food:2,
            value:3,
            color:'bone',
            bulk:0.5,
            perishable:true
        },
        baguette:{
            name:'stale baguette',
            usable: true,
            food:1,
            color:'bone',
            flimsy:35,
            bulk:1,

            weapon:true,
            damage:1,
            stunTime:1,
            weight:1,
            type:{
                blunt:true,
                improvised:true
            },
            value:1
        },
        poultry:{
            name:'cooked poultry',
            usable: true,
            food:1,
            uses:3,
            color:'woodBrown',
            value:2,
            perishable:true
        },
        salami:{
            name:'salami',
            usable: true,
            food:2,
            color:'darkRed',
            flimsy:8,
            weapon:true,
            damage:1,
            stunTime:2,
            weight:1,
            bulk:1,
            type:{
                blunt:true,
                improvised:true
            },
            value:2,
            preserved:true
        },
        cookingOil:{
            name:'cooking oil',
            uses:3,
            usable: true,
            food:1,
            light:1,
            fuel:1,
            color:'gold',
            value:5,
            bulk:1,
        },
        cake:{
            name:'cake',
            usable:true,
            food:1,
            value:4,
            uses:5,
            bulk:2,
            color:'brightPurple'
        },
        ultimateSalami:{
            name:'ultimate salami',
            usable: true,
            food:3,
            color:'darkRed',
            weapon:true,
            damage:3,
            stunTime:4,
            weight:2,
            bulk:1,
            type:{
                blunt:true,
                improvised:true
            },
            preserved:true,
            value:10
        },
    },
    foodModifiers:{
        rotten:{
            rotten:true,
            name:"rotten",
            value:0.3
        }
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
            tip: 'You lost health',
            
            bulk:0.5,
        },
        darkness:{
            name:'potion of darkness',
            usable: true,
            potable: true,
            color: 'black',
            light: -10,
            value: 3,
            negative:true,
            message:'your light is extinguished.',
            
            bulk:0.5,
        },
        illFortune:{
            name:'potion of ill fortune',
            usable: true,
            potable: true,
            color: 'darkPurple',
            luck: -3,
            value: 3,
            negative:true,
            message: 'Your luck drains away.',
            
            bulk:0.5,
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
            tip: 'You lost stamina',
            
            bulk:0.5,
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
            tip: 'You lost hunger',
            
            bulk:0.5,

        },
        unlabeled:{
            name:'unlabeled potion',
            usable: true,
            potable: true,
            color:'darkPurple',
            unlabeled: true,
            value: 5,
            tier: 3,
            
            bulk:0.5,
        },
        healthTincture:{
            name:'health tincture',
            usable: true,
            potable: true,
            health: 2,
            value: 5,
            color: 'red',
            message:'Your wounds close.',
            
            bulk:0.5,
        },
        healthPotion:{
            name:'health potion',
            usable: true,
            potable: true,
            health: 5,
            value: 10,
            color: 'red',
            message:'Your wounds close.',
            
            bulk:0.5,
        },
        greaterHealthPotion:{
            name:'greater health potion',
            usable: true,
            potable: true,
            health: 10,
            value: 20,
            color: 'red',
            message:'Your wounds close.',
            
            bulk:0.5,
        },
        staminaTincture:{
            name:'stamina tincture',
            usable: true,
            potable: true,
            stamina: 4,
            value: 5,
            color: 'darkYellow',
            message:'You feel a surge of energy.',
            tip: 'You gained stamina',
            
            bulk:0.5,
        },
        staminaPotion:{
            name:'stamina potion',
            usable: true,
            potable: true,
            stamina: 6,
            value: 7,
            color: 'darkYellow',
            message:'You feel a surge of energy.',
            tip: 'You gained stamina',
            
            bulk:0.5,
        },
        greaterStaminaPotion:{
            name:'greater stamina potion',
            usable: true,
            potable: true,
            stamina: 10,
            value: 11,
            color: 'darkYellow',
            message:'You feel a surge of energy.',
            tip: 'You gained stamina',
            
            bulk:0.5,
        },
        luckTincture:{
            name:'luck tincture',
            usable: true,
            potable: true,
            luck: 1,
            value: 5,
            color: 'green',
            message:'Your luck returns to you.',
            
            bulk:0.5,
        },
        luckPotion:{
            name:'luck potion',
            usable: true,
            potable: true,
            luck: 3,
            value: 10,
            color: 'green',
            message:'Your luck returns to you.',
            
            bulk:0.5,
        },
        greaterLuckPotion:{
            name:'greater luck potion',
            usable: true,
            potable: true,
            luck: 6,
            value: 15,
            color: 'green',
            message:'Your luck returns to you.',
            
            bulk:0.5,
        },
        metabolismPotion:{
            name:'metabolism potion',
            usable: true,
            potable: true,
            stamina: 10,
            health: 3,
            hunger: -6,
            value: 7,
            color: 'orange',
            message:"You digest your stomach's contents in an instant.",
            tip: 'You gained stamina and health, at the cost of hunger.',
            
            bulk:0.5,
        },
        /*
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
            tip: 'You gained stamina at the cost of luck.',
            
            bulk:0.5,
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
            tip: 'You gained health at the cost of luck.',
            
            bulk:0.5,
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
            tip: 'You gained hunger at the cost of luck.',
            
            bulk:0.5,
        },
        */
        fatestealerElixir:{
            name:'fatestealer elixir',
            usable: true,
            potable: true,
            stamina: 10,
            health: 10,
            luck: -10,
            hunger: 10,
            value: 11,
            color: 'brightPurple',
            message:"You feel fully renewed, but something's wrong...",
            tip: 'You gained hunger, stamina, and health at the cost of luck.',
            
            bulk:0.5,
        },
        nectar:{
            name:'nectar',
            usable: true,
            potable: true,
            stamina: 10,
            health: 10,
            luck: 10,
            value: 20,
            hunger: 10,
            light:2,
            color: 'gold',
            message:"You feel reinvigorated.",
            tip: 'You gained stamina, health, luck, and hunger.',
            
            bulk:0.5,
        },
        ritualBrew:{
            name:'ritual brew',
            usable: true,
            potable: true,
            stamina: -5,
            health: -5,
            luck: 10,
            value: 20,
            hunger: -10,
            color: 'darkOrange',
            message:"Your life force is rended from you. You feel reborn.",
            tip: 'You gained luck at the cost of stamina, health, and hunger',
            
            bulk:0.5,
        },
        nourishmentPotion:{
            name:'nourishment potion',
            usable: true,
            potable: true,
            value: 4,
            hunger: 10,
            color: 'darkOrange',
            message:"Your stomach fills.",
            
            bulk:0.5,
        },
        lightPotion:{
            name:'potion of light',
            usable: true,
            potable: true,
            value: 8,
            light: 10,
            color: 'gold',
            message:"Your lantern roars to life.",
            
            bulk:0.5,
        },
        darkVigor:{
            name:'potion of dark vigor',
            usable: true,
            potable: true,
            value: 6,
            light: -10,
            stamina: 10,
            color: 'darkPurple',
            message:"You feel a surge of strength as your lantern is extinguished.",
            tip: 'You gained stamina.',
            
            bulk:0.5,
        }
    }
}