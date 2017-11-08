const Cookies = require('cookies');
const fs = require('fs');
const qs = require('querystring');

const tasks = require('../libs/tasks');
const date_time = require('../libs/date_time');

const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

// БД конфигурации пользователей с текущим игровым положением
const users_adapter = new FileSync('gdata/gamelog.json');
const users_db = low(users_adapter);

users_db.defaults({ users: [] }).write();

function clear() {
    return users_db.set('users', []).value();
}

function create(req, res) {
    if (getAllUsers().length == 10) {
        res.writeHead(302, {'Content-Type': 'text/plain', 'Location': '/auth?err=max_users_exceeded'});
        return res.end();
    }

    var body = '';
    req.on('data', (chunk) => {
        body += chunk;
    });
    req.on('end', () => {
        var data = qs.parse(body);        
        var login = data.login;

        if (users_db.get('users').map('login').value().indexOf(data.login) != -1) {
            res.writeHead(302, {'Content-Type': 'text/plain', 'Location': '/auth?err=already_exists'});
            return res.end();
        }

        var cookies = new Cookies(req, res);
        cookies.set('auth', login, { maxAge: 1*24*60*60*1000 }); // cookies.maxAge = 1 day

        var startStationID = getStartStation(login, res.timer.sec());

        var userData = {
            login: login,
            stations: [],
            start: res.timer.sec(),
            completed: false,
            score: '-'
        };

        for (var i = 0; i < tasks.getSize(); i++)
            userData.stations.push({
                id: (i+1),
                active: (i == startStationID) ? true : false,
                start: (i == startStationID) ? res.timer.sec() : '',
                finished: false,
                tooltips: []
            });

        users_db.get('users')
                .push(userData)
                .write();

        res.writeHead(302, {'Content-Type': 'text/plain', 'Location': '/game'});
        return res.end();
    });
}

function update(req, res) {
    var body = '';
    req.on('data', (chunk) => {
        body += chunk;
    });
    req.on('end', () => {
        var data = qs.parse(body);

        var login = data.login;
        var code = data.code;
        var currentStationID = Number(data.stationID) || getUserActiveStationId(login);
        var isCorrect = tasks.checkAnswer(currentStationID, code);
        if (isCorrect) {
            if (currentStationIsLast(login)) {
                users_db.get('users')
                        .find({ login: login })
                        .assign({ completed: true, score: data.score })
                        .write();

                users_db.get('users['+getUserId(login)+'].stations')
                        .find({ id: currentStationID })                        
                        .assign({ active: false, finished: true })
                        .write();

                var cookies = new Cookies(req, res);
                cookies.set('auth', '');

                writeToUsersLog(date_time.getCurrentDateTime() + ' user ' + login + ' has ended the game with score = ' + getUserScore(login));

                res.writeHead(302, {'Content-Type': 'text/plain', 'Location': '/finish'});
                return res.end();
            }
            else {
                users_db.get('users['+getUserId(login)+'].stations')
                        .find({ id: currentStationID })                        
                        .assign({ active: false, finished: true })
                        .write();
                
                var nextStationID = getNextStation(login, res.timer.sec());

                users_db.get('users['+getUserId(login)+'].stations')
                        .find({ id: nextStationID+1 })                        
                        .assign({ active: true, start: res.timer.sec() })
                        .write();

                res.writeHead(302, {'Content-Type': 'text/plain', 'Location': '/game'});
                return res.end();
            }            
        }
        else {
            res.writeHead(302, {'Content-Type': 'text/plain', 'Location': '/game?err=incorrect_code'});
            return res.end();
        }       
    });
}

function getAllUsers() {
    return users_db.get('users').value();
}

// not for export
function getAllActiveUsers() {
    return users_db.get('users').filter({ completed: false }).value();
}

// not for export
function getUserId(login) {
    var allUsers = getAllUsers();
    for (var i = 0; i < allUsers.length; i++) {
        if (allUsers[i].login == login)
            return i;
    }
}

// not for export
function currentStationIsLast(login) {
    return (notFinishedStations(login).length == 1) ? true : false;
}

// поиск подходящей станции

// not for export
// st - current server timer in sec
function getStartStation(login, st) {
    var allUsers = getAllActiveUsers();
    if (allUsers.length == 0) {
        writeToUsersLog(date_time.getCurrentDateTime() + ' user ' + login + ' connected on the 1 station');
        return 0;
    }
    else {
        var uOS = { }; // usersOnStations
        for (var i = 0; i < tasks.getSize(); i++)
            uOS[i] = [];

        for (var i = 0; i < allUsers.length; i++) {
            var activeStationId = getUserActiveStationId(allUsers[i].login);
            var activeStationTime = getUserStationStartTime(allUsers[i].login, activeStationId+1);
            uOS[activeStationId].push(st - activeStationTime);
        }

        for (var i = 0; i < tasks.getSize(); i++) {
            if (uOS[i].length == 0) {
                writeToUsersLog(date_time.getCurrentDateTime() + ' user ' + login + ' connected on the ' + (i+1) + ' station');
                return i;
            }
        }

        var tmp_arr = { indx: [], val: [] };
        for (var i = 0; i < tasks.getSize(); i++) {
            if (uOS[i].length == 1) {
                tmp_arr.indx.push(i);
                tmp_arr.val.push(uOS[i]);
            }
        }

        var iMax = 0;
        var Max = Number(tmp_arr.val[iMax]);
        for (var i = 0; i < tmp_arr.val.length; i++) {
            if (Number(tmp_arr.val[i]) >= Max) {
                Max = Number(tmp_arr.val[i]);
                iMax = Number(tmp_arr.indx[i]);
            }
        }
        writeToUsersLog(date_time.getCurrentDateTime() + ' user ' + login + ' connected on the ' + (iMax+1) + ' station');
        return iMax;
    }
}

