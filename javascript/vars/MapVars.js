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
                        description:"The day will pass. Some monsters will respawn, your fatigue will decrease, and your Hunger will deplete. Some extra Hunger will be converted into Health if you're hurt.",
                        flavorText:"In such a cruel world, at least rest is free."
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