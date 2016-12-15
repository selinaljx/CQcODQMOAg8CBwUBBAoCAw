'use strict';

const config = require('./config');
const fivebeans = require('fivebeans');

console.log('producer');

let payload = {
	from: 'USD',
	to: 'HKD'
};

let client = new fivebeans.client(config.beanstalkd.HOST, config.beanstalkd.PORT);

client.on('connect', onBeanstalkdConnect).on('error', onBeanstalkdError).on('close', onBeanstalkdClose);
client.connect();

function onBeanstalkdConnect() {
	console.log('beanstalkd connected');
	client.use(config.beanstalkd.TUBE_NAME, function (err, tubename) {
		console.log('try to use tube ' + config.beanstalkd.TUBE_NAME);
		if (err) {
			console.log('fail to use tube:' + err);
		} else {
			client.put(0, 0, 60, JSON.stringify([config.beanstalkd.TUBE_NAME, payload]), function (error, jobid) {
				console.log('submit the job');
				if (error) {
					console.log('fail to submit the job' + error);
				} else {
					console.log(jobid);
				}
			});
		}
	});
}

function onBeanstalkdError(err) {
	console.log(err);
}

function onBeanstalkdClose() {
	console.log('beanstalkd connection closed');
}

