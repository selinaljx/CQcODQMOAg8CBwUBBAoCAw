'use strict';

const config = require('./config');
const promise = require('bluebird');
const co = require('co');
const fivebeans = promise.promisifyAll(require('fivebeans'));
const requestHandler = require('./requestHandler');
const DBManager = require('./dbManager');


/**
 * Beanstalkd config
 * @param {object} config - The configuration parameter
 * @param {obejct} config.beanstalkd - The beanstalkd configuration parameter
 * @param {string} config.beanstalkd.HOST - The beanstalkd hostname
 * @param {number} config.beanstalkd.PORT - The beanstalkd port number
 * @param {string} config.beanstalkd.TUBE_NAME - The beanstalkd tube name
 */


let retryCount = 0;
let successCount = 0;
let db = new DBManager();
let client = new fivebeans.client(config.beanstalkd.HOST, config.beanstalkd.PORT);

client.on('connect', onBeanstalkdConnect);
client.on('error', onBeanstalkdError);
client.on('close', onBeanstalkdClose);
client.connect();


/**
 * To handle beanstalkd connection
 */
function onBeanstalkdConnect() {
	co(function* () {
		let numwatched = yield client.watchAsync(config.beanstalkd.TUBE_NAME);
		console.log('# of tube wathcing: ' + numwatched);

		client.reserve(function (err, jobid, payload) {
			if (err) {
				throw err;
			}
			console.log(jobid + ' ' + payload);

			let json_rate = JSON.parse(payload);
			console.log('payload ' + JSON.stringify(json_rate[1]));

			co(function* () {
				if (retryCount === 3) {
					client.buryAsync(jobid, null, 60);
				} else if (successCount === 10) {
					client.destroyAsync(jobid);
				} else {
					let rate = yield requestHandler.getExchangeRate(json_rate[1].to, json_rate[1].from);
					if (rate >= 0) {
						let data = {};
						data.from = json_rate[1].from;
						data.to = json_rate[1].to;
						data.created_at = new Date();
						data.rate = rate.toString();
						db.insertDocuments(data);
						client.releaseAsync(jobid, 0, 60);
						successCount++;
					} else {
						client.releaseAsync(jobid, 0, 3);
						retryCount++;
					}
					client.connect();
				}
			}).catch(onError);
		});
	}).catch(onError);
}

/**
 * To handle beanstalkd error
 * @param  {object} err - The beanstalkd error
 */
function onBeanstalkdError(err) {
	console.log(err);
}

/**
 * To carring out handling in beanstalked closing state
 */
function onBeanstalkdClose() {
	console.log('beanstalkd connection closed');
}

/**
 * To log exceptional error
 * @param  {obejct} err - The exceptional error
 */
function onError(err) {
	console.log(err);
}
