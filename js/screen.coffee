# declare variables
@cprList = []
@countCompleted = 0
@dob = 0
window.socket = io.connect()

$(document).ready ->

	$(".accordion").accordion
		autoHeight: false
		collapsible: true

   	# UI
	$("button").button()
	$(".progressbar").progressbar value: 0
	$( "#sex" ).buttonset();

	# next preparation step
	$("#next").click ->
		$("#next").button "disable"
		$("#loading").fadeIn()
		socket.emit "next"
		console.log "next was clicked"

	# find cpr numbers
	$("#findValidNumbers").click setInputData


# SOCKET.IO
#################################

socket.socket.on('error', (reason) ->
  console.error('Unable to connect Socket.IO', reason);
)

# CPR number found
socket.on('correctCpr', (data) ->
	addToProgressbar()
	console.log("Correct: " + data.cpr);

	$('#correctCpr').fadeIn();
	$("#correctCpr .content").append(data.cpr + ',').effect('highlight', {color: '#E78F08'});	
);

# CPR number invalid
socket.on('incorrectCpr', (data) ->
	addToProgressbar()
	console.log("Incorrect: " + data.cpr);
	container = $('<div></div>');
	$('<p></p>', { text: "CPR: " + data.cpr }).appendTo(container);
	$('<p></p>', { text: "Error message: " + data.msg }).appendTo(container);	
	container.prependTo('#failedNumbers')
);

# CPR number lookup failed
socket.on('lookupFailed', (data) ->
	addToProgressbar()

	$("#failedCpr").fadeIn();	
	$("#failedCpr .content").append(data.cpr + ', ').effect('highlight', {color: '#E78F08'});	
);

# server waiting for client
socket.on "waitForClient", (data) ->
	console.log "server waiting for client: " + data["name"]
	$("#loading").fadeOut()
	$("#next").button "enable"

# receive response from server
socket.on "renderPreparationResponse", (data) ->
	# Debug
	console.log data	

	# reset
	$(".accordion div").html ""

	# set url
	$("#requestUrl").html data.req.url if data.req?

	# set response body
	if data.res?
		body = $(data.res.body.replace(/<script[\d\D]*?>[\d\D]*?<\/script>/g, ""), "body")
		if body.find(data.domTarget).length is 0
			body.appendTo "#responseBody"
		else
			body.find(data.domTarget).appendTo "#responseBody"

	# set resp. header			
	$("#responseHeader").html data.res.head.replace(/\n/g, "<br />") if data.res?
		
	# set errors
	$("#errors").html JSON.stringify(data.err)
	$(".accordion").accordion( "activate" , 3 ) if data.err?

	# set request header
	$("#requestHeader").html JSON.stringify(data.req)
	$(".accordion").accordion "resize"			


# Helper functions
#################################

# simple function to return numbers of valid cpr numbers
countCprList = ->
	@cprList.length;

addToProgressbar = ->
	countCompleted++
	$( ".progressbar.completed" ).progressbar( "option", "value", (countCompleted/countCprList()*100) );

setInputData = ->
	dob = $("input[name=dob]").val()
	firstName = $("input[name=firstName]").val()
	lastName = $("input[name=lastName]").val()
	gender = $("input[name=gender]:checked").val()

	generateCombinations dob, firstName, lastName, gender, (cprList) =>
		console.log cprList 
		@cprList = cprList

		# send input data to server
		socket.emit "setInputData",
			inputData: 
				dob: dob
				firstName: firstName
				lastName: lastName
				cprList: cprList

		# hide controller element and show progress bar
		$("#processFb, #stopTimer, #progressbars, #controllerContainer, #inputData").fadeToggle()
		$("#inputData .content").html("Fødselsdag: " + dob + "<br> Fornavn: " + firstName + "<br> Efternavn: " + lastName).fadeIn()