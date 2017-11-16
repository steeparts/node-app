const users = require('../libs/users');

function home(req, res) {

	var allUsers = users.getAllUsers();
	var result = { table_nodata: 'true', table_data: ' ' };

	if (allUsers.length > 0) {
		result.table_nodata = 'false';

		var cntCompletedUsers = 0;
		for (var i = 0; i < allUsers.length; i++) {
			if (allUsers[i].completed == true)
				cntCompletedUsers++;
		}

		if (cntCompletedUsers == allUsers.length) {
			for (var i = 0; i < allUsers.length; i++) {
				result.table_data += '\n<div class="table__row">' +
					'<div class="table__col col-1">' + (i+1) + '</div>' +
					'<div class="table__col col-8">' + (allUsers[i].login) + '</div>' +
					'<div class="table__col col-3">' + (users.getUserScore(allUsers[i].login)) + '</div>' +
				'</div><!-- /table__row -->\n';
			}
		}
		else {
			for (var i = 0; i < allUsers.length; i++) {
				result.table_data += '\n<div class="table__row">' +
					'<div class="table__col col-1">' + (i+1) + '</div>' +
					'<div class="table__col col-8">' + (allUsers[i].login) + '</div>' +
					'<div class="table__col col-3">' + (users.getUserProgress(allUsers[i].login)) + '</div>' +
				'</div><!-- /table__row -->\n';
			}
		}
	}

	res.render('index.html', result);
}

module.exports = home;