const nohm = require('nohm').Nohm;
const UserModel = require('./UserModel');
const WorkspaceModel = require('./WorkspaceModel');
const DeviceModel = require('./DeviceModel');
const EventModel = require('./EventModel');
const {inspect} = require('util');

const Models = {
	UserModel: UserModel,
	WorkspaceModel: WorkspaceModel,
	DeviceModel: DeviceModel
};

// Overwrite static methods.
const sm = [
	findAndLoadByName,
	propagateInstances,
];

// Overwrite basic methods of instance.
const bm = [
	_pSave,
	_pBelongsTo,
	getAllLinks,
];


for ( const key in Models ) {
	sm.forEach( f => { Models[key][f.name] = f });
	bm.forEach( f => { Models[key].prototype[f.name] = f } );
}



// EventModel is added manually because it is just pure javascript class not likely other models created by nohm.
// So this model doesn't serve methods inherited from nohm model.
Models.EventModel = EventModel;


module.exports = Models;



/*
 * Define static methods of Model
 * Defaultly defined methods are:
 *    load
 *    find
 *    findAndLoad
 *    save
 *    sort
 *    subscribe
 *    subscribeOnce
 *    unsubscribe
 *    remove
 */
function findAndLoadByName (name) {
	const model = nohm.factory(this.prototype.modelName);
	return new Promise( (resolve, reject) => {
		model.findAndLoad({name: name}, (err, instances) => {
			if (err) reject(err);
			else resolve(instances[0]);
		});
	});
}


function propagateInstances (ids) {
	const promisesArray = ids.map( id => {
		return new Promise( (resolve, reject) => {
			const instance = nohm.factory(this.prototype.modelName, id, (err, prop) => {
				if (err) reject(err);
				else resolve(instance);
			});
		});
	});

	return Promise.all(promisesArray);
}


/*
 * Define basic methods of instance.
 */
function _pSave() {
	return new Promise( (resolve, reject) => {
		this.save( err => {
			if (err) reject({err:err, info:JSON.stringify(this.errors)});
			else resolve(this);
		});
	});
}


function _pBelongsTo(instance, relation) {
	return new Promise( (resolve, reject) => {
		this.belongsTo(instance, relation, (err, isBelonged) => {
			if (err) reject(err);
			else resolve(isBelonged);
		});
	});
}


function getAllLinks (modelName, linkNames) {
	linkNames = Array.isArray(linkNames) ? linkNames : new Array(linkNames);
	const promisesArray = linkNames.map(linkName => {
		return new Promise((resolve, reject) => {
			this.getAll(modelName, linkName, (err, roleIds) => {
				if (err) reject(err);
				resolve(roleIds);
			});
		});
	});

	return Promise.all(promisesArray)
		.then( linksArray => {
			let allLinks = [];
			linksArray.forEach( links => { allLinks = allLinks.union(links) } );
			return Promise.resolve(allLinks);
		});
}




/*
 * Define global helper function
 */
// Deprecated function
// This was for unit test not using redis.client.flushdb()
global.clearInstances = function (_r, cb) {
	const removeList = [];
	_r.forEach( e => e && e.remove && removeList.push(e) );

	if (removeList.length === 0) {
		cb();
		return;
	}
	removeList.forEach( (instance, index) => {
		instance.remove( () => {
			if (index === removeList.length-1) {
				cb();
			}
		});
	});
}


