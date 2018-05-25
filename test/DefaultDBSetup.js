'use strict'

const redis = require('redis');
const nohm = require('nohm').Nohm;
require('../object_extend');
const assert = require('assert');
const mkdirp = require('mkdirp-promise');
const path = require('path');
const fs = require('fs');
const {UserModel, WorkspaceModel, DeviceModel} = require('../models/Models');



let client = null;
describe(`WorkspaceModel.test.js`, function() {

	const yongjae = {
		email: 'yongjae.lee@wrl.onl',
		name: 'Yongjae Lee',
		password: '123123'
	};
	const daeil = {
		email: 'seo@wrl.onl',
		name: 'Daeil Seo',
		password: '123123'
	};
	const jongho = {
		email: 'jongho.lee@wrl.onl',
		name: 'Jongho Lee',
		password: '123123'
	};
	const wanho = {
		email: 'wanho.im@wrl.onl',
		name: 'Wanho Im',
		password: '123123'
	};
	const jungmin = {
		email: 'jungmin.ha@wrl.onl',
		name: 'Jungmin Ha',
		password: '123123'
	};

	let yj, di, jh, wh, jm;

	const insstek3d = {
		name: 'Insstek 3D',
		description: 'insstek 3D printer maintenance on the 3D web',
		thumbnail: 'https://wxr.nyc3.digitaloceanspaces.com/ar3dp/thumb/3d-thumb.png'
	};
	const insstekvr = {
		name: 'Insstek VR',
		description: 'insstek 3D printer maintenance training using WXR VR browser',
		thumbnail: 'https://wxr.nyc3.digitaloceanspaces.com/ar3dp/thumb/vr-thumb.png'
	};
	const insstekar = {
		name: 'Insstek AR',
		description: 'insstek 3D printer maintenance using WXR AR browser',
		thumbnail: 'https://wxr.nyc3.digitaloceanspaces.com/ar3dp/thumb/ar-thumb.png'
	};
	const test3d = {
		name: 'Test 3D',
		description: 'Test interaction'
	};

	let in3d, invr, inar, t3d;

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
	describe('# Setup', function() {


		it(`Create users`, function (done) {

			let instances;

			Promise.all([
				UserModel.create(yongjae),
				UserModel.create(daeil),
				UserModel.create(jongho),
				UserModel.create(wanho),
				UserModel.create(jungmin)])
				.then( _instances => instances = _instances )
				.then( () => [yj, di, jh, wh, jm] = instances )
				.then( () => assert.equal(instances.length, 5) )
				.catch( reason => assert.fail(reason) )
				.then( () => done() );
		});


		it(`Create workspaces of yongjae`, function (done) {

			let instances;
			const CMSRoot = path.join(__dirname, '../cms');
			const CMSBodyTemplate = path.join(CMSRoot, 'body_template.ejs');

			Promise.all([
				yj.createWorkspace(insstek3d),
				yj.createWorkspace(insstekvr),
				yj.createWorkspace(insstekar),
				yj.createWorkspace(test3d),
			])
				.then( _instances => instances = _instances )
				.then( () => [in3d, invr, inar, t3d] = instances )
				.then( () => assert.equal(instances.length, 4) )
				.then( () => {
					return Promise.all(
						instances.map( i => mkdirp(path.join(CMSRoot, i.id)) )
					);
				})
				.then( _pathes => {
					_pathes.forEach( p => {
						fs.copyFileSync(CMSBodyTemplate, path.join(p, 'body.ejs'))
					});
				})
				.catch( reason => assert.fail(reason) )
				.then( () => done() );
		});


		it(`Join members`, function (done) {

			let members = [di, jh, wh, jm];
			let workspaces = [in3d, invr, inar, t3d];

			Promise.all([
				...workspaces.map( w => w.addMember(di) ),
				...workspaces.map( w => w.addMember(jh) ),
				...workspaces.map( w => w.addMember(wh) ),
				...workspaces.map( w => w.addMember(jm) )
				])
				.then( results => assert.equal(results.includes(undefined), false) )
				.catch( reason => assert.fail(reason) )
				.then( () => done() );
		});

	});

});
