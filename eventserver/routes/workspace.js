const express = require('express');
const router = express.Router();
const {UserModel, WorkspaceModel} = require('../models/Models');


// check whether api caller is logged in
function checkUserSession(req, res, next) {

	if (!!req.user === true) {
		next();
	} else {
		res.json( APIResponseMessage.ERROR('You are not logged in') );
	}
}


// create new workspace
function createNewWorkspace(req, res) {

	const user = req.user;
	const wsName = req.body.name;

	user.createWorkspace(wsName)
	// shift to enterWorkspace logic
		.then( () => enterWorkspace(req,res) )
		.catch( err => res.json(APIResponseMessage.ERROR(err)) );
}


// get list of all workspaces
function getWorkspaceList(req, res) {
	WorkspaceModel.getAllWorkspaces()
		.then( instances => {
			instancesPropertiesOnly = instances.map( i => i._allProperties() )
			res.json( APIResponseMessage.OK(instancesPropertiesOnly) );
		})
		.catch( reason => {
			if (reason === 'not found') res.json( APIResponseMessage.OK([]) );
			// TODO: response unavailable access message
			else res.json( APIResponseMessage.ERROR('Unavailable access.') );
		});
}


// workspace entering logic
function enterWorkspace(req, res) {

	const user = req.user;
	const workspaceId = req.params.id;

	WorkspaceModel.findAndLoadByName(workspaceId)
		.then( workspaceInstance => workspaceInstance.getAllMembers() )
		.then( members => {
			const isJoined = !!members.find( _u => _u.id === user.id );
			if (isJoined) {
				// start getting socketio stream data
				res.json( APIResponseMessage.OK() );
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
				promisesArray[i * 2    ] = members[i]._allProperties();
				promisesArray[i * 2 + 1] = members[i].getMyRightsIn(workspaceInstance);
			}
			return Promise.all(promisesArray);
		})
		.then( propertiesAndAuthorities => {
			const props = [];
			for (let i=0; i<propertiesAndAuthorities.length; i=i+2) {
				propertiesAndAuthorities[i].authority = propertiesAndAuthorities[i+1];
				props.push(propertiesAndAuthorities[i]);
			}
			res.json( APIResponseMessage.OK(props) );
		});

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
		.then( () => workspaceInstance.resetRightsOf(memberInstance, WorkspaceModel.USER_RIGHTS) )
		.then( () => workspaceInstance.setRightsOf(memberInstance, authority) )
		.then( () => res.json(APIResponseMessage.OK()) )
		.catch( reason => res.json(APIResponseMessage.ERROR(reason)) );
}



router.use(checkUserSession);

router.route('/')
	.post(createNewWorkspace);

router.route('/list')
	.get(getWorkspaceList);

router.route('/:id')
	.get(enterWorkspace);

router.route('/:id/exit')
	.get(exitWorkspace);

router.route('/:id/member/list')
	.get(getAllMembers);

router.route('/:id/member/invite')
	.post(inviteMember);

router.route('/:id/member/:memberId')
	.put(updateMemberProperties);




module.exports = router;
