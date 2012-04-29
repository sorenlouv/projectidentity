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

  renderPreparationResponse: (req, res, err, callback) ->
    console.log("Page loaded")
    @socket.emit "renderPreparationResponse", req: req, err: err, res: res, domTarget: @domTarget
    callback(req)

  getResponse: (req, res, err, callback) ->

  afterGetResponse: (cpr, status, html) ->
    if status is "success"
      @socket.emit "correctCpr", cpr: cpr, html: html
      @completed = true
    else
      @socket.emit "incorrectCpr", cpr: cpr, html: html

  waitForClient: (name, res, callback) ->
    console.log("Waiting for client " + name)
    @socket.emit("waitForClient", {name: name})
    @socket.once "next", () ->
      callback res

  prepareRequest: (callback) ->
    callback()

  updateCPR: ->

  bruteForce: ->    
    self = @
    Curl.scrape @req, (req, res, err) ->
      self.getResponse req, res, err, (cpr, status, html) ->
        console.log("Bruteforcing: " + cpr)

        self.afterGetResponse(cpr, status, html)

        self.counter++
        self.updateCPR()

        # keep brute forcing until end of numbers or status finished
        if self.inputData.cprList[self.counter]? and self.completed != true
          self.bruteForce()