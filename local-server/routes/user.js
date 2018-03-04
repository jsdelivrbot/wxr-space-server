var express = require('express');
var request = require('request-promise-native');
var router = express.Router();


// register
function createNewUser(req, res) {

	const options = {
		method: 'POST',
		uri: global.REMOTE_ORIGIN + '/user',
		body: {
			username: req.body.username,
			password: req.body.password
		}
	};

	request(options)
		.then( parseBody => {
			console.log(parseBody);
		})
		.catch( err => console.log(err) )
		.then( () => res.end() );
}


// login
function userLogin(req, res) {

	const options = {
		method: 'POST',
		uri: global.REMOTE_ORIGIN + '/user/login/local',
		body: {
			username: req.body.username,
			password: req.body.password
		}
	};

	request(options)
		.then( parseBody => {
			console.log(parseBody);
		})
		.catch( err => console.log(err) )
		.then( () => res.end() );
}


// logout
function userLogout(req, res) {

	const URI = global.REMOTE_ORIGIN + '/user/logout';
	request(URI)
		.then( response => console.log(response) )
		.then( () => res.end() );

}



router.route('/')
	.post(createNewUser);

router.route('/login')
	.post(userLogin);

router.route('/logout')
	.get(userLogout);


module.exports = router;
