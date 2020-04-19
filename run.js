const { exec } = require('child_process');

setInterval(() => {
	exec(
		'npm run prod:build && npm run prod:maintain && npm run prod:start',
		(err, stdout, stderr) => {
			if (err) {
				console.error(err);
			} else {
				console.log(`stdout: ${stdout}`);
				console.log(`stderr: ${stderr}`);
			}
		}
	);
}, 1000 * 60 * 60 * 24);
