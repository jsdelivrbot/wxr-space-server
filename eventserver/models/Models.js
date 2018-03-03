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
	findAndLoadAll,
	findAndLoadByName,
	propagateInstances,
];

// Overwrite basic methods of instance.
const bm = [
	_pSave,
	_pBelongsTo,
	_allProperties,
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
function findAndLoadAll() {
	const model = nohm.factory(this.prototype.modelName);
	return new Promise( (resolve, reject) => {
		model.findAndLoad({}, (err, instances) => {
			if (err === 'not found') instances = [];
			else if (err) return reject(err);
			resolve(instances);
		});
	});
}


function findAndLoadByName (name) {
	const model = nohm.factory(this.prototype.modelName);
	return new Promise( (resolve, reject) => {
		model.findAndLoad({name: name}, (err, instances) => {
			if (err === 'not found') instances = [];
			else if (err) return reject(err);
			resolve(instances[0]);
		});
	});
}


function propagateInstances (ids) {
	const promisesArray = ids.map( id => {
		return new Promise( (resolve, reject) => {
			let instance = nohm.factory(this.prototype.modelName, id, (err, prop) => {
				if (err === 'not found') instance = undefined;
				else if (err) return reject(err);
				resolve(instance);
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
			if (err === 'not found') isBelonged = false;
			else if (err) return reject(err);
			resolve(isBelonged);
		});
	});
}


function _allProperties() {
	let props = this.allProperties();
	delete props.id;
	return props;
}


function getAllLinks (modelName, linkNames) {
	linkNames = Array.isArray(linkNames) ? linkNames : new Array(linkNames);
	const promisesArray = linkNames.map(linkName => {
		return new Promise((resolve, reject) => {
			this.getAll(modelName, linkName, (err, roleIds) => {
				if (err === 'not found') roleIds = [];
				else if (err) return reject(err);
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


