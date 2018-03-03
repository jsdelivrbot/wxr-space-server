'use strict'

const redis = require('redis');
const nohm = require('nohm').Nohm;
require('../object_extend');
const assert = require('assert');
const {inspect} = require('util');
const {UserModel, WorkspaceModel} = require('../models/Models');


describe(`Models.test.js`, function() {

	/*
	 * Connect to redis client
	 */
	describe(`# Connection init`, function() {

		it(`Connect redis server and set it as nohm client`, function(done) {
			const client = redis.createClient({db: 1});
			client.on('connect', () => {
				client.flushdb();
				nohm.setClient(client);
				done();
			});
		});

	});


	/*
	 * Test static methods of Model
	 */
	describe('# Test static methods', function() {

		let ids;
		let userInstance;


		it(`Test 'findAndLoadByName' method`, function(done) {
			UserModel.findAndLoadByName('user1')
				.then( instance => {
					assert.equal(!!instance, true);
				})
				.catch( reason => {
					assert.equal(reason, 'not found');
				})
				.then( () => done() );

		});


		it(`Test '_pSave' method`, function(done) {
			userInstance = nohm.factory('UserModel');
			userInstance.p({name:'u', password:123123});
			userInstance._pSave()
				.then( () => done() )
				.catch( reason => done(reason) );
		});


		it(`Test 'getAllLinks' method`, function(done) {
			let promisesArray = [];
			for (let i=0; i < 3; ++i) {
				const info = {name:`user_${i}`, password:123456};
				promisesArray.push(UserModel.newUser(info));
			}

			Promise.all(promisesArray)
				.then( users => {
					userInstance.link(users[0], 'a');
					userInstance.link(users[1], 'b');
					userInstance.link(users[2], 'c');
					return userInstance._pSave()
				})
				.then( userInstance => {
					return userInstance.getAllLinks('UserModel', ['a', 'b', 'c'])
				})
				.then( _ids => ids = _ids )
				.then( () => assert.equal(ids.length, 3) )
				.catch( reason => done(reason) )
				.then( () => done() );
		});


		it(`Test propagation ids`, function(done) {
			UserModel.propagateInstances(ids)
				.then( instances => assert.equal(instances.length, 3) )
				.catch( reason => done(reason) )
				.then( () => done() );
		});


		it(`Test 'findAndLoadAll' method`, function(done) {
			UserModel.findAndLoadAll()
				.then( instances => assert.equal(instances.length, 4) )
				.catch( reason => assert.fail(reason) )
				.then( () => done() );
		});

	});
});
