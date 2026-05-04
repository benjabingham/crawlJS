class Sound{
    static hit = new Audio('audio/hit.mp3');
    static click = new Audio('audio/click.mp3')
    static die = new Audio('audio/die.mp3')

    static playHit(){

        Sound.hit.load();
        Sound.hit.play();

    }

    static playClick(){
        Sound.click.load();
        Sound.click.play();
    }

    static playDie(){
        Sound.die.load();
        Sound.die.play();
    }
}