'use_strict'
var TelegramBot = require('node-telegram-bot-api'),
    requestHandler = require('./vkRequest/requestHandler'),
	token = require('./config').telToken;

var bot = new TelegramBot(token, {polling: true} ),
    currentUsers = [];

var cancelCurrentSearch = function(chatId){
    if(!currentUsers[chatId]){
        bot.sendMessage(chatId, 'Нет текущего поиска. /search - начать поиск');
        return;
    }
    delete currentUsers[chatId];
    bot.sendMessage(chatId, 'Поиск отменен. /search - начать новый поиск');
    return;
}

var startSearching = function(chatId){
    if(currentUsers[chatId]){
        bot.sendMessage(chatId, 'Поиск отменен.');
        delete currentUsers[chatId];
    }
    var options = {reply_markup: JSON.stringify({
                    keyboard: [[{ text: 'Пропустить' }]],
                    resize_keyboard: true
    })};
    currentUsers[chatId] = {};
    currentUsers[chatId].step = 'hometown';
    setTimeout(()=>{
        bot.sendMessage(chatId, 'В каком городе искать.', options);
    }, 500);
    return;
}

var sendHelp = function(chatId){
    return bot.sendMessage(chatId,  'Чтобы начать поиск напишите "/search".'+
                                    ' Затем я задам вопросы по критериям поиска.'+
                                    ' Если данный критерий не важен нажмите кнопку "Пропустить".'+
                                    ' Для отемны текущего поиска напишите "/cancel"');
}

var sendDefaultMessage = function(chatId){
    return bot.sendMessage(chatId, 'Привет! Я умею искать людей вконтакте.'+
                            '\n/search - начать поиск.'+
                            '\n/help   - помощь по поиску.'+
                            '\n/cancel - отмена поиска.');
}

bot.on('text', function(message){
    var chatId = message.chat.id,
        textMes = message.text;

    if(textMes === '/search') return  startSearching(chatId);
    if(textMes === '/help') return sendHelp(chatId);
    if(textMes === '/cancel') return cancelCurrentSearch(chatId);
    if(!currentUsers[chatId]) return sendDefaultMessage(chatId);

    if(currentUsers[chatId].step === 'hometown'){
        if(!textMes.match(/[а-яa-zё\s]+/i)) return bot.sendMessage(chatId, 'Какой-то странный город =(. Попробуйте еще раз.(напишите город)');
        if(textMes !== 'Пропустить') currentUsers[chatId].hometown = textMes.match(/[а-яa-zё\s]+/i)[0];
        currentUsers[chatId].step = 'q';
        return bot.sendMessage(chatId, 'Напишите имя и/или фамилию.');
    }

    if(currentUsers[chatId].step === 'q'){
        if(textMes !== 'Пропустить') currentUsers[chatId].q = textMes.match(/[а-яa-zё\s]+/i)[0];
        currentUsers[chatId].step = 'age_from';
        return bot.sendMessage(chatId, 'Пользователей c какого возраста искать?(Число)');
    }

    if(currentUsers[chatId].step === 'age_from'){
        if(!textMes[0].match(/[0-9]+/) && textMes !== 'Пропустить') return bot.sendMessage(chatId, 'Некорректный возраст.(Напишите число)');
        if(textMes !== 'Пропустить') currentUsers[chatId].age_from = textMes.match(/[0-9]+/)[0];
        currentUsers[chatId].step = 'age_to';
        return bot.sendMessage(chatId, 'Пользователей до какого возраста искать?(Число)');
    }

    if(currentUsers[chatId].step === 'age_to'){
        if(!textMes[0].match(/[0-9]+/) && textMes !== 'Пропустить') return bot.sendMessage(chatId, 'Некорректный возраст.(Напишите число)');
        if(textMes !== 'Пропустить') currentUsers[chatId].age_to = textMes.match(/[0-9]+/)[0];
        currentUsers[chatId].step = 'count';
        return bot.sendMessage(chatId, 'Отправьте максимальное количество пользователей, но не больше 100.(По умолчанию 20)');
    } 

    if(currentUsers[chatId].step === 'count'){
        if(!textMes[0].match(/[0-9]+/) && textMes !== 'Пропустить') return bot.sendMessage(chatId, 'Некорректное колличество.(Напишите число)');
        if(textMes !== 'Пропустить') currentUsers[chatId].count = +textMes.match(/[0-9]+/)[0] > 100 ? 100 : textMes.match(/[0-9]+/)[0] ;
        currentUsers[chatId].step = 'offset'
        return bot.sendMessage(chatId, 'Напишите смещение относительно первого найденного пользователя.(Число)');
    }

    if(currentUsers[chatId].step = 'offset'){
        if(!textMes[0].match(/[0-9]+/) && textMes !== 'Пропустить') return bot.sendMessage(chatId, 'Некорректное смещение.(Напишите число)');
        if(textMes !== 'Пропустить') currentUsers[chatId].offset = +textMes.match(/[0-9]+/)[0] > 100 ? 100 : textMes.match(/[0-9]+/)[0] ;
        var options = {reply_markup: JSON.stringify({
                    hide_keyboard: true
        })};
        delete currentUsers[chatId].step
        requestHandler(currentUsers[chatId], bot, chatId);
        delete currentUsers[chatId];
        return bot.sendMessage(chatId, 'Выполняю поиск...', options);
    }
});