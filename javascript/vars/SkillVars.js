let skillVars = {
    hp:[
        {
            type:"raiseBarMax",
            bar:"hp",
            amount:2,
        },
        {
            type:"misc",
            category:"hp",
            name:"vitality",
            key:"vitality",
            description:"Gain +1 health when you rest."
        },
    ],
    stamina:[
        {
            type:"raiseBarMax",
            bar:"stamina",
            amount:2
        },
        {
            type:"misc",
            category:"stamina",
            name:"aerobics",
            key:"aerobics",
            description:"+1 stamina gain on wait."
        },
    ],
    luck:[
        {
            type:"raiseBarMax",
            bar:"luck",
            amount:2
        }
    ],
    hunger:[
        {
            type:"raiseBarMax",
            bar:"hunger",
            amount:2
        },
        {
            type:"misc",
            category:"hunger",
            name:"hangry",
            key:"hangry",
            description:"Your critical strike chance increases by 1% for each 1% of your hunger you're missing."
        },
    ],
    bulk:[
        {
            type:"raiseBarMax",
            bar:"bulk capacity",
            amount:2
        }
    ],
    swords:[
        {
            type:"advantage",
            attackType:"sword"
        }
    ],
    axes:[
        {
            type:"advantage",
            attackType:"axe"
        }
    ],
    blunt:[
        {
            type:"advantage",
            attackType:"blunt" 
        },
        {
            type:"misc",
            category:"blunt",
            name:"concussive blows",
            key:"concussiveBlows",
            description:"Blunt weapons get bonus max stun equal to 25% of their max damage."
        },
    ],
    long:[
        {
            type:"advantage",
            attackType:"long" 
        }
    ],
    edged:[
        {
            type:"misc",
            category:"edged",
            name:"cutting edge",
            key:"cuttingEdge",
            description:"Edged weapons that aren't degraded get +3 max damage."
        },
    ],
    improvised:[
        {
            type:"advantage",
            attackType:"improvised" 
        }
    ],
    simple:[
        {
            type:"advantage",
            attackType:"simple" 
        }
    ],
    unarmed:[
        {
            type:"advantage",
            attackType:"unarmed" 
        },
        {
            type:"critChance",
            attackType:"unarmed",
            chance:0.2 
        }
    ],
    swing:[
        {
            type:"critChance",
            attackType:"swing",
            chance: 0.2
        }
    ],
    jab:[
        {
            type:"critChance",
            attackType:"jab",
            chance: 0.2
        }
    ],
    draw:[
        {
            type:"critChance",
            attackType:"draw",
            chance: 0.2
        }
    ],
    strafe:[
        {
            type:"critChance",
            attackType:"strafe",
            chance: 0.2
        }
    ],
    counterattack:[
        {
            type:"critChance",
            attackType:"counterattack",
            chance: 0.35
        }
    ],
    sell:[
        {
            type:"misc",
            category:"sell",
            name:"trinket peddler",
            key:"trinketPeddler",
            description:"Sell all treasure for +1 gold."
        },
        {
            type:"misc",
            category:"sell",
            name:"appraiser",
            key:"appraiser",
            description:"Sell all treasure for +20% gold."
        },
    ],
    buy:[

    ],
    goblinoid:[
        {
            type:"misc",
            category:"goblinoid",
            name:"goblinoid anatomy",
            key:"anatomy",
            description:"+2 maximum stun time against goblinoid foes."
        }
    ],
    beast:[
        {
            type:"misc",
            category:"beast",
            name:"beast anatomy",
            key:"anatomy",
            description:"+2 maximum stun time against beasts."
        }
    ],
    undead:[
        {
            type:"misc",
            category:"undead",
            name:"undead anatomy",
            key:"anatomy",
            description:"+2 maximum stun time against undead."
        }
    ],
    ooze:[
        {
            type:"misc",
            category:"ooze",
            name:"ooze anatomy",
            key:"anatomy",
            description:"+2 maximum stun time against oozes."
        }
    ],
}