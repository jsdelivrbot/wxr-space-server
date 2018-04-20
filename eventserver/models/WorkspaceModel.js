const nohm = require('nohm').Nohm;
const config = require('config');
const UUID = require('uuid/v4');


/**
 * Model definition of Workspace
 */
const WorkspaceModel = nohm.model('WorkspaceModel', {
	idGenerator: callback => callback(UUID()),
	properties: {
		name: {
			type: 'string',
			index: true,
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
			}
		},
		owner: {
			type: 'string',
			validations: [
				'notEmpty'
			]
		}
	},
	methods: {


		addMember: function (user) {
			this.link(user, WorkspaceModel.RELATION_USER_VIEWER);
			return this._pSave();
		},

		removeMember: function (user) {
			WorkspaceModel.USER_RIGHTS.forEach( RIGHT => {
				this.unlink(user, RIGHT);
			});
			return this._pSave();
		},

		getAllMembers: function() {
			return getMembersOfRights.call(this, WorkspaceModel.USER_RIGHTS);
		},

		getEditors: function () {
			return getMembersOfRights.call(this, WorkspaceModel.RELATION_USER_EDITOR);
		},

		getViewers: function () {
			return getMembersOfRights.call(this, WorkspaceModel.RELATION_USER_VIEWER);
		},

		getRightsOf: function (user) {
			const rights = [];
			const promisesArray = WorkspaceModel.USER_RIGHTS.map( RIGHT => {
				return this._pBelongsTo(user, RIGHT)
					.then( isBelonged => isBelonged ? rights.push(RIGHT) : 'not belonged' );
			});

			return Promise.all(promisesArray)
				.then( () => Promise.resolve(rights) );
		},

		setRightsOf: function (user, rights) {
			rights = Array.isArray(rights) ? rights : new Array(rights);

			const setRights = WorkspaceModel.USER_RIGHTS.filter( RIGHT => {
				if (rights.indexOf(RIGHT) !== -1) return !this.link(user, RIGHT);
				else return false;
			});

			return this._pSave()
				.then( () => Promise.resolve(setRights) );
		},

		resetRightsOf: function (user, rights) {
			rights = Array.isArray(rights) ? rights : new Array(rights);

			rights.forEach( RIGHT => this.unlink(user, RIGHT) );

			return this._pSave();
		},


		/*
		 * Device control helpers
		 */
		attachDevice: function(device) {
			this.link(device, WorkspaceModel.RELATION_DEVICE_TRACKER);

			return this._pSave()
			// For updating event data publishing list of device in socket instance, Calling refreshDeviceEventPublishListOf should be needed.
				.then( workspace => {
					refreshDeviceEventPublishListOf(device);
					return Promise.resolve(workspace);
				});
		},

		detachDevice: function (device) {
			this.unlink(device, WorkspaceModel.RELATION_DEVICE_TRACKER);
			return this._pSave();
		},

		getAttachedDevices: function () {
			const DeviceModel = nohm.getModels()['DeviceModel'];
			return this.getAllLinks('DeviceModel', WorkspaceModel.RELATION_DEVICE_TRACKER)
				.then( ids => DeviceModel.propagateInstances(ids) );
		},

		// Pub/Sub of redis has no relation to the key space. It was made to not interfere with it on any level, including database numbers.
		// Publishing on db 10, will be heard by a subscriber on db 1.
		// So we have to scoping by prefixing.
		getChannelName: function() {
			return `DATABASE${config.get('dbConfig.db')}:${this.p('name')}`;
		}

	}
});


WorkspaceModel.RELATION_USER_OWNER = 'owner';
WorkspaceModel.RELATION_USER_EDITOR = 'editor';
WorkspaceModel.RELATION_USER_VIEWER = 'viewer';

WorkspaceModel.USER_RIGHTS = [
	WorkspaceModel.RELATION_USER_OWNER,
	WorkspaceModel.RELATION_USER_EDITOR,
	WorkspaceModel.RELATION_USER_VIEWER
];

WorkspaceModel.RELATION_DEVICE_TRACKER = 'tracker';


/*
 * Define static methods of WorkspaceModel
 */
WorkspaceModel.create = function (owner, wsName) {
	const ws = nohm.factory('WorkspaceModel');
	const workspaceInfo = {
		name: owner.p('name') + '@' + wsName,
		owner: owner.p('name')
	}
	const rights = WorkspaceModel.USER_RIGHTS;

	ws.p(workspaceInfo);

	return ws._pSave()
		.then( () => ws.setRightsOf(owner, rights) )
		// ws.setRightsOf method will return the list of rights that is successfully saved.
		// so to return created workspace instance to caller, process Promise.resolve(ws).
		.then( rights => Promise.resolve(ws) );
}


// for further implementation, this function should accept filter option.
WorkspaceModel.getAllWorkspaces = function () {
	return this.findAndLoadAll();
}



function getMembersOfRights(RIGHTS) {
	const UserModel = nohm.getModels()['UserModel'];
	return this.getAllLinks('UserModel', RIGHTS)
		.then( ids => UserModel.propagateInstances(ids) );
}


module.exports = WorkspaceModel;