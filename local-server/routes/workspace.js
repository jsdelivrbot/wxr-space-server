var express = require('express');
var request = require('request-promise-native');
var router = express.Router();


// get workspaces
router.get('/', function(req, res, next) {

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
router.get('/:id', function(req, res, next) {

	const URI = global.REMOTE_ORIGIN + '/workspaces/' + req.params.id;
	request(URI)
		.then( response => console.log(response) )
		.then( () => res.end() );

});


// invite user
router.post('/invite', function(req, res, next) {

	
	const URI = global.REMOTE_ORIGIN + '/workspaces/' + req.params.id;
	request(URI)
		.then( response => console.log(response) )
		.then( () => res.end() );

});

module.exports = router;
