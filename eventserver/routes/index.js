const express = require('express');
const router = express.Router();
const {UserModel, WorkspaceModel} = require('../models/Models');



// index page
function indexPage(req, res) {

	var options = {
		title: 'XWR Space',
		user: req.user,
		workspaceList: [],
	};

	WorkspaceModel.getAllWorkspaces()
		.then( instances => {
			instancesPropertiesOnly = instances.map( i => i._allProperties() );
			options.workspaceList = instancesPropertiesOnly;
		})
		.catch( reason => res.render('index', options) )
		.then( () => res.render('index', options) );

}




router.route('/')
	.get(indexPage);



module.exports = router;
