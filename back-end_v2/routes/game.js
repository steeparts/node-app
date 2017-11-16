const Cookies = require('cookies');
const url = require('url');

const tasks = require('../libs/tasks');
const crypto = require('../libs/crypto');

function game(req, res) {
	res.statusCode = 200;
	res.setHeader('Content-Type', 'text/html');

	var cookies = new Cookies(req, res);
	if (cookies.get('auth') !== undefined) {
		var currentUserLogin = cookies.get('auth');
		var interval = tasks.getInterval() || 15; // по умолчанию 15 минут между подсказками

		const users = require('../libs/users');
		var stationID = users.getUserActiveStationId(currentUserLogin);

		const parsedUrl = url.parse(req.url, true)
		var result = { 
			id: tasks.getOne(stationID+1).id,
			login: currentUserLogin,
			text: tasks.getOne(stationID+1).text,
			tooltip1: crypto.encryptText(tasks.getOne(stationID+1).tooltips[0], 'shkRqhijOdhTu6R2nsuvLoagxsZEYC2oLUBeNTre28J9Hisoj1Lh2ykQvBmT6gcq'),
			tooltip2: crypto.encryptText(tasks.getOne(stationID+1).tooltips[1], 'shkRqhijOdhTu6R2nsuvLoagxsZEYC2oLUBeNTre28J9Hisoj1Lh2ykQvBmT6gcq'),
			tooltip3: crypto.encryptText(tasks.getOne(stationID+1).tooltips[2], 'shkRqhijOdhTu6R2nsuvLoagxsZEYC2oLUBeNTre28J9Hisoj1Lh2ykQvBmT6gcq'),
			task_time: users.getUserStationStartTime(currentUserLogin, stationID+1),
			total_time: users.getUserStartTime(currentUserLogin),
			server_time: res.timer.sec(),
			interval: tasks.getInterval(),
			err_style: (parsedUrl.query.err) ? 'style="display: block"' : ' ',
			err_text: (parsedUrl.query.err) ? 'Неверный код станции' : ' '
		};

		res.render('game.html', result);
	}
	else {
		res.render('auth.html', { style: ' ', error: ' ' });
	}
}

module.exports = game;