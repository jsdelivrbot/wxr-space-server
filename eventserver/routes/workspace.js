const express = require('express');
const router = express.Router();
const {UserModel, WorkspaceModel} = require('../models/Models');


// check whether api caller is logged in
function checkUserSession(req, res, next) {

	if (!!req.user === true) {
		next();
	} else {
		// TODO: response unavailable access message
		const message = {
			status: `error`,
			message: `You are not logged in`
		}
		res.json(message);
	}
}


// create new workspace
function create_new_workspace(req, res) {

	const user = req.user;
	const wsName = req.body.name;

	user.createWorkspace(wsName)
	// shift to enter_workspace logic
		.then( () => enter_workspace(req,res) );
}


// get list of all workspaces
function get_workspace_list(req, res) {
	WorkspaceModel.getAllWorkspaces()
		.then( instances => {
			instancesPropertiesOnly = instances.map( i => i._allProperties() )
			res.json(instancesPropertiesOnly);
		})
		.catch( reason => {
			if (reason === 'not found') res.json([]);
			// TODO: response unavailable access message
			else res.end();
		});
}


// workspace entering logic
function enter_workspace(req, res) {

	const user = req.user;
	const workspaceId = req.params.id;

	WorkspaceModel.findAndLoadByName(workspaceId)
		.then( workspaceInstance => workspaceInstance.getAllMembers() )
		.then( members => {
			const isJoined = !!members.find( _u => _u.id === user.id );
			if (isJoined) {
				// start getting socketio stream data
				res.end('ok');
			} else {
				const message = {
					status: `error`,
					message: `You are not joined in this workspace`
				}
				res.json(message);
			}
		});
}


// exit workspace
// end getting socketio stream data
function exit_workspace(req, res) {

}


// get list of all members joined in this workspace
function get_all_members (req,res) {

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
			res.json(props);
		});

}


// invite a user to this workspace
function invite_member(req, res) {

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
		.then( () => res.end() )
		// TODO: response unavailable access message
		.catch( reason => {
			const message = {
				status: `error`,
				message: reason
			}
			res.json(message);
		});

}


// change authority of a member
// In the present only can handle with authority of member
function update_member_properties(req, res) {

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
		.then( () => res.end() )
		// TODO: response unavailable access message
		.catch( reason => {
			const message = {
				status: `error`,
				message: reason
			}
			res.json(message);
		});
}



router.use(checkUserSession);

router.route('/')
	.post(create_new_workspace);

router.route('/list')
	.get(get_workspace_list);

router.route('/:id')
	.get(enter_workspace);

router.route('/:id/exit')
	.get(exit_workspace);

router.route('/:id/member/list')
	.get(get_all_members);

router.route('/:id/member/invite')
	.post(invite_member);

router.route('/:id/member/:memberId')
	.put(update_member_properties);




module.exports = router;
