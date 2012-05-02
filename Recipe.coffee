Curl = require("./utils/Curl.js")

class @Recipe
  @socket = null
  @domTarget = ""
  @counter = 0
  @completed = false

  # the request object to be used for brute forcing
  @req:
    data: {}
    settings:
        formatting: {}

  # additional settings like encoding (utf8, iso or false)
  @settings: {}

  # data received from client (full name, birthday and a list of potential cpr numbers)
  @inputData: 
    cprList: {}

  renderPreparationResponse: (req, res, err) ->
    @socket.emit "renderPreparationResponse", req: req, err: err, res: res, domTarget: @domTarget

  getResponse: (req, res, callback) ->
    console.log("Warning: An implementation of 'getResponse' must be made")

  afterGetResponse: (cpr, status, msg = "") ->
    if status is "success"
      @socket.emit "correctCpr", cpr: cpr, msg: msg
      @completed = true
    else
      @socket.emit "incorrectCpr", cpr: cpr, msg: msg

  waitForClient: (name, req, res, err, nextStep) ->
    # in dev: only invoke function when client clicks next
    if debug_mode is true

      # send all info to client
      @renderPreparationResponse(req, res, err) 

      console.log("Waiting for client: " + name)
      @socket.emit("waitForClient", {name: name})
      
      @socket.once "next", () -> 
        nextStep(res)
        
    # in prod: return response immediately
    else
      nextStep(res)

  prepareRequest: (startBruteForce) ->
    startBruteForce()

  updateCPR: (counter) ->
    console.log("Warning: An implementation of 'updateCPR' must be made")

  bruteForce: () ->
    self = @
    Curl.scrape(@req, (req, res = {}, err) ->

      # debugging
      self.renderPreparationResponse(req, res, err) if debug_mode is true

      # get response from recipe
      self.getResponse req, res, (cpr, status, html) ->        
        self.afterGetResponse(cpr, status, html)
        self.counter++
        self.updateCPR()

        # keep brute forcing until end of numbers or completed
        if self.inputData.cprList[self.counter]? and self.completed != true
          self.bruteForce()

    # trailing argument for Curl.scrape()
    , @settings)

module.exports = @Recipe