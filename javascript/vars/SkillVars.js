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
        {
            type:"misc",
            category:"stamina",
            name:"final push",
            key:"finalPush",
            description:"Attacks that use your last point of stamina are guaranteed crits."
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
        {
            type:"misc",
            category:"hunger",
            name:"iron gut",
            key:"ironGut",
            amount:1,
            description:"Rotten food has no ill effect on you. Gain 1 luck whenever you eat rotten food."
        },
    ],
    bulk:[
        {
            type:"raiseBarMax",
            bar:"bulk capacity",
            amount:2
        },
        {
            type:"misc",
            category:"bulk",
            name:"familiar burden",
            key:"familiarBurden",
            amount:.75,
            description:"Weapons you're proficient in have their bulk decreased by 75%."
        },
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
            description:"Sell all pelts for +100% gold."
        },
        {
            type:"misc",
            category:"sell",
            name:"appraiser",
            key:"appraiser",
            description:"Sell all treasure for +20% gold."
        },
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
    dark:[
        {
            type:"misc",
            category:"dark",
            name:"lurker",
            key:"lurker",
            amount:3,
            description:"While you have no light, monsters treat you as if you were 3 tiles further away. (they will be less likely to notice you, and more likely to attack the wrong tile)"
        },
        {
            type:"misc",
            category:"dark",
            name:"night eyes",
            key:"nightEyes",
            amount:1,
            description:"+1 minimum sight range."
        },
    ],
    fuel:[
        {
            type:"misc",
            category:"fuel",
            name:"kindler",
            key:"kindler",
            amount:1,
            description:"Increase your light by an extra level whenever you burn fuel with a fuel strength of 1."
        },
        {
            type:"misc",
            category:"fuel",
            name:"burning fury",
            key:"burningFury",
            amount:.2,
            description:"your critical hits deal +10% damage for each level of light you have."
        },
    ],
    durability:[
        {
            type:"misc",
            category:"durability",
            name:"proper care",
            key:"properCare",
            amount:.75,
            description:"Weapons you are proficient in have their degrade chance decreased by 75%, with a minimum reduction of 1 percentage point."
        },
        {
            type:"misc",
            category:"durability",
            name:"disposable blows",
            key:"disposableBlows",
            amount:.5,
            description:"Each weapon's max damage is increased by an amount equal to half of its degrade chance. When determining if a weapon will degrade on attack, its max damage is added to its degrade chance."
        },
    ],
    potions:[
        {
            type:"misc",
            category:"potions",
            unique:true,
            name:"potions expert",
            key:"potionsExpert",
            description:"When you obtain an unlabeled potion, identify it."
        },
        {
            type:"misc",
            category:"potions",
            name:"little sips",
            key:"littleSips",
            amount:.5,
            description:"50% chance to not consume a potion when you drink it."
        },
    ]
}