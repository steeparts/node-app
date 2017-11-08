const fs = require('fs');
const path = require('path');

function public(req, res) {
	const ext = path.extname(req.url);
	const filename = '' + ext.replace('.', '') + '/' + req.url.replace(/^.*[\\\/]/, '');
	let contentType = '';

	switch(ext) {
		case '.css' : contentType = 'text/css'; break;
		case '.js' : contentType = 'text/javascript'; break;
		default : contentType = 'text/plain'; break;
	}

	res.statusCode = 200;
	res.setHeader('Content-Type', contentType);

	const stream = fs.createReadStream(path.resolve('public', filename));

	stream.pipe(res);
	stream.on('error', error => {
		console.log(error);
		if (error.code === 'ENOENT') {
			res.writeHead(404, {'Content-Type': 'text/plain'});
			res.end('Not Found');
		} else {
			res.writeHead(500, {'Content-Type': 'text/plain'});
			res.end(error.message);
		}
	});
}

module.exports = public;