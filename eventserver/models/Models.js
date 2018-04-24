const nohm = require('nohm').Nohm;
const UserModel = require('./UserModel');
const WorkspaceModel = require('./WorkspaceModel');
const DeviceModel = require('./DeviceModel');
const EventModel = require('./EventModel');

const Models = {
	UserModel: UserModel,
	WorkspaceModel: WorkspaceModel,
	DeviceModel: DeviceModel
};

// Overwrite static methods.
const sm = [
	_pFindAndLoad,
	findAndLoadAll,
	findAndLoadByName,
	propagateInstance,
];

// Overwrite basic methods of instance.
const bm = [
	_pSave,
	_pBelongsTo,
	_pRemove,
	getAllLinks,
];


for ( const key in Models ) {
	const model = Models[key];
	sm.forEach( f => { model[f.name] = f });
	bm.forEach( f => { model.prototype[f.name] = f } );
}






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


function _pFindAndLoad(indexSet) {
	const model = nohm.getModels()[this.prototype.modelName];

	if (typeof indexSet === 'string') {
		// Find by id
		const id = indexSet;
		return new Promise( (resolve, reject) => {
			let instance = nohm.factory(this.prototype.modelName, id, (err, prop) => {
				if (err === 'not found') instance = undefined;
				else if (err) return reject(err);
				resolve(instance);
			});
		});
	} else if (typeof indexSet === 'object' ) {
		// delete empty property
		for (let key in indexSet) {
			const val = indexSet[key];
			if (val === '' || val === undefined || val === null)
				delete indexSet[key];
		}
		// Find by index
		return new Promise( (resolve, reject) => {
			model.findAndLoad(indexSet, (err, instances) => {
				if (err === 'not found') instances = [];
				else if (err) return reject(err);
				resolve(instances);
			});
		});
	}
}


function findAndLoadAll() {
	return _pFindAndLoad.call(this, {});
}


function findAndLoadByName(name) {
	return _pFindAndLoad.call(this, {name: name});
}


function propagateInstance (ids) {
	ids = [].concat(ids);
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


function _pRemove() {
	return new Promise( (resolve, reject) => {
		this.remove(err => {
			if (err) return reject(err);
			resolve();
		});
	});
}


function getAllLinks (modelName, linkNames) {
	linkNames = [].concat(linkNames);
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







// EventModel is added manually because it is just pure javascript class not likely other models created by nohm.
// So this model doesn't serve methods inherited from nohm model.
Models.EventModel = EventModel;


module.exports = Models;