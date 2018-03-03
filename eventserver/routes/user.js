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
				if (err) throw Error(err);
				res.end();
			});
		})
		.catch( err => {
			console.log(err);
			res.end();
		});

}


// default login process
function localLoginSuccess(req, res) {
	res.end();
}


// default logout process
function userLogout(req, res) {
	req.logout();
	res.end();
}





router.route('/')
	.post(registerNewUser);

router.route('/login/local')
	.post(passport.authenticate('local'), localLoginSuccess);

router.route('/logout')
	.get(userLogout);



module.exports = router;
