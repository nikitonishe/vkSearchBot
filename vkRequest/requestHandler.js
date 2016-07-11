var request = require('request'),
	view = require('../view/view'),
	token = require('../config').vkToken;
	fields = require('../config').fields;

var generateForm = function(req){
	var form = req;
	if(!form.hometown) form.country = 1;
	form.fields = fields;
	form.access_token = token;
	return form;
}

var requestHandler = function(req, bot, chatId){
	var url = 'https://api.vk.com/method/users.search?v=V';
	var form = generateForm(req);
	console.log(form);
	request.post(url,{form: form},(err, res, body)=>{
		if(err) console.log(err);
		body=JSON.parse(body).response;
		if(!body || !body[0]){
			bot.sendMessage(chatId,'Ничего не найдено =(');
			return;
		}
		body.shift();
		view(body, bot, chatId)();	
	});
}

module.exports = requestHandler;