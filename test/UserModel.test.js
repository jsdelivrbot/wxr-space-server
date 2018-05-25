'use strict'

const redis = require('redis');
const nohm = require('nohm').Nohm;
require('../object_extend');
const assert = require('assert');
const {inspect} = require('util');
const {UserModel, WorkspaceModel} = require('../models/Models');


const userInfo_1 = {
	email: 'user_1@gmail.com',
	name: 'user_1',
	password: 123123
};

const userInfo_2 = {
	email: 'user_2@gmail.com',
	name: 'user_2',
	password: 123456
};

const userInfo_3 = {
	email: 'user_3@gmail.com',
	name: 'user_3',
	password: 321321
};

let client = null;

describe(`UserModel.test.js`, function() {

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
	 * Test User Model
	 */
	describe('# User Model tests', function() {

		let userInstance;

		it(`Create a user account`, function(done) {
			UserModel.create(userInfo_1)
				.then( user => console.log(`user properties: `, user.allProperties()) )
				.catch( reason => assert.fail(reason) )
				.then( () => done() );
		});


		it(`Test 'findAndLoadByEmail' method`, function(done) {
			UserModel.findAndLoadByEmail(userInfo_1.email)
				.then( instance => assert.equal(instance.p('name'), userInfo_1.name) )
				.catch( reason => assert.fail(reason) )
				.then( () => done() );
		});


		it(`Login method test`, function(done) {
			UserModel.login(userInfo_1.email, userInfo_1.password)
				.then( instance => {userInstance = instance} )
				.catch( reason => assert.fail(reason) )
				.then( () => done() );
		});


		it(`Try to login with unregistered user information`, function(done) {
			UserModel.login(userInfo_2.email, userInfo_2.password)
				.then( instance => assert.fail(`This test should be end with error, user info: `, instance) )
				.catch( reason => assert.equal(reason, 'Error: email or password is invalid') )
				.then( () => done() );
		});


		it(`Test validPassword method`, function() {
			const isValidPassword = userInstance.validPassword(userInfo_2.password);
			assert.equal(isValidPassword, false);
		});

	});


	/*
	 * Test User-Workspace relation
	 */
	describe('# User-Workspace relation tests', function() {

		let userHost, userClient;
		let ws1, ws2, ws3;
		const wsInfo_1 = { name: 'myWS_1' };
		const wsInfo_2 = { name: 'myWS_2' };
		const wsInfo_3 = { name: 'myWS_3' };

		it(`Load a host user of workspace`, function(done) {
			UserModel.findAndLoadByEmail(userInfo_1.email)
				.then( instance => {userHost = instance} )
				.catch( reason => assert.fail(reason) )
				.then( () => done() );
		});


		it(`Test 'createWorkspace' method`, function(done) {
			userHost.createWorkspace(wsInfo_1)
				.then( instance => {ws1 = instance} )
				.then( () => userHost.createWorkspace(wsInfo_2) )
				.then( instance => {ws2 = instance} )
				.then( () => userHost.createWorkspace(wsInfo_3) )
				.then( instance => {ws3 = instance} )
				.catch( reason => assert.fail(reason) )
				.then( () => done() );
		});


		it(`Test 'getMyWorkspaces' method`, function(done) {
			userHost.getMyWorkspaces()
				.then( instances => assert.equal(instances.length, 3) )
				.catch( reason => assert.fail(reason) )
				.then( () => done() );
		});


		it(`Create new user`, function(done) {
			UserModel.create(userInfo_2)
				.then( instance => {userClient = instance} )
				.catch( reason => assert.fail(reason) )
				.then( () => done() );
		});


		it(`Test 'joinWorkspace' method`, function(done) {
			userClient.joinWorkspace(ws1)
				.catch( reason => assert.fail(reason) )
				.then( () => done() );
		});


		it(`Test 'giveRight' method`, function(done) {
			const right = WorkspaceModel.RELATION_USER_EDITOR;

			userHost.giveRight(ws1, userClient, right)
				.catch( reason => assert.fail(reason) )
				.then( () => done() );
		});


		it(`Test 'myRightsIn' method`, function(done) {
			userClient.getMyRightIn(ws1)
				.then( myRight => assert.equal(myRight, WorkspaceModel.RELATION_USER_EDITOR) )
				.catch( reason => assert.fail(reason) )
				.then( () => done() );
		});


		it(`Test 'exitWorkspace' method`, function(done) {
			userClient.exitWorkspace(ws1)
				.then( () => userClient.getMyWorkspaces() )
				.then( instances => assert.equal(instances.length, 0) )
				.catch( reason => assert.fail(reason) )
				.then( () => done() );
		});


		// it(`Test 'removeWorkspace' method`, function(done) {
		// 	userHost.removeWorkspace(ws3)
		// 		.then( () => userHost.getMyWorkspaces() )
		// 		.then( instances => assert.equal(instances.length, 2) )
		// 		.catch( reason => assert.fail(reason) )
		// 		.then( () => done() );
		// });

	});


	/*
	 * Test User-Device relation
	 */
	describe('# User-Device relation tests', function() {

		let owner, ws, device;
		const deviceProfile = {
			device: 'Optitrack',
			name: 'myDevice',
			connectionType: 'VRPN',
			deviceType: 'Tracker',
		};


		it(`Get user instances`, function(done) {
			UserModel.findAndLoadByEmail(userInfo_1.email)
				.then( instance => {owner = instance} )
				.catch( reason => assert.fail(reason) )
				.then( () => done() );
		});


		it(`Create device instance of owner user`, function(done) {
			owner.registerDevice(deviceProfile)
				.then( instance => {device = instance} )
				.catch( reason => assert.fail(reason) )
				.then( () => done() );
		});


		it(`Test 'getMyDevices' method`, function(done) {
			owner.getMyDevices()
				.then( instances => assert.equal(instances.length, 1) )
				.catch( reason => assert.fail(reason) )
				.then( () => done() );
		});


		it(`Test device profile update`, function(done) {
			const newDeviceName = 'myNewOptitrackTrackerDevice';
			device.p('name', newDeviceName);
			device._pSave()
				.then( deviceInstance => assert.equal(device.p('name'), newDeviceName) )
				.catch( reason => assert.fail(reason) )
				.then( () => done() );
		});


		// it(`Test 'removeDevice' method`, function(done) {
		// 	owner.removeDevice(device)
		// 		.then( () => owner.getMyDevices() )
		// 		.then( instances => assert.equal(instances.length, 0) )
		// 		.catch( reason => assert.fail(reason) )
		// 		.then( () => done() );
		// });


		it(`Test 'attachDeviceTo' method`, function(done) {
			owner.createWorkspace({name: 'mywwww'})
				.then( instance => {ws = instance} )
				.then( () => owner.attachDeviceTo(ws, device) )
				.then( wsInstance => device.getLinkedWorkspaces() )
				.then( instances => assert.equal(instances[0].id, ws.id) )
				.catch( reason => assert.fail(reason) )
				.then( () => done() );
		});


		it(`Test 'detachDeviceFrom' method`, function(done) {
			owner.detachDeviceFrom(ws, device)
				.then( wsInstance => ws.getAttachedDevices() )
				.then( instances => assert.equal(instances.length, 0) )
				.catch( reason => assert.fail(reason) )
				.then( () => done() );
		});


	});



	/*
	 * test end
	 */
	describe(`# The test end - cleaning DB`, function() {

		it(`flush db`, function() {
			client.flushdb();
		});

	});

});
