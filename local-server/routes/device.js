var express = require('express');
var request = require('request-promise-native');
var router = express.Router();



// Get device list in local machine
function getDeviceList(req, res) {

	const deviceList = global.DEVICES;
	res.json(deviceList);
}



router.route('/list')
	.get(getDeviceList);


module.exports = router;
