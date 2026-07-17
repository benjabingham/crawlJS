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
                fullMeal:10,
                morsel:2,
                rest:0
            }
        },
        //for back compatibility .... TODO remove.
        shop:{
            shopType:'item-shop',
            weaponTiers:[0,2,3,4],
            carriedMaterials:['wood','copper','bronze','iron','steel'],
            fuelSlots:2,
            potionSlots:2
        },
        tavern:{
            fullMeal:10,
            morsel:2,
            rest:0
        }
        
    },
}

let mapTypes = {
    vibe:['undead','weird','serene'],
    scale:['dungeon','town','world'],
    setting:['indoors','outdoors']
}