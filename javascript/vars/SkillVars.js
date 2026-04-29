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
            description:"Gain +2 health when you rest.",
            amount:2
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
            description:"As long as you're at half hunger or below, your critical strike chance increases by 10% for each point of hunger you're missing."
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
            description:"Blunt weapons get bonus max stun equal to 30% of their max damage.",
            amount:.3
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
            amount:5,
            description:"Edged weapons that aren't degraded get +5 max damage."
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
            chance:0.25 
        }
    ],
    swing:[
        {
            type:"critChance",
            attackType:"swing",
            chance: 0.25
        }
    ],
    jab:[
        {
            type:"critChance",
            attackType:"jab",
            chance: 0.25
        }
    ],
    draw:[
        {
            type:"critChance",
            attackType:"draw",
            chance: 0.25
        }
    ],
    strafe:[
        {
            type:"critChance",
            attackType:"strafe",
            chance: 0.25
        }
    ],
    counterattack:[
        {
            type:"critChance",
            attackType:"counterattack",
            chance: 0.40
        }
    ],
    sell:[
        {
            type:"misc",
            category:"sell",
            name:"trinket peddler",
            key:"trinketPeddler",
            description:"Sell all treasure for +2 gold.",
            amount:2
        },
        {
            type:"misc",
            category:"sell",
            name:"trapper",
            key:"trapper",
            description:"Sell all pelts for +50% gold, rounded up."
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