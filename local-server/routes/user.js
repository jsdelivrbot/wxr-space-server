var express = require('express');
var request = require('request-promise-native');
var router = express.Router();


// register
function createNewUser(req, res) {

	const options = createJSONOptions('POST', '/user', {
		username: req.body.username,
		password: req.body.password});
	options.resolveWithFullResponse = true;

	request(options)
		.then( response => {
			if (response.body.status === 'ok') {
				createJSONOptions.cookie = response.headers['set-cookie'] && response.headers['set-cookie'][0] || createJSONOptions.cookie;
				return Promise.resolve();
			} else {
				return Promise.reject(JSON.stringify(response.body));
			}
		})
		.then( () => res.end() )
		.catch( err => res.end(err.toString()) );
}


// login
function userLogin(req, res) {

	const options = createJSONOptions('POST', '/user/login/local', {
		username: req.body.username,
		password: req.body.password});
	options.resolveWithFullResponse = true;

	request(options)
		.then( response => {
			if (response.body.status === 'ok') {
				createJSONOptions.cookie = response.headers['set-cookie'] && response.headers['set-cookie'][0] || createJSONOptions.cookie;
				return Promise.resolve();
			} else {
				return Promise.reject(JSON.stringify(body));
			}
		})
		.then( () => res.end() )
		.catch( err => res.end(err) );
}


// logout
function userLogout(req, res) {

	const options = createJSONOptions(null, '/user/logout');

	request(options)
		.then( body => body.status === 'ok' ? Promise.resolve() : Promise.reject(JSON.stringify(body)) )
		.then( () => res.end() )
		.catch( err => res.end(err) );
}



router.route('/')
	.post(createNewUser);

router.route('/login')
	.post(userLogin);

router.route('/logout')
	.get(userLogout);


module.exports = router;
