Recipe = require("../Recipe.js")
Curl = require("../utils/Curl.js")
$ = require("jquery")
querystring = require("querystring")

class @Dummy extends Recipe

	# constructor
	constructor: (inputData, socket) ->

		@inputData = inputData
		@socket = socket
		@counter = 0
		@domTarget = ""

		@req =
			url: "http://dummyrep.konscript.net/delay.php"
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
		unless res?
			callback(cpr, "error", "Could not get response")
			return false

		html = res.body
		msg_regex = /alert\('(.+)'\)/.exec(html)
		msg = if msg_regex? then msg_regex[1] else ""

		if html? and html.indexOf("NOVBetal") > -1
			callback cpr, "success", ""
		else
			callback cpr, "error", msg

module.exports = @Dummy