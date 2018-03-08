var express = require('express');
var request = require('request-promise-native');
var router = express.Router();



function createNewWorkspace(req, res) {

	const options = createJSONOptions('POST', '/workspace', {
		name: req.body.name});

	request(options)
		.then( body => body.status === 'ok' ? Promise.resolve() : Promise.reject(JSON.stringify(body)) )
		.then( () => res.end() )
		.catch( err => res.end(err) );
}


function getWorkspaceList(req, res) {

	const options = createJSONOptions(null, '/workspace/list');

	request(options)
		.then( body => body.status === 'ok' ? Promise.resolve(JSON.stringify(body.message)) : Promise.reject(JSON.stringify(body)) )
		.then( workspaceList => res.end(workspaceList) )
		.catch( err => res.end(err) );
}


// TODO: connect socketio stream
function enterWorkspace(req, res) {

}


// TODO: exit socketio stream
function exitWorkspace(req, res) {

}


function getAllMembers(req, res) {

	const workspaceId = req.params.id;
	const options = createJSONOptions(null, `/workspace/${workspaceId}/member/list`);

	request(options)
		.then( body => body.status === 'ok' ? Promise.resolve(JSON.stringify(body.message)) : Promise.reject(JSON.stringify(body)) )
		.then( workspaceList => res.end(workspaceList) )
		.catch( err => res.end(err) );
}


function inviteMember(req, res) {

	const workspaceId = req.params.id;
	const options = createJSONOptions('POST', `/workspace/${workspaceId}/member/invite`, {
		name: req.body.name});

	request(options)
		.then( body => body.status === 'ok' ? Promise.resolve() : Promise.reject(JSON.stringify(body)) )
		.then( () => res.end() )
		.catch( err => res.end(err) );
}


// TODO:
function updateMemberProperties(req, res) {

}




router.route('/')
	.post(createNewWorkspace);

router.route('/list')
	.get(getWorkspaceList);

router.route('/:id/enter')
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
