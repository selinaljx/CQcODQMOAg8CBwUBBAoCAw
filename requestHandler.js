'use strict';

const config = require('./config');
const request = require('request');

function getExchangeRate(base, symbol, callback) {
	let ex_api = config.ex.API + '?base=' + base + '&symbols=' + symbol;

	request(ex_api, function (error, response, body) {
		console.log('calling api ' + ex_api);
		let rate = -1;
		let callback_err = error;

		if (!error && response.statusCode === 200) {
			let json_response = JSON.parse(body);
			rate = roundoffRate(json_response.rates[symbol]);
		} else if (!error) {
			callback_err = 'request failed with status code ' + response.statusCode;
		}

		console.log('[getExchangeRate]' + callback_err);
		return callback(callback_err, rate);
	});
}

function roundoffRate(rate) {
	if (typeof rate === 'number') {
		return rate.toFixed(2);
	} else if (typeof rate === 'string') {
		return parseFloat(rate).toFixed(2);
	}

	return -1;
}

exports.getExchangeRate = getExchangeRate;
