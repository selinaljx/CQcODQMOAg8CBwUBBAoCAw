'use strict';

const config = require('./config');
//const promise = require('bluebird');
const co = require('co');
const mongodb = require('mongodb');

function DBManager() {
	this.Client = mongodb.MongoClient;
	this.URI = 'mongodb://' + config.mongodb.USER + ':' + config.mongodb.PASS + '@' + config.mongodb.URL + ':' + config.mongodb.PORT + '/' + config.mongodb.DATABASE;
}

DBManager.prototype.insertDocuments = function (documents) {
	let client = this.Client;
	let uri = this.URI;
	co(function* () {
		let db = yield client.connect(uri);
		let collection = db.collection('exchage_rate');
		let result = yield collection.insertOne(documents).catch(function (err) {
			db.close();
			throw err;
		});

		console.log('[dbManager]insert sucess: ' + JSON.stringify(result));
		db.close();
	}).catch(onError);
};

function onError(err) {
	console.log('[dbManager]' + err);
	throw err;
}

module.exports = DBManager;
