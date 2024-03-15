class Random{

    //returns a random integer between min and max, inclusive
    static roll(min,max){
        return Math.floor(Math.random()*(max-min+1))+min;
    }
    
    //returns the sum of n random integers between min and max, inclusive
    static rollN(n, min,max){
        let sum = 0;
        for(let i = 0; i < n; i++){
            sum += Random.roll(min,max);
        }
        return sum;
    }

}