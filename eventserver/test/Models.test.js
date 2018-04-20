'use strict'

const redis = require('redis');
const nohm = require('nohm').Nohm;
require('../object_extend');
const assert = require('assert');
const {UserModel} = require('../models/Models');


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
		const userInfo_1 = {
			email: 'yong@gmail.com',
			name: 'yong',
			password: '123123',
		};


		it(`Test '_pFindAndLoad' method`, function(done) {
			UserModel._pFindAndLoad({email: userInfo_1.email})
				.then( instances => assert.equal(instances.length, 0) )
				.catch( reason => assert.fail(reason) )
				.then( () => done() );
		});


		it(`Test '_pSave' method`, function(done) {
			userInstance = nohm.factory('UserModel');
			userInstance.p(userInfo_1);
			userInstance._pSave()
				.catch( reason => assert.fail(reason) )
				.then( instance => {
					console.log(instance);
					done();
				} );
		});


		it(`Test again '_pFindAndLoad' method`, function(done) {
			UserModel._pFindAndLoad({email: userInfo_1.email})
				.then( instances => assert.equal(instances[0].p('email'), userInfo_1.email) )
				.catch( reason => assert.fail(reason) )
				.then( () => done() );
		});


		it(`Test 'findAndLoadAll' method`, function(done) {
			UserModel.findAndLoadAll()
				.then( instances => assert.equal(instances.length, 1) )
				.catch( reason => assert.fail(reason) )
				.then( () => done() );
		});


		it(`Test 'findAndLoadByName' method`, function(done) {
			UserModel.findAndLoadByName(userInfo_1.name)
				.then( instane => assert.equal(instane.p('name'), userInfo_1.name) )
				.catch( reason => assert.fail(reason) )
				.then( () => done() );
		});


		it(`Test 'getAllLinks' method`, function(done) {
			let promisesArray = [];
			for (let i=0; i < 3; ++i) {
				const info = {email: `${userInfo_1.email}_${i}`, name: userInfo_1.name, password: userInfo_1.password};
				promisesArray.push(UserModel.create(info));
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
				.catch( reason => assert.fail(reason) )
				.then( () => done() );
		});


		it(`Test propagation ids`, function(done) {
			UserModel.propagateInstances(ids)
				.then( instances => assert.equal(instances.length, 3) )
				.catch( reason => assert.fail(reason) )
				.then( () => done() );
		});


	});
});
