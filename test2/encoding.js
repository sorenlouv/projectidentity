		console.log(querystring.stringify(inputData));
		var var1 = decodeURIComponent(escape(querystring.stringify(inputData)));
		var var2 = decodeURIComponent(querystring.stringify(inputData));		
		var var3 = escape(querystring.stringify(inputData));
		
		var var4 = unescape(encodeURIComponent(querystring.stringify(inputData)));
		var var5 = encodeURIComponent(querystring.stringify(inputData));		
		var var6 = unescape(querystring.stringify(inputData));
		

		var1 = querystring.parse(var1);
		var1 = var1.firstName;
		var1 = escape(var1);
		
		var2 = querystring.parse(var2);
		var2 = var2.firstName;
		var2 = escape(var2);
				
		var3 = querystring.parse(var3);		
		var4 = querystring.parse(var4);
		var5 = querystring.parse(var5);
		var6 = querystring.parse(var6);

		
		console.log(var1);
		console.log(var2);
		console.log(var3);
		console.log(var4);
		console.log(var5);
		console.log(var6);
