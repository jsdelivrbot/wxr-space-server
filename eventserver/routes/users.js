const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const passport = require('passport');
const {UserModel, DeviceModel} = require('../models/Models');


const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, path.join(__app_root, '/public/images/profile'));
	},
	filename: function (req, file, cb) {
		cb(null, file.fieldname + '-' + Date.now() + '-' + file.originalname);
	}
});
const upload = multer({ storage: storage });

// check whether api caller is logged in
function checkUserSession(req, res, next) {

	if (!!req.user === true) {
		next();
	} else {
		res.json( APIResponseMessage.ERROR('You are not logged in') );
	}
}


// register new user
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
			});
		}
	})(req, res);
}


// default logout process
function userLogout(req, res) {
	req.logout();
	res.redirect('/');
}


// update user profile
function updateUserProfile(req, res) {

	const userInfo = {
		name: req.body.name,
		password: req.body.password,
		profileImage: req.file && req.file.filename
	};

	req.user.updateProperties(userInfo)
		.then( instance => instance.getRefinedProperty() )
		.then( property => res.json( APIResponseMessage.OK(property)) )
		.catch( reason => res.json( APIResponseMessage.ERROR(reason)) );
}





router.route('')
	.post(registerNewUser);

router.route('/login/local')
	.post(localLogin);

router.route('/logout')
	.get(userLogout);


// below goes processes needing session.
router.use(checkUserSession);


router.route('/:userId')
	.put(upload.single('profile'), updateUserProfile);

// shortcut for /workspaces/:wsId/members/:userId
router.route('/me/exit/workspace/:wsId')
	.delete(function exitWorkspace(req, res) {
		res.redirect(`/workspaces/` + req.params.wsId + `/members/` + req.user.id);
	});

// shortcut for /devices?owner=user.id
router.route('/me/devices')
	.get(function getMyDeviceProfiles(req, res) {
		res.redirect(`/devices?owner=${req.user.id}`);
	});
router.route('/me')
	.put(function updateMyProfile(req, res) {
		res.redirect(`/users/${req.user.id}`);
	});



module.exports = router;
