class Sound{
    static soundGroups = {
        hit:[new Audio('audio/hit.mp3')],
        hitStrong:[new Audio('audio/hitStrong.mp3')],
        hitWeak:[new Audio('audio/hitWeak.mp3')],
        crit:[new Audio('audio/crit.mp3'),new Audio('audio/crit2.mp3'),new Audio('audio/crit3.mp3')],
        brutalCrit:[new Audio('audio/brutalCrit.mp3'),new Audio('audio/brutalCrit2.mp3')],
        savageCrit:[new Audio('audio/savageCrit.mp3')],
        click:[new Audio('audio/click.mp3')],
        die:[new Audio('audio/die1.mp3'),new Audio('audio/die2.mp3')],
        dieSmall:[new Audio('audio/dieSmall1.mp3'),new Audio('audio/dieSmall2.mp3')],
        dieLarge:[new Audio('audio/dieLarge2.mp3'),new Audio('audio/dieLarge1.mp3')],
        monsterHit:[new Audio('audio/monsterHit.mp3')],
        monsterHitStrong:[new Audio('audio/monsterHitStrong.mp3')],
        monsterHitWeak:[new Audio('audio/monsterHitWeak.mp3')],
        softMove:[new Audio('audio/move1.mp3'),new Audio('audio/move2.mp3'),new Audio('audio/move3.mp3')],
        hardMove:[new Audio('audio/moveStone1.mp3'),new Audio('audio/moveStone2.mp3'),new Audio('audio/moveStone3.mp3')],
        rotate:[new Audio('audio/swing1.mp3'),new Audio('audio/swing2.mp3'),new Audio('audio/swing3.mp3')],
        getMoney:[new Audio('audio/getMoney.mp3')],
        take:[new Audio('audio/take3.mp3')],
        openBag:[new Audio('audio/openBag.mp3')],
        closeBag:[new Audio('audio/closeBag.mp3')],
        drawWeapon:[new Audio('audio/drawWeapon.mp3')],
        awayWeapon:[new Audio('audio/awayWeapon.mp3')],
        drop:[new Audio('audio/drop.mp3')],
        eat:[new Audio('audio/eat.mp3')],
        rotten:[new Audio('audio/rotten.mp3')],
        drink:[new Audio('audio/drink.mp3')],
        rewind:[new Audio('audio/rewind.mp3')],
        breakSword:[new Audio('audio/breakSword.mp3')],
        swordHit:[new Audio('audio/swordHit.mp3')],
        burn:[new Audio('audio/burn.mp3')],
        error:[new Audio('audio/error.mp3'),new Audio('audio/error.mp3'),new Audio('audio/error.mp3')],
        levelUp:[new Audio('audio/levelup.mp3')],
    }

    //tracks are judged to be appropriate based on vibe, scale, and setting.
    //In order for a track to be appropriate, each of its set attributes must match the present location.
    //vibe - undead/weird/serene/unset
    //scale - dungeon/town/world/unset
    //setting - indoors/outdoors/unset
    
    static tracks = {
        ambient1:{
            track: new Audio('audio/tracks/ambient_track_1.mp3'),

        },
        ambient2:{
            track: new Audio('audio/tracks/ambient_track_2.mp3'),
            setting:['indoors'],
        },
        ambientWeird:{
            track: new Audio('audio/tracks/ambient_track_weird.mp3'),
            vibe:['weird'],
            scale:['dungeon','world']
        },
        ambientOutside:{
            track: new Audio('audio/tracks/outdoors_ambiance.mp3'),
            setting:['outdoors'],
        },
        townHarp:{
            track: new Audio('audio/tracks/harp.mp3'),
            scale:['town','world'],
            unskippable:true
        },
        /*heroism:{
            track: new Audio('audio/tracks/HEROISM.mp3')
        },*/

    }

    static playingTrack = false;

    static lastPlayedTrackName = false

