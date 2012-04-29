lebara = require("./recipes/Lebara.js")
express = require("express")
app = express.createServer()
app.listen(3000)
io = require("socket.io").listen(app);
io.set('log level', 0); 

# routing
app.use express.bodyParser()
app.get "/*.html", (req, res) ->
	res.sendfile __dirname + "/pages/" + req.url

app.get "/js/*", (req, res) ->
	res.sendfile __dirname + req.url

app.get "/css/*", (req, res) ->
	res.sendfile __dirname + req.url

app.get "/images/*", (req, res) ->
	res.sendfile __dirname + req.url

app.get "/", (req, res) ->
	res.sendfile __dirname + "/pages/index.html"

###
inputData =
	firstName: "Peter"
	lastName: "Hansen"
	dob: '250188'
	cprList: [1107,1235,9969]
###	

io.sockets.on('connection', (socket) ->

	socket.on("setInputData", (inputData) ->
		recipe = new lebara.Lebara(inputData, socket)
		recipe.prepareRequest () ->
			recipe.bruteForce()
	)
);