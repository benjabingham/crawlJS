class Log{

    static messages = {};
    static notices = [];
    static turnCounter = 0;

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

    static addMessage(message, messageClass = false, keyword = false, tipText = false){
        if(!Log.messages[Log.turnCounter]){
            Log.messages[Log.turnCounter] = [];
        }
        Log.messages[Log.turnCounter].unshift({
            message:message,
            fresh:true,
            messageClass: messageClass,
            keyword: keyword,
            tipText: tipText
        });
    }

    static addTip(){
        let tips = [
            "Ogres are dangerous, but have limited interest in you unless you bother them. If you can't fight them, leave them alone!",
            "Remember you can move diagonally! This opens up many useful maneuvers in combat.",
            "Buying a proper meal fills your hunger bar completely.",
            "Luck regenerates when you rest, but very slowly. Use it sparingly!",
            "Weapon breaking is completely random - you can use luck to make your weapons last longer!",
            "Stunned enemies appear in lower case, and take double damage. Press the advantage!",
            "Scroll over an object with your mouse to see what it is.",
            "Scroll over a keyword in the log to see what it means.",
            "Objects like shrubs, tables, and bedrolls may contain treasure - push against them or destroy them to search them!",
            "Paper burns bright, but not very long. Burn it if you need a quick burst of light.",
            "The contents of unlabeled potions are undetermined until the moment you drink them. Use luck to make better use of them.",
            "Some lootable objects like shrubs and rat stashes have a chance to restock as days pass."
        ]

        let tip = tips[Random.roll(0,tips.length-1)]

        Log.addMessage("TIP - "+tip,'win');
    }

    static wipeLog(){
        Log.messages = {};
        Log.turnCounter = 0;
    }

    static printLog(){
        let log = $('#log');
        log.html('');
        for (const [turn, messages] of Object.entries(Log.messages)) {
            if(messages){
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
                        messageElement = $('<p>').text("> "+message.message);
                    }
                    if(message.tipText){
                        tipText = message.tipText;
                        if(!keyword){
                            messageElement.addClass('log-hoverable');
                        }
                    }
                    messageElement.addClass((message.fresh) ? 'message-fresh' : 'message-old').addClass((message.messageClass) ? 'message-'+message.messageClass : '').on('mouseenter',()=>{
                        if(tipText){
                            $('.hint-divs').append(
                                $('<p>').text(tipText)
                            )
                        }
                    }).on('mouseleave',()=>{
                        $('.hint-divs').html('');
                    })
                    log.prepend(messageElement)
                    message.fresh = false;
                })
                log.prepend(
                    $('<p>').text('Turn '+turn).addClass('turn-counter')
                )
            }
        }

        Log.notices.forEach((notice)=>{
            log.prepend(
                $('<p>').text(notice).addClass('notice')
            )
        })
    }

    static rewind(){
        Log.messages[Log.turnCounter] = false;
    }

    static peek(){
        return Log.messages[Log.turnCounter];
    }
}