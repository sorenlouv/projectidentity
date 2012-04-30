# scope variables
count = 0
@cprList = []
@dob = 0

@generateCombinations = (dob, firstName, lastName, gender, setCprList_cb) ->
	@dob = dob

	# set values for permutations of CPR number
	options = []
	options[0] = [ 0, 1, 2, 3, 4, 9 ]
	options[1] = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ]
	options[2] = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ]
	options[3] = (if gender is "male" then [ 1, 3, 5, 7, 9 ] else [ 0, 2, 4, 6, 8 ])

	# find valid cpr numbers
	recursiveSearch options, 0, 0, ->
		setCprList_cb(cprList)

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
	# callback when finished
	callback() if count is 0

# validate cpr
validateCPR = (cpr) ->
	fullcpr = @dob + cpr
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

#Calc = exports ? this