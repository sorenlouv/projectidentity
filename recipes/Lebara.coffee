Recipe = require("../Recipe.js")
Curl = require("../utils/Curl.js")
$ = require("jquery")
querystring = require("querystring")

class @Lebara extends Recipe

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

		cpr = querystring.parse(req.data).cpr

		# Abort if no response is available
		if !res? || !res.body?
			callback(cpr, "error", "Could not get response")
			return false

		html = res.body
		msg_regex = /alert\('(.+)'\)/.exec(html)
		msg = if msg_regex? then msg_regex[1] else ""
		
		html = res.body
		
		if html.indexOf("NOVBetal") > -1
		  callback cpr, "success", ""
		else
		  callback cpr, "error", msg

module.exports = @Lebara