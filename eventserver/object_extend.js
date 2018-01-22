var crypto = require('crypto');
var redis = require('redis');

// hash shortcut
String.prototype.hash = function(salt) {
  salt = salt || 'eventserver-socketio';
  let hash = crypto.createHash('sha512');
  hash.update(this.valueOf());
  hash.update(salt);
  return hash.digest('base64');
}


// redis client extension example
redis.RedisClient.prototype.parse_info = function (callback) {

  console.log('parse_info');
  callback('ok');

};
