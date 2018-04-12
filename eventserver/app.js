var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var bodyParser = require('body-parser');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var passportSocketio = require('passport.socketio');
var config = require('config');


var index = require('./routes/index');
var lib = require('./routes/lib');
var user = require('./routes/user');
var workspace = require('./routes/workspace');

var app = express();


// connect to redis
var redis = require('redis');
var nohm = require('nohm').Nohm;
client = redis.createClient(config.get('dbConfig'));
client.on('connect', () => {
	nohm.setClient(client);
	console.log('Database connection is done.');
});
var sessionStore = new RedisStore({client:client});
var scretKey = 'this is a key for hashing';
var {UserModel} = require('./models/Models');


// configure passport
passport.serializeUser(function(user, done) {
	done(null, user.p('name'));
});

passport.deserializeUser(function(name, done) {
	UserModel.findAndLoadByName(name)
		.then( user => done(null, user) )
		.catch( err => done(err, null) );
});

passport.use(new LocalStrategy(
	function(username, password, done) {
		UserModel.login(username, password)
			.then( user => done(null, user) )
			.catch( err => {
				if (err === 'not found') {
					done(null, false);
					return;
				}
				done(err, false)
			});
	}
));


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
		secret: 'this is a key for hashing',
		store: sessionStore,
		saveUninitialized: false,
		resave: false
}));
app.use(passport.initialize());
app.use(passport.session());


app.use('/', index);
app.use('/lib', lib);
app.use('/user', user);
app.use('/workspace', workspace);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handler
app.use(function(err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error');
});



/**
 * Create Socket.io server
 */

var io = require('./socket')(passportSocketio.authorize({
	key: 'connect.sid',
	secret: scretKey,
	store: sessionStore,
	passport: passport,
	cookieParser: cookieParser,
	fail: function onAutohrizeFail(data, message, error, accept) {
		// without session make following logic go.
		accept(null, true);
	}
}));



module.exports = app;
