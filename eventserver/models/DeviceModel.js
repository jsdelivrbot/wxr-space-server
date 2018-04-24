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
			index: true,
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
			defaultValue: 'disconnected',
			type: 'string',
			validations: [
				function checkIsValidString(value, options, callback) {
					callback(['disconnected', 'connected'].includes(value));
				}
			]
		},

		eventStreamEnable: {
			defaultValue: false,
			type: 'boolean'
		},

		createdDate: {
			defaultValue: function() {return Date.now()},
			type: 'timestamp'
		},

		ownerId: {
			type: 'string',
			index: true,
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
			const key = this.getEventSetKey();
			const score = event.timestamp;
			const member = JSON.stringify(event);

			redisClient.zadd(key, score, member, (err, numOfSavedItems) => {
				if (err) console.error(err);
			});
		},

		getEvents: function(tFrom, tTo) {
			const redisClient = nohm.client;
			const key = this.getEventSetKey();
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
				.then( ids => WorkspaceModel.propagateInstance(ids) )
		},

		updateProfile: function(newValues) {
			for (let key in newValues) {
				const val = newValues[key];
				if (val === '' || val === undefined || val === null) delete newValues[key];
			}

			this.p(newValues);

			return isExist(this.allProperties())
				.then( isExist => isExist ? Promise.reject(`Duplicated device profile.`) : this._pSave() );
		},

		getEventSetKey: function() {
			if (this.id) return false;
			else return `WXR:zset:${device.id}:EVENT`;
		}

	}
});



DeviceModel.RELATION_WORKSPACE_LINKED = 'trackerForeign';


/*
 * Define static methods of DeviceModel
 */
DeviceModel.create = function (owner, deviceProfile) {
	const device = nohm.factory('DeviceModel');
	deviceProfile.ownerId = owner.id;

	device.p(deviceProfile);

	return isExist(deviceProfile)    // search device profile duplication
		.then( isExist => isExist ? Promise.reject(`Duplicated device profile.`) : device._pSave() );
};

DeviceModel.getAllDevicesOf = function(userInstance) {
	return DeviceModel._pFindAndLoad({ownerId: userInstance.id});
};


function isExist(profile) {
	return DeviceModel._pFindAndLoad({name: profile.name, device: profile.device, ownerId: profile.ownerId})
		.then( instance => instance.length === 0 ? Promise.resolve(false) : Promise.resolve(true) );
};




module.exports = DeviceModel;