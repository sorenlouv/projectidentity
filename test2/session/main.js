var io = require('socket.io'),
    express = require('express'),
    MemoryStore = express.session.MemoryStore,
    app = express.createServer(),
    sessionStore = new MemoryStore(),
    Session = require('connect').middleware.session.Session,
		parseCookie = require('connect').utils.parseCookie;     
 
app.configure(function () {
    app.use(express.cookieParser());
    app.use(express.session({store: sessionStore, secret: 'secret', key: 'express.sid'}));
});

app.listen(3000);
var sio = io.listen(app);


// disable socket.io logging
sio.set('log level', 1); 

// receive request from frontend
app.get('/*', function(req, res){
  res.sendfile(__dirname + '/index.html');
});		

// authentication
sio.sockets.on('connection', function (socket) {

	sio.set('authorization', function (data, callback) {
	  if (data.headers.cookie) {
	  
	  	// parse headers -> parse cookie -> get sessionID to retrieve the entire session later
			data.cookie = parseCookie(data.headers.cookie);
			data.sessionID = data.cookie['express.sid'];			    
      data.sessionStore = sessionStore;
			
			console.log('A socket with sessionID ' + data.sessionID + ' connected!');		

			// get entire session
			sessionStore.get(data.sessionID, function (err, session) {
			
				// session error: refuse connection			
				if (err || !session) {
					callback('Error', false);
					
				// save the session data and accept the connection					
				} else {
					data.session = new Session(data, session);
					callback(null, true);
				}
			});			
		} else {
			// no cookie: refuse connection
			return callback('No cookie transmitted.', false);
		}
		// accept the incoming connection
		callback(null, true);
	});

});


// get socket connection
sio.sockets.on('connection', function (socket) {
	// receive messages	from client
	socket.on('msg', function (msg) {
		var hs = socket.handshake;
	
		if(hs.session.messages == undefined){
			console.log(hs);
			hs.session.messages = [];
		}
		
		
		hs.session.messages.push(msg);
		hs.session.save();
		console.log(hs.session.messages);
    //var session = socket.handshake.session;    
	});	
	
	// list messages to client
	socket.on('list', function () {
		var hs = socket.handshake;	
		console.log(hs.session.messages);
		//socket.emit('msg', messages);
	});		
});
