const nohm = require('nohm').Nohm;
require('../object_extend');
const UUID = require('uuid/v4');

const PASSWORD_MINLENGTH = 6;


/**
 * Model definition of a simple user
 */
const UserModel = nohm.model('UserModel', {
	idGenerator: callback => callback(UUID()),
	properties: {
		email: {
			type: 'string',
			unique: true,
			validations: [
				'email',
				'notEmpty'
			]
		},

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
		},

		profileImage: {
			type: 'string',
		},
		
		recentWorkspaces: {
			type: 'json',
			defaultValue: [],
		}
	},
	methods: {

		validPassword: function (password) {
			return this.p('password') === password.toString().hash();
		},

		updateProperties: function (newValues) {
			for (let key in newValues) {
				const val = newValues[key];
				if (val === '' || val === undefined || val === null) delete newValues[key];
			}

			this.p(newValues);

			return this._pSave();
		},

		getRefinedProperty: function () {
			const p = this.allProperties();
			delete p['password'];
			return Promise.resolve(p);
		},


		/*
		 * workspace control helpers
		 */
		createWorkspace: function(wsInfo) {
			const WorkspaceModel = nohm.getModels()['WorkspaceModel'];
			const owner = this;
			return WorkspaceModel.create(owner, wsInfo);
		},

		getMyWorkspaces: function() {
			const {UserModel, WorkspaceModel} = nohm.getModels();
			return this.getAllLinks('WorkspaceModel', UserModel.RELATION_WORKSPACE_JOINED)
				.then( ids => WorkspaceModel.propagateInstance(ids) );
		},

		joinWorkspace: function (ws) {
			return ws.addMember(this)
				.then( workspaceInstnace => Promise.resolve(this) );
		},

		exitWorkspace: function (ws) {
			return ws.removeMember(this)
				.then( workspaceInstnace => Promise.resolve(this) );
		},

		getMyRightIn: function (ws) {
			return ws.getRightOf(this);
		},

		giveRight: function (ws, member, right) {
			return ws.setRightOf(member, right)
				.then( workspaceInstnace => Promise.resolve(this) );
		},
		
		touchRecentWorkspace: function(ws) {
			let recent = this.p('recentWorkspaces');
			recent = [ws.id].concat(recent);
			recent = [...(new Set(recent))];
			this.p('recentWorkspaces', recent);
			return this._pSave();
		},

		// TODO: Unsupported method in nohm v0.9.8
		// removeWorkspace: function(ws) {
		// 	const WorkspaceModel = nohm.getModels()['WorkspaceModel'];
		// 	return ws.getRightOf(this)
		// 		.then( right => right === WorkspaceModel.RELATION_USER_OWNER ? ws.destroy() : Promise.reject(`You are not owner of this workspace.`) );
		// },

		attachDeviceTo: function(ws, device) {
			if (this.id !== device.p('ownerId')) return Promise.reject(new Error(`This device is not yours.`));
			return ws.attachDevice(device);
		},

		detachDeviceFrom: function(ws, device) {
			if (this.id !== device.p('ownerId')) return Promise.reject(new Error(`This device is not yours.`));
			return ws.detachDevice(device);
		},


		/*
		 * device control helpers
		 */
		registerDevice: function(deviceProfile) {
			const DeviceModel = nohm.getModels()['DeviceModel'];
			const owner = this;
			return DeviceModel.create(owner, deviceProfile);
		},

		getMyDevices: function() {
			const DeviceModel = nohm.getModels()['DeviceModel'];
			return DeviceModel.getAllDevicesOf(this);
		},

		// TODO: Unsupported method in nohm v0.9.8
		// removeDevice: function(device) {
		// 	if (this.id !== device.p('ownerId')) return Promise.reject(new Error(`This device is not yours.`));
		// 	return device.destroy();
		// }


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


/*
 * Define static methods of UserModel
 */
UserModel.create = function(userInfo) {
	const user = nohm.factory('UserModel');
	user.p(userInfo);
	return user._pSave();
};

UserModel.login = function(email, password) {
	return Promise.resolve()
		.then( () => {
			if (!email || !password)
				return Promise.reject(new Error(`email or password is invalid`));
		})
		.then( () => this.findAndLoadByEmail(email) )
		.then( user => {
			if (user && user.validPassword(password))
				return Promise.resolve(user);
			else
				return Promise.reject(new Error(`email or password is invalid`));
		});
};

UserModel.findAndLoadByEmail = function(email) {
	return this._pFindAndLoad({email: email})
		.then( instances => Promise.resolve(instances[0]) );
};



module.exports = UserModel;