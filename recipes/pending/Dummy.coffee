Recipe = require("../Recipe.js")
Curl = require("../utils/Curl.js")
$ = require("jquery");

class @Dummy extends Recipe.Recipe

	# constructor
	constructor: (inputData, socket) ->

		@inputData = inputData
		@socket = socket

		# DOM target
		@domTarget = "div.indhold"

		#
		@counter = 0

		@req =
			data:
				cprok: "on"
				email: "test@ofir.dk"
				password1: "test1234"
				password2: "test1234"
				fornavn: inputData["firstName"]
				efternavn: inputData["lastName"]
				cpr: inputData["birthday"]+""+inputData["cprList"][0]

			options:
				url: "http://dummyrep.konscript.net/testNumberBig.php"
				method: "POST"
				encoding: "UTF-8"


	self = @

	prepareRequest: (callback) ->
		console.log("Prepare request started")

		preparationData = {}

		# get cookies
		@step1 = (callback) ->
			waitingForCookies = 2
						
			#path: /;
			Curl.getCookie("https://www.oister.dk/Mobil/Shopflow/Basket/?product=152&product=458", (cookie) ->
				self.cookieA = cookie
				waitingForCookies--
			)

			#path: /selfcare;
			Curl.getCookie("https://www.oister.dk/selfcare/servlet/LoginFramePassive", (cookie) ->
				self.cookieB = cookie
				waitingForCookies--
			)


			setInterval(->
				# console.log("Waiting for cookies: " + waitingForCookies)
				if waitingForCookies is 0
					clearInterval(this)
					callback("done")
			, 400)

		# get phone number
		@step2 = (res, callback) ->
			req =
				options:
					url: 'https://www.oister.dk/Mobil/Shopflow/Vaelg-nummer/',
					cookies: self.cookieA

			Curl.scrape req, self.renderPreparationResponse

		# post phone number
		@step3 = (prev_res, callback) ->			
			preparationData.viewstate = $(prev_res.body).find('#__VIEWSTATE').val();
			preparationData.eventvalidation = $(prev_res.body).find('#__EVENTVALIDATION').val();
			preparationData.phonenumber = $(prev_res.body).find('#number-grid table input[name=numbers]:first').val();
			preparationData.phonenumber_clean = preparationData.phonenumber.substr(0,8);
			req = 
				"options":
					"url": 'https://www.oister.dk/Mobil/Shopflow/ConfirmPage/?numb=' + preparationData.phonenumber_clean
					"cookies": self.cookieA

			Curl.scrape req, self.renderPreparationResponse

		@step4 = (prev_res, callback) ->

				callback(prev_res)

		@step5 = (prev_res, callback) ->
			console.log self.cookieB
			req =
				"options":
					"url": 'https://www.oister.dk/selfcare/servlet/VoisterSavePersonalIDLookup;' + self.cookieB.toLowerCase()
					"method": "POST"
					"cookies": self.cookieB
				"data":
					JSESSION: self.cookieB.toLowerCase()
					account_type: 0
					users__personal_id: self.inputData["birthday"]+""+self.inputData["cprList"][0]
					users__first_name: self.inputData.firstName
					users__last_name: self.inputData.lastName

			Curl.scrape req, self.renderPreparationResponse

		@step6 = (prev_res, callback) ->
			req =
				"options":
					"url": 'https://www.oister.dk/selfcare/servlet/VoisterInitSubscription?product=POST_PAID'
					"method": "POST"
					"cookies": self.cookieB
				"data":
					"oister_customer": "false"
					#"numbers": phonenumber		

			Curl.scrape req, self.renderPreparationResponse

		self = @		
		@step1 (res) -> self.waitForClient "step1", res, (res) ->
			self.step2 res, (res) -> self.waitForClient "step2", res, (res) ->
				self.step3 res, (res) -> self.waitForClient "step3", res, (res) ->
					self.step4 res, (res) -> self.waitForClient "step4", res, (res) ->
						self.step5 res, (res) -> self.waitForClient "step5", res, (res) ->
							console.log("Preperation finished")
							callback()


	getResponse: (req, res, callback) ->
		unless res.body.indexOf("fantastisk") is -1
			callback req.data.cpr, "success"
		else
			callback req.data.cpr, "error"