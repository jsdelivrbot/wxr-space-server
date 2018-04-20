'use strict'

const redis = require('redis');
const nohm = require('nohm').Nohm;
require('../object_extend');
const assert = require('assert');
const {inspect} = require('util');
const {UserModel, WorkspaceModel, DeviceModel} = require('../models/Models');



let client;
describe(`WorkspaceModel.test.js`, function() {

	/*
	 * Connect to redis client
	 */
	describe(`# Connection init`, function() {

		it(`Connect redis server and set it as nohm client`, function(done) {
			client = redis.createClient({db: 1});
			client.on('connect', () => {
				client.flushdb();
				nohm.setClient(client);
				done();
			});
		});

	});


	/*
	 * Test Device Model
	 */
	describe('# Device Model tests', function() {

		let owner, device;
		const userInfo_1 = {
			email: 'yong@gmail.com',
			name: 'yong',
			password: '123123'
		};
		const deviceProfile = {
			device: 'Optitrack',
			name: 'myDevice',
			connectionType: 'VRPN',
			deviceType: 'Tracker',
		};


		it(`Create base owner`, function(done) {
			UserModel.create(userInfo_1)
				.then( instance => {owner = instance} )
				.catch( reason => assert.fail(`this should not be failed. But error is occured: ${reason.err}, ${reason.info}`))
				.then( () => done() );
		});


		it(`Test 'DeviceModel.create' method`, function(done) {
			DeviceModel.create(owner, deviceProfile)
				.then( instance => {
					device = instance;
					console.log(device.allProperties());
				})
				.catch( reason => assert.fail(`${reason.err}, ${reason.info}`) )
				.then( () => done() );
		});


		it(`Test 'addEvent' method (add 10 event object sequently)`, function() {
			for (let i=0; i<10; ++i) {
				const eventObj = {
					event: 'dump_event',
					timestamp: Date.now(),
					detail: {
						order: i
					}
				};
				device.addEvent(eventObj);
			}
		});


		it(`Test 'getEvents' method`, function(done) {
			device.getEvents()
				.then( events => {
					console.log(events);
					assert.equal(events.length, 10);
				})
				.catch( reason => assert.fail(reason) )
				.then( () => done() );
		});


		// it(`Test 'destroy' method`, function(done) {
		// 	DeviceModel.findAndLoadAll()
		// 		.then( instances => {
		// 			const promisesArray = instances.map( deviceInstance => deviceInstance.destroy() );
		// 			return Promise.all(promisesArray);
		// 		})
		// 		.then( () => DeviceModel.findAndLoadAll() )
		// 		.then( instances => assert.equal(instances.length, 0) )
		// 		.catch( reason => assert.fail(reason) )
		// 		.then( () => done() );
		// });

	});


});