    static soundInit(){
        //adjust volumes
        let volumes = {
            drawWeapon:0.5,
            dieSmall:0.5,
            die:0.5,
            dieLarge:0.5,
            crit:0.1,
            brutalCrit:0.1,
            savageCrit:0.1,
            rotten:0.5,
            hardMove:0.8,
            levelUp:0.2,
            eat:0.5,

            ambient1:0.3,
            ambient2:0.3,
            ambientWeird:0.6,
            ambientOutside:0.5,
            heroism:0.3,
            townHarp:0.25
        }
        Object.entries(Sound.soundGroups).forEach(group=>{
            let soundGroup = group[1]
            let groupName = group[0];
            
            soundGroup.forEach(sound=>{
                //sound.volume = 0.5
                //sound.playbackRate = 0.6
                sound.addEventListener('ended', (e)=>{
                    //sound.load();
                })
                if(volumes[groupName]){
                    sound.volume = volumes[groupName]
                }
            })
            
        })
        Object.entries(Sound.tracks).forEach(track=>{
            let audioTrack = track[1].track
            let trackName = track[0];
            track[1].timesPlayed = 0;
            track[1].name = trackName;
            audioTrack.addEventListener('ended', (e)=>{
                Sound.playingTrack = false;
                Sound.lastPlayedTrackName = trackName;
                setTimeout(()=>{
                    Sound.playRandomTrack();
                },Random.roll(2,5)*100)
            })
            if(volumes[trackName]){
                audioTrack.volume = volumes[trackName]
            }
          
            
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

    static playGetMoney(){
        Sound.playSound(Sound.soundGroups.getMoney)
    }

    static playMove(){
        let playerPos = EntityManager.playerEntity;
        let floorType = Board.getFloor(playerPos.x,playerPos.y);
        let softFloors = ['dirt','grass']
        if(softFloors.includes(floorType)){
            Sound.playSound(Sound.soundGroups.softMove)
        }else{
            Sound.playSound(Sound.soundGroups.hardMove)
        }
    }

    static playNav(){
        Sound.playSound(Sound.soundGroups.hardMove)
    }

    static playRewind(){
        Sound.playSound(Sound.soundGroups.rewind)
    }

    static playRotate(){
        Sound.playSound(Sound.soundGroups.rotate)
    }

    static playBreakSword(){
        Sound.playSound(Sound.soundGroups.breakSword)
    }

    static playSwordHit(){
        //Sound.playSound(Sound.soundGroups.swordHit)
    }

    static playTake(){
        Sound.playSound(Sound.soundGroups.take)
    }

    static playOpenBag(){
        Sound.playSound(Sound.soundGroups.openBag)
    }

    static playCloseBag(){
        Sound.playSound(Sound.soundGroups.closeBag)
    }

    static playDrawWeapon(){
        Sound.playSound(Sound.soundGroups.drawWeapon)
    }

    static playAwayWeapon(){
        Sound.playSound(Sound.soundGroups.awayWeapon)
    }

    static playDrop(){
        Sound.playSound(Sound.soundGroups.drop)
    }

    static playDrink(){
        Sound.playSound(Sound.soundGroups.drink)
    }

    static playEat(){
        Sound.playSound(Sound.soundGroups.eat)
    }

    static playRotten(){
        Sound.playSound(Sound.soundGroups.rotten)
    }

    static playBurn(){
        Sound.playSound(Sound.soundGroups.burn)
    }

    static playError(){
        Sound.playSound(Sound.soundGroups.error)
    }

    static playLevelUp(){
        Sound.playSound(Sound.soundGroups.levelUp)
    }

    static playCrit(level){
        if(!level){return false}
        if(level==1){
            Sound.playSound(Sound.soundGroups.crit)
        }else if(level==2){
            Sound.playSound(Sound.soundGroups.brutalCrit)
        }else{
            Sound.playSound(Sound.soundGroups.savageCrit)
        }
    }

    static playSound(soundGroup){
        let sound = soundGroup[Random.roll(0,soundGroup.length-1)]
        sound.load();
        sound.play();
    }

    static playTrack(track){
        if(this.playingTrack){
            this.fadeOutTrack();
            this.playingTrack = false;
        }
        track.track.load();
        track.track.play();
        console.log('Playing '+track.name)
        track.timesPlayed += 1;
        this.playingTrack = track;
    }

    static playRandomTrack(){
        let fading = false;
        if(this.playingTrack){
            if(this.playingTrack.unskippable || this.trackIsAppropriate(this.playingTrack)){
                return false
            }
            this.fadeOutTrack();
            fading = true
            this.playingTrack = false;
        }
        let waitms = 0
        if(fading){waitms = 3000}

        let track = this.getAppropriateTrack()
        setTimeout(()=>{this.playTrack(track)}, waitms)
    }


    static fadeOutTrack(){
        let track = this.playingTrack;
        this.playingTrack = false;
        let volume = track.track.volume;
        //calls itself recursively on a timeout, resetting track when it reaches zero
        let lowerVolume = function(){
            let newVolume = track.track.volume - volume*0.02
            track.track.volume = Math.max(newVolume,0)
            console.log(track.track.volume)
            if(track.track.volume > 0){
                setTimeout(lowerVolume,100)
            }else{
                track.track.pause();
                track.track.volume = volume;
                track.track.currentTime = 0;
            }
        }

        lowerVolume();
    }

    //gets the appropriate track that has been played the least
    static getAppropriateTrack(){
        let appropriateTracks = [];
        //first, get a list of all appropriate tracks
        Object.entries(Sound.tracks).forEach(track=>{
            let trackObj = track[1]
            let trackName = track[0];
            if(Sound.lastPlayedTrackName != trackName && Sound.trackIsAppropriate(trackObj)){
                appropriateTracks.push(trackObj);
            }
        })

        //first randomize the order
        appropriateTracks.sort((a,b)=>{
            return(Random.roll(-1,1))
        })

        appropriateTracks.sort((a,b)=>{
            if(a.timesPlayed > b.timesPlayed){
                return 1;
            }else if(b.timesPlayed > a.timesPlayed){
                return -1
            }
            return 0;
        })

        return appropriateTracks[0]
    }


    //TODO - should check if vibe, setting, and scale are appropriate
    static trackIsAppropriate(track){
        //for now, hardcode town values while not in dungeon.
        let scale = 'town';
        let setting = {outdoors:true};
        let vibe = {serene:true};
        if(GameMaster.dungeonMode){
            let mapTypes = EntityManager.currentMap.mapTypes
            if(!mapTypes){return false}
            scale = mapTypes.scale
            setting = mapTypes.setting
            vibe = mapTypes.vibe
        }
        let appropriate = true;

        //track scale must match map scale
        if(track.scale && track.scale != scale){
            return false;
        }
        //Each track setting (indoors/outdoors) must be true for map
        if(track.setting){
            track.setting.forEach((trackSetting)=>{
                if(!setting[trackSetting]){
                    appropriate = false;
                }
            })
        }
       
        //each track vibe must be true for map
        if(track.vibe){
            track.vibe.forEach((trackVibe)=>{
                if(!vibe[trackVibe]){
                    appropriate = false;
                }
            })
        }
        
        return appropriate;
    }

}