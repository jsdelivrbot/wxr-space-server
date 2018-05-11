const express = require('express');
const mailer = require('../mailer');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mkdirp = require('mkdirp');
const router = express.Router();
const {UserModel, WorkspaceModel, DeviceModel} = require('../models/Models');

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, path.join(__app_root, '/public/images/thumbnail'));
	},
	filename: function (req, file, cb) {
		cb(null, file.fieldname + '-' + Date.now() + '-' + file.originalname);
	}
});
const upload = multer({ storage: storage });


// check whether api caller is logged in
function checkUserSession(req, res, next) {

	if (!!req.user === true) {
		next();
	} else {
		res.json( APIResponseMessage.ERROR('You are not logged in') );
	}
}


// get list of all workspaces
function getWorkspaceList(req, res) {

	let index = req.query.id;
	index = index || {
		name: req.query.name,
		ownerId: req.query.owner,
	};

	WorkspaceModel._pFindAndLoad(index)
		.then( instances => {
			instances = [].concat(instances);
			const promisesArray = instances.map( i => i.getRefinedProperty() );
			return Promise.all(promisesArray);
		})
		.then( instances => res.json( APIResponseMessage.OK(instances) ) )
		.catch( reason => res.json( APIResponseMessage.ERROR(`Unavailable access: ${reason}`) ) );
}

// create new workspace
function createNewWorkspace(req, res) {

	const user = req.user;
	const wsInfo = {
		name: req.body.name || 'noname',
		description: req.body.description || 'An Webizing Workspace.',
	};

	user.createWorkspace(wsInfo)
		.then( wsInstance => wsInstance.getRefinedProperty() )
		.then( property => res.json( APIResponseMessage.OK(property) ) )
		.catch( reason => res.json( APIResponseMessage.ERROR(reason) ) );
}


// get workspace
function getWorkspaceInfo(req, res) {

	const wsId = req.params.wsId;

	WorkspaceModel._pFindAndLoad(wsId)
		.then( instance => {
			if (!instance) return Promise.resolve({});    // if invalid wsId, return empty object.
			else return Promise.resolve(instance.getRefinedProperty());
		})
		.then( property => res.json( APIResponseMessage.OK(property) ) )
		.catch( reason => res.json( APIResponseMessage.ERROR(reason)) );
};


// save contents
function saveContents(req, res) {

	const user = req.user;
	const wsId = req.params.wsId;
	const body = req.body;
	const wsCMSPath = `../cms/` + wsId;

	// TODO: checking if requester is valid user.
	mkdirp(wsCMSPath, err => {
		if (err) res.json( APIResponseMessage.ERROR(err) );
		else fs.writeFile(wsCMSPath + `body.ejs`, body);
		res.json( APIResponseMessage.OK() );
	});
}


// update workspace info
function updateWorkspaceInfo(req, res) {

	const user = req.user;
	const wsId = req.params.wsId;
	const wsInfo = {
		name: req.body.name,
		description: req.body.description,
		thumbnail: req.file && req.file.filename
	};

	WorkspaceModel._pFindAndLoad(wsId)
		.then( instance => {
			if (!instance) return Promise.reject(`None exist workspace.`);
			else if (instance.p('ownerId') !== user.id) return Promise.reject(`That workspace is not yours.`);
			else return instance.updateProfile(wsInfo);
		})
		.then( instance => instance.getRefinedProperty() )
		.then( property => res.json( APIResponseMessage.OK(property) ) )
		.catch( reason => res.json( APIResponseMessage.ERROR(reason)) );
}


// get list of all members joined in this workspace
function getAllMembers (req,res) {

	const user = req.user;
	const wsId = req.params.wsId;


	let workspaceInstance;

	// parse ids to instances
	Promise.all([
		WorkspaceModel._pFindAndLoad(wsId),
	])
		.then( instances => [workspaceInstance] = instances )

		// get list of members
		.then( () => workspaceInstance.getAllMembers() )
		.then( members => {
			const promisesArray = [];
			for (let i=0; i<members.length; ++i) {
				promisesArray[i * 2    ] = members[i].getRefinedProperty();
				promisesArray[i * 2 + 1] = members[i].getMyRightIn(workspaceInstance);
			}
			return Promise.all(promisesArray);
		})
		.then( propertiesAndAuthorities => {
			const props = [];
			for (let i=0; i<propertiesAndAuthorities.length; i=i+2) {
				propertiesAndAuthorities[i].authority = propertiesAndAuthorities[i+1];
				props.push(propertiesAndAuthorities[i]);
			}
			return Promise.resolve(props);
		})
		.then( props => res.json( APIResponseMessage.OK(props) ) )
		.catch( reason => res.json(APIResponseMessage.ERROR(reason)) );

}

