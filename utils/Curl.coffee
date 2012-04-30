curlrequest = require("curlrequest")
splitResponse = require("./splitResponse.js")
$ = require("jquery")

Curl =
  scrape: (req_specific, callback) ->
    console.log "Scraping: " + req_specific.url

    # set default request arguments
    req =      
      headers: []
      include: true   # include header
      timeout: 10     # timeout after x sec
      'retries': 3      # retry x times
      'location': 'false' # don't follow redirects
      #'socks5': 'localhost:9050' # proxy through Tor
      # --data-urlencode
      # encoding
      # --Form -f

    # merge into req
    $.extend(req, req_specific);

    # make curl request
    curl_request = curlrequest.request(req, (err, res_raw) ->
      #console.log "Scraping finished " + curl_request
      
      # format response into head and body (and location + status_code)
      res = splitResponse(res_raw) if res_raw?

      # callback with response
      callback req, res, err 
    )

  getCookie: (url, callback) ->

    options =
      url: url
      include: true

    curl_request = curlrequest.request(options, (err, res) ->
       # divide response into header and body
      res = res.split("\r\n\r\n")    

      # get header (first part of array)
      head = res.shift()

      # get cookie
      regex = /^Set-Cookie: (.*?);/m
      result = head.match(regex)
      cookie = result[1]

      console.log("Cookie: " + cookie)
      callback cookie
    )    

module.exports = Curl