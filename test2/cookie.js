var querystring = require("querystring");

function getCookie(cookieUrl, callback){
	var exec = require('child_process').exec;
	var command = 'curl -I ' + cookieUrl;
	child = exec(command, function(error, stdout, stderr){
	
		var regex = /^Set-Cookie: (.*?);/m;
		var result = stdout.match(regex);
		callback(result[1]);
	});	
}

var cookieUrl = 'http://oister.dk/selfcare/servlet/LoginFramePassive';	
// get cookie
getCookie(cookieUrl, function(cookie){ 
	// set cookie
	this.options.cookie = cookie;
});	

console.log(cookie);
var cookieObj = querystring.parse(cookie);
for(var key in cookieObj){
	console.log("value " + cookieObj[key]);
}

/*
Get cookie

var cookieUrl = 'http://oister.dk/selfcare/servlet/LoginFramePassive';


Not important:
--referer "http://facebook.com" --user-agent "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_7) AppleWebKit/534.24 (KHTML, like Gecko) Chrome/11.0.696.68 Safari/534.24" --header "Accept: application/xml,application/xhtml+xml,text/html;q=0.9,text/plain;q=0.8,image/png,*/*;q=0.5" --header "Accept-Language: en-US,id-ID;q=0.8,id;q=0.6,en;q=0.4" --header "Accept-Charset: ISO-8859-1,utf-8;q=0.7,*;q=0.3" --header "Keep-Alive: 300" --header "Connection: keep-alive"

*/

curl --proxy localhost:8118 -d "account_type=0&users__personal_id=121273&users__first_name=Anders%20Hanse&users__last_name=Anderssen&JSESSION=;jsession=8FBACD2228B485441FBEAA3244B58C60" -b "JSESSIONID=8FBACD2228B485441FBEAA3244B58C60" https://www.oister.dk/selfcare/servlet/VoisterSavePersonalIDLookup;jsession=418F0FB7EA2A4CFD0AF8C5476F3EFB99


curl --proxy localhost:8118 -d "account_type=0&users__personal_id=121273&users__first_name=Anders%20Hanse&users__last_name=Anderssen&JSESSION=;jsession=C95DE00DE83B755AEE3C152F80BE6B32" -b "JSESSIONID=E2D8085BE2CB28795795C10271EE78FA" https://www.oister.dk/selfcare/servlet/VoisterSavePersonalIDLookup;jsession=E2D8085BE2CB28795795C10271EE78F

