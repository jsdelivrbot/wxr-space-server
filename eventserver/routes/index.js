const express = require('express');
const router = express.Router();
const {UserModel, WorkspaceModel} = require('../models/Models');



// index page
function indexPage(req, res) {

	var options = {
		title: 'XWR Space',
		user: req.user,
		workspaceList: [],
		recentWorkspace: null,
	};

	WorkspaceModel.getAllWorkspaces()
		.then( instances => {options.workspaceList = instances} )
		.catch( reason => res.render('index', options) )
		.then( () => {if (options.user) return options.user.getMyWorkspaces()} )
		.then( recentWorkspace => {options.recentWorkspace = recentWorkspace} )
		.then( () => res.render('index', options) );

}

// view page
function viewPage(req, res) {

	const wsId = req.params.wsId;
	const options = {
		user: req.user
	}

	res.render('view', options);
}


// profile page
function profilePage(req, res) {

	const options = {
		user: req.user,
	};

	if (!options.user === true) {
		res.redirect('/');
	} else {
		res.render('profile', options);
	}
}


// device setting page
function deviceSettingPage(req, res) {

	const options = {
		user: req.user,
	};

	if (!options.user === true) {
		res.redirect('/');
	} else {
		res.render('device_setting', options);
	}
}


// workspace manager page
function workspaceManagerPage(req, res) {
	res.end('Unimplemented');
}

// search workspace page
function searchWorkspacePage(req, res) {
	res.end('Unimplemented');
}




router.route('/')
	.get(indexPage);

router.route('/view/:wsId')
	.get(viewPage);

router.route('/profile')
	.get(profilePage);

router.route('/device_setting')
	.get(deviceSettingPage);

router.route('/workspace_manager')
	.get(workspaceManagerPage);

router.route('/search')
	.get(searchWorkspacePage);



module.exports = router;
