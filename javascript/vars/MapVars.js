let mapVars = {
    "Sundun":{
        name:"Town of Sundun",
        symbol:'☉',
        type:'town',
        description:'',
        shop:{
            weaponTiers:[0,0,1,2,3,4],
            carriedMaterials:['wood','copper','bronze','iron','steel'],
            fuelSlots:2,
            potionSlots:2
        },
        tavern:{
            fullMeal:6,
            morsel:1,
            rest:0
        },
        destinations:{
            north:{
                name:"Abandoned Village",
                symbol:'⌂',
                type:'dungeon',
                description:'',
            },
            south:{
                name:"Rat Nest",
                symbol:'Π',
                type:'dungeon',
                description:'',
            },
            east:{
                name:"Goblin Keep",
                symbol:'Π',
                type:'dungeon',
                description:'',
            },
            west:{
                name:"Dark Forest",
                symbol:'❧',
                type:'dungeon',
                description:'',
                destinations:{
                    west:"Gravehold"
                }
            },
        }
    },
}