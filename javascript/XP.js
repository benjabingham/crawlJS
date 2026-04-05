class XP{
    static xp = 0;
    static skills = {
        hp: {},
        stamina: {},
        luck: {},
        hunger: {},
        swords: {},
        axes: {},
        blunt: {}
    };

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
                finalWeight /= this.skills[skill].level;
                finalWeight += 1;
                finalWeight = Math.floor(finalWeight);
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

    static levelUp(skill){
        this.skills[skill].level++;
    }

    static gainAttackXP(weapon,target){
        console.log(weapon);
        if(weapon.owner != 'player'){
            return false;
        }
        let skill = false;
        if(weapon.item.type.sword){
            skill = 'swords';
        }
        if(weapon.item.type.axe){
            skill = 'axes';
        }
        if(weapon.item.type.blunt){
            skill = 'blunt';
        }

        if(!skill){
            //give xp to strike type instead...?
            return false;
        }

        //TODO - if target is valid
        this.gain(skill,1,1)
    }

    static gainHPXP(amount){
        amount *=3;
        this.gain('hp',amount,amount);
    }

    static gainStaminaXP(amount){
        //multiply amount stamina spent by current percentage of stamina spent
        let percent = 1 - (Player.staminaPercent/100);
        let weightAmount = amount * percent;
        weightAmount /= 2;
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
}

