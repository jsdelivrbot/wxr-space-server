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


// get device profiles
function getDeviceProfiles(req, res) {

	let index = req.query.id;
	index = index || {
		name: req.query.name,
		device: req.query.device,
		ownerId: req.query.owner,
	};

	DeviceModel._pFindAndLoad(index)
		.then( instances => {
			instances = [].concat(instances);
			const promisesArray = instances.map(i => i.getRefinedProperty());
			return Promise.all(promisesArray);
		})
		.then( properties => res.json( APIResponseMessage.OK(properties) ) )
		.catch( reason => res.json( APIResponseMessage.ERROR(reason)) );
}

// register new device
function registerNewDeviceProfile(req, res) {

	const user = req.user;
	const deviceProfile = {
		name: req.body.name || 'noname',
		device: req.body.device,
		deviceType: req.body.deviceType,
		connectionType: req.body.connectionType,
		status: req.body.status || 'disconnected',
		eventStreamEnable: req.body.eventStreamEnable || false,
	};

	user.registerDevice(deviceProfile)
		.then( deviceInstance => deviceInstance.getRefinedProperty() )
		.then( property => res.json( APIResponseMessage.OK(property) ) )
		.catch( reason => res.json( APIResponseMessage.ERROR(reason) ) );
}

// delete device profiles
// this can be accessed by only owner.
function deleteDeviceProfiles(req, res) {

	const user = req.user;
	let index = req.query.id;
	index = index || {
		name: req.query.name,
		device: req.query.device,
		ownerId: req.query.owner || req.user.id,
	};

	DeviceModel._pFindAndLoad(index)
		.then( instances => {
			instances = [].concat(instances);
			if (instances.find( i => i.p('ownerId') !== user.id )) return Promise.reject(`These is not your device`);
			const promisesArray = instances.map( i => i._pRemove() );
			return Promise.all(promisesArray);
		})
		.then( results => res.json( APIResponseMessage.OK(`Deletion of ${results.length} is done`)) )
		.catch( reason => res.json( APIResponseMessage.ERROR(reason)) );
}


// get a device profile
function getDeviceProfile(req, res) {

	const user = req.user;
	const deviceId = req.params.deviceId;

	DeviceModel._pFindAndLoad(deviceId)
		.then( deviceInstance => {
			if (!deviceInstance) return res.json( APIResponseMessage.OK() );
			else if (deviceInstance.p('ownerId') !== user.id) return res.json( APIResponseMessage.OK() );    // This is not your device!!!
			else return deviceInstance.getRefinedProperty();
		})
		.then( property => res.json( APIResponseMessage.OK(property)) )
		.catch( reason => res.json( APIResponseMessage.ERROR(`An internal has occurred: ${reason}`)) );
}

// update device profile
function updateDeviceProfile(req, res) {

	const user = req.user;
	const deviceId = req.params.deviceId;
	const newValues = {
		name: req.body.name,
		connectionType: req.body.connectionType,
		status: req.body.status,
		eventStreamEnable: req.body.eventStreamEnable,
	};

	DeviceModel._pFindAndLoad(deviceId)
		.then( instance => {
			if (!instance) return Promise.reject(`That device doesn't exist.`);
			else if (instance.p('ownerId') !== user.id) return Promise.resolve();   // This is not your device!!!
			else return instance.updateProfile(newValues);
		})
		.then( instance => instance.getRefinedProperty() )
		.then( property => res.json( APIResponseMessage.OK(property) ) )
		.catch( reason => res.json( APIResponseMessage.ERROR(reason) ) );
}

// delete device profile
function deleteDeviceProfile(req, res) {

	const user = req.user;
	const deviceId = req.params.deviceId;

	DeviceModel._pFindAndLoad(deviceId)
		.then( instance => {
			if (!instance) return Promise.resolve();
			else if (instance.p('ownerId') !== user.id) return Promise.resolve();   // This is not your device!!!
			else return instance._pRemove();
		})
		.then( () => res.json( APIResponseMessage.OK()) )
		.catch( reason => res.json( APIResponseMessage.ERROR(reason) ) );
}





// below goes processes needing session.
router.use(checkUserSession);


router.route('')
	.get(getDeviceProfiles)
	.post(registerNewDeviceProfile)
	// .delete(deleteDeviceProfiles);

router.route('/:deviceId')
	.get(getDeviceProfile)
	.put(updateDeviceProfile)
	// .delete(deleteDeviceProfile);




module.exports = router;
