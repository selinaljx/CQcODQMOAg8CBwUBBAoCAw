'use strict';

const config = require('./config');
const co = require('co');
const mongodb = require('mongodb');


/**
 * Database config
 * @param {object} config - The configuration parameter
 * @param {object} config.mongodb - The mongodb configuration parameter
 * @param {string} config.mongodb.USER - The mongodb username
 * @param {string} config.mongodb.PASS - The mongodb password
 * @param {string} config.mongodb.HOST - The mongodb hostname
 * @param {number} config.mongodb.PORT - The mongodb port number
 * @param {string} config.mongodb.DATABASE - The mongodb database name
 * @param {string} config.mongodb.COLLECTION - The mongodb collection name
 * @property {object} Client - The mongodb client
 * @property {string} URI - The mongodb connection string
 */

/**
 * Create a new DB manager
 * @constructor
 */
function DBManager() {
	this.Client = mongodb.MongoClient;
	this.URI = 'mongodb://' + config.mongodb.USER + ':' + config.mongodb.PASS + '@' + config.mongodb.HOST + ':' + config.mongodb.PORT + '/' + config.mongodb.DATABASE;
}


/**
 * To insert data into mongodb
 * @param  {object} documents - The data to be inserted
 */
DBManager.prototype.insertDocuments = function (documents) {
	let client = this.Client;
	let uri = this.URI;
	co(function* () {
		let db = yield client.connect(uri);
		let collection = db.collection(config.mongodb.COLLECTION);
		let result = yield collection.insertOne(documents).catch(function (err) {
			db.close();
			throw err;
		});

		console.log('[dbManager]insert sucess: ' + JSON.stringify(result));
		db.close();
	}).catch(onError);
};

/**
 * To log exceptional error
 * @param  {object} err - The exceptional error
 */
function onError(err) {
	console.log('[dbManager]' + err);
}

module.exports = DBManager;
