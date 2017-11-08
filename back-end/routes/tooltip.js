const tasks = require('../libs/tasks');
const url = require('url');

function tooltip(req, res) {
	var mask = { tooltip: ' ' };
	if (req.headers["x-requested-with"] == 'XMLHttpRequest') {
	    const parsedUrl = url.parse(req.url, true);
		var task_id = Number(parsedUrl.query.task_id);
		var tooltip_id = Number(parsedUrl.query.tooltip_id);
		var task = tasks.getOne(task_id);
		mask.tooltip = task.tooltips[tooltip_id-1];
	}

	res.render('tooltip.html', mask);
}

module.exports = tooltip;