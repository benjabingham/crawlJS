class Log{

    static messages = {};
    static notices = [];
    static turnCounter = 0;
    static resetTurn = 0;

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
        if (Player.fatigueLevel == 1){
            Log.addMessage('You are fatigued! Max Bulk and Stamina decreased.','danger')
        }else if (Player.fatigueLevel > 1){
            Log.addMessage('You are fatigued! Max Bulk and Stamina decreased.','urgent')
        }
    }

    //turnOffset is used to print a message into a past or future turn.... Currently only used for rewind.
    static addMessage(message, messageClass = false, keyword = false, tipText = false, highlightID = -1,turnOffset = 0){
        let turn = Log.turnCounter+turnOffset;
        console.log(message)
        if(!Log.messages[turn]){
            Log.messages[turn] = [];
        }
        Log.messages[turn].unshift({
            message:message,
            fresh:true,
            messageClass: messageClass,
            keyword: keyword,
            tipText: tipText,
            highlightID:highlightID
        });
    }

    static addSpanMessage(message,messageClass = false, tipText=false,highlightID=-1){
        if(!Log.messages[Log.turnCounter]){
            Log.messages[Log.turnCounter] = [];
        }
        Log.messages[Log.turnCounter].unshift({
            message:'',
            spanMessage:message,
            fresh:true,
            messageClass: messageClass,
            tipText: tipText,
            highlightID:highlightID
        });
    }

    static addTip(){
        let tips = tipVars;

        let tip = tips[Random.roll(0,tips.length-1)]

        Log.addMessage("TIP - "+tip,'win');
    }

    static wipeLog(){
        Log.messages = {};
        Log.turnCounter = 0;
        Log.resetTurn = 0;
        $('.turn-message').remove();
        $('.day-counter').remove();
    }

    static printTurn(turn){   
        let messages = Log.messages[turn];
        $('.message-fresh').removeClass('message-fresh')
        $('.temp-turn-counter').remove();
        if(messages){
            if(messages.printed){
                return false;
            }
            let turnMessage = $('<div>').addClass('turn-'+turn+'-message turn-message')
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
                if(message.spanMessage){
                    messageElement.append(message.spanMessage)
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
                Board.getScale() == 'dungeon' ? $('<p>').text('Turn '+turn).addClass('turn-counter') : ""
            ).append($('<hr>'))
            messages.printed = true;
        }else{
            $('#log').prepend(
                Board.getScale() == 'dungeon' ? $('<div>').addClass('temp-turn-counter turn-counter').text('Turn '+turn).append($('<hr>')) : ""
            )
        }

        if(Board.getScale() == 'town'){
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
        console.log(Log.turnCounter)
        Log.messages[Log.turnCounter] = false;
        $('.turn-'+Log.turnCounter+'-message').remove();
        $('.turn-'+(Log.turnCounter-1)+'-message').remove();
        if(Log.messages[Log.turnCounter-1]){
            Log.messages[Log.turnCounter-1].printed = false
            Log.messages[Log.turnCounter-1].forEach((message)=>{
            message.fresh = true
        })
        }
        
        //Log.printTurn(Log.turnCounter-1)        
    }

    static peek(){
        return Log.messages[Log.turnCounter];
    }

    static sendCritMessage(crit){
        Sound.playCrit(crit);
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