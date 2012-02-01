// create new vendor object
var Lebara = {

	data: { 
		cprok: 'on',
		email: 'test@ofir.dk',
		password1: 'test1234',
		password2: 'test1234'
	},			

	options: { 
		path: 'https://mypage.lebara.dk/iframe/NOVcpr_iframe.asp',
		method: 'POST'
	},

	settings: {
		formatting: {
			cpr: {
				filter: '%(d)s%(m)s%(y)s-%(cpr)s',
				type: 'cpr'
			},
			navn: {
				filter: '%(firstName)s %(lastName)s',
				type: 'name'
			},
		}
	},
	
	/**
	* Extend object: receive response
	********************/
	getResponse: function(req, res, callback){
		var html = res.body;
		
		if(html.indexOf("NOVBetal") > -1){					
			callback(req.data.cpr, "success");
		}else{
			callback(req.data.cpr, html);
		}
	}
}

// export Vendor object
module.exports = Lebara;
