var util = require("util");
var http = require("http");
var https = require("https");
var querystring = require("querystring");
var kutils = require("./konUtils.js");		
var spawn = require('child_process').spawn;

var Curl = {
	
	/**
	 * Scrape
	 ***********************/	
	scrape: function(req, callback){					
		kutils.debug("Scrape(): ", "", 0, "functioninit");	

		// set request variables		
		var options = req.options;
		var data = req.data;
		var settings = req.settings;

		// old school ISO-8859-1
		if(settings.encoding == "ISO-8859-1"){
			data = kutils.querystringOld(data);
		// normal utf8		
		}else{
			data = querystring.stringify(data);
		}
		
		// init headers
		if(options.headers == undefined){
			options.headers = {};
		}
		
		// set content length and type
		if(options.method == "POST"){
			options.headers = {
			    'Content-Type': 'application/x-www-form-urlencoded',
			    'Content-Length': data.length
			}
		}
		options.headers.host = options.path;	
		
		var args = [
			'-w {statusCode:%{http_code}; location:%{redirect_url};}',
			'-d'+ data,
			'--socks5', 'localhost:9050',
			options.path];
			
		var curl;
		if(options.cookie != ""){
			args.push('-b ' + options.cookie)
		}			

		var curl = spawn('curl', args);    
		var stdout = "";
		var stderr = "";
   				    
    // add a 'data' event listener for the spawn instance
    curl.stdout.on('data', function(data) { 
    	stdout += data; 
  	});  	  	
		curl.stderr.on('data', function (data) {
    	stderr += data; 
		}); 		
		    
    // when the spawn child process exits, check if there were and close the writeable stream
    curl.on('exit', function(code) {     
			console.log("received");
			// create response object
			var res = {headers:{}};		    
    
			// set location and status code
			if(stdout !== undefined){				
				// get statusCode
				var regex_status = /{statusCode:(\d+);.*}/;
				var result_status = stdout.match(regex_status);				

				// get location (redirect url)
				var regex_location = /{.*location:(.*);}/;
				var result_location = stdout.match(regex_location);				

				req.commandArgs = args;
				res.body = stdout;				
				res.statusCode = (result_status != null && result_status[1] != undefined ) ? result_status[1] : 0;	
				res.headers.location = (result_location != null && result_location[1] != undefined ) ? result_location[1] : "";
			}    
    
			// set error
			if(code != 0){
				res.error = {};
				res.error.stderr = stderr;
				//kutils.error("Command: ", command, 3, "scrape");				
				kutils.error("Request: ", JSON.stringify(req));
				kutils.error("Response: ", JSON.stringify(res));
			}else{	
				// logging request
				var debug_priority = res.statusCode >= 400 ? 3 : 1;			
				kutils.debug("Request: ", JSON.stringify(req), debug_priority, "curl");
				kutils.debug("Response: ", JSON.stringify(res), 0, "curl");				
			}
			
			callback(req, res);			
    });		

	}
}
module.exports = Curl;

