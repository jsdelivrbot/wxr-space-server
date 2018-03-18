const express = require('express');
const router = express.Router();
const passport = require('passport');
const {UserModel} = require('../models/Models');



// register new user
// TODO: handle errors
function registerNewUser(req, res) {

	const userInfo = {
		name: req.body.username,
		password: req.body.password
	};

	console.log(`new register ${userInfo.name}, ${userInfo.password}`);
	UserModel.newUser(userInfo)
		.then( user => {
			req.login(user, err => {
				if (err) return Promise.reject(err);
				res.json( APIResponseMessage.OK() );
			});
		})
		.catch( err => {
			console.log(err);
			res.json( APIResponseMessage.ERROR(err) );
		});

}


// default login process
function localLogin(req, res) {
	passport.authenticate('local', (err, user, info) => {
		if (!!err === true || !!user === false) {
			return res.json( APIResponseMessage.ERROR(`Internal error: ${err}`) );
		} else {
			req.login(user, err => {
				if (err) return APIResponseMessage.ERROR('username or password is not valid.');
				res.json( APIResponseMessage.OK() );
			});
		}
	})(req, res);
}


// default logout process
function userLogout(req, res) {
	req.logout();
	res.json( APIResponseMessage.OK() );
}





router.route('/')
	.post(registerNewUser);

router.route('/login/local')
	.post(localLogin);

router.route('/logout')
	.get(userLogout);



module.exports = router;
