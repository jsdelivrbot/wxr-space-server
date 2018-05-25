


module.exports = function(passportAuthorize) {

  var config = require('config');
  var io = require('socket.io')(config.get('RealtimeDatasyncServer.port'));
  var redis = require('redis');
  var {WorkspaceModel} = require('./models/Models');

  
  // To get session of passport in socket logic, use passport.socketio middleware.
  io.use(passportAuthorize);


  io.on('connection', function(socket){

  	// save some data.
  	socket.data = {
  		user: socket.request.user,
  		referer: socket.request.headers.referer,
		workspaceId: socket.request.headers.referer.split('/').pop(),
	  };


  	if (!socket.data.workspaceId || !socket.data.user.logged_in) {
  		return;
	  }
	
  	// setting client config for sub/pub by key name.
	  const subClient = redis.createClient();
	  subClient.config('set', 'notify-keyspace-events', 'AKE', function(err) {
		  if (err) { return console.log(err); }
	  });
	
	
	  WorkspaceModel._pFindAndLoad(socket.data.workspaceId)
		  .then( instance => {
			  if (!instance) return Promise.reject(`Invalid Workspace ID.`);
			  
			  return instance.isMember(socket.data.user);
		  })
		  .then( isMember => {
			if (!isMember) return Promise.reject(`Invalid accesss.`);
			
			return getWorkspaceProperty();
		  })
		  .then( workspaceProperty => {
			
			socket.join(socket.data.workspaceId);
			socket.emit('workspace', workspaceProperty);
			  
		  	const workspaceChannel = `__keyspace@` + config.get('dbConfig.db') + `__:nohm:*:WorkspaceModel:` + socket.data.workspaceId;
			subClient.psubscribe(workspaceChannel);
			  
			subClient.on('pmessage', (pattern, channel, event) => {
				// console.log(channel, event);
			  	switch (event) {
					case 'hset' :
					case 'sadd' :
					case 'srem' :
						getWorkspaceProperty()
							.then( workspaceProperty => socket.emit('workspace', workspaceProperty) );

					    break;

					  default:
					  	break;
				  }
			  });
			  
		  })
	      .catch( reason => {
			  handleError(reason);
			  socket.disconnect(true);
		  });


    socket.on('disconnect', function () {
		socket.leave(socket.data.workspaceId);
    });



    function handleError(message) {
    	socket.emit('error', message);
    	console.log(message);
    }
	
	// getting workspace property function returns Promise
	function getWorkspaceProperty() {
		let instance;
	 return  WorkspaceModel._pFindAndLoad(socket.data.workspaceId)
		  .then( _instance => {
			  instance = _instance ;
			  
			  return instance.getAllMembers();
		  })
		  .then( memberInstances => {
			let promisesArray = [];
			promisesArray.push(instance.getRefinedProperty());			// push refined property of workspace at first index
			promisesArray = promisesArray.concat(memberInstances.map( i => i.getRefinedProperty() ));		// getting refined property of users
			
			return Promise.all( promisesArray );
		  })
		  .then( ([workspaceProperty, ...members]) => {
			workspaceProperty.users = members;
			  
			return Promise.resolve(workspaceProperty);
		});
	}


  });

  return io;
};