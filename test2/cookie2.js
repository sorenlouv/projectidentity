		var sprintf = require("../backend/sprintf.js");
		var querystring = require("querystring");		
		
		var cookieString = "JSESSIONID=333095146B07FE5B2ECFDFD4FA67B577;ASP.NET_SessionId=jvdaczuojt4topvtkgydrwe4";		
		var cprString = "2501881271";
		
		var formatting = {
			JSESSION: {
				filter: ';jsession=%(JSESSIONID)s',
				type: 'cookie'
			},
			users__personal_id: {
				type: 'cpr'
			}
		}	
		
		if(Object.keys(formatting).length > 0){
			for(var data_key in formatting){
				var filter = formatting[data_key]["filter"];
				var type = formatting[data_key]["type"];				
				var placeHolderData = {};
				
				// cpr number splitted into formattable pieces
				if(type == "cpr"){
					if(filter == undefined){
						filter = "%(d)s%(m)s%(y)s-%(cpr)s";
					}
				
					placeHolderData = {
						d: cprString.substring(0, 2),
						m: cprString.substring(2, 4),
						y: cprString.substring(4, 6),
						cpr: cprString.substring(6, 10),		
					};				
					
				// cookies splitted into formattable pieces					
				}else if(type == "cookie"){

					var cookies = cookieString.split(";");
					for(var key in cookies){
						var cookie = querystring.parse(cookies[key]);
		
							for(var key in cookie){
								placeHolderData[key] = cookie[key];
							}		
					}
				}

				var stringFormatted = sprintf(filter, placeHolderData);		
				console.log('key ' + data_key);
				console.log(stringFormatted);
				// save 
				this.data[data_key] = stringFormatted;
			}
		}
		
31/1 - 2012
				// cookies splitted into formattable pieces					
				}else if(type == "cookie"){

					var cookies = cookieString.split(";");
					for(var key in cookies){
						var cookie = querystring.parse(cookies[key]);
						for(var key in cookie){
							placeHolderData[key] = cookie[key];
						}		
					}
