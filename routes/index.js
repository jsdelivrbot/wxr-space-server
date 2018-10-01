const express = require('express');
const router = express.Router();
const {UserModel, WorkspaceModel} = require('../models/Models');



// index page
function indexPage(req, res) {

	const user = req.user;
	var options = {
		title: 'WXR Space',
		user: user,
		workspaceList: [],
		recentWorkspace: null,
	};

	WorkspaceModel.getAllWorkspaces()
		.then( instances => {
			const promisesArray = instances.map(i => i.getRefinedProperty());
			return Promise.all(promisesArray);
		})
		.then( properties => {options.workspaceList = properties} )
		.then( () => WorkspaceModel.propagateInstance(user.p('recentWorkspaces')) )
		.then( instances => {
			const promisesArray = instances.map(i => i.getRefinedProperty());
			return Promise.all(promisesArray);
		})
		.then( properties => {options.recentWorkspace = properties} )
		.then( () => res.render('index', options) )
		.catch( reason => res.render('index', options) );

}

// view page
function viewPage(req, res) {

	const user = req.user;
	const wsId = req.params.wsId;

	
	let workspaceInstance;

	WorkspaceModel._pFindAndLoad(wsId)
		.then( instance => workspaceInstance = instance )
		.then( () => workspaceInstance.isMember(user) )
		.then( isMember => {
			if (isMember) {
				const options = {
					user: user,
					workspace: workspaceInstance,
				};
				user.touchRecentWorkspace(workspaceInstance);
				res.render('view', options);
			} else {
				res.redirect('/');
			}
		});
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

	const user = req.user;
	const options = {
		user: user,
		workspaceList: [],
	};

	if (!user) {
		res.redirect('/');
	} else {
		user.getMyWorkspaces()
			.then( instances => {
				const promisesArray = instances.map(i => i.getRefinedProperty());
				return Promise.all(promisesArray);
			})
			.then( properties => {
				options.workspaceList = properties;
				res.render('my_workspace', options);
			})
			.catch( reason => res.redirect('/') );
	}
}

// search workspace page
function searchWorkspacePage(req, res) {

	const user = req.user;
	const keyword = req.query.keyword;
	const options = {
		user: user,
		keyword: keyword,
		workspaceList: [],
	};

	WorkspaceModel.findAndLoadByKeyword(keyword)
		.then( instances => {
			const promisesArray = instances.map(i => i.getRefinedProperty());
			return Promise.all(promisesArray);
		})
		.then( properties => {options.workspaceList = properties} )
		.then( () => res.render('search', options) );
		//.catch( reason => res.render('index', options) );

	//res.render('search', options);
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
