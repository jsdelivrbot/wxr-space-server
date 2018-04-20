const config = require('config');
const nohm = require('nohm').Nohm;
require('../object_extend');
const UUID = require('uuid/v4');


/**
 * Model definition of Workspace
 */
const DeviceModel = nohm.model('DeviceModel', {
	idGenerator: callback => callback(UUID()),
	properties: {

		device: {
			type: 'string',
			validations: [
				'notEmpty',
			]
		},

		name: {
			type: 'string',
			index: true,
			validations: [
				'notEmpty',
			]
		},

		connectionType: {
			type: 'string',
			validations: [
				'notEmpty',
			]
		},

		deviceType: {
			type: 'string',
			validations: [
				'notEmpty',
			]
		},

		status: {
			type: 'string',
			defaultValue: function() {return 'disconnected';}
		},

		eventStreamEnable: {
			type: 'boolean',
			defaultValue: function() {return true}
		},

		createdDate: {
			type: 'timestamp',
			defaultValue: function() {return Date.now()}
		},

		ownerId: {
			type: 'string',
			index: true,
			validations: [
				'notEmpty'
			]
		},

		eventSetKey: {
			type: 'string',
			validations: [
				'notEmpty'
			]
		}

	},

	methods: {

		// TODO: Unsupported method in nohm v0.9.8
		// destroy: function() {
		// 	return this._pRemove();
		// },

		addEvent: function(event) {
			const redisClient = nohm.client;
			const key = this.p('eventSetKey');
			const score = event.timestamp;
			const member = JSON.stringify(event);

			redisClient.zadd(key, score, member, (err, numOfSavedItems) => {
				if (err) console.error(err);
			});
		},

		getEvents: function(tFrom, tTo) {
			const redisClient = nohm.client;
			const key = this.p('eventSetKey');
			const min = tFrom || '-inf';
			const max = tTo || '+inf';

			return new Promise( (resolve, reject) => {
				redisClient.zrangebyscore(key, min, max, (err, ret) => {
					if (err) return reject(err);
					resolve(ret);
				});
			});
		},

		getLinkedWorkspaces: function() {
			const WorkspaceModel = nohm.getModels()['WorkspaceModel'];
			return this.getAllLinks('WorkspaceModel', DeviceModel.RELATION_WORKSPACE_LINKED)
				.then( ids => WorkspaceModel.propagateInstances(ids) )
		}

	}
});



DeviceModel.RELATION_WORKSPACE_LINKED = 'trackerForeign';


/*
 * Define static methods of DeviceModel
 */
DeviceModel.create = function (owner, deviceProfile) {
	const device = nohm.factory('DeviceModel');
	const deviceInfo = deviceProfile;
	deviceInfo.ownerId = owner.id;
	deviceInfo.eventSetKey = `WXR:zset:${deviceInfo.ownerId}@${deviceInfo.device}@${deviceInfo.name}:EVENT`;

	device.p(deviceInfo);

	return device._pSave();
};

DeviceModel.getAllDevicesOf = function(userInstance) {
	return DeviceModel._pFindAndLoad({ownerId: userInstance.id});
};



module.exports = DeviceModel;