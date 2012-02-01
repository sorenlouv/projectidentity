var fs = require('fs');
var errorLogStream, standardLogStream;
var kutils = {

	debug: function(title, string, priority, type, seperator, errorLog){

		var logging = true;
		var priorityLevel = 1;
		var typeFiltering = new Array('curl', 'getResponse');

		if (string == null){
			//console.log("No string given for title: "+ title);
			string = "/null/";
		}

		if (priority == null){
		 priority = 0;
		}
		if (type == null){
		 type = 'all';
		}
		if (errorLog == undefined){
		 errorLog = false;
		}
		
		var output = "";
		if(seperator === true){
			output += "#################################################################\n\n";
		}
		title = title + "("+type+"): ";
		if(string.length > 300 || priority > 3){
			output += "##################### " + title + " ###########################\n";
			output += string+'\n';
			output += '\n';
		}else{
			output += title + string;		
		}
	
		if(string.length > 300){
			output += "################## end of " + title + " ########################\n\n";
		}
	
		// if type filtering is not set, show all messages with priority higher than priorityLevel
		// else if type filtering is set, only show messages in type filtering
		if((priorityLevel <= priority || typeFiltering.length > 0 && inArray(type, typeFiltering)) && errorLog == false ){		
			// output 
			console.log(output);

			// log
			writeLog(output, priority);			
		}
		
		if(errorLog == true){
			writeLog(output, priority, errorLog);	
		}
				
		/**
		 * Logging
		 ************/
		function writeLog(msg, priority, errorLog){	
			// write to error log		
			if(errorLog == true){
				errorLogStream.write(msg + '\n\n');
			// write to standard log
			}else{	
				standardLogStream.write(msg + '\n\n');
			}
		}
	
		/**
		 * check if key exists in array
		 ************/	
		function inArray(needle, haystack) {
				var length = haystack.length;
				for(var i = 0; i < length; i++) {
				    if(haystack[i] == needle) return true;
				}
				return false;
		}

	},
	
	error: function(title, string, priority, type, seperator){
		this.debug(title, string, priority, type, seperator, true);
	},	

	initLogStreams: function(){
		// set date
		var currentTime = new Date();
		var day = currentTime.getDate();		
		var month = currentTime.getMonth();
		var year = currentTime.getFullYear();
		var standardLogFile =__dirname + "/tmp/standard_" + String(year) + String(month) + String(day) + ".log";
		var errorLogFile =__dirname + "/tmp/error_" + String(year) + String(month) + String(day) + ".log";		
		
		console.log("Log started: " + standardLogFile);
		console.log("Error log started: " + errorLogFile);		
		
		// open streams for writing
		standardLogStream = fs.createWriteStream(standardLogFile, {flags: 'a'});		
		errorLogStream = fs.createWriteStream(errorLogFile, {flags: 'a'});				
	},

	querystringOld: function(data){
		var qs = "";
		// build querystring
		for(var key in data){
			qs += key + '=' + escape(data[key]) + '&';
		}
		data = qs.slice(0, -1);
		return data;
	},
	
	/**
	 * Get session cookie and pass to server for every request
	 **********/
	getCookie: function(cookieUrl, callback){
		var exec = require('child_process').exec;
		var command = 'curl -I ' + cookieUrl;
		child = exec(command, function(error, stdout, stderr){
	
			// filter cookie from other header info
			var regex = /^Set-Cookie: (.*?);/m;
			var result = stdout.match(regex);
			var cookie = result[1];
			if(result[1] != null && error === null ){
				kutils.debug("GetCookie: ", cookie, 0, "getCookie");
			}else{
				console.log("No cookie!");
				kutils.error("Problems with fetching cookie: ", "");	
				kutils.error("Stdout: ", stdout);	
				kutils.error("Stderr: ", stderr);						
			}
			
			// return cookie in callback
			callback(cookie);
		});	
	}
};
kutils.initLogStreams();
module.exports = kutils;
