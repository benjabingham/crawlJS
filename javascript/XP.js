class XP{
    static xp = 0;
    static skills = {
        hp: {},
        stamina: {},
        luck: {},
        hunger: {},
        bulk:{},
        swords: {},
        axes: {},
        blunt: {},
        long: {},
        edged:{},
        improvised:{},
        simple:{},
        swing: {},
        strafe: {},
        jab: {},
        draw: {},
        unarmed: {},
        counterattack:{},
        sell:{},
        goblinoid:{},
        beast:{},
        undead:{},
        ooze:{}
    };
    static threshold = 50;

    static XPInit(){
        console.log(this.skills);
        Object.keys(this.skills).forEach(skill => {
            this.skills[skill] = {
                level: 0,
                weight: 0,
                xpGained: 0
            }
        });

        XP.applyPerk(skillVars.simple[0],false)
        /*
        XP.applyPerk(skillVars.sell[0],false)
        XP.applyPerk(skillVars.sell[0],false)
       
        XP.applyPerk(skillVars.swords[0],false)
        XP.applyPerk(skillVars.unarmed[0],false)
        XP.applyPerk(skillVars.long[0],false)
        XP.applyPerk(skillVars.simple[0],false)
        XP.applyPerk(skillVars.edged[0],false)
        XP.applyPerk(skillVars.swing[0],false)
        XP.applyPerk(skillVars.sell[0],false)
        XP.applyPerk(skillVars.sell[0],false)
       
        XP.applyPerk(skillVars.swords[0],false)
        XP.applyPerk(skillVars.unarmed[0],false)
        XP.applyPerk(skillVars.long[0],false)
        XP.applyPerk(skillVars.simple[0],false)
        XP.applyPerk(skillVars.edged[0],false)
*/
        //XP.levelUp();
        //XP.openLevelupDialog();
        //XP.applyPerk(skillVars.swing[0])
    }

    static get xpPercent(){
        return Math.floor((XP.xp/XP.threshold)*100);
    }

    static gain(skill, xp, weight){
        console.log(skill);
        if(skill){
            this.skills[skill].weight += weight;
            this.skills[skill].xpGained += xp;
        }
        this.xp += xp;
        Display.fillBars();
        console.log({
            xp:this.xp,
            weights:this.skills
        })
    }

    //picks n skills, wieghted by each skill's weight. When picked, a skill's weight is reset to 0. Returns as array of strings.
    
    static getWeightedSkills(n){
        let chosenSkills = [];
        while(chosenSkills.length < n){
            //weightedSkills is an array of skill names. Each skill occurs a number of times equal to its weight.
            let weightSum = 0;
            Object.keys(this.skills).forEach(skill =>{
                weightSum += this.skills[skill].weight;
            })
            if(!weightSum){
                //push random skill to chosenskills
                let skills = Object.keys(this.skills);
                let skill = skills[Math.floor(Math.random()*skills.length)];
                while(chosenSkills.includes(skill)){
                    skill = skills[Math.floor(Math.random()*skills.length)]
                }
                chosenSkills.push(skill);
                continue;
            }
            let rand = Math.random()*weightSum;
            let skillString;
            let pointer = 0;
            let found = false;
            Object.keys(this.skills).forEach(skill =>{
                pointer += this.skills[skill].weight;
                if(rand <= pointer && !found){
                    chosenSkills.push(skill);
                    this.skills[skill].weight = 0;
                    found = true;
                }
            })
        }

        return chosenSkills;
    }

    static resetWeights(){
        Object.keys(this.skills).forEach(skill=>{
            this.skills[skill].weight = 0;
        })
    }

    static reduceWeights(){
        Object.keys(this.skills).forEach(skill=>{
            this.skills[skill].weight /= 2;
        })
    }

    static gainWeaponAttackXP(weapon,target, strikeType){
        if(weapon.owner != 'player'){
            return false;
        }
        let weaponSkills = []
        if(weapon.item.type.sword){
            weaponSkills.push('swords');
        }
        if(weapon.item.type.axe){
            weaponSkills.push('axes');
        }
        if(weapon.item.type.blunt){
            weaponSkills.push('blunt');
        }
        if(weapon.item.type.long){
            weaponSkills.push('long');
        }
        if(weapon.item.type.edged){
            weaponSkills.push('edged');
        }
        if(weapon.item.type.improvised){
            weaponSkills.push('improvised');
        }
        if(weapon.item.type.simple){
            weaponSkills.push('simple');
        }
        let strikeTypeXP = 1;
        if(target.isContainer || target.dead){
            return false;
        }

        if(target.parryable){
            this.gain("counterattack",1,1);
        }

        //split xp evenly among all relevant skills
        if(weaponSkills.length){
            let xp = 1/weaponSkills.length;
            weaponSkills.forEach(skill=>{
                this.gain(skill,xp,xp)
            })
        }else{
            //if there are no weaponskills, pass xp to striketype... Probably won't ever happen?
            strikeTypeXP++;
        }

        this.gain(strikeType,strikeTypeXP,strikeTypeXP)

    }

    static gainUnarmedAttackXP(target){
        if(!target.isContainer && !target.dead){
            if(target.parryable){
                this.gain("counterattack",1,1);
            }
            this.gain('unarmed',1,1);
        }
    }

    static gainHPXP(amount){
        amount *=3;
        this.gain('hp',amount,amount);
    }

    static gainStaminaXP(amount){
        //multiply amount stamina spent by current percentage of stamina spent
        let percentMissing = 1 - (Player.staminaPercent/100);
        let weightAmount = amount * percentMissing;
        weightAmount *= 0.75;
        amount /= 5;
        this.gain('stamina',amount,weightAmount)
    }

    static gainBulkXP(amount = 1){
        this.gain('bulk',0,amount)
    }

    static gainLuckXP(){
        this.gain('luck',3,7);
        console.log(this.skills.luck)
    }

    static gainHungerXP(){
        let percent = 1 - (Player.hungerPercent/100);
        let weightAmount = 5*percent;
        this.gain('hunger',2,weightAmount);
    }

    static gainSellXP(amount){
        let xpAmount = amount * 0.3
        let weightAmount = amount * 0.3
        this.gain('sell',xpAmount,weightAmount)
    }

    static gainFoeXP(entity){
        
        let enemyTypes = [];
        let possibleTypes = ["goblinoid","beast","undead","ooze"];
        possibleTypes.forEach(type=>{
            if(entity.types[type]){
                enemyTypes.push(type)
            }
        })

        let totalXp = entity.threshold/4;

        if(!enemyTypes.length){
            XP.gain(false,totalXp,0)
        }

        totalXp /= enemyTypes.length;
        enemyTypes.forEach(type=>{
            XP.gain(type,totalXp,totalXp)
        })
    }

    static checkLevelUp(){
        if(this.xp >= this.threshold){
            this.levelUp();
        }
    }

    //takes array of skill strings. Returns array containing random perk object for each.
    static getPerks(skillArray){
        let perks = [];
        skillArray.forEach(skill=>{
            perks.push(this.getPerk(skill))
        })

        return perks
    }

    //skill is string corresponding to a skill. Returns a random perk of that skill.
    static getPerk(skill){
        let perks = skillVars[skill];
        let perk = perks[Math.floor(Math.random()*perks.length)]
        return perk;
    }

    static levelUp(){
        //for now, just get one...
        console.log('Level up!')
        console.log(JSON.parse(JSON.stringify(this.skills)))
        let skillOptions = this.getWeightedSkills(3);
        let perkOptions = this.getPerks(skillOptions);
        XP.openLevelupDialog(perkOptions);
        this.reduceWeights();
        this.xp -= this.threshold;
        this.threshold +=30;
        this.threshold *= 1.25 
        Player.level++;
    }

    static openLevelupDialog(perkOptions){
        let modal = $("<div>").addClass("modal").append(
            $("<h2>").text("LEVEL UP")
        )

        perkOptions.forEach(perk =>{
            console.log(perk);
            let text = $('<text>');
            let oldVal = 0;
            let newVal = 0;
            let attackTypeSpan;
            switch(perk.type){
                case "raiseBarMax":
                    text.append("Increase "+perk.bar);
                    oldVal = Player.getMaxResource(perk.bar)
                    newVal = oldVal+perk.amount;
                    text.append(" ("+oldVal+" → "+newVal+")");
                    break;
                case "advantage":
                    attackTypeSpan = $('<span>').text(perk.attackType).addClass('keyword');
                    let proficiencySpan = $('<span>').text(" proficiency").addClass('keyword');
                    let weapons = LootManager.getWeaponsOfType(perk.attackType);
                    console.log(weapons);
                    let weaponNames = [];
                    weapons.forEach(weapon=>{
                        weaponNames.push(weapon.name)
                    })
                    console.log(weaponNames);
                    Display.setHintText(attackTypeSpan, weaponNames.join(", "));
                    Display.setHintText(proficiencySpan, keywordVars.proficiency.hintText);
                    text.append("Increase ").append(attackTypeSpan).append(proficiencySpan);
                    if(Player.perks[perk.attackType].advantage){
                        oldVal = Player.perks[perk.attackType].advantage;
                    }
                    newVal = oldVal + 1;
                    text.append(" ("+oldVal+" → "+newVal+")");
                    break;
                case "critChance":
                    attackTypeSpan = $('<span>').text(perk.attackType).addClass('keyword');
                    let critSpan = $('<span>').text(" crit chance").addClass('keyword');
                    if(keywordVars[perk.attackType]){
                        Display.setHintText(attackTypeSpan,keywordVars[perk.attackType].hintText);
                    }
                    Display.setHintText(critSpan,keywordVars.critical.hintText)
                    text.append("Increase ").append(attackTypeSpan).append(critSpan);
                    if(Player.perks[perk.attackType].critChance){
                        oldVal = Player.perks[perk.attackType].critChance;
                    }
                    newVal = oldVal + perk.chance;
                    oldVal *= 100;
                    oldVal = Number.parseFloat(oldVal).toFixed(0);
                    oldVal += "%";
                    newVal *= 100;
                    newVal = Number.parseFloat(newVal).toFixed(0);
                    newVal += "%";
                    text.append(" ("+oldVal+" → "+newVal+")")
                    break;
                case "misc":
                    let perkNameSpan = $('<span>').text(perk.name).addClass('keyword')
                    if(perk.description){
                        Display.setHintText(perkNameSpan,perk.description)
                    }
                    text.append('Gain perk - ').append(perkNameSpan)
                default:
            }

            modal.append(
                $('<div>').addClass('skill-option').append(text).on('click',(e)=>{
                    XP.applyPerk(perk)
                    Inventory.displayInventory();
                    Display.hideHintDiv();
                    modal.remove();
                })
            )
        })

        $("body").append(
            modal
        )
    }

    static applyPerk(perk, verbose = false){
        switch(perk.type){
            case "raiseBarMax":
                this.applyRaiseBarMax(perk, verbose);
                break;
            case "advantage":
                this.applyAdv(perk, verbose);
                break;
            case "critChance":
                this.applyCritChance(perk,verbose);
                break;
            case "misc":
                this.applyMisc(perk)
                break;
            default:
                console.log('PERK TYPE '+perk.type+' NOT RECOGNIZED')
        }

        Display.fillBars();
    }

    static applyRaiseBarMax(perk,verbose = false){
        console.log(perk.type + " " + perk.bar);
        if(verbose){
            alert("Your maximum " +perk.bar+" has increased.")
        }
        switch(perk.bar){
            case "stamina":
                Player.staminaMax += perk.amount;
                Player.changeStamina(perk.amount);
                break;
            case "hp":
                Player.healthMax += perk.amount;
                Player.changeHealth(perk.amount);
                break;
            case "luck":
                Player.luckMax += perk.amount;
                Player.changeLuck(perk.amount);
                break;
            case "hunger":
                Player.nourishmentMax += perk.amount;
                Player.changeNourishment(perk.amount);
                break;
            case "bulk capacity":
                Player.maxBulk += perk.amount;
                break;
            default:
                console.log('BAR '+perk.bar+' NOT RECOGNIZED')
        }
    }

    static applyAdv(perk, verbose = false){
        console.log(perk.type + " " + perk.attackType)
        if(verbose){
            alert("You have grown accustomed to using weapons that are "+perk.attackType+".")
        }
        if(Player.perks[perk.attackType].advantage){
            Player.perks[perk.attackType].advantage++;
        }else{
            Player.perks[perk.attackType].advantage = 1;
        }
    }

    static applyCritChance(perk, verbose = false){
        if(Player.perks[perk.attackType].critChance){
            Player.perks[perk.attackType].critChance += perk.chance;
        }else{
            Player.perks[perk.attackType].critChance = perk.chance;
        }

        let newCritChance = Math.floor(Player.perks[perk.attackType].critChance * 100);
        if(verbose){
            alert("Your "+perk.attackType+" attacks now have a "+newCritChance+"% crit chance.")
        }
    }

    static applyMisc(perk){
        if(!Player.perks[perk.category][perk.key]){
            Player.perks[perk.category][perk.key] = {
                name:perk.name,
                val:1,
                description:perk.description
            };
        }else{
            Player.perks[perk.category][perk.key].val ++;
        }
    }

    static getSnapshot(){
        let snapshot = {
            xp:this.xp,
            skills:this.skills,
            threshold:this.threshold
        }

        return JSON.stringify(snapshot)
    }

    static loadSnapshot(snapshot){
        snapshot = JSON.parse(snapshot)
        let luck = JSON.parse(JSON.stringify(this.skills.luck));
        this.xp = snapshot.xp;
        this.skills = snapshot.skills;
        this.threshold = snapshot.threshold;
        this.skills.luck = luck;
    }
}

