const express = require('express');
const multer = require('multer');
const path = require('path');
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



// get all attached devices
function getAllAttachedDevice(req, res) {

	const user = req.user;
	const wsId = req.params.wsId;

	WorkspaceModel._pFindAndLoad(wsId)
		.then( instance => {
			if (!instance) return Promise.reject(`None exist workspace.`);
			return instance.getAttachedDevices();
		})
		.then( devices => Promise.all(devices.map( device => device.getRefinedProperty() )) )
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

// workspace entering logic
// TODO: 사실 이 부분은 소켓로직에서 해아할 것들.
function enterWorkspace(req, res) {

	const user = req.user;
	const workspaceId = req.params.id;

	WorkspaceModel._pFindAndLoad(workspaceId)
		.then( instance => instance.getAllMembers() )
		.then( members => {
			const isJoined = !!members.find( _u => _u.id === user.id );
			if (isJoined) {
				// start getting socketio stream data
				res.render('view');
			} else {
				res.json( APIResponseMessage.ERROR('You are not joined in this workspace') );
			}
		});
}


// exit workspace
// end getting socketio stream data
function exitWorkspace(req, res) {

}


// get list of all members joined in this workspace
function getAllMembers (req,res) {

	const user = req.user;
	const workspaceId = req.params.id;

	let workspaceInstance;

	// parse ids to instances
	Promise.all([
		WorkspaceModel.findAndLoadByName(workspaceId),
	])
		.then( instances => [workspaceInstance] = instances )

	// get list of members
		.then( () => workspaceInstance.getAllMembers() )
		.then( members => {
			const promisesArray = [];
			for (let i=0; i<members.length; ++i) {
				promisesArray[i * 2    ] = members[i].allProperties();
				promisesArray[i * 2 + 1] = members[i].getMyRightsIn(workspaceInstance);
			}
			return Promise.all(promisesArray);
		})
		.then( propertiesAndAuthorities => {
			const props = [];
			for (let i=0; i<propertiesAndAuthorities.length; i=i+2) {
				propertiesAndAuthorities[i].authority = propertiesAndAuthorities[i+1];
				delete propertiesAndAuthorities[i].password;
				props.push(propertiesAndAuthorities[i]);
			}
			res.json( APIResponseMessage.OK(props) );
		})
		.catch( reason => res.json(APIResponseMessage.ERROR(reason)) );

}


// invite a user to this workspace
function inviteMember(req, res) {

	const user = req.user;
	const workspaceId = req.params.id;
	const memberId = req.body.name;

	let workspaceInstance, memberInstance;

	// parse ids to instances
	Promise.all([
		WorkspaceModel.findAndLoadByName(workspaceId),
		UserModel.findAndLoadByName(memberId)
	])
		.then( instances => [workspaceInstance, memberInstance] = instances )

	// check if caller has owner authority
		.then( () => user.getMyRightsIn(workspaceInstance) )
		.then( authorities => authorities.includes(WorkspaceModel.RELATION_USER_OWNER) ? Promise.resolve() : Promise.reject(`You are not owner`) )

	// add member
		.then( () => workspaceInstance.addMember(memberInstance) )
		.then( () => res.json(APIResponseMessage.OK()) )
		.catch( reason => res.json(APIResponseMessage.ERROR(reason)) );

}


// change authority of a member
// In the present only can handle with authority of member
function updateMemberProperties(req, res) {

	const user = req.user;
	const workspaceId = req.params.id;
	const memberId = req.params.memberId;
	const authority = req.body.authority;

	let workspaceInstance, memberInstance;
	let isMember;

	// parse ids to instances
	Promise.all([
		WorkspaceModel.findAndLoadByName(workspaceId),
		UserModel.findAndLoadByName(memberId)
	])
		.then( instances => [workspaceInstance, memberInstance] = instances )

	// check if caller has owner authority
		.then( () => user.getMyRightsIn(workspaceInstance) )
		.then( authorities => authorities.includes(WorkspaceModel.RELATION_USER_OWNER) ? Promise.resolve() : Promise.reject(`You are not owner`) )

	// check member is joined that workspace
		.then( () => workspaceInstance.getAllMembers() )
		.then( members => (isMember = !!members.find( _u => _u.id === memberInstance.id )) === true ? Promise.resolve() : Promise.reject(`The member is not joined this workspace yet`) )

	// check if authority variable is correct
		.then( () => WorkspaceModel.USER_RIGHTS.includes(authority) ? Promise.resolve() : Promise.reject(`You cannot set authority of ${authority}`) )

	// change authority
	// 	.then( () => workspaceInstance.resetRightsOf(memberInstance, WorkspaceModel.USER_RIGHTS) )
		.then( () => workspaceInstance.setRightOf(memberInstance, authority) )
		.then( () => res.json(APIResponseMessage.OK()) )
		.catch( reason => res.json(APIResponseMessage.ERROR(reason)) );
}






// Checking no session when getting the list
router.route('')
	.get(getWorkspaceList);

router.use(checkUserSession);

router.route('')
	.post(createNewWorkspace);

router.route('/:wsId')
	.get(getWorkspaceInfo)
	.put(upload.single('thumbnail') ,updateWorkspaceInfo);
	// .delete(destroyWorkspace);

router.route('/:wsId/members')
	.get(getAllMembers);

router.route('/:wsId/devices')
	.get(getAllAttachedDevice);

router.route('/:wsId/attachDevice')
	.post(attachDeviceToWorkspace);

router.route('/:wsId/detachDevice')
	.post(detachDeviceFromWorkspace);


// router.route('/:id/exit')
// 	.get(exitWorkspace);
//
// router.route('/:id/member/list')
// 	.get(getAllMembers);
//
// router.route('/:id/member/invite')
// 	.post(inviteMember);
//
// router.route('/:id/member/:memberId')
// 	.put(updateMemberProperties);




module.exports = router;