// not for export
function notFinishedStations(login) {
    return users_db.get('users['+getUserId(login)+'].stations')
                   .filter({ finished: false })
                   .map('id')
                   .value();
}

// not for export
function addTofS(obj, _stationID, _time) {
    for (var i = 0; i < obj.val.length; i++) {
        if (obj.indx[i] == _stationID)
            obj.val[i].push(_time);
    }
}

// not for export
function getNextStation(login, st) {
    var notFinished = notFinishedStations(login);    
    var allUsers = getAllActiveUsers();

    if (allUsers.length == 1) {
        writeToUsersLog(date_time.getCurrentDateTime() + ' user ' + login + ' moved on the ' + (notFinished[0]) + ' station');
        return notFinished[0]-1;
    }
    else {
        var fS = { indx: [], val: [] }; // freeStations for user 'login'
        for (var i = 0; i < notFinished.length; i++) {
            fS.indx[i] = notFinished[i]-1;
            fS.val[i] = [];
        }

        console.log('All active users: ');

        for (var i = 0; i < allUsers.length; i++) {
            if (allUsers[i].login !== login) {
                var activeStationId = getUserActiveStationId(allUsers[i].login);
                var activeStationTime = getUserStationStartTime(allUsers[i].login, activeStationId+1);
                console.log(allUsers[i].login + ': ' +  activeStationId + ' -> ' + (st - activeStationTime));
                addTofS(fS, activeStationId, (st - activeStationTime));
            }
        }

        for (var i = 0; i < notFinished.length; i++) {
            if (fS.val[i].length == 0) {
                writeToUsersLog(date_time.getCurrentDateTime() + ' user ' + login + ' moved on the ' + (fS.indx[i]+1) + ' station');
                return fS.indx[i];
            }
        }

        var tmp_arr = { indx: [], val: [] };
        for (var i = 0; i < notFinished.length; i++) {
            if (fS.val[i].length == 1) {
                tmp_arr.indx.push(fS.indx[i]);
                tmp_arr.val.push(fS.val[i]);
            }
        }


        var iMax = 0;
        var Max = Number(tmp_arr.val[iMax]);
        for (var i = 0; i < tmp_arr.val.length; i++) {
            if (Number(tmp_arr.val[i]) >= Max) {
                Max = Number(tmp_arr.val[i]);
                iMax = Number(tmp_arr.indx[i]);
            }
        }
        writeToUsersLog(date_time.getCurrentDateTime() + ' user ' + login + ' moved on the ' + (iMax+1) + ' station');
        return iMax;
    }
}

function getUserStartTime(login) {
    return users_db.get('users').find({ login: login }).value().start;
}

function getUserActiveStationId(login) {
    var uStations = users_db.get('users').find({ login: login }).value().stations;
    for (var i = 0; i < uStations.length; i++) {
        if (uStations[i].active == true) {
             return uStations[i].id-1;
        }
    }
}

function getUserStationStartTime(login, id) {
    var uStations = users_db.get('users').find({ login: login }).value().stations;
    for (var i = 0; i < uStations.length; i++) {
        if (uStations[i].id == id) {
             return uStations[i].start;
        }
    }
}

function getUserProgress(login) {
    var uStations = users_db.get('users').find({ login: login }).value().stations;
    var progress = 0;
    for (var i = 0; i < uStations.length; i++) {
        if (uStations[i].finished == true) {
             progress++;
        }
    }
    return progress + ' / ' + uStations.length;
}

function getUserScore(login) {
    return users_db.get('users').find({ login: login }).value().score;
}

function getUserTooltips(login) {
    return users_db.get('users['+getUserId(login)+'].stations')
                   .find({ id: getUserActiveStationId(login)+1 })
                   .value().tooltips;
}

function writeTooltip(login, tooltip_id, tooltip_text) {

    var userTooltipList = users_db.get('users['+getUserId(login)+'].stations')
                                  .find({ id: getUserActiveStationId(login)+1 })
                                  .value().tooltips;

    var tooltipsData = (userTooltipList.length == 0) ? [] : userTooltipList;

    tooltipsData[tooltip_id-1] = tooltip_text;

    return users_db.get('users['+getUserId(login)+'].stations')
                   .find({ id: getUserActiveStationId(login)+1 })
                   .set('tooltips', tooltipsData)
                   .write();
}

// not for export
function writeToUsersLog(log) {
    log += '\n';
    var usersLogFile = 'gdata/userslog.txt';
    fs.mkdir('gdata', () => {
        fs.appendFile(usersLogFile, log, 'utf-8', (error) => {
            if (error) console.log(error);
        });
    });
}

module.exports = {
    clear,
    create,
    update,
    getAllUsers,
    getUserStartTime,
    getUserActiveStationId,
    getUserStationStartTime,
    getUserProgress,
    getUserScore,
    getUserTooltips,
    writeTooltip
};