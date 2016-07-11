'use_strict'
var generateMessage = function(user){
	var message = user.first_name + ' ' + user.last_name;
	message += user.city ? '\nГород: ' + user.city.title : '';
	message += user.bdate ? '\nДата рождения: ' + user.bdate : ''; 
	message += '\nid: ' + user.id +
				'\n'+user.photo_max;
	return message;
}

var view = function(result, bot, chatId){
	var counter = 0;
	return function req(){
		if(counter === result.length) return bot.sendMessage(chatId, '/search - начать новый поиск.');
		bot.sendMessage(chatId,generateMessage(result[counter++]));
		setTimeout(req, 1000);
	}
}
module.exports = view;