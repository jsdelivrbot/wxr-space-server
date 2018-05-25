'use strict'

const redis = require('redis');
const nohm = require('nohm').Nohm;
require('../object_extend');
const assert = require('assert');
const {inspect} = require('util');
const {UserModel, WorkspaceModel, DeviceModel, EventModel} = require('../models/Models');



let client = null;

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

		const events = [];

		it(`Create 10 Event instance`, function() {
			for (let i=0; i<10; ++i) {
				events.push(new EventModel('track_start'));
			}
			console.log(events);
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
