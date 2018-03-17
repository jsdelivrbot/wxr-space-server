var request = require('request-promise-native');
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	
	let workspaceList = null;
	
	const options = createJSONOptions(null, '/workspace/list');

	request(options)
		.then( body => {
			res.render('index', {
				title: 'Motion Tracking Service',
				user: !!createJSONOptions.cookie,
				workspaces: body.message,
			})
		})
	
});

module.exports = router;
