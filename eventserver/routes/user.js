const express = require('express');
const router = express.Router();
const passport = require('passport');
const {UserModel, DeviceModel} = require('../models/Models');


// check whether api caller is logged in
function checkUserSession(req, res, next) {

	if (!!req.user === true) {
		next();
	} else {
		res.json( APIResponseMessage.ERROR('You are not logged in') );
	}
}


// register new user
// TODO: handle errors
function registerNewUser(req, res) {

	const userInfo = {
		email: req.body.email,
		name: req.body.name,
		password: req.body.password
	};

	console.log(`new register ${userInfo.email}, ${userInfo.password}`);
	UserModel.create(userInfo)
		.then( user => {
			req.login(user, err => {
				if (err) return Promise.reject(err);
				res.redirect('/');
				// res.json( APIResponseMessage.OK() );
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
		if (!!err === true) {
			return res.json(APIResponseMessage.ERROR(`Internal error: ${err}`));
		} else if (!!user === false) {
			return APIResponseMessage.ERROR('username or password is not valid.');
		} else {
			req.login(user, err => {
				if (err) return APIResponseMessage.ERROR('username or password is not valid.');
				res.redirect('/');
				// res.json( APIResponseMessage.OK() );
			});
		}
	})(req, res);
}


// default logout process
function userLogout(req, res) {
	req.logout();
	res.redirect('/');
	// res.json( APIResponseMessage.OK() );
}


// update user profile
function updateUserProfile(req, res) {

	const userInfo = {
		name: req.params.name,
		password: req.params.password
	};

	res.end('Unimplemented.');
}


router.route('')
	.post(registerNewUser);

router.route('/login/local')
	.post(localLogin);

router.route('/logout')
	.get(userLogout);


// below goes processes needing session.
router.use(checkUserSession);


router.route('')
	.put(updateUserProfile);

// shortcut for /device?owner=user.id
router.route('/me/device')
	.get(function getMyDeviceProfiles(req, res) {
		res.redirect(`/device?owner=${req.user.id}`);
	});



module.exports = router;
