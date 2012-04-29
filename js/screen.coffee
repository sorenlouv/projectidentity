# declare variables
cprList = []
countCompleted = 0
dob = 0

 # DOM ready
 ########################
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
	$("#findValidNumbers").click(findValidNumbers);

findValidNumbers = ->
	dob = $("input[name=dob]").val()
	firstName = $("input[name=firstName]").val()
	lastName = $("input[name=lastName]").val()
	gender = $("input[name=gender]:checked").val()

	$("#processFb, #stopTimer, #progressbars, #controllerContainer, #inputData").fadeToggle()
	$("#inputData .content").html("Fødselsdag: " + dob + "<br> Fornavn: " + firstName + "<br> Efternavn: " + lastName).fadeIn()

	# set permutations of CPR number
	options = []
	options[0] = [ 0, 1, 2, 3, 4, 9 ]
	options[1] = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ]
	options[2] = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ]
	options[3] = (if gender is "male" then [ 1, 3, 5, 7, 9 ] else [ 0, 2, 4, 6, 8 ])

	# find valid cpr numbers
	recursiveSearch options, 0, 0, ->
		console.log cprList

		# send input data
		socket.emit "setInputData",
			dob: dob
			firstName: firstName
			lastName: lastName
			cprList: cprList

count = 0
# Iterate all permutations of CPR number
recursiveSearch = (options, number, depth, callback) ->
  count++
  number = number or ""
  depth = depth or 0
  i = 0

  while i < options[depth].length
    if depth + 1 < options.length
      recursiveSearch options, number + options[depth][i], depth + 1, callback
    else
      cpr = number + options[depth][i]

      # CPR is valid
      cprList.push cpr if validateCPR(cpr)
    i++
  count--
  callback() if count is 0

# validate cpr
validateCPR = (cpr) ->
  fullcpr = dob + cpr
  sum = 0
  factors = [ 4, 3, 2, 7, 6, 5, 4, 3, 2, 1 ]
  i = 0
  while i < 10
    sum += fullcpr.substring(i, i + 1) * factors[i]
    i++
  unless (sum % 11) is 0
    false
  else
    true

# SOCKET.IO
##################
socket = io.connect("http://localhost")

socket.socket.on('error', (reason) ->
  console.error('Unable to connect Socket.IO', reason);
)

# CPR number found
socket.on('correctCpr', (data) ->
	addToProgressbar()

	$('#correctCpr').fadeIn();
	$("#correctCpr .content").append(data.cpr + ',').effect('highlight', {color: '#E78F08'});	
);

# CPR number invalid
socket.on('incorrectCpr', (data) ->
	addToProgressbar()
	console.log(data.cpr);
);

# CPR number lookup failed
socket.on('lookupFailed', (data) ->
	addToProgressbar()

	$("#failedCpr").fadeIn();	
	$("#failedCpr .content").append(data.cpr + ', ').effect('highlight', {color: '#E78F08'});	
);


# simple function to return numbers of valid cpr numbers
countCprList = ->
	cprList.length;

addToProgressbar = ->
	countCompleted++
	$( ".progressbar.completed" ).progressbar( "option", "value", (countCompleted/countCprList()*100) );


#
# Preparation debugging
###########################################

# server waiting for client
socket.on "waitForClient", (data) ->
	console.log "server waiting for client: " + data["name"]
	$("#loading").fadeOut()
	$("#next").button "enable"

# receive response from server
socket.on "renderResponse", (data) ->
	# Debug
	console.log "Data: "
	console.log data

	# reset
	$(".accordion div").html ""

	# set resp. body
	if data.res.body?
		body = $(data.res.body.replace(/<script[\d\D]*?>[\d\D]*?<\/script>/g, ""), "body")
		if body.find(data.domTarget).length is 0
			body.appendTo "#responseBody"
		else
			body.find(data.domTarget).appendTo "#responseBody"
	# set resp. header			
	if data.res.head?
		$("#responseHeader").html data.res.head.replace(/\n/g, "<br />")			

	# set errors
	$("#errors").html JSON.stringify(data.err)

	# set request header
	$("#requestHeader").html JSON.stringify(data.req)
	$(".accordion").accordion "resize"	