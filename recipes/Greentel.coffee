Recipe = require("../Recipe.js")
Curl = require("../utils/Curl.js")
$ = require("jquery")
querystring = require("querystring")

class @Greentel extends Recipe

	# constructor
	constructor: (inputData, socket) ->

		@inputData = inputData
		@socket = socket
		@counter = 0
		@domTarget = ""

		@req =
			'insecure': true
			url: "https://www.greentel.dk/index.php?ajax=true"
			data:
				up_ajax_action: "do_address_check"
				cpr: inputData["dob"]+''+inputData["cprList"][0]
				fullname: inputData["lastName"]

	updateCPR: ->
		@req.data.cpr = @inputData["dob"]+""+@inputData["cprList"][@counter]

	getResponse: (req, res, callback) ->
		
		cpr = querystring.parse(req.data).cpr

		# Abort if no response is available
		if !res? || !res.body?
			callback(cpr, "error", "Could not get response")
			return false
		
		if res.body.indexOf("#address") > -1
			msg_regex = /\$\('#address'\).val\('(.*)'\);/.exec(res.body);
			msg = if msg_regex? then msg_regex[1] else ""
			callback cpr, "success", msg
		else
			callback cpr, "error", res.body

module.exports = @Greentel