const { exec } = require('child_process');

const date = new Date();
let currDate = date.getDate();

// Will run every hour
// Will only check for new Tweets and update GitHub repo if it is a new day
const hourly = () => {
	console.log('Checking for new Tweets and updating GitHub repo with new data...');
	const newDate = new Date();
	const tempDate = newDate.getDate();
	if (tempDate !== currDate) {
		currDate = tempDate;
		exec(
			'npm run prod:build && npm run prod:maintain && npm run prod:start',
			(err, stdout, stderr) => {
				if (err) console.error(err);
				else {
					console.log(stdout);
					console.log(stderr);
				}
			}
		);
	}
};
setInterval(hourly, 1000 * 60 * 60);
