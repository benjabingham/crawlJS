class Sound{
    static sounds = {
        hit:new Audio('audio/hit.mp3'),
        click:new Audio('audio/click.mp3'),
        die:new Audio('audio/die.mp3')
    }


    static soundInit(){
        Object.entries(Sound.sounds).forEach(sound=>{
            sound.onEnded = ()=>{
                //TODO - this doesnt work. Need to find a way to reload all sounds once they're done playing.
                console.log('done')
            }
        })
    }

    static playHit(){

        Sound.sounds.hit.load();
        Sound.sounds.hit.play();
    }

    static playClick(){
        Sound.sounds.click.load();
        Sound.sounds.click.play();
    }

    static playDie(){
        Sound.sounds.die.load();
        Sound.sounds.die.play();
    }
}