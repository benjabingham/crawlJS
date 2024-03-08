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

    static addMessage(message, messageClass = false, keywords = false){
        if(!Log.messages[Log.turnCounter]){
            Log.messages[Log.turnCounter] = [];
        }
        Log.messages[Log.turnCounter].unshift({
            message:message,
            fresh:true,
            messageClass: messageClass,
            keywords: keywords
        });
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
                    log.prepend(
                        $('<p>').text("> "+message.message).addClass((message.fresh) ? 'message-fresh' : 'message-old').addClass((message.messageClass) ? 'message-'+message.messageClass : '').on('mouseenter',()=>{
                            if(message.keywords){
                                message.keywords.forEach((keyword)=>{
                                    $('.hint-divs').append(
                                        $('<p>').text(keywordVars[keyword].hintText)
                                    )
                                })
                            }
                        }).on('mouseleave',()=>{
                            $('.hint-divs').html('');
                        }).addClass((message.keywords) ? 'message-keyword' : '')
                    )
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