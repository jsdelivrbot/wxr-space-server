'use strict'

const redis = require('redis');
const nohm = require('nohm').Nohm;
require('../object_extend');
const assert = require('assert');
const {UserModel, WorkspaceModel, DeviceModel} = require('../models/Models');



let client = null;
describe(`WorkspaceModel.test.js`, function() {

	const ownerInfo = {
		email: 'owner@gmail.com',
		name: 'owner',
		password: '123123'
	};
	const userInfo_1 = {
		email: 'user_1@gmail.com',
		name: 'user_1',
		password: '123123'
	};
	const userInfo_2 = {
		email: 'user_2@gmail.com',
		name: 'user_2',
		password: '123123'
	};
	const userInfo_3 = {
		email: 'user_3@gmail.com',
		name: 'user_3',
		password: '123123'
	};

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
	 * Test Workspace Model
	 */
	describe('# Workspace Model tests', function() {

		let owner;
		const workspaceInfo = {
			name: 'myWorkspace'
		};

		it(`Create base owner`, function(done) {
			UserModel.create(ownerInfo)
				.then( instance => {owner = instance} )
				.catch( reason => assert.fail(`this should not be failed. But error is occured: ${reason.err}, ${reason.info}`))
				.then( () => done() );
		});


		it(`Test 'WorkspaceModel.create' method`, function(done) {
			WorkspaceModel.create(owner, workspaceInfo)
				.then( instance => assert.equal(instance.p('ownerId'), owner.id) )
				.catch( reason => assert.fail(`${reason.err}, ${reason.info}`) )
				.then( () => done() );
		});

	});


	/*
	 * Test Workspace-User relation
	 */
	describe('# Workspace-User relation tests', function() {

		let owner, user1, user2, user3, ws;

		it(`Create base owner and member users and an workspace for them`, function (done) {

			// Create base owner and members
			UserModel.findAndLoadByEmail(ownerInfo.email)
				.then( instance => {owner = instance} )
				.then( () => UserModel.create(userInfo_1) )
				.then( instance => {user1 = instance} )
				.then( () => UserModel.create(userInfo_2))
				.then( instance => {user2 = instance} )
				.then( () => UserModel.create(userInfo_3))
				.then( instance => {user3 = instance} )

				// Create ws of owner
				.then( () => owner.createWorkspace({name: 'myWorkspace'}) )
				.then( instance => {ws = instance} )

				// Invite members to owner's workspace.
				.then( () => ws.addMember(user1) )
				.then( wsInstance => ws.addMember(user2) )
				.then( wsInstance => ws.addMember(user3) )
				.catch( reason => assert.fail(`this process should not be failed. But error is occured: ${reason.err}, ${reason.info}`) )
				.then( () => done() );
		});


		it(`Test 'findAndLoadByName' method`, function (done) {
			WorkspaceModel.findAndLoadByName('myWorkspace')
				.then(instances => assert.equal(instances.length, 2))
				.catch(reason => assert.fail(reason))
				.then(() => done());
		});


		it(`Test 'removeMember' and 'getAllMembers' method`, function (done) {
			ws.removeMember(user3)
				.then(wsInstance => ws.getAllMembers())
				.then(members => assert.equal(members.length, 3))
				.catch(reason => assert.fail(reason))
				.then(() => done());
		});


		it(`Test 'setRightOf' and 'getRightOf' method`, function (done) {
			ws.setRightOf(user2, WorkspaceModel.RELATION_USER_EDITOR)
				.then(wsInstnace => ws.getRightOf(user2))
				.then(right => assert.equal(right, WorkspaceModel.RELATION_USER_EDITOR))
				.catch(reason => assert.fail(reason))
				.then(() => done());
		});


		it(`Test 'getEditors' and 'getViewers' method`, function (done) {
			ws.getEditors()
				.then(instnaces => assert.equal(instnaces.length, 1))
				.then(() => ws.getViewers())
				.then(instnaces => assert.equal(instnaces.length, 1))
				.catch(reason => assert.fail(reason))
				.then(() => done());
		});


		it(`Test 'isMember' method`, function (done) {
			ws.isMember(owner)
				.then( isMember => assert.equal(isMember, true) )
				.catch(reason => assert.fail(reason))
				.then(() => done());
		});


		// it(`Test 'destroy' method`, function(done) {
		// 	WorkspaceModel.findAndLoadAll()
		// 		.then( wsInstances => {
		// 			const promisesArray = wsInstances.map( ws => ws.destroy() );
		// 			return Promise.all(promisesArray);
		// 		})
		// 		.then( () => WorkspaceModel.findAndLoadAll() )
		// 		.then( instances => assert.equal(instances.length, 0) )
		// 		.then( () => owner.getMyWorkspaces() )
		// 		.then( instances => assert.equal(instances.length, 0) )
		// 		.catch( reason => assert.fail(reason) )
		// 		.then( () => done() );
		// });

	});


	/*
	 * Test Workspace-Device relation
	 */
	describe('# Workspace-Device relation tests', function() {

		let owner, ws, device;
		const deviceProfile = {
			device: 'Optitrack',
			name: 'myDevice',
			connectionType: 'VRPN',
			deviceType: 'Tracker',
		};

		it(`Test 'attachDevice' method (Create and attach device)`, function(done) {
			UserModel.findAndLoadByEmail(ownerInfo.email)
				.then( instance => {owner = instance} )
				.then( () => owner.registerDevice(deviceProfile) )
				.then( instance => {device = instance} )
				.then( () => owner.createWorkspace({name: 'wsTestDevice'}) )
				.then( instance => {ws = instance} )
				.then( () => ws.attachDevice(device) )
				.catch( reason => assert.fail(reason) )
				.then( () => done() );
		});


		it(`Test 'getAttachedDevices' method`, function(done) {
			ws.getAttachedDevices()
				.then( instances => assert.equal(instances.length, 1) )
				.catch( reason => assert.fail(reason) )
				.then( () => done() );
		});


		it(`Test 'detachDevice' method`, function(done) {
			ws.detachDevice(device)
				.then( () => ws.getAttachedDevices() )
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
