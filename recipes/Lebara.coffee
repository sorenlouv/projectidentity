Recipe = require("../Recipe.js")
Curl = require("../utils/Curl.js")
$ = require("jquery")
querystring = require("querystring")

class @Lebara extends Recipe.Recipe

	# constructor
	constructor: (inputData, socket) ->

		@inputData = inputData
		@socket = socket
		@counter = 0
		@domTarget = ""

		@req =
			url: "https://mypage.lebara.dk/iframe/NOVcpr_iframe.asp"
			data:
				cprok: "on"
				email: "test@ofir.dk"
				password1: "test1234"
				password2: "test1234"
				navn: inputData["firstName"] + " " + inputData["lastName"]
				cpr: inputData["dob"]+"-"+inputData["cprList"][0]							

	updateCPR: ->
		@req.data.cpr = @inputData["dob"]+"-"+@inputData["cprList"][@counter]

	getResponse: (req, res, callback) ->
		
		html = res.body
		cpr = querystring.parse(req.data).cpr
		msg = /alert\('(.+)'\)/.exec(html);
		
		if html.indexOf("NOVBetal") > -1
		  callback cpr, "success", ""
		else
		  callback cpr, "error", msg[1]

module.exports = @Lebara