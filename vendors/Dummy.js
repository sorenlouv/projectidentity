// create new vendor object
var Dummy = {

	data: { 
		cprok: 'on',
		email: 'test@ofir.dk',
		password1: 'test1234',
		password2: 'test1234'
	},			

	options: { 
		path: 'http://dummyrep.konscript.net/testNumberBig.php',
		method: 'POST'
	},

	settings: {
		formatting: {
			cpr: {
				filter: '%(d)s%(m)s%(y)s-%(cpr)s',
				type: 'cpr',
			},
			fornavn: {
				filter: '%(firstName)s Sigurd',
				type: 'name'
			},
			efternavn: {
				filter: '%(lastName)s',
				type: 'name'			
			}
		}
	},

	/**
	 * do stuff like get session cookie and pick number
	 * returns: session cookie
	 ********************/	
	prepareRequest: function(callback){
		// do stuff
		var cookie = "cookieSession=1337";
		callback(cookie);
	},
		
	/**
	 * receive response and parse
	 ********************/
	getResponse: function(req, res, callback){
		if(res.body.indexOf("fantastisk") != -1){
			callback(req.data.cpr, "success");	
		}else{
			callback(req.data.cpr, "error");
		}
	}
}

// export Vendor object
module.exports = Dummy;
