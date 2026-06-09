class Random{

    //returns a random integer between min and max, inclusive
    static roll(min,max, adv=0){
        let roll = Math.floor(Math.random()*(max-min+1))+min;
        let maxMinFunc = (adv > 0) ? Math.max : Math.min;
        //roll adv more times, taking the highest result
        for(let i = 0; i < adv; i++){
            roll = maxMinFunc(roll,Random.roll(min,max))
        }

        return roll;
    }
    
    //returns the sum of n random integers between min and max, inclusive
    static rollN(n, min, max, adv = 0){
        let sum = 0;
        for(let i = 0; i < n; i++){
            sum += Random.roll(min,max,adv);
        }
        return sum;
    }

}