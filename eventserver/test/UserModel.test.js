'use strict'

const redis = require('redis');
const nohm = require('nohm').Nohm;
require('../object_extend');
const assert = require('assert');
const {inspect} = require('util');
const {UserModel, WorkspaceModel} = require('../models/Models');


const testUserInfo = {
	name: 'yong',
	password: 123123
}

const unregisteredUserInfo = {
	name: 'yongyong',
	password: 123456
}



describe(`UserModel.test.js`, function() {

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
	 * Test User Model
	 */
	describe('# User Model tests', function() {

		let userInstance;

		it(`Create a user account`, function(done) {
			UserModel.newUser(testUserInfo)
				.then( user => console.log(`user id: ${user.p('name')}`) )
				.catch( reason => assert.fail(reason) )
				.then( () => done() );
		});


		it(`Login method test`, function(done) {
			UserModel.login(testUserInfo.name, testUserInfo.password)
				.then( user => userInstance = user )
				.catch( reason => assert.fail(reason) )
				.then( () => done() );
		});


		it(`Try to login with unregistered user information`, function(done) {
			UserModel.login(unregisteredUserInfo.name, unregisteredUserInfo.password)
				.then( user => assert.fail(`This test should be end with error, user: ${user}`) )
				.catch( reason => assert.equal(reason, 'not found') )
				.then( () => done() );
		});


		it(`Test validPassword method`, function() {
			const isValidPassword = userInstance.validPassword(unregisteredUserInfo.password);
			assert.equal(isValidPassword, false);
		});

	});


	/*
	 * Test User-Workspace relation
	 */
	describe('# User-Workspace relation tests', function() {

		let userHost, userClient;
		let ws1, ws2, ws3;

		it(`Load a user`, function(done) {
			UserModel.findAndLoadByName(testUserInfo.name)
				.then( user => userHost = user )
				.catch( reason => assert.fail(reason) )
				.then( () => done() );
		});


		it(`Test 'createWorkspace' method`, function(done) {
			userHost.createWorkspace('myWS_1')
				.then( ws => ws1 = ws )
				.then( () => userHost.createWorkspace('myWS_2') )
				.then( ws => ws2 = ws )
				.then( () => userHost.createWorkspace('myWS_3') )
				.then( ws => ws3 = ws )
				.catch( reason => assert.fail(reason) )
				.then( () => done() );
		});


		it(`Test 'getMyWorkspaces' method`, function(done) {
			userHost.getMyWorkspaces()
				.then( wss => assert.equal(wss.length, 3) )
				.catch( reason => assert.fail(reason) )
				.then( () => done() );
		});


		it(`Create new user`, function(done) {
			UserModel.newUser(unregisteredUserInfo)
				.then( user => userClient = user )
				.catch( reason => assert.fail(reason) )
				.then( () => done() );
		});


		it(`Test 'joinWorkspace' method`, function(done) {
			userClient.joinWorkspace(ws1)
				.catch( reason => assert.fail(reason) )
				.then( () => done() );
		});


		it(`Test 'giveRights' method`, function(done) {
			const rights = [
				WorkspaceModel.RELATION_USER_EDITOR,
				WorkspaceModel.RELATION_USER_OWNER];

			userHost.giveRights(ws1, userClient, rights)
				.then( setRights => assert.equal(setRights.length, rights.length) )
				.catch( reason => assert.fail(reason) )
				.then( () => done() );
		});


		it(`Test 'myRightsIn' method`, function(done) {
			const rights = [
				WorkspaceModel.RELATION_USER_VIEWER,
				WorkspaceModel.RELATION_USER_EDITOR,
				WorkspaceModel.RELATION_USER_OWNER];

			userClient.getMyRightsIn(ws1)
				.then( myRights => console.log(myRights) )
				.catch( reason => assert.fail(reason) )
				.then( () => done() );
		});


		it(`Test 'ridOfRights' method`, function(done) {
			const rights = [
				WorkspaceModel.RELATION_USER_EDITOR,
				WorkspaceModel.RELATION_USER_OWNER];

			userHost.ridOfRights(ws1, userClient, rights)
				.then( () => userClient.getMyRightsIn(ws1) )
				.then( myRights => assert.equal(myRights.length, 1) )
				.catch( reason => assert.fail(reason) )
				.then( () => done() );
		});


		it(`Test 'exitWorkspace' method`, function(done) {
			userClient.exitWorkspace(ws1)
				.then( () => userClient.getMyWorkspaces() )
				.then( wss => assert.equal(wss.length, 0) )
				.catch( reason => assert.fail(reason) )
				.then( () => done() );
		});

	});
});
