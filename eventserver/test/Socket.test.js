'use strict'

const request = require('request-promise-native');
const redis = require('redis');
const nohm = require('nohm').Nohm;
require('../object_extend');
const assert = require('assert');
const {inspect} = require('util');
const {UserModel, WorkspaceModel, DeviceModel} = require('../models/Models');



let client, cookieOfUser_1, cookieOfUser_2;


describe(`Socket.test.js`, function() {

	/*
	 * Initialize environment
	 */
	describe(`# Initialize environment`, function() {


		it(`Connect redis server flush db`, function(done) {
			client = redis.createClient({db: 1});
			client.on('connect', () => {
				client.flushdb();
				nohm.setClient(client);
				done();
			});
		});


		it(`Execute express server`, function() {
			require('../bin/www');
		})


		it(`Create user_1 and user_2`, function(done) {

			const options = {
				method: 'POST',
				uri: 'http://localhost:6701/user',
				body: {
					username: 'user_1',
					password: '123123'
				},
				json: true,
				resolveWithFullResponse: true
			}

			request(options)
				.then( response => {
					if (response.body.status === 'ok') {
						cookieOfUser_1 = response.headers['set-cookie'][0];
						return Promise.resolve();
					} else {
						return Promise.reject(JSON.stringify(response.body.message));
					}
				})
				.catch( reason => assert.fail(reason) )
				.then( () => options.body.username = 'user_2' )
				.then( () => request(options) )
				.then( response => {
					if (response.body.status === 'ok') {
						cookieOfUser_2 = response.headers['set-cookie'][0];
						return Promise.resolve();
					} else {
						return Promise.reject(JSON.stringify(response.body.message));
					}
				})
				.then( () => done() )
				.catch( reason => assert.fail(reason) );
		});


		it(`Create myWorkspace`, function(done) {

			const options = {
				method: 'POST',
				uri: 'http://localhost:6701/workspace',
				body: {
					name: 'myWorkspace'
				},
				json: true,
				headers: {
					'Cookie': cookieOfUser_1
				}
			}

			request(options)
				.then( body => body.status === 'ok' ? Promise.resolve() : Promise.reject(JSON.stringify(body)) )
				.catch( reason => assert.fail(reason) )
				.then( () => done() )
		});


		it(`Invite user_2`, function(done) {

			const options = {
				method: 'POST',
				uri: 'http://localhost:6701/workspace/user_1@myWorkspace/member/invite',
				body: {
					name: 'user_2'
				},
				json: true,
				headers: {
					'Cookie': cookieOfUser_1
				}
			}

			request(options)
				.then( body => body.status === 'ok' ? Promise.resolve() : Promise.reject(JSON.stringify(body)) )
				.catch( reason => assert.fail(reason) )
				.then( () => done() )
		});


	});


	/*
	 * Flow of connecting workspace
	 */

	let sender, receiver;

	describe(`# Flow of event data publishing`, function() {

		const io = require('socket.io-client');

		const serverName = 'dummy_server';
		let userInstance, workspaceInstance, deviceInstance;

		it(`Start sending stream`, function(done) {

			sender = io('http://localhost:6711');
			sender.on('error', function(message) {
				console.log(`error: ${message}`);
			});

			// send 'local_server_on' event
			const serverOnMessage = {
				event: 'local_server_on',
				detail: {
					serverName: serverName,
					timestamp: Date.now()
				}
			}
			console.log('send local_server_on');
			sender.emit('vrpn_event', serverOnMessage);

			// send 'packagedMessage' event periodically in every 1 seconds.
			const packagedMessage = {
				event: 'local_packaged_events',
				detail: {
					timestamp: Date.now(),
					messages: [serverOnMessage, serverOnMessage]
				}
			}
			setInterval( () => {
				packagedMessage.detail.timestamp = Date.now();
				console.log('send local_packaged_events');
				sender.emit('vrpn_event', packagedMessage);
			}, 1000);


			setTimeout( () => done(), 300 );
		});


		it(`Check local server instance is created as device`, function(done) {
			DeviceModel.findAndLoadAll()
				.then( devices => assert.equal(devices.length, 1) )
				.then( () => done() );
		})


		it(`Get workspace instance`, function(done) {

			UserModel.findAndLoadByName('user_1')
				.then( userInstance => userInstance.getMyWorkspaces() )
				.then( _workspaceInstances => workspaceInstance = _workspaceInstances[0] )
				.catch( reason => assert.fail(reason) )
				.then( () => done() )
		});


		it(`Enter the workspace as user_2`, function (done) {

			receiver = io('http://localhost:6711', {
				transportOptions: {
					polling: {
						extraHeaders: {
							'Cookie': cookieOfUser_2
						}
					}
				}
			});
			receiver.on('error', function(message) {
				console.log(message);
			});
			receiver.on('enter_workspace_response', function(message) {
				console.log(message);
				done();
			});
			receiver.on('vrpn_event', function(message) {
				console.log(`Getting vrpn_event: ${message}`);
			})

			receiver.emit('enter_workspace', workspaceInstance.p('name'));
		});


		it(`User_1 attach device`, function(done) {

			// register 'dummy_server' device' owner as user_1
			UserModel.findAndLoadByName('user_1')
				.then( user => userInstance = user )
				.then( () => DeviceModel.findAndLoadByName('127.0.0.1@dummy_server') )
				.then( device => deviceInstance = device )
				.then( () => !!deviceInstance === true ? Promise.resolve() : Promise.reject(`device is not exist`) )
				.then( () => userInstance.registerDevice(deviceInstance) )
				.catch( reason => assert.fail(reason) )

			// attach device to 'myWorkspace'
				.then( () => workspaceInstance.attachDevice(deviceInstance) )
				.then( () => done() )
				.catch( reason => assert.fail(reason) )
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
