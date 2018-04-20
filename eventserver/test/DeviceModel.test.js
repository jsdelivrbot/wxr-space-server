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

		let device, deviceName;


		it(`Test 'DeviceModel.create' method`, function(done) {
			DeviceModel.create('127.0.0.1', 'myDevice')
				.then( _device => deviceName = _device.p('name') )
				.catch( reason => assert.fail(`${reason.err}, ${reason.info}`) )
				.then( () => done() );
		});


		it(`Check 'eventSetKey' property`, function(done) {
			DeviceModel.findAndLoadByName(deviceName)
				.then( _device => {
					device = _device;
					console.log(device.p('eventSetKey'));
				})
				.catch( reason => assert.fail(reason) )
				.then( () => done() );
		});


		it(`Test 'addEvent' method (add 10 event object sequently)`, function(done) {
			new Promise( (resolve, reject) => {
				let index = 0;
				(function add() {
					if (index >= 10) return resolve();
					const eventObj = {
						event: 'dump_event',
						detail: {
							timestamp: Date.now(),
							order: index++
						}
					}

					device.addEvent(eventObj)
						.then(add);
				})(0);
			})
				.catch( reason => assert.fail(reason) )
				.then( () => done() );
		});


		it(`Test 'getEvents' method`, function(done) {
			device.getEvents()
				.then( events => assert.equal(events.length, 10) )
				.catch( reason => assert.fail(reason) )
				.then( () => done() );
		});

	});


	/*
	 * Test Workspace-User relation
	 */
	describe('# Device-User relation tests', function() {

		let owner, other1, other2, device;

		const testUserInfo = {
			name: 'testDeviceOwner',
			password: 123123
		};
		const otherUserInfo1 = {
			name: 'oUser1',
			password: 123123
		};
		const otherUserInfo2 = {
			name: 'oUser2',
			password: 123123
		};


		it(`Create device instance and owner user`, function(done) {
			DeviceModel.create('127.0.0.1', 'testDevice')
				.then( _device => device = _device )
				.catch( reason => assert.fail(`Creating device instance is failed: ${reason.err}, ${reason.info}`) )
				.then( () => UserModel.create(testUserInfo) )
				.then( _user => owner = _user )
				.catch( reason => assert.fail(`This is should not be failed. But Error is occured: ${reason.err}, ${reason.info}`) )
				.then( () => done() );
		});


		it(`Test 'setOwner' method`, function(done) {
			device.setOwner(owner)
				.then( _device => assert.equal(device.p('owner'), owner.p('name')) )
				.catch( reason => assert.fail(reason) )
				.then( () => done() );
		});


		it(`Test 'addDevice' and 'getMyDevices' method (Setting owner of device and getting his own devices)`, function(done) {
			owner.addDevice(device)
				.then( owner => owner.getMyDevices() )
				.then( devices => {
					assert.equal( devices.length, 1 );
					assert.equal( devices[0].p('name'), device.p('name') );
				})
				.catch( reason => assert.fail(reason) )
				.then( () => done() );
		});


		it(`Test 'shareDevice' and 'getDevices' method (Giving reference of device to other user and getting all linked devices of an user including his own devices`, function(done) {
			UserModel.create(otherUserInfo1)
				.then( _otherUser => other1 = _otherUser )
				.then( () => UserModel.create(otherUserInfo2) )
				.then( _otherUser => other2 = _otherUser )
				.then( () => owner.shareDeviceWith(device, other1) )
				.then( () => owner.shareDeviceWith(device, other2) )
				.then( () => other1.getDevices() )
				.then( devices => {
					assert.equal( devices.length, 1 );
					assert.equal( devices[0].p('name'), device.p('name') );
				})
				.catch( reason => assert.fail(reason) )
				.then( () => done() );
		});


		it(`Test 'cutSharingFrom' method (Taking device instance from other user)`, function(done) {
			owner.cutSharingFrom(device, other1)
				.then( () => other1.getDevices() )
				.then( devices => assert.equal(devices.length, 0) )
				.catch( reason => assert.fail(reason) )
				.then( () => done() );
		});


		it(`Test 'removeDevice' method (Removing ownership and device)`, function(done) {
			owner.removeDevice(device)
				.then( () => owner.getDevices() )
				.then( devices => assert.equal(devices.length, 0) )
				.then( () => other2.getDevices() )
				.then( devices => assert.equal(devices.length, 0) )
				.catch( reason => assert.fail(reason) )
				.then( () => done() );
		});

	});

});
