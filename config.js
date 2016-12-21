'use strict';

let config = {};

config.beanstalkd = {};
config.mongodb = {};
config.ex = {};

config.beanstalkd.HOST = 'challenge.aftership.net';
config.beanstalkd.PORT = 11300;
config.beanstalkd.TUBE_NAME = 'selinaljx';

config.mongodb.USER = 'exrate';
config.mongodb.PASS = '3xRatC1';
config.mongodb.HOST = 'ds013014.mlab.com';
config.mongodb.PORT = 13014;
config.mongodb.DATABASE = 'db-exrate';
config.mongodb.COLLECTION = 'exchange_rate';

config.ex.API = 'http://api.fixer.io/latest';

module.exports = config;
