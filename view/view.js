var request = require('request');

var getCityByUserPromise = function(user){
	return new Promise((resolve, reject)=>{
		if(user.city){
			var url = 'https://api.vk.com/method/database.getCitiesById?city_ids='+user.city+'&v=V';
			request(url, (err, res, body)=>{
				if (err) reject(err);
				user.city = JSON.parse(body).response[0].name;
				resolve(user);
			})
		}else{
			resolve('');
		}
	});
};

var generateMessage = function(user){
	var message = user.first_name + ' ' + user.last_name;
	message += user.city ? '\nГород: ' + user.city : '';
	message += user.bdate ? '\nДата рождения: ' + user.bdate : ''; 
	message += '\nid: ' + user.uid +
				'\n'+user.photo_max;
	return message;
}

var view = function(result, bot, chatId){
	var counter = 0;
	return function req(){
		if(counter === result.length){
			bot.sendMessage(chatId, '/search - начать новый поиск.');
			return;
		}
		user = result[counter];
		getCityByUserPromise(user)
			.then(user => {
				if(user.uid && user.photo_max) {
					bot.sendMessage(chatId,generateMessage(user));
				}
				counter++;
				setTimeout(req, 1000);
			})
			.catch(err=>{
				console.log(err);
			});
	}
}
module.exports = view;