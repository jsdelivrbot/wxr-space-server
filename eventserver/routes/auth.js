const express = require('express');
const router = express.Router();
const passport = require('passport');
const {UserModel} = require('../models/Models');

// default login process
router.post('/login', passport.authenticate('local', {
		successRedirect: '/',
		failureRedirect: '/',
		failureFlash: false
	})
);

// default logout process
router.get('/logout', function(req, res) {
	req.logout();
	res.redirect('/');
});


// signup
router.post('/signup', function(req, res) {

	const userInfo = {
		name: req.body.username,
		password: req.body.password
	};

	console.log(`new register ${userInfo.name}, ${userInfo.password}`);
	UserModel.newUser(userInfo)
		.then( user => {
			req.login(user, err => {
				if (err) throw Error(err);
				res.redirect('/');
			});
		})
		.catch( err => {
			console.log(err);
			res.redirect('/');
		});

});



module.exports = router;
