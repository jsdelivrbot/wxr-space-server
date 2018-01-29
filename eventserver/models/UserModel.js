const nohm = require('nohm').Nohm;


const PASSWORD_MINLENGTH = 6;



/**
 * Model definition of a simple user
 */
module.exports = nohm.model('User', {
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

	  /**
     * Check a given username/password combination for validity.
     */
	  login: function (id, password, callback) {
	    const self = this;

	    if (!id || id === '' || !password || password === '') {
	    	callback(false);
	    	return;
	    }

	    self.load(id, err => {
				if (err || self.p('password') === password.toString().hash()) {
					callback(false);
				} else {
					callback(true);
				}
		  });
	  }

	//	 /**
	//		* This function makes dealing with user input a little easier, since we don't want the user to be able to do things on certain fields, like the salt.
	//		* You can specify a data array that might come from the user and an array containing the fields that should be used from used from the data.
	//		* Optionally you can specify a function that gets called on every field/data pair to do a dynamic check if the data should be included.
	//		* The principle of this might make it into core nohm at some point.
	//		*/
	//	 fill: function (data, fields, fieldCheck) {
	//		 var props = {},
	//			 self = this,
	//			 doFieldCheck = typeof(fieldCheck) === 'function';
	//
	//		 fields = Array.isArray(fields) ? fields : Object.keys(data);
	//
	//		 fields.forEach(function (i) {
	//			 var fieldCheckResult;
	//
	//			 if (i === 'salt' || // make sure the salt isn't overwritten
	//				 ! self.properties.hasOwnProperty(i))
	//				 return;
	//
	//			 if (doFieldCheck)
	//				 fieldCheckResult = fieldCheck(i, data[i]);
	//
	//			 if (doFieldCheck && fieldCheckResult === false)
	//				 return;
	//			 else if (doFieldCheck && typeof (fieldCheckResult) !== 'undefined' &&
	//				 fieldCheckResult !== true)
	//				 return (props[i] = fieldCheckResult);
	//
	//
	//			 props[i] = data[i];
	//		 });
	//
	//		 this.p(props);
	//		 return props;
	//	 },
	//
	//	 /**
	//		* This is a wrapper around fill and save.
	//		* It also makes sure that if there are validation errors, the salt field is not included in there. (although we don't have validations for the salt, an empty entry for it would be created in the errors object)
	//		*/
	//	 store: function (data, callback) {
	//		 var self = this;
	//
	//		 this.fill(data);
	//		 this.save(function () {
	//			 delete self.errors.salt;
	//			 callback.apply(self, Array.prototype.slice.call(arguments, 0));
	//		 });
	//	 },
	//
	//	 /**
	//		* Wrapper around fill and valid.
	//		* This makes it easier to check user input.
	//		*/
	//	 checkProperties: function (data, fields, callback) {
	//		 callback = typeof(fields) === 'function' ? fields : callback;
	//
	//		 this.fill(data, fields);
	//		 this.valid(false, false, callback);
	//	 },
	//
	//	 /**
	//		* Overwrites nohms allProperties() to make sure password and salt are not given out.
	//		*/
	//	 allProperties: function (stringify) {
	//		 var props = this._super_allProperties.call(this);
	//		 delete props.password;
	//		 delete props.salt;
	//		 return stringify ? JSON.stringify(props) : props;
	//	 }
	}
});