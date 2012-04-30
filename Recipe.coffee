Curl = require("./utils/Curl.js")

class @Recipe
  @socket = null
  @domTarget = ""
  @counter = 0
  @completed = false

  @req:
    data: {}
    settings:
        formatting: {}
  @inputData: {
    cprList: {}
  }

  renderPreparationResponse: (req, res, err) ->
    console.log("Page loaded")
    @socket.emit "renderPreparationResponse", req: req, err: err, res: res, domTarget: @domTarget

  getResponse: (req, res, err, callback) ->
    console.log("Warning: An implementation of 'getResponse' must be made")
    #callback("cpr", "status", "html")

  afterGetResponse: (cpr, status, html) ->
    if status is "success"
      @socket.emit "correctCpr", cpr: cpr, html: html
      @completed = true
    else
      @socket.emit "incorrectCpr", cpr: cpr, html: html

  waitForClient: (name, req, res, err, callback) ->
    # in dev: only invoke function when client clicks next
    if debug_mode is true

      # send all info to client
      @renderPreparationResponse(req, res, err) 

      console.log("Waiting for client: " + name)
      @socket.emit("waitForClient", {name: name})
      
      @socket.once "next", () -> 
        callback res
    # in prod: return response immediately
    else
      callback res

  prepareRequest: (callback) ->
    callback()

  updateCPR: (counter) ->
    console.log("Warning: An implementation of 'updateCPR' must be made")

  bruteForce: () ->
    self = @
    Curl.scrape @req, (req, res, err) ->

      # debugging
      self.renderPreparationResponse(req, res, err) if debug_mode is true

      # get response from recipe
      self.getResponse req, res, (cpr, status, html) ->        
        self.afterGetResponse(cpr, status, html)
        self.counter++
        self.updateCPR()

        # keep brute forcing until end of numbers or status finished
        if self.inputData.cprList[self.counter]? and self.completed != true
          self.bruteForce()