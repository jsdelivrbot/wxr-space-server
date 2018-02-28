const express = require('express');
const router = express.Router();
const passport = require('passport');
const {UserModel} = require('../models/Models');



// register new user
// TODO: handle errors
function register_new_user(req, res) {

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
function local_login_success(req, res) {
	res.end();
}


// default logout process
function user_logout(req, res) {
	req.logout();
	res.end();
}





router.route('/')
	.post(register_new_user);

router.route('/login/local')
	.post(passport.authenticate('local'), local_login_success);

router.route('/logout')
	.get(user_logout);



module.exports = router;
