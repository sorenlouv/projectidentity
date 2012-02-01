var util  = require('util'),
    spawn = require('child_process').spawn;
    var datapost = "a=b";
		var args = [
			'-w {statusCode:%{http_code}; location:%{redirect_url};}',
			//'-d '+ datapost,
			'--socks5', 'localhost:9050',
			'http://www.dr.dk'];    
    
var ls = spawn('curl', args);

var stdout = "";
ls.stdout.on('data', function (data) {
	stdout += data; 
});

ls.stderr.on('data', function (data) {
  console.log('stderr: ' + data);
});

ls.on('exit', function (code) {
	console.log(stdout);
  console.log('child process exited with code ' + code);
});
