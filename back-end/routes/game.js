const Cookies = require('cookies');
const url = require('url');

const tasks = require('../libs/tasks');

function game(req, res) {
	res.statusCode = 200;
	res.setHeader('Content-Type', 'text/html');

	var cookies = new Cookies(req, res);
	if (cookies.get('auth') !== undefined) {
		var currentUserLogin = cookies.get('auth');
		//console.log('Local user: ' + currentUserLogin);
		var interval = tasks.getInterval() || 15; // по умолчанию 15 минут между подсказками

		const users = require('../libs/users');
		var stationID = users.getUserActiveStationId(currentUserLogin);

		var htmlTooltips = ' ';
		var userTooltips = users.getUserTooltips(currentUserLogin);

		if (userTooltips.length > 0)
			for (var i = 0; i < userTooltips.length; i++)
				htmlTooltips += '\n<div class="form__tooltips-elem">' + (userTooltips[i]) + '</div><!-- /form__tooltips-elem -->\n';

		const parsedUrl = url.parse(req.url, true)
		var result = { 
			id: tasks.getOne(stationID+1).id,
			login: currentUserLogin,
			text: tasks.getOne(stationID+1).text,
			db_tooltips: htmlTooltips,
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