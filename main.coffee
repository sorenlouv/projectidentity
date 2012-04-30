callme = require("./recipes/Callme.js")
express = require("express")
app = express.createServer()
app.listen(3000)
io = require("socket.io").listen(app);
io.set('log level', 0); 
inputDebugger = require("./utils/inputDebugger.js")

# only use in debug_mode together with debugger.html (view)
GLOBAL.debug_mode = true

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
	socket.on("setInputData", (inputData) ->
		recipe = new callme.Callme(inputData, socket)
		recipe.prepareRequest () ->
			recipe.bruteForce()
	)
);

