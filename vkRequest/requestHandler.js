'use_strict'
var request = require('request'),
	view = require('../view/view'),
	token = require('../config').vkToken,
	fields = require('../config').fields;

var getCityIdPromise = function(cityTitle){
	return new Promise((resolve, reject)=>{
		if(cityTitle){
			var url = 'https://api.vk.com/method/database.getCities';
			var form = {country_id: 1,
						q: cityTitle,
						v: 5.52};
			cityTitle = cityTitle.charAt(0).toUpperCase() + cityTitle.substr(1);
			request.post(url,{form: form},(err, res, body)=>{
				if(err) return reject(err);
				body = JSON.parse(body).response.items;
				for(var i = 0, l = body.length; i < l; i++){
					if(body[i].title === cityTitle) resolve(body[i].id);
				}
				resolve();
			});
		}
		else resolve();
	});
};

var generateForm = function(req){
	var form = req;
	form.country = 1;
	form.fields = fields;
	form.access_token = token;
	return form;
};

var requestPromise = function(bot, chatId, url, form){
	return new Promise((resolve, reject)=>{
		request.post(url,{form: form},(err, res, body)=>{
			if(err) return reject(err);
			body = JSON.parse(body).response.items;
			if(!body || !body[0]) return bot.sendMessage(chatId,'Ничего не найдено =(. /search - начать новый поиск.');
			resolve(body);	
		});
	});
};

var requestHandler = function(req, bot, chatId){
	var url = 'https://api.vk.com/method/users.search?v=5.52';

	getCityIdPromise(req.hometown)
		.then((id)=>{
			req.city=id;
			var form = generateForm(req);
			return form;
		})
		.then((form)=>requestPromise(bot, chatId, url, form))
		.then(body=>view(body, bot, chatId)())
		.catch(err=>console.error(err));
};

module.exports = requestHandler;