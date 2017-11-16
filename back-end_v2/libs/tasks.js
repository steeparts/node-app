const qs = require('querystring');

const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

// БД конфигурации станций
const stations_adapter = new FileSync('config.json');
const stations_db = low(stations_adapter);

stations_db.defaults({ interval: 15, tasks: [] }).write();

function getAll() {
    return stations_db.get('tasks').value();
}

function getAllIds() {
    return stations_db.get('tasks').map('id').value();
}

function getOne(id) {
    return stations_db.get('tasks').find({ id: id }).value();
}

function getInterval() {
    return stations_db.get('interval').value();
}

function getSize() {
    return stations_db.get('tasks').size().value();
}

function update(req, res) {
    var body = '';
    req.on('data', (chunk) => {
        body += chunk;
    });
    req.on('end', () => {
        var data = qs.parse(body);

        var tasksData = {
            interval: data.interval,
            tasks: []
        };

        for (var i = 0; i < data.task.length; i++) {
            tasksData.tasks.push({
                id: (i+1), 
                text: data.task[i],
                code: data.code[i],
                tooltips: [
                    data.tooltip1[i],
                    data.tooltip2[i],
                    data.tooltip3[i]
                ] 
            });
        }

        stations_db.set('interval', tasksData.interval)
                   .write();

        stations_db.set('tasks', tasksData.tasks)
                   .write();

        res.writeHead(302, {'Content-Type': 'text/plain', 'Location': '/admin?key=HDyq8dfZ'});
        return res.end();
    });    
}

function checkAnswer(id, code) {
    return (getOne(id).code == code) ? true : false;
}

module.exports = { getAll, getAllIds, getOne, getInterval, getSize, update, checkAnswer };