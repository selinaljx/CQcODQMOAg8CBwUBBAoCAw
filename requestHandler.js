'use strict';

const config = require('./config');
const promise = require('bluebird');
const request = require('request');

/**
 * Exchage rate API config
 * @param {object} config - The configuration parameter
 * @param {object} config.ex - The exchange rate configuration parameter
 * @param {string} config.ex.API - The exchange rate API url
 */

/**
 * To get the exchage rate through calling API and return a callback function
 * @param  {string}   base - The currency to get to
 * @param  {string}   symbol - The currency to get from
 * @param  {Function} callback - The callback function to handle the rate and the error
 * @return {Function}
 */
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
			console.log('[getExchangeRate]request failed with status code ' + response.statusCode);
		}

		console.log('[getExchangeRate]' + callback_err);
		return callback(callback_err, rate);
	});
}


/**
 * To round off the currency rate to 2 decimal places
 * @param  {string|number} rate - The currency rate
 * @return {number}
 */
function roundoffRate(rate) {
	if (typeof rate === 'number') {
		return rate.toFixed(2);
	} else if (typeof rate === 'string') {
		return parseFloat(rate).toFixed(2);
	}

	return -1;
}

exports.getExchangeRate = promise.promisify(getExchangeRate);
