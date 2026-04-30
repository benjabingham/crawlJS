class Log{

    static messages = {};
    static notices = [];
    static turnCounter = 0;

    static logInit(){
        $('#log-title').off().on('click',(e)=>{
            let log = $('#log')
            if(log.hasClass('log-reverse')){
                log.removeClass('log-reverse')
                $('#log-title').text('Log ↓')
            }else{
                log.addClass('log-reverse')
                $('#log-title').text('Log ↑')
            }
        })
    }

    static addNotice(notice){
        Log.notices.unshift(notice);
    }

    static clearNotices(){
        Log.notices = [];
    }

    static initialWarnings(){
        if (Player.exertion == 1){
            Log.addMessage('You are exerted! Stamina regen dereased.','danger')
        }else if (Player.exertion > 1){
            Log.addMessage('You are exhausted! Moving will cost stamina. Stamina regen decreased.','urgent')
        }
    }

    static addMessage(message, messageClass = false, keyword = false, tipText = false, highlightID = -1){
        if(!Log.messages[Log.turnCounter]){
            Log.messages[Log.turnCounter] = [];
        }
        Log.messages[Log.turnCounter].unshift({
            message:message,
            fresh:true,
            messageClass: messageClass,
            keyword: keyword,
            tipText: tipText,
            highlightID:highlightID
        });
    }

    static addTip(){
        let tips = [
            "Ogres are dangerous, but have limited interest in you unless you bother them. If you can't fight them, leave them alone!",
            "Remember you can move diagonally! This opens up many useful maneuvers in combat.",
            "Buying a proper meal fills your hunger bar completely.",
            "Luck regenerates when you rest, but very slowly. Use it sparingly!",
            "Weapon breaking is completely random - you can use luck to make your weapons last longer!",
            "Stunned enemies appear in lower case, and recieve guaranteed critical hits. Press the advantage!",
            "Scroll over an object with your mouse to see what it is.",
            "Scroll over a bolded keyword to see what it means.",
            "Objects like shrubs, tables, and bedrolls may contain treasure - push against them or destroy them to search them!",
            "Paper burns bright, but not very long. Burn it if you need a quick burst of light.",
            "The contents of unlabeled potions are undetermined until the moment you drink them. Use luck to make better use of them.",
            "Some lootable objects like shrubs and rat stashes have a chance to restock as days pass.",
            "Most oozes have a low sight radius. Keep your distance if you don't want to fight them.",
            "Corrosive(green) and absorbent(orange) oozes track your weapon instead of you. Put it away and they'll leave you alone!",
            "Black oozes follow the heat of your lantern. The lower your light, the lower their detection range.",
            "Smarter monsters will remember where they last saw you. Run around a corner and then hide to escape them.",
            "Heavier weapons make more sound. Use lighter weapons around sleeping enemies to remain undetected.",
            "Your proficiency with a weapon is represented by a number of '+'s next to that weapon's name. Scroll over the '+'s to learn more.",
            "Skills that are used more are more likely to be recieved as levelup rewards. This includes taking damage and using luck!",
            "Guaranteed crits are applied separately from crits from crit chance. They scale multiplicitively!"
        ]

        let tip = tips[Random.roll(0,tips.length-1)]

        Log.addMessage("TIP - "+tip,'win');
    }

    static wipeLog(){
        Log.messages = {};
        Log.turnCounter = 0;
        $('.turn-message').remove();
        $('.day-counter').remove();
    }

    static printTurn(turn){   
        console.log(turn);     
        let messages = Log.messages[turn];
        $('.message-fresh').removeClass('message-fresh')
        $('.temp-turn-counter').remove();
        if(messages){
            if(messages.printed){
                return false;
            }
            let turnMessage = $('<div>').attr('id','turn-'+turn+'-message').addClass('turn-message')
            $('#log').prepend(turnMessage);
            messages.forEach((message) => {
                let keyword = false;
                //only expect one keyword for now ...
                let messageElement;
                let tipText;
                if(message.keyword){
                    keyword = message.keyword;
                    let splitMessage = message.message.split(keyword);
                    messageElement = $('<div>').append(
                        $('<span>').text("> "+ splitMessage[0])
                    ).append(
                        $('<strong>').text(keyword).addClass('log-hoverable')
                    ).append(
                        $('<span>').text(splitMessage[1])
                    )
                    if(keywordVars[keyword]){
                        tipText = keywordVars[keyword].hintText;
                    }
                }else{
                    messageElement = $('<p>').text("> "+message.message).addClass('log-message-p');
                }
                if(message.tipText){
                    tipText = message.tipText;
                    if(!keyword){
                        messageElement.addClass('log-hoverable log-bold');
                    }
                }
                let highlightID = message.highlightID;
                if(highlightID != -1){
                    messageElement.addClass('log-hoverable');
                }
                messageElement.addClass((message.fresh) ? 'message-fresh' : 'message-old').addClass((message.messageClass) ? 'message-'+message.messageClass : '').on('mouseenter',()=>{
                    if(tipText){
                        $('.hint-divs').show().text(tipText).addClass('info');
                    }
                    if(highlightID != -1){
                        EntityManager.getEntity(highlightID).highlighted = true;
                        Display.printBoard();
                    }
                }).on('mouseleave',()=>{
                    Display.hideHintDiv();
                    if(highlightID != -1){
                        EntityManager.getEntity(highlightID).highlighted = false;
                        Display.printBoard();
                    }
                })

                

                turnMessage.prepend(messageElement)
                
                message.fresh = false;
            })
            turnMessage.prepend(
                GameMaster.dungeonMode ? $('<p>').text('Turn '+turn).addClass('turn-counter') : ""
            ).append($('<hr>'))
            messages.printed = true;
        }else{
            $('#log').prepend(
                GameMaster.dungeonMode ? $('<div>').addClass('temp-turn-counter turn-counter').text('Turn '+turn).append($('<hr>')) : ""
            )
        }

        if(!GameMaster.dungeonMode){
            Log.printDayToLog(true)
        }
    }

    static printDayToLog(temp){
        let classes = 'turn-counter day-counter'
        classes += temp ? ' temp-turn-counter' : '';
        $('#log').prepend(
                $('<div>').addClass(classes).text('Day '+ Save.day).append($('<hr>'))
            )
    }

    static printLog(){
        let log = $('#log');
        //log.html('');
        Log.printTurn(Log.turnCounter-1);

        Log.updateNotices();
    }

    static updateNotices(){
        $('.notice').remove();
        Log.notices.forEach((notice)=>{
            $('#log').prepend(
                $('<p>').text(notice).addClass('notice')
            )
        })
    }

    static rewind(){
        Log.messages[Log.turnCounter] = false;
        $('#turn-'+Log.turnCounter+'-message').remove();
        $('#turn-'+Log.turnCounter-1+'-message').addClass('message-fresh');
    }

    static peek(){
        return Log.messages[Log.turnCounter];
    }

    static sendCritMessage(crit){
        if(crit == 1){
            EntityManager.transmitMessage("Critical Hit!",'pos',"Critical Hit", keywordVars.critical.hintText);
        }else if(crit == 2){
            EntityManager.transmitMessage("Brutal Critical!",'pos',"Brutal Critical", "A brutal critical occurs if you recieve a crit from multiple sources (ex. from crit chance and by attacking a stunned enemy), and inflicts quadruple damage.");
        }else if(crit > 2){
            EntityManager.transmitMessage("SAVAGE CRITICAL!!!",'pos',"SAVAGE CRITICAL", "A savage critical occurs if you recieve a crit from THREE SEPARATE sources, and inflicts octuple damage.");
        }
    }

    static sendStrikeMessage(strikeType, weapon, target){
        let message = '';
        let tipText = '';
        switch (strikeType){
            case "swing":
                message = 'you swing your weapon into the '+target.name+"."
                tipText = keywordVars.swing.hintText;
                break;
            case "jab":
                message = "you jab the "+target.name+'.'
                tipText = keywordVars.jab.hintText;
                break;
            case "strafe":
                message = "you deliver a strafing strike to the "+target.name+"."
                strikeType = "strafing"
                tipText = keywordVars.jab.strafe;
                break;
            case "draw":
                message = 'you draw your weapon, striking the '+target.name+"."
                tipText = keywordVars.draw.hintText;
                break;
            default:    
                message = "you strike the "+target.name+".";
        }
        Log.addMessage(message,false,strikeType,tipText,target.id);
    }
}