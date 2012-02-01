// include base vendor object
var vendorBase = require("../Vendor.js");
var	debug = require("../backend/debug.js");		

// create new vendor object
var Vendor = {

	/**
	 * Prepare request by setting data and options
	 *********************/	
	setupRequest: function(inputData, callback){		
	
		// Clone vendor base and set data and options
		var Greentel = Object.create(vendorBase, {
			data: { value: {
				navn: firstName
			}},			
			
			options: { value: {
				path: 'http://www.greentel.dk/order/cpr.asp',
				method: 'GET'
			}},

			settings: { value: { formatting: {
				cpr: {
					type: 'cpr'
				}
			}}},				
			
			/**
			 * Extend object: receive response
			 ********************/
			getResponse: { value: function(data, res, html, callback){
				//console.log(res.statusCode);  				

				var text = $(html).find('h1').text();

				if(html.indexOf("NOVBetal.asp") != -1){
					debug("CPR number found", JSON.stringify(data), 3, "vendor");
					debug("Successful html response", html, 3, "vendor");
					debug("Successful response", res, 3, "vendor");					
					
					var status = "success";
				}else{
					var status = "error";
				}
				callback(data.cpr, status);
			}}			
		});
		
				// STEP 1: get check value
				
				http://www.greentel.dk/order/proccess.asp?cpr=1212891234&msisdn=52242047&check=3e3fe50dc1da28d0df0a30c9b2a03c90		
		
		// signal finished
		callback(Greentel);

	}
}
http://www.greentel.dk/order/cpr.asp?navn=Tomas+Berlok&cpr=201288

// export Vendor object
module.exports = Vendor;
