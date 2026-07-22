keywordVars = {
    enraged:{
        hintText:'When a creature becomes enraged, it becomes more aggressive and may shake off any stuns affecting it.'
    },
    dazed:{
        hintText:'When a creature becomes dazed, it is stunned for an additional turn and it becomes slower and less aggressive.'
    },
    corroding:{
        hintText:"Attacking and defending against this creature has a chance to increase your weapon's degrade chance."
    },
    flickers:{
        hintText:"Each turn, your lantern's chance to dim increases. Flickering is an indication that it is likely to dim soon."
    },
    counterattack:{
        hintText:"You may counterattack an enemy when they attack you or your weapon without inflicting damage. costs 1 less stamina and stuns for +1 turn."
    },
    critical:{
        hintText:"Critical hits inflict double damage, and can be achieved through skills or by attacking stunned enemies."
    },
    proficiency:{
        hintText:"Your proficiency in a weapon determines how many times damage is rolled for each attack, with the highest rolled number being used. Enemies' attacks against that weapon make the same number of damage rolls, using the lowest."
    },
    swing:{
        hintText:"A swing is a strike that occurs when you rotate your weapon into a target."
    },
    jab:{
        hintText:"A target is jabbed when you strike them by advancing towards them."
    },
    strafe:{
        hintText:"A strafing strike is one that occurs when you strike while moving sideways or backwards diagonally"
    },
    draw:{
        hintText:"A draw strike occurs when you draw your weapon into a target."
    },
    "End the day":{
        hintText:"Some monsters will respawn, and you will Level Up if you have enough XP."
    },

    traits:{
        worn:{name:'worn', hintText:"This weapon has a higher degrade chance, and lower damage if it's sharp. It will become unuseable next time it degrades."},
        resistant:{name:'resistant', hintText:"This item can't be corroded"},
        unwieldy:{name:'unwieldy', hintText:"While this item is equipped, moving costs stamina."},
        ether:{name:'ether', hintText:"While this item is equipped, moving restores stamina."},
        cursed:{name:'cursed', hintText:"While this item is in your inventory, you must spend 1 additional luck to rewind. While it's equipped, you can't use luck."},
        damned:{name:'damned', hintText:"You can't use luck while this item is in your inventory."},
        wrecking:{name:'wrecking', hintText:"This item deals triple damage to objects."},

        preserved:{name:'preserved',hintText:"This food item is less likely to be rotten."},
        perishable:{name:'perishable',hintText:"This food item is more likely to be rotten."},
        rotten:{name:"rotten", hintText:"Eating this food item will decrease your hunger bar instead of raising it."},
        treasure:{name:"treasure", hintText:"This item has value not for its purpose, but for its rarity."},
        fuel:{name:"fuel", hintText:"This item can be burned in your lantern, producing light."},
        food:{name:"food", hintText:"You can eat this."},
        //accustomed:{name:'accustomed', hintText:"When attacking with this weapon, damage is rolled twice, with the higher roll being used."}
    
        vigorAspect:{name:"aspect of vigor", hintText:"As long as this item is in your quickbar, regain 1 additional stamina when you wait."},
        hungerAspect:{name:"aspect of hunger", hintText:"As long as this item is in your quickbar, whenever you attack, lose 1 hunger and regain 3 stamina."},
        furyAspect:{name:"aspect of fury", hintText:"As long as this item is in your quickbar, your critical hit chance increases by 10% for each point of health you're missing."},
        lucky:{name:"lucky",hintText:"While this item is equipped, luck has a 50% chance to be refunded on use."}
    },

    symbols:{
        cursed:{name:"cursed",symbol:'⚶',color:'darkPurple'},
        damned:{name:"damned",symbol:'⛧',color:'darkRed'},
        vigorAspect:{name: "Aspect of Vigor",color:"orange",symbol:'♃'},
        hungerAspect:{name: "Aspect of Hunger",color:"green",symbol:'♆'},
        furyAspect:{name: "Aspect of Fury",color:"red",symbol:'♅'},
        lucky:{name: "lucky",color:"green",symbol:'☘'},
        worn:{name:"degraded",symbol:'⤓'},
        proficient:{name:"proficient",symbol:'+'},
    }
}