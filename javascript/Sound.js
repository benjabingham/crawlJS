class Sound{
    static soundGroups = {
        hit:[new Audio('audio/hit.mp3')],
        hitStrong:[new Audio('audio/hitStrong.mp3')],
        hitWeak:[new Audio('audio/hitWeak.mp3')],
        click:[new Audio('audio/click.mp3')],
        die:[new Audio('audio/die1.mp3'),new Audio('audio/die2.mp3')],
        dieSmall:[new Audio('audio/dieSmall1.mp3'),new Audio('audio/dieSmall2.mp3')],
        dieLarge:[new Audio('audio/dieLarge2.mp3')],
        monsterHit:[new Audio('audio/monsterHit.mp3')],
        monsterHitStrong:[new Audio('audio/monsterHitStrong.mp3')],
        monsterHitWeak:[new Audio('audio/monsterHitWeak.mp3')],
        move:[new Audio('audio/move.mp3')],
        rotate:[new Audio('audio/rotate.mp3')],
    }


    static soundInit(){
        Object.entries(Sound.soundGroups).forEach(group=>{
            let soundGroup = group[1]
            soundGroup.forEach(sound=>{
                sound.addEventListener('ended', (e)=>{
                    sound.load();
                    console.log('load');
                })
            })
            
        })
    }

    static playPlayerHit(damage){
        let soundGroup;
        if(damage < 3){
            soundGroup = Sound.soundGroups.hitWeak;
        }else if (damage < 6){
            soundGroup = Sound.soundGroups.hit;
        }else{
            soundGroup = Sound.soundGroups.hitStrong;
        }
        this.playSound(soundGroup);
    }

    static playMonsterHit(damage){
        let soundGroup;
        if(damage < 3){
            soundGroup = Sound.soundGroups.monsterHitWeak;
        }else if (damage < 5){
            soundGroup = Sound.soundGroups.monsterHit;
        }else{
            soundGroup = Sound.soundGroups.monsterHitStrong;
        }
        this.playSound(soundGroup);
    }

    static playClick(){
        this.playSound(Sound.soundGroups.click)
    }

    static playDie(monsterEntity){
        let threshold = monsterEntity.threshold;
        let soundGroup
        if(threshold < 2){
            soundGroup = Sound.soundGroups.dieSmall
        }else if(threshold < 7){
            soundGroup = Sound.soundGroups.die
        }else{
            soundGroup = Sound.soundGroups.dieLarge
        }
        Sound.playSound(soundGroup);
    }

    static playMove(){
        Sound.playSound(Sound.soundGroups.move)
    }

    static playRotate(){
        Sound.playSound(Sound.soundGroups.rotate)
    }

    static playSound(soundGroup){
        let sound = soundGroup[Random.roll(0,soundGroup.length-1)]
        sound.load();
        sound.play();
    }

}