'use strict'

const redis = require('redis');
const nohm = require('nohm').Nohm;
require('../object_extend');
const assert = require('assert');
const {inspect} = require('util');

var UserModel;
var client;
var userInstance;

const testUserInfo = {
	id: 'yong',
	password: 123123
}

const unregisteredUserInfo = {
	id: 'yongyong',
	password: 123123
}

const removeList = [];



describe(`Nohm`, function() {

	describe(`# Connection`, function() {

		it(`Connect redis server and set it as nohm client`, function(done) {
			client = redis.createClient();
			client.on('connect', () => {
				nohm.setClient(client);
				done();
			});
		});

	});


	describe('# User Model tests', function() {

		it(`Load UserModel`, function() {
			assert.doesNotThrow( () => {
				UserModel = require('../models/UserModel');
			});
		});


		it(`Test overwritten findAndLoad method of UserModel class`, function(done) {
			UserModel.findAndLoad(testUserInfo.id, (err, user) => {
				if (user) {
					removeList.push(user);
				}
				done();
			});
		});


		it(`Delete sample items`, function(done) {
			if (removeList.length === 0) {
				done();
			}
			removeList.forEach( (instance, index) => {
				instance.remove( () => {
					if (index === removeList.length - 1) {
						done();
					}
				});
			});
		});


		it(`Create a user account`, function(done) {
			const user = nohm.factory('User');
			user.p(testUserInfo);

			console.log(`user properties: ${inspect(user.allProperties())}`);
			console.log(`user id: ${user.p('id')}`);

			user.save( err => {
				if (err === 'invalid') {;
					assert.ifError(user.error)
				} else {
					done(err);
				}
			});
		});


		it(`Login method test`, function(done) {
			UserModel.login(testUserInfo.id, testUserInfo.password, (err, user) => {
				userInstance = user;
				done(err);
			});
		});


		it(`Try to login with unregistered user information`, function(done) {
			UserModel.login(unregisteredUserInfo.id, unregisteredUserInfo.password, (err, user) => {
				done(user);
			});
		});


		it(`Test validPassword method`, function() {
			const isValidPassword = userInstance.validPassword(testUserInfo.password);
			assert(isValidPassword);
		});


		it(`Delete just the created one`, function(done) {
			userInstance.remove(err => {
				done(err);
			});
		});


		it(`Try to delete the created one again, it'd be throw error`, function(done) {
			userInstance.remove(err => {
				done(!err);
			});
		});

	});
});
