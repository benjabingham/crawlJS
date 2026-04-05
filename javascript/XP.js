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
                weight: 0
            }
        });
    }

    static gain(skill, xp, weight){
        this.skills[skill].weight += weight;
        this.xp += xp;

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
        let skill;
        if(weapon.type.sword){
            skill = 'swords';
        }
        if(weapon.type.axe){
            skill = 'axes';
        }
        if(weapon.type.blunt){
            skill = 'blunt';
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
        amount *= percent;
        amount /= 2;
        this.gain('stamina',amount,amount)
    }

    static gainLuckXP(){
        this.gain('luck',3,7);
    }

    static gainHungerXP(){
        this.gain('hunger',2,5);
    }
}

