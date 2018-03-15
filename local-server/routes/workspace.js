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

	ATTACHED_DEVICES = [];
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


function attachDevice(req, res) {

	const deviceId = req.body.id;
	const device = global.DEVICES[deviceId];

	// check deviceId is right
	if (!!device === false) {
		return res.end('no that device');
	}

	global.ATTACHED_DEVICES[deviceId] = device;
	res.end();
}


function getAttachedDeviceList(req, res) {

	const attachedDeviceList = global.ATTACHED_DEVICES;
	res.json(attachedDeviceList);
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

router.route('/:id/device')
	.post(attachDevice);

router.route('/:id/device/list')
	.get(getAttachedDeviceList);

module.exports = router;
