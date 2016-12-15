'use strict';

const config = require('./config');
//const promise = require('bluebird');
//const co = require('co');
const fivebeans = require('fivebeans');
const requestHandler = require('./requestHandler');
const DBManager = require('./dbManager');

console.log('woker');

let base = 'HKD';
let symbol = 'USD';
let retryCount = 0;
let successCount = 0;
let db = new DBManager();
let client = new fivebeans.client(config.beanstalkd.HOST, config.beanstalkd.PORT);


client.on('connect', onBeanstalkdConnect).on('error', onBeanstalkdError).on('close', onBeanstalkdClose);
client.connect();

function onBeanstalkdConnect() {
	client.watch(config.beanstalkd.TUBE_NAME, function (err_w, numwatched) {
		console.log('watching client');
		if (err_w) {
			console.log('watch failed: ' + err_w);
		} else {
			console.log('number of tube watching: ' + numwatched);
			client.reserve(function (err_reserve, jobid, payload) {
				if (err_reserve) {
					console.log('fail to reserve: ' + err_reserve);
				} else {
					console.log('reserving job ' + jobid);

					let rateJSON = JSON.parse(payload);
					console.log('payload ' + rateJSON[1].to);

					if (retryCount === 1) {
						client.bury(jobid, null, 60, function (err_bury) {
							if (err_bury) {
								console.log('fail to bury job ' + jobid + ': ' + err_bury);
							} else {
								console.log('successfully bury job ' + jobid);
							}
						});
					} else if (successCount === 1) {
						client.destroy(jobid, function (err_d) {
							if (err_d) {
								console.log('fail to destroy: ' + err_d);
							} else {
								console.log('successfully destroy ' + jobid);
							}
						});
					} else {
						/* process the job */
						requestHandler.getExchangeRate(rateJSON[1].to, rateJSON[1].from, function (rate, err_req) {
							if (!err_req) { /* request api success */
								console.log(rate);

								let data = {};
								data.from = base;
								data.to = symbol;
								data.created_at = new Date();
								data.rate = rate.toString();

								db.insertDocuments(data); /* async */

								client.release(jobid, 0, 60, function (err_release) {
									if (err_release) {
										console.log('[Request success]fail to release job ' + jobid + ': ' + err_release);
									} else {
										console.log('successfully released with 60s delay ' + jobid);
									}
								});

								successCount++;
							} else { /* request api failed */
								console.log('fail to get get exchange rate: ' + err_req);
								client.release(jobid, 0, 3, function (err_release) {
									if (err_release) {
										console.log('[Request fail]fail to release job ' + jobid + ': ' + err_release);
									} else {
										console.log('successfully released with 3s delay ' + jobid);
									}
								});

								retryCount++;
							}
						});
						client.connect();
					}
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

function onError(err) {
	console.log(err);
}