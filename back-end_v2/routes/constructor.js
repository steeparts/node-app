const tasks = require('../libs/tasks');

function constructor(req, res) {
	var _tasks = tasks.getAll();
	var result = { table_data: ' ', interval: tasks.getInterval() };
	for (var i = 0; i < tasks.getSize(); i++) {
		result.table_data += '\n<div class="table__row">' +
				'<div class="table__col col-c col-1">' + (i+1) + '</div>' +
				'<div class="table__col col-c col-4">' +
					'<input type="text" name="task" autocomplete="off" placeholder="Текст задания" value="' + (_tasks[i].text) + '" class="form__input table__input">' +
				'</div>' +
				'<div class="table__col col-c col-2">' +
					'<input type="text" name="code" autocomplete="off" placeholder="Код станции" value="' + (_tasks[i].code) + '" class="form__input table__input">' +
				'</div>' +
				'<div class="table__col col-c col-5">' +
					'<input type="text" name="tooltip1" autocomplete="off" placeholder="Подсказка №1" value="' + (_tasks[i].tooltips[0]) + '" class="form__input table__input">' +
					'<input type="text" name="tooltip2" autocomplete="off" placeholder="Подсказка №2" value="' + (_tasks[i].tooltips[1]) + '" class="form__input table__input">' +
					'<input type="text" name="tooltip3" autocomplete="off" placeholder="Подсказка №3" value="' + (_tasks[i].tooltips[2]) + '" class="form__input table__input">' +
				'</div>' +
			'</div><!-- /table__row -->\n';
	}

	res.render('constructor.html', result);
}

module.exports = constructor;