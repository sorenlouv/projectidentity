curlrequest = require("curlrequest")
Utils = require("./Utils.js")
$ = require("jquery")

Curl =
  scrape: (req_specific, callback, settings = {}) ->
    console.log "Scraping: " + req_specific.url

    # set default request arguments
    req =      
      headers: []
      include: true   # include header
      timeout: 10     # timeout after x sec
      'retries': 3      # retry x times
      location: false # don't follow redirects
      #'socks5': 'localhost:9050' # proxy through Tor

    # merge into req
    $.extend(req, req_specific);

    # encode data with utf8 as default
    if req.data?
      if settings.urlencoding?
        req.data = Utils.dataUrlEncode(req.data, settings.urlencoding)
      else
        req.data = Utils.dataUrlEncode(req.data, "utf8")
      
    # make curl request
    curl_request = curlrequest.request(req, (err, res_raw) ->
      # debugging
      if err?
        console.log "ERROR: "
        console.log err
      
      # format response into head and body (and location + status_code)
      res = Utils.splitResponse(res_raw) if res_raw?

      # callback with response
      callback req, res, err 
    )

  getCookie: (url, callback) ->

    options =
      url: url
      include: true

    curl_request = curlrequest.request(options, (err, res) ->
      # Debugging
      unless err?
        console.log "ERROR: "
        console.log err

       # divide response into header and body
      res = res.split("\r\n\r\n")

      # get header (first part of array)
      head = res.shift()

      # get cookie
      regex = /^Set-Cookie: (.*?);/m
      result = head.match(regex)
      cookie = (if (result?) then result[1] else "")

      console.log("Cookie: " + cookie)
      callback cookie
    )    

module.exports = Curl