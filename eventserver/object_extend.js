var md5 = require('md5');
var redis = require('redis');

// hash shortcut
String.prototype.hash = function() {
  return md5(this.valueOf());
}


// redis client extension example
redis.RedisClient.prototype.parse_info = function (callback) {

  console.log('parse_info');
  callback('ok');

};
