const http = require('http');
const fs = require('fs');

// Основные маршруты
const render = require('./libs/render');
const { public, home, constructor, auth, game, tooltip, notFound } = require('./routes');

const timer = require('./libs/timer');

http.ServerResponse.prototype.render = render;
http.ServerResponse.prototype.timer = timer;

http.createServer((req, res) => {
    if (req.url.match(/.(css|js)$/)) {
        public(req, res);
    } else if (req.url === '/') {
        res.writeHead(302, {'Content-Type': 'text/plain', 'Location': '/auth'});
        return res.end();
        //home(req, res);
    } else if (req.url === '/admin?key=HDyq8dfZ') {
        if (req.method === 'POST') {
            const tasks = require('./libs/tasks');
            tasks.update(req, res);
        }
        else
            constructor(req, res);
    } else if (req.url === '/auth') {
        if (req.method === 'POST') {
            const users = require('./libs/users');
            users.create(req, res);
        }
        else
            auth(req, res);
    } else if (req.url.startsWith('/auth?err')) {
        auth(req, res);
    } else if (req.url.startsWith('/game')) {
        if (req.method === 'POST') {
            const users = require('./libs/users');
            users.update(req, res);
        }
        else
            game(req, res);
    } else if (req.url.startsWith('/ajax/get_tooltip')) {
        tooltip(req, res);
    } else {
        notFound(req, res);
    }
}).listen(3000, () => {
    console.log('Сервер запущен');

    const del = require('del');
    del(['gdata/*']).then(paths => {
        const users = require('./libs/users');
        users.clear();
        console.log('Логи очищены');
    });

    if (!timer.isStarted())
        timer.start();
});