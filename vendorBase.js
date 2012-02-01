var sprintf = require("./utils/sprintf.js"),	
	kutils = require("./utils/konUtils.js");
	
// the layer between the vendor specific code, and the Curl function that executes the scraping
var vendorBase = {	

	options: {
		path: '',
		method: '',
		cookie: '',		
		headers: {}	
	},
	
	data: {},
	settings: { formatting: {} },
	setData: function(key, value){
		this.data[key] = value;
	},	
	
	updatePlaceholders: function(string, typeToFind, callback){		
		var defaultFilter, placeHolderData;
		var formatting = this.settings.formatting;		
		
		switch(typeToFind)	{
			case 'cpr':
				defaultFilter = "%(d)s%(m)s%(y)s-%(cpr)s";
				placeHolderData = {
					d: string.substring(0, 2),
					m: string.substring(2, 4),
					y: string.substring(4, 6),
					cpr: string.substring(6, 10)
				};
			break;
			case 'name':
				defaultFilter = "%(firstName)s %(lastName)s";
				placeHolderData = {
					firstName: string.firstName,
					lastName: string.lastName
				};
			break;
		}	
		
		if(Object.keys(formatting).length > 0){
			for(var data_key in formatting){
				var type = formatting[data_key]["type"];							
				
				if(type == typeToFind){
					// use default filter if none is specified 
					var filter = formatting[data_key]["filter"];
					if(filter == undefined){
						filter = defaultFilter;
					}
					
					// format string according to filter
					var stringFormatted = sprintf(filter, placeHolderData);		
	
					// save the new string in data
					this.data[data_key] = stringFormatted;					
				}
			}
		}
	}
};
module.exports = vendorBase;
