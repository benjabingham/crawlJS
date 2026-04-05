class XP{
    static xp = 0;
    static skills = {
        hp: {},
        stamina: {},
        luck: {},
        hunger: {},
        swords: {},
        axes: {},
        blunt: {},
        long: {},
        edged:{},
        improvised:{},
        /*
        unarmed: {},
        swing: {},
        strafe: {},
        jab: {},
        draw: {},
        counterAttack:{}
        */
    };
    static threshold = 30;

    static XPInit(){
        console.log(this.skills);
        Object.keys(this.skills).forEach(skill => {
            this.skills[skill] = {
                level: 0,
                weight: 0,
                xpGained: 0
            }
        });
    }

    static gain(skill, xp, weight){
        console.log(skill);
        this.skills[skill].weight += weight;
        this.xp += xp;
        this.skills[skill].xpGained += xp;

        console.log({
            xp:this.xp,
            weights:this.skills
        })
    }

    //picks n skills, wieghted by each skill's weight. When picked, a skill's weight is reset to 0. Returns as array of strings.
    static getWeightedSkills(n){
        let chosenSkills = [];
        while(chosenSkills.length < n){
            //weightedSkills is an array of skill names. Each skill occurs a number of times equal to its weight plus 1.
            let weightedSkills = [];
            Object.keys(this.skills).forEach(skill =>{
                let finalWeight = this.skills[skill].weight;
                finalWeight /= (this.skills[skill].level+1);
                finalWeight += 1;
                finalWeight = Math.floor(finalWeight);
                console.log(finalWeight);
                for(let i = 0; i < finalWeight; i++){
                    weightedSkills.push(skill);
                }
            })
            let skill = weightedSkills[Math.floor(Math.random()*weightedSkills.length)];
            chosenSkills.push(skill);
            this.skills[skill].weight = 0;
        }

        return chosenSkills;
    }

    static resetWeights(){
        Object.keys(this.skills).forEach(skill=>{
            this.skills[skill].weight = 0;
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
        let strikeTypeXP = 1;
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

        //this.gain(strikeType,strikeTypeXP,strikeTypeXP)

        //TODO - if target is valid
    }

    static gainUnarmedAttackXP(target){
        //TODO - if target is valid
        this.gain(unarmed,1,1);
    }

    static gainHPXP(amount){
        amount *=3;
        this.gain('hp',amount,amount);
    }

    static gainStaminaXP(amount){
        //multiply amount stamina spent by current percentage of stamina spent
        let percent = 1 - (Player.staminaPercent/100);
        let weightAmount = amount * percent;
        //weightAmount /= 2;
        amount /= 5;
        this.gain('stamina',amount,weightAmount)
    }

    static gainLuckXP(){
        this.gain('luck',3,7);
    }

    static gainHungerXP(){
        let percent = 1 - (Player.hungerPercent/100);
        let weightAmount = 5*percent;
        this.gain('hunger',2,weightAmount);
    }

    //skills is array of strings which correspond to skills
    static getPerks(skills){

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
        let skillOptions = this.getWeightedSkills(1);
        let perkOptions = this.getPerks(skillOptions);
        let chosenPerk = perkOptions[0];
        this.applyPerk(chosenPerk)
        this.resetWeights();
        this.xp -= this.threshold;
        this.threshold *= 1.5;
    }

    static applyPerk(perk){
        switch(perk.type){
            case "raiseBarMax":
                this.applyRaiseBarMax(perk);
                break;
            case "weaponAdv":
                this.applyWeaponAdv(perk);
                break;
            default:
                console.log('PERK TYPE '+perk.type+' NOT RECOGNIZED')
        }
    }

    static applyRaiseBarMax(perk){
        console.log(perk.type + " " + perk.bar);
        alert("Your maximum " +perk.bar+" has increased.")
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
                //
                break;
            default:
                console.log('BAR '+perk.bar+' NOT RECOGNIZED')
        }
    }

    static applyWeaponAdv(perk){
        console.log(perk.type + " " + perk.weaponType)
        alert("You have grown accustomed to using weapons that are "+perk.weaponType+".")
        if(Player.perks[perk.weaponType].advantage){
            Player.perks[perk.weaponType].advantage++;
        }else{
            Player.perks[perk.weaponType].advantage = 1;
        }
    }
}

