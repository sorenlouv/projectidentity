// set variables
var	queueing = 0,
	completed = 0,
	correct = 0,
	dob,
	timer,
	cprNumbers = [];
	

/**
 * DOM ready
 *************************/
$(document).ready(function() {

	// styles
	jqueryuiStyles();

	// login to Facebook
	$('#processFb').click(processFb);
	
	// autostart facebook login
	if(window.location.href.indexOf("autostart") != -1){
		setTimeout(processFb, 2000);
	}
	
	// stop process
	$('#stopTimer').click(function(){
		stopTimer();	
	});
	
	// find cpr manually
	$('#findValidNumbers').click(function(){
	
		dob = $('input[name=dob]').val();
		var firstName = $('input[name=firstName]').val();				
		var lastName = $('input[name=lastName]').val();						
		var gender = $('input[name=gender]:checked').val();		
		findValidNumbers(dob, firstName, lastName, gender);	
	
	});
});

// simple function to return numbers of valid cpr numbers
function getNumbersOfCprNumbers(){
	return cprNumbers.length;
}

/**
 * jquery ui
 ************************/ 
	function jqueryuiStyles(){
		// init button
		$("button").button();
		
		// counters
		$( ".progressbar" ).progressbar({
			value: 0
		});		
	}

/**
 * find valid cpr numbers
 ************************/ 
findValidNumbers = function(dob, firstName, lastName, gender){

	// set basic data
	$('#basicData .content').html("Fødselsdag: "+dob+"<br> Fornavn: "+firstName+"<br> Efternavn: "+lastName);
	
	// Toggle UI stuff
	$('#processFb, #stopTimer, #progressbars, #basicData').fadeToggle();		

	// send firstName, lastName and dob
	sio.emit('setBasicData', {'dob': dob, 'firstName': firstName, 'lastName': lastName});
	
	console.log("Basic Data sent!");
	console.log("dob: "+dob+", 'firstName': "+firstName+", 'lastName': "+lastName);

	// set permutations of CPR number
	var options = [];
	options[0] = [0,1,2,3,4,9];
	options[1] = [0,1,2,3,4,5,6,7,8,9];
	options[2] = [0,1,2,3,4,5,6,7,8,9];		
	options[3] = gender=="male" ? [1,3,5,7,9] : [0,2,4,6,8];
	
	// find valid cpr numbers
	recursiveSearch(options, 0, 0, function(){
	
		// set total number of cpr numbers to check
		console.log("All " + getNumbersOfCprNumbers() + " numbers ready!");			
	
		// loop through list of valid cpr numbers, one each half second
		var index = 0;
		
		timer = setInterval(function(){
			sio.emit('setCprNumber', cprNumbers[index]);
			console.log("Number "+ cprNumbers[index] +" sent!");
			index++;

			// remove timer
			if (index >= getNumbersOfCprNumbers()) {
				stopTimer();
			}
		}, 400);	// end setInterval
		
	});
}

function stopTimer(){
	clearInterval(timer);
	
	$('#processFb, #stopTimer, #progressbars').fadeToggle();
	
}


/**
 * Socket behaviour
 *************************/
var sio = io.connect(window.location.hostname);

// CPR number found
sio.on('correctCPR', function (cpr) {
  correct = (correct+1);  
  if(correct > 1){
		  $("#correctCpr .content").append(',' + cpr);
  }else{
  	$('#correctCpr').fadeIn();
	  $("#correctCpr .content").text(cpr);
  }

	$('#correctCpr>*').effect('highlight', {color: '#E78F08'});
});

// CPR number lookup failed
sio.on('failed', function (cpr) {
  $("#failed").fadeIn();	
  $("#failed .content").append(cpr + ', ').effect('highlight', {color: '#E78F08'});	
});

// Socket error (probably auth) - reload client window
sio.on('error', function (msg) {
	if(msg == "reload"){
	
		window.location.href=window.location.href + "?autostart=1"
	}
});

// CPR number invalid
sio.on('incorrectCPR', function (cpr, status) {
	console.log(cpr + ' - ' + status);
});

// item placed in queue
sio.on('queueing', function () {
  queueing = (queueing+1);
	$( ".progressbar.queueing" ).progressbar( "option", "value", (queueing/getNumbersOfCprNumbers()*100) );
});	
// item finished
sio.on('completed', function () {
  completed = (completed+1);
	$( ".progressbar.completed" ).progressbar( "option", "value", (completed/getNumbersOfCprNumbers()*100) );
});	

var count = 0;
/**
 * Iterate all permutations of CPR number
 ***********************/
recursiveSearch = function (options, number, depth, callback ){
	count++;	
	number = number || "";
	depth = depth || 0;
	for ( var i = 0; i < options[depth].length; i++ ){
		if ( depth +1 < options.length ){
			recursiveSearch (options, number + options[depth][i] , depth +1, callback );			
		}else{		
			var cpr = number + options[depth][i];

			// CPR is valid
			if(validateCPR(cpr)){
				cprNumbers.push(cpr);
				console.log("valid " + cpr);
			}			
		}
	}	
	
	count--;
	
	// callback
	if(count == 0){
		console.log("Doing callback");
		callback();		
	}	
}

/**
 * test for valid cpr number
 ***********************/
function validateCPR(cpr){
	var fullcpr = dob + cpr;
	var sum = 0;	
	var factors = [ 4, 3, 2, 7, 6, 5, 4, 3, 2, 1 ];
	
	for (i = 0; i < 10; i++)	{
		sum += fullcpr.substring(i, i+1) * factors[i];
	}
	
	if ((sum % 11) != 0)	{
		return false;
	}	else {
		return true;
	}
}

/**
 * process FB data
 ************************/ 
processFb = function(){
	
	loginFb(function(response){				
		var fullName = response.name;
		var dobUnformatted = response.birthday;
		var gender = response.gender;
		 
		// format date from mm/dd/yyyy to dd/mm/yy
		var dobArr = dobUnformatted.split('/');
		dob = dobArr[1] + dobArr[0] + dobArr[2].substring(2, 4);
		
		// format name. Everything not in lastname is first name (incl. middlenames etc)
		var lastSpacePosition = fullName.lastIndexOf(" ");
		var firstName = fullName.substring(0, lastSpacePosition);
		var lastName = fullName.substring(lastSpacePosition+1);
				
		findValidNumbers(dob, firstName, lastName, gender);
	});
}	
	
/**
 * fb login  
 ************************/ 
function loginFb(callback){
	FB.login(function(response) {
		 if (response.authResponse) {
			 console.log('Welcome!  Fetching your information.... ');
			 FB.api('/me', function(response) {	 
					if(response.verified == false){
						console.log("User not verified");
					}else{
					 callback(response);				 
				 }
			 });
		 } else {
			 console.log('User cancelled login or did not fully authorize.');
		 }
	 }, {scope: 'user_birthday'});  
}
	
window.fbAsyncInit = function() {
  FB.init({
    appId      : '139550259497394', // App ID
    channelUrl : window.location.hostname + '/cpr/frontend/channel.php', // Channel File
    status     : true, // check login status
    cookie     : true, // enable cookies to allow the server to access the session
    xfbml      : true  // parse XFBML
  });
};

/**
 * Load the SDK Asynchronously
 ************************/ 
(function(d){
   var js, id = 'facebook-jssdk'; if (d.getElementById(id)) {return;}
   js = d.createElement('script'); js.id = id; js.async = true;
   js.src = "//connect.facebook.net/en_US/all.js";
   d.getElementsByTagName('head')[0].appendChild(js);
 }(document));
