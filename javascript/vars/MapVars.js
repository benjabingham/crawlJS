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
                fuelSlots:2,
                potionSlots:2
            },
            tavern:{
                specialItems:[
                    {
                        type:'fullMeal',
                        price:10,
                        name:"Proper Meal",
                        description:"Fully refill your hunger bar.",
                        flavorText:"\"You look hungry. How about something that'll really fill you up?\""
                    },
                    {
                        type:'morsel',
                        price:2,
                        name:"Morsel",
                        description:"Refills your hunger by 1 point.",
                        flavorText:"It's not much, but it's something to put in your stomach."
                    },
                    {
                        type:'rest',
                        price:0,
                        name:"rest",
                        description:"End the day.",
                        descriptionKeyword:"End the day",
                        flavorText:"In such a cruel world, at least rest is free."
                    },
                    {
                        type:'gamble',
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
                    }
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