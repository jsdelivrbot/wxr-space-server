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
	 * Test Workspace Model
	 */
	describe('# Workspace Model tests', function() {

		let owner, ws;

		it(`Create base owner`, function(done) {
			UserModel.create({name: 'aUser', password: 123123})
				.then( _owner => owner = _owner)
				.catch( reason => assert.fail(`this should not be failed. But error is occured: ${reason.err}, ${reason.info}`))
				.then( () => done() );
		});


		it(`Test 'WorkspaceModel.create' method`, function(done) {
			WorkspaceModel.create(owner, 'myFirstWorkspace')
				.then( _ws => ws = _ws)
				.catch( reason => assert.fail(`${reason.err}, ${reason.info}`) )
				.then( () => done() );
		});

	});


	/*
	 * Test Workspace-User relation
	 */
	describe('# Workspace-User relation tests', function() {

		let owner, user1, user2, user3, ws, device;


		it(`Create base owner and member users and an workspace for them`, function(done) {

			// Create base owner and members
			UserModel.create({name: 'uOwner', password: 123123})
				.then( _owner => owner = _owner )
				.then( () => UserModel.create({name: 'm1', password:123123}) )
				.then( _user => user1 = _user )
				.then( () => UserModel.create({name: 'm2', password:123123}) )
				.then( _user => user2 = _user )
				.then( () => UserModel.create({name: 'm3', password:123123}) )
				.then( _user => user3 = _user )

				// Create ws of owner
				.then( () => owner.createWorkspace('myWorkspace') )
				.then( _ws => ws = _ws )

				// Invite members to join owner's workspace.
				.then( () => user1.joinWorkspace(ws) )
				.then( _ws => user2.joinWorkspace(ws) )
				.then( _ws => user3.joinWorkspace(ws) )
				.catch( reason => assert.fail(`this process should not be failed. But error is occured: ${reason.err}, ${reason.info}`))
				.then( () => done() );
		});


		it(`Test 'getAllMembers' method`, function(done) {
			ws.getAllMembers()
				.then( members => assert.equal(members.length, 4) )
				.then( () => done() );
		});


		it(`Test 'attachDevice' method (Create and attach device)`, function(done) {
			DeviceModel.create('127.0.0.1', 'ownerDevice', owner)
				.then( _device => device = _device )
				.then( () => ws.attachDevice(device) )
				.catch( reason => assert.fail(reason) )
				.then( () => done() );
		});


		it(`Test 'getAttachedDevices' method`, function(done) {
			ws.getAttachedDevices()
				.then( _devices => assert.equal(_devices.length, 1) )
				.catch( reason => assert.fail(reason) )
				.then( () => done() );
		});


		it(`Test 'detachDevice' method`, function(done) {
			ws.detachDevice(device)
				.then( () => ws.getAttachedDevices() )
				.then( _devices => assert.equal(_devices.length, 0) )
				.catch( reason => assert.fail(reason) )
				.then( () => done() );
		});

	});

});