// exit workspace
function exitWorkspace(req, res) {

	const user = req.user;
	const wsId = req.params.wsId;
	const userId = req.params.userId;

	WorkspaceModel._pFindAndLoad(wsId)
		.then( instance => {
			if (user.id !== userId) return Promise.resolve();
			return user.exitWorkspace(instance);
		})
		.then( workspaceInstance => res.json( APIResponseMessage.OK() ) )
		.catch( reason => res.json( APIResponseMessage.ERROR(reason)) );
}


// change authority of a member
// In the present only can handle with authority of member
function updateMemberProperties(req, res) {

	const user = req.user;
	const wsId = req.params.wsId;
	const userId = req.params.userId;
	const authority = req.body.authority;


	let workspaceInstance, memberInstance;

	// parse ids to instances
	Promise.all([
		WorkspaceModel._pFindAndLoad(wsId),
		UserModel._pFindAndLoad(userId)
	])
		.then( instances => [workspaceInstance, memberInstance] = instances )

		// check if caller has owner authority
		.then( () => user.getMyRightIn(workspaceInstance) )
		.then( authorities => authorities.includes(WorkspaceModel.RELATION_USER_OWNER) ? Promise.resolve() : Promise.reject(`You are not owner`) )

		// check member is joined that workspace
		.then( () => workspaceInstance.isMember(memberInstance) )
		.then( isMember => isMember ? Promise.resolve() : Promise.reject(`The member is not joined this workspace yet`) )

		// check if authority variable is correct
		.then( () => WorkspaceModel.USER_RIGHTS.includes(authority) ? Promise.resolve() : Promise.reject(`You cannot set authority of ${authority}`) )

		// change authority
		// 	.then( () => workspaceInstance.resetRightsOf(memberInstance, WorkspaceModel.USER_RIGHTS) )
		.then( () => user.giveRight(workspaceInstance, memberInstance, authority) )
		.then( owner => res.json(APIResponseMessage.OK()) )
		.catch( reason => res.json(APIResponseMessage.ERROR(reason)) );
}


// invite a user to this workspace
// This only can be executed by host
function inviteMember(req, res) {

	const user = req.user;
	const wsId = req.params.wsId;
	const email = req.body.email;


	let workspaceInstance, memberInstance;

	// parse ids to instances
	Promise.all([
		WorkspaceModel._pFindAndLoad(wsId),
		UserModel.findAndLoadByEmail(email)
	])
		.then( instances => [workspaceInstance, memberInstance] = instances )

		// check if caller has owner authority
		.then( () => user.getMyRightIn(workspaceInstance) )
		.then( authorities => authorities.includes(WorkspaceModel.RELATION_USER_OWNER) ? Promise.resolve() : Promise.reject(`You are not owner`) )

		// add member
		.then( () => !!memberInstance ? workspaceInstance.setInvite(memberInstance) : Promise.reject(`The user doesn't exist.`) )
		.then( () => mailer.sendInvitationMail(email, memberInstance.p('name'), `http://es2.webizing.org/workspaces/` + workspaceInstance.id + `/members/join`) )
		.then( () => res.json(APIResponseMessage.OK()) )
		.catch( reason => res.json(APIResponseMessage.ERROR(reason)) );
}


// join the workspace
// equals for accepting invitation.
function joinWorkspace(req, res) {

	const user = req.user;
	const wsId = req.params.wsId;


	let workspaceInstance;

	WorkspaceModel._pFindAndLoad(wsId)
		.then( instance => workspaceInstance = instance )
		.then( () => workspaceInstance.getInvitedUsers() )
		.then( invitedUsers => Promise.resolve(invitedUsers.find( _u => _u.id === user.id)) )
		.then( _user => {
			if (!_user) return Promise.reject(`Invalid access.`);
			return workspaceInstance.resetInvite(user);
		})
		.then( workspaceInstance => workspaceInstance.addMember(user) )
		.then( () => res.redirect(`/view/` + workspaceInstance.id) )
		.catch( reason => res.json(APIResponseMessage.ERROR(reason)) );
}


