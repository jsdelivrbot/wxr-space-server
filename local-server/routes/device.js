var express = require('express');
var request = require('request-promise-native');
var router = express.Router();



// Get device list in local machine
router.get('/list', function(req, res, next) {

	const device_list = global.DEVICES;
	res.send(device_list);
	res.end();
});


// Delete device profile
router.delete('/:deviceId', function(req, res, next) {

	const options = {
		method: 'DELETE',
		uri: global.REMOTE_ORIGIN + '/user/'+ req.param.userId + '/device/' + req.param.deviceId
	};

	request(options)
		.then( parseBody => {
			console.log(parseBody);
		})
		.catch( err => console.log(err) )
		.then( () => res.end() );

});


module.exports = router;
