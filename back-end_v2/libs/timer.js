var _sec = 0,
    intervalID;

/* 
 * limit = false (таймер без ограничения длительности)
 * limit = true (таймер с ограничением длительности limitval)
 * limitval > 0 (если limit установлено в true)
 */
function start(limit = false, limitval = 0) { 
	if (limit) { // если задана продолжительность таймера
		if (limitval <= 0) {
			console.log('Таймер не был запущен. Ошибка параметров запуска.');
			return false;
		} else {
			intervalID = setInterval(() => { 
				_sec++;

				if (_sec == limitval)
					stop();

			}, 1000);
			console.log('Таймер запущен');
		}
	} else { // если не задана продолжительность таймера
		intervalID = setInterval(() => { _sec++; }, 1000);
		console.log('Таймер запущен');
	} 
}

function isStarted() { return (_sec != 0) ? true : false; }

function getSec() { return _sec; }

function stop() { clearInterval(intervalID); console.log('Таймер остановлен'); }

exports.start = start;
exports.isStarted = isStarted;
exports.sec = getSec;
exports.stop = stop;