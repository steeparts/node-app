const Cookies = require('cookies');
const url = require('url');

function auth(req, res) {
	var cookies = new Cookies(req, res);
	if (cookies.get('auth') !== undefined) {
		res.writeHead(302, {'Content-Type': 'text/plain', 'Location': '/game'});
		return res.end();
	} 
	else {
		const parsedUrl = url.parse(req.url, true);
		var mask = { style: ' ', error: ' '	};
		if (parsedUrl.query.err == 'already_exists') {
			mask.style = 'style="display: block"';
			mask.error = 'Пользователь с таким логином уже зарегистрирован';
		}

		if (parsedUrl.query.err == 'max_users_exceeded') {
			mask.style = 'style="display: block"';
			mask.error = 'Превышено максимальное количество пользователей на сервере';
		}

		res.render('auth.html', mask);
	} 
}

module.exports = auth;