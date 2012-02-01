var http = require("http");
var options = {
	host: 'localhost',
	port: 8118,
	path: 'http://dummyrep.konscript.net/',
	Cookie: "PHPSESSID=91di3aoqs0958dhe246ddo5bu6"		
	method: 'GET',
};

var req = http.request(options, function(res) {
		// receive response body in chunks
		var html = '';		
		res.on('data', function (chunk) {
			html += chunk;		  
		}).on('end', function () {
			console.log(html);
		});
});

req.on('error', function(e) {
  console.log('problem with request: ' + e.message);
});

req.end();


/*
// send request with normal http			
}else{
	var req = http.request(options, function(res){			
		res.setEncoding('utf8');
		
		// receive response body in chunks
		var html = '';		
		res.on('data', function (chunk) {
			html += chunk;		  
		}).on('end', function () {
		
			// debugging response
			
			var debug_priority = res.statusCode != 200 ? 2 : 0;
			debug("Path: ", req.path, (1+debug_priority), "curl");
			debug("Options: ", options.cookie, (1+debug_priority), "curl");					
			debug("Location", res.headers.location, (1+debug_priority), "curl");	
			debug("Status code", res.statusCode, (1+debug_priority), "curl");
			debug("Data: ", data, (1+debug_priority), "curl");										
			debug("html", html, 0, "curl");							
	
			// return response
			callback(data, res, html);		      
		});									
	});		

	// write data
	req.write(data);

	// error occured during request
	req.on('error', function(e) {
		debug("Problem with request: ", e.message, 3, "curl");			
		debug("Request: ", req, 3, "curl");
	});	
				
	// close connection
	req.end();
}
*/
