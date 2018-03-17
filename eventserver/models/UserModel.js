const nohm = require('nohm').Nohm;
require('../object_extend');


const PASSWORD_MINLENGTH = 6;


/**
 * Model definition of a simple user
 */
const UserModel = nohm.model('UserModel', {
	properties: {
		name: {
			type: 'string',
			unique: true,
			validations: [
				// 'email',
				'notEmpty'
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

		password: {
			load_pure: true, // this ensures that there is no typecasting when loading from the db.
			type: function (value, key, old) {
				value = value.toString();
				let pwd;
				let valueDefined = (value && typeof(value.length) !== 'undefined');

				if (valueDefined && value.length >= PASSWORD_MINLENGTH) {
					pwd = value.hash();
					return pwd;
				} else {
					return old;
				}
			},

			validations: [
				'notEmpty',
				['length', {
					min: PASSWORD_MINLENGTH
				}]
			]
		}
	},
	methods: {

		validPassword: function (password) {
			return this.p('password') === password.toString().hash();
		},


		/*
		 * workspace control helpers
		 */
		createWorkspace: function(wsName) {
			const {WorkspaceModel} = nohm.getModels();
			const owner = this;
			return WorkspaceModel.create(owner, wsName);
		},

		getMyWorkspaces: function() {
			const {UserModel, WorkspaceModel} = nohm.getModels();
			return this.getAllLinks('WorkspaceModel', UserModel.RELATION_WORKSPACE_JOINED)
				.then( ids => WorkspaceModel.propagateInstances(ids) );
		},

		joinWorkspace: function (ws) {
			return ws.addMember(this);
		},

		exitWorkspace: function (ws) {
			return ws.removeMember(this);
		},

		getMyRightsIn: function (ws) {
			return ws.getRightsOf(this);
		},

		giveRights: function (ws, member, rights) {
			return ws.setRightsOf(member, rights);
		},

		ridOfRights: function (ws, member, rights) {
			return ws.resetRightsOf(member, rights)
		},




		/*
		 * device control helpers
		 */
		addDevice: function(device) {
			this.link(device, UserModel.RELATION_DEVICE_HAS);
			return this._pSave();
		},

		shareDeviceWith: function(device, user) {
			// TODO: Checking if the caller is device's owner.
			user.link(device, UserModel.RELATION_DEVICE_LINKED)
			return user._pSave()
			// Added .then chain do nothing for returning undefined
				.then();
		},

		getMyDevices: function() {
			const DeviceModel = nohm.getModels()['DeviceModel'];
			return this.getAllLinks('DeviceModel', UserModel.RELATION_DEVICE_HAS)
				.then( ids => DeviceModel.propagateInstances(ids) );
		},

		getDevices: function() {
			const DeviceModel = nohm.getModels()['DeviceModel'];

			return this.getAllLinks('DeviceModel', UserModel.RELATIONS_WITH_DEVICE)
				.then( ids => DeviceModel.propagateInstances(ids) );
		},

		cutSharingFrom: function(device, user) {
			// TODO: Checking if the caller is device's owner.
			user.unlink(device, UserModel.RELATION_DEVICE_LINKED);
			return user._pSave()
			// Added .then chain do nothing for returning undefined
				.then();
		},

		removeDevice: function(device) {
			if (this.p('name') === device.p('owner')) {
				return device.getSharedUser()
					.then( sharedUsers => {
						const promisesArray = sharedUsers.map( user => {
							return this.cutSharingFrom(device, user)
						});
						return Promise.all(promisesArray)
					})
					.then( () => device.destroy() );
			}
			this.unlink(device, UserModel.RELATION_DEVICE_LINKED);
			return this._pSave();
		}

	}
});


UserModel.RELATION_WORKSPACE_VIEWER = 'viewerForeign';
UserModel.RELATION_WORKSPACE_EDITOR = 'editorForeign';
UserModel.RELATION_WORKSPACE_OWNER = 'ownerForeign';
UserModel.RELATION_WORKSPACE_JOINED = [
	UserModel.RELATION_WORKSPACE_VIEWER,
	UserModel.RELATION_WORKSPACE_EDITOR,
	UserModel.RELATION_WORKSPACE_OWNER
];
UserModel.RELATION_DEVICE_HAS = 'has';
UserModel.RELATION_DEVICE_LINKED = 'linked';
UserModel.RELATIONS_WITH_DEVICE = [
	UserModel.RELATION_DEVICE_HAS,
	UserModel.RELATION_DEVICE_LINKED
];


/*
 * Define static methods of UserModel
 */
UserModel.login = function(name, password) {
	return Promise.resolve()
		.then( () => {
			if (!name || name === '' || !password || password === '')
				return Promise.reject(new Error(`name or password is invalid`));
		})
		.then( () => this.findAndLoadByName(name) )
		.then( user => {
			if (user && user.validPassword(password))
				return Promise.resolve(user);
			else
				return Promise.reject(new Error(`name or password is invalid`));
		});
}

UserModel.newUser = function(userInfo) {
	const user = nohm.factory('UserModel');
	user.p(userInfo);
	return user._pSave();
}



module.exports = UserModel;