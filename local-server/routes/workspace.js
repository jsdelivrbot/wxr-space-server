var express = require('express');
var request = require('request-promise-native');
var router = express.Router();


// get workspaces
router.get('/list', function(req, res, next) {

	const URI = global.REMOTE_ORIGIN + '/workspaces';

	request(URI)
		.then( response => console.log(response) )
		.then( () => res.end() );

});


// create workspaces
router.post('/', function(req, res, next) {

	const options = {
		method: 'POST',
		uri: global.REMOTE_ORIGIN + '/workspaces',
		body: {
			name: req.body.name || 'noname'
		}
	};

	request(options)
		.then( parseBody => {
			console.log(parseBody);
		})
		.catch( err => console.log(err) )
		.then( () => res.end() );

});


// join workspaces
router.get('/:workspaceId', function(req, res, next) {

	const URI = global.REMOTE_ORIGIN + '/workspaces/' + req.params.workspaceId;
	request(URI)
		.then( response => console.log(response) )
		.then( () => res.end() );

});


// invite user
router.post('/:workspaceId/invite', function(req, res, next) {

	const URI = global.REMOTE_ORIGIN + '/workspaces/' + req.params.workspaceId;
	request(URI)
		.then( response => console.log(response) )
		.then( () => res.end() );

});


// change authority of member
router.put('/:workspaceId/member/:userId', function(req, res, next) {

	const options = {
		method: 'PUT',
		uri: global.REMOTE_ORIGIN + '/workspaces/' + workspaceId + '/member/' + userId,
		body: {
			authority: req.body.authority
		}
	};

	request(options)
		.then( response => console.log(response) )
		.then( () => res.end() );

});

module.exports = router;
