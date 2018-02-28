var express = require('express');
var request = require('request-promise-native');
var router = express.Router();


// register
router.post('/', function(req, res, next) {

	const options = {
		method: 'POST',
		uri: global.REMOTE_ORIGIN + '/user',
		body: {
			name: req.body.username,
			password: req.body.password
		}
	};

	request(options)
		.then( parseBody => {
			console.log(parseBody);
		})
		.catch( err => console.log(err) )
		.then( () => res.end() );

});


// login
router.post('/login', function(req, res, next) {

	const options = {
		method: 'POST',
		uri: global.REMOTE_ORIGIN + '/user/login',
		body: {
			name: req.body.username,
			password: req.body.password
		}
	};

	request(options)
		.then( parseBody => {
			console.log(parseBody);
		})
		.then( () => request(global.REMOTE_ORIGIN + '/user/' + req.body.username + '/device/list') )
		.then( device_list => global.DEVICES = device_list )
		.catch( err => console.log(err) )
		.then( () => res.end() );

});


// logout
router.get('/logout', function(req, res, next) {

	const URI = global.REMOTE_ORIGIN + '/user/logout';
	request(URI)
		.then( response => console.log(response) )
		.then( () => res.end() );

});


module.exports = router;
