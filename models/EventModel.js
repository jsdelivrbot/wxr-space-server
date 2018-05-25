

/**
 * Model definition of Workspace
 */

class EventModel {
	constructor (_name, _details) {
		this.name = _name;
		this.details = _details || {};
		this.details.timestamp = Date.now();
	}
}



module.exports = EventModel;