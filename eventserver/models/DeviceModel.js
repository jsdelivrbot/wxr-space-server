const config = require('config');
const nohm = require('nohm').Nohm;
require('../object_extend');


/**
 * Model definition of Workspace
 */
const DeviceModel = nohm.model('DeviceModel', {
	properties: {

		name: {
			type: 'string',
			unique: true,
			validations: [
				'notEmpty',
				/*
				 * TODO: implement custom validation to check if owner_id is valid
				 * refer this: https://maritz.github.io/nohm/#validators
				 */
				function checkIsValidOwner (value, options, callback) {
					callback(true);
				}
			]
		},

		createdDate: {
			type: 'timestamp',
			defaultValue: function () {
				return Date.now();
			},
			validations: [
				'notEmpty'
			]
		},

		owner: {
			type: 'string',
			validations: []
		},

		eventSetKey: {
			type: 'string',
			validations: [
				'notEmpty'
			]
		}

	},

	methods: {

		destroy: function() {
			return new Promise( (resolve, reject) => {
				this.remove( err => {
					if (err) return reject(err);
					resolve();
				});
			});
		},

		setOwner: function(owner) {
			this.p('owner', owner.p('name'));
			return this._pSave();
		},

		getSharedUser: function() {
			const UserModel = nohm.getModels()['UserModel'];
			return this.getAllLinks('UserModel', DeviceModel.RELATION_USER_SHARED)
				.then( ids => UserModel.propagateInstances(ids) );
		},

		addEvent: function(event) {
			const redisClient = nohm.client;
			const key = this.p('eventSetKey');
			const score = event.detail.timestamp;
			const member = JSON.stringify(event);

			return new Promise( (resolve, reject) => {
				redisClient.zadd(key, score, member, (err, numOfSavedItems) => {
					if (err) return reject(err);
					resolve(numOfSavedItems); // numOfSavedItems will always be 1.
				});
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


DeviceModel.RELATION_USER_OWNER = 'hasForeign';
DeviceModel.RELATION_USER_SHARED = 'linkedForeign';
DeviceModel.RELATIONS_WITH_USER = [
	DeviceModel.RELATION_USER_OWNER,
	DeviceModel.RELATION_USER_SHARED
];

DeviceModel.RELATION_WORKSPACE_LINKED = 'trackerForeign';


/*
 * Define static methods of DeviceModel
 */
DeviceModel.create = function (ip, deviceName, owner) {
	const device = nohm.factory('DeviceModel');
	owner = owner && owner.p('name') || '';
	const deviceInfo = {
		name: `${ip}@${deviceName}`,
		owner: owner,
		eventSetKey: `zset:${ip}@${deviceName}:EVENT`
	}

	device.p(deviceInfo);

	return device._pSave();
}

DeviceModel.resolveDeviceName = function (ip, deviceName) {
	return `${ip}@${deviceName}`;
}



module.exports = DeviceModel;