// get all attached devices
function getAttachedDevice(req, res) {

	const user = req.user;
	const wsId = req.params.wsId;
	let index = {
		ownerId: req.query.owner,
	};

	WorkspaceModel._pFindAndLoad(wsId)
		.then( instance => {
			if (!instance) return Promise.reject(`None exist workspace.`);
			return instance.getAttachedDevices();
		})
		.then( devices => {
			// Filtering with index.ownerId
			if (!!index.owner) devices = devices.filter( device => device.p('ownerId') === index.ownerId );
			return Promise.all(devices.map( device => device.getRefinedProperty() ))
		})
		.then( refinedProperties => res.json( APIResponseMessage.OK(refinedProperties) ) )
		.catch( reason => res.json( APIResponseMessage.ERROR(reason)) );
}


// attach device
function attachDeviceToWorkspace(req, res) {

	const user = req.user;
	const wsId = req.params.wsId;
	const deviceId = req.body.deviceId;


	let workspaceInstance, deviceInstance;

	// parse ids to instances
	Promise.all([
		WorkspaceModel._pFindAndLoad(wsId),
		DeviceModel._pFindAndLoad(deviceId),
	])
		.then( instances => {
			[workspaceInstance, deviceInstance] = instances;

			// Check instances are exist.
			if (!workspaceInstance) return Promise.reject(`None exist workspace.`);
			if (!deviceInstance) return Promise.reject(`None exist device.`);

			return workspaceInstance.isMember(user);
		})
		.then( isMember => {
			// Check user relations for workspace and device are valid.
			if (!isMember) return Promise.reject(`You are not member.`);
			if (deviceInstance.p('ownerId') !== user.id) return Promise.reject(`The device is not yours.`);

			return workspaceInstance.attachDevice(deviceInstance);
		})
		.then( workspaceInstance => res.json( APIResponseMessage.OK() ) )
		.catch( reason => res.json( APIResponseMessage.ERROR(reason)) );
}


// detach device
function detachDeviceFromWorkspace(req, res) {

	const user = req.user;
	const wsId = req.params.wsId;
	const deviceId = req.body.deviceId;


	let workspaceInstance, deviceInstance;

	// parse ids to instances
	Promise.all([
		WorkspaceModel._pFindAndLoad(wsId),
		DeviceModel._pFindAndLoad(deviceId),
	])
		.then( instances => {
			[workspaceInstance, deviceInstance] = instances;

			// Check instances are exist.
			if (!workspaceInstance) return Promise.reject(`None exist workspace.`);
			if (!deviceInstance) return Promise.reject(`None exist device.`);

			return workspaceInstance.isMember(user);
		})
		.then( isMember => {
			// Check user relations for workspace and device are valid.
			if (!isMember) return Promise.reject(`You are not member.`);
			if (deviceInstance.p('ownerId') !== user.id) return Promise.reject(`The device is not yours.`);

			return workspaceInstance.detachDevice(deviceInstance);
		})
		.then( workspaceInstance => res.json( APIResponseMessage.OK() ) )
		.catch( reason => res.json( APIResponseMessage.ERROR(reason)) );
}


// delete workspace
function destroyWorkspace(req, res) {

}






// Checking no session when getting the list of workspace
router.route('')
	.get(getWorkspaceList);

router.use(checkUserSession);

router.route('')
	.post(createNewWorkspace);

router.route('/:wsId')
	.get(getWorkspaceInfo)
	.put(upload.single('thumbnail'), updateWorkspaceInfo);
	// .delete(destroyWorkspace);

router.route('/:wsId/save')
	.post(saveContents);

router.route('/:wsId/members')
	.get(getAllMembers);

router.route('/:wsId/members/:userId')
	.put(updateMemberProperties)
	.delete(exitWorkspace);

router.route('/:wsId/members/invite')
	.post(inviteMember);

router.route('/:wsId/members/join')
	.get(joinWorkspace);

router.route('/:wsId/devices')
	.get(getAttachedDevice);

router.route('/:wsId/devices/attach')
	.post(attachDeviceToWorkspace);

router.route('/:wsId/devices/detach')
	.post(detachDeviceFromWorkspace);





module.exports = router;
