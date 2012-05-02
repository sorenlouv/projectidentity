Recipe = require("./recipes/Lebara.js")
express = require("express")
app = express.createServer()
app.listen(3000)
io = require("socket.io").listen(app);
io.set('log level', 0); 

# set debug mode
GLOBAL.debug_mode = false

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


io.sockets.on('connection', (socket) ->

	# start app when input data is received from client
	socket.on("setInputData", (data) ->

		# debug mode for debugger.html
		GLOBAL.debug_mode = true if data.debug_mode? 

		if data.session_cookie?
			new Recipe(data.inputData, socket, data.session_cookie)
		else
			recipe = new Recipe(data.inputData, socket)
			recipe.prepareRequest () ->
				recipe.bruteForce()
	)
);

