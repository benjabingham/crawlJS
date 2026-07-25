let mapVars = {
    "Sundun":{
        name:"Town of Sundun",
        symbol:'☉',
        type:'town',
        description:'',
        shops:{
            shop:{
                weaponTiers:[0,2,3,4],
                carriedMaterials:['wood','copper','bronze','iron','steel'],
                curseMultiplier:0,
                enchantmentChance:0,
                preferredRange:{min:1,max:10},
                fuelSlots:2,
                potionSlots:2,
                restockChances:{
                    weaponTiers:{
                        0:0.3,
                        2:0.2,
                        3:0.13,
                        4:0.08
                    },
                    fuel:0.4,
                    potion:0.15
                }
            },
            tavern:{
                morselSlots:3,
                restockChances:{
                    morsel:0.5,
                },
                specialItems:[
                    {
                        type:'rest',
                        tier:'rest',
                        price:0,
                        name:"rest",
                        description:"End the day.",
                        descriptionKeyword:"End the day",
                        flavorText:"In such a cruel world, at least rest is free."
                    },
                    {
                        type:'gamble',
                        tier:'rest',
                        price:5,
                        name:'carouse',
                        message:"You're pretty sure you had a good time...",
                        description:"End the day.",
                        descriptionKeyword:"End the day",
                        flavorText:"Who knows what the night may hold.",
                        effects:{
                            luck:{
                                min:0,max:2
                            },
                            hunger:{
                                min:-1,max:-3
                            },
                            fatigue:{
                                min:-10,max:3
                            },
                            rest:true
                        }
                    },
                    {
                        type:'fullMeal',
                        tier:'meal',
                        price:10,
                        name:"Feast",
                        description:"Fully refill your hunger bar.",
                        flavorText:"\"You look hungry. How about something that'll really fill you up?\""
                    },
                    {
                        type:'meal',
                        tier:'meal',
                        price:3,
                        name:"Meal",
                        nourishment:2,
                        description:"Regain 2 Hunger.",
                        flavorText:"\"Now, this here is my own recipe...\""
                    },

                ]
            }
        },
        //for back compatibility .... TODO remove.
        
        
    },
}

let mapTypes = {
    vibe:['undead','weird','serene'],
    scale:['dungeon','town','world'],
    setting:['indoors','outdoors']
}