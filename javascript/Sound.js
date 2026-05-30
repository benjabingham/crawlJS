class Sound{
    static sounds = {
        hit:new Audio('audio/hit.mp3'),
        click:new Audio('audio/click.mp3'),
        die:new Audio('audio/die.mp3')
    }


    static soundInit(){
        Object.entries(Sound.sounds).forEach(item=>{
            let sound = item[1]
            sound.addEventListener('ended', (e)=>{
                sound.load();
            })
        })
    }

    static playHit(){

        Sound.sounds.hit.load();
        Sound.sounds.hit.play();
    }

    static playClick(){
        Sound.sounds.hit.load();
        Sound.sounds.hit.play();
    }

    static playDie(){
        Sound.sounds.die.load();
        Sound.sounds.die.play();
    }

}