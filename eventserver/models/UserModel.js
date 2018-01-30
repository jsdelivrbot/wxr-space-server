const nohm = require('nohm').Nohm;


const PASSWORD_MINLENGTH = 6;



/**
 * Model definition of a simple user
 */
const UserModel = nohm.model('User', {
	properties: {
		id: {
			type: 'string',
			unique: true,
			validations: [
				// 'email',
				'notEmpty'
			]
		},
		createdDate: {
			type: 'timestamp',
			defaultValue: function () {
				return Date.now();
			},
			validations: [
				'notEmpty'
			]
		},
		password: {
			load_pure: true, // this ensures that there is no typecasting when loading from the db.
			type: function (value, key, old) {
				value = value.toString();
				let pwd;
				let valueDefined = (value && typeof(value.length) !== 'undefined');

				if (valueDefined && value.length >= PASSWORD_MINLENGTH) {
					pwd = value.hash();
					return pwd;
				} else {
					return old;
				}
			},
			validations: [
				'notEmpty',
				['length', {
					min: PASSWORD_MINLENGTH
				}]
			]
		}
	},
	methods: {

		validPassword: function (password) {
			return this.p('password') === password.toString().hash();
		}

	}
});


/*
 * Define static methods of UserModel
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
UserModel.findAndLoad = function(id, callback) {
	var instance = new this();

	instance.findAndLoad({id: id}, (err, users) => {
		callback(err, users[0]);
	});
}


UserModel.login = function(id, password, callback) {

	if (!id || id === '' || !password || password === '') {
		callback(new Error(`id or password is invalid`));
		return;
	}

	this.findAndLoad(id, (err, user) => {
		if (err || !user.validPassword(password)) {
			callback(err || new Error(`id or password is invalid`));
		} else {
			callback(false, user);
		}
	});

}



module.exports = UserModel;