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
				'notEmpty'
			]
		},
		createdDate: {
			type: 'timestamp',
			defaultValue: function () {
				return Date.now();
			}
		},
		ownerId: {
			type: 'string',
			index: true,
			validations: [
				'notEmpty'
			]
		},
		description: {
			type: 'string',
			defaultValue: 'An webizing workspace.'
		},
		thumbnail: {
			type: 'string',
		}
	},
	methods: {

		getRefinedProperty: function () {
			const UserModel = nohm.getModels()['UserModel'];
			return UserModel._pFindAndLoad(this.p('ownerId'))
				.then( instance => {
					const p = this.allProperties();
					p['ownerName'] = instance.p('name');
					p['id'] = this.id;
					return Promise.resolve(p);
				});
		},

		updateProfile: function(newValues) {
			for (let key in newValues) {
				const val = newValues[key];
				if (val === '' || val === undefined || val === null) delete newValues[key];
			}

			this.p(newValues);

			return this._pSave();
		},


		// TODO: Unsupported method in nohm v0.9.8
		// destroy: function() {
		// 	return this._pRemove();
		// },

		addMember: function (user) {
			this.link(user, WorkspaceModel.RELATION_USER_VIEWER);
			return this._pSave();
		},

		// TODO: if there are no participant, should it destroyed?
		removeMember: function (user) {
			WorkspaceModel.USER_RIGHTS.forEach( RIGHT => this.unlink(user, RIGHT) );
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

		getRightOf: function (user) {
			let right = null;
			const promisesArray = WorkspaceModel.USER_RIGHTS.map( RIGHT => {
				return this._pBelongsTo(user, RIGHT)
					.then( isBelonged => isBelonged ? right = RIGHT : 'not belonged' );
			});

			return Promise.all(promisesArray)
				.then( () => Promise.resolve(right) );
		},

		setRightOf: function (user, right) {
			if (WorkspaceModel.USER_RIGHTS.includes(right) === false) {
				return Promise.reject('Invalid right');
			}

			// Reset all rights was set.
			WorkspaceModel.USER_RIGHTS.forEach( RIGHT => this.unlink(user, RIGHT) );

			this.link(user, right);
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
					// refreshDeviceEventPublishListOf(device);
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
				.then( ids => DeviceModel.propagateInstance(ids) );
		},



		// Pub/Sub of redis has no relation to the key space. It was made to not interfere with it on any level, by including database numbers.
		// Publishing on db 10, will be heard by a subscriber on db 1.
		// So we have to scoping by prefixing.
		getChannelName: function() {
			return `DATABASE${config.get('dbConfig.db')}:${this.id}`;
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
WorkspaceModel.create = function (owner, workspaceInfo) {
	const ws = nohm.factory('WorkspaceModel');
	workspaceInfo.ownerId = owner.id;

	const right = WorkspaceModel.RELATION_USER_OWNER;

	ws.p(workspaceInfo);

	return ws._pSave()
		.then( () => ws.setRightOf(owner, right) );
};


// for further implementation, this function should accept filter option.
WorkspaceModel.getAllWorkspaces = function () {
	return this.findAndLoadAll();
};


function getMembersOfRights(RIGHTS) {
	const UserModel = nohm.getModels()['UserModel'];
	return this.getAllLinks('UserModel', RIGHTS)
		.then( ids => UserModel.propagateInstance(ids) );
}

module.exports = WorkspaceModel;