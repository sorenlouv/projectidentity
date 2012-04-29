curl = require("curlrequest")

Curl =
  scrape: (req, callback) ->
    console.log("Scraping started " + req.options.url)
    options =
      headers: []
      location: true
      include: true
      timeout: 10
      retries: 3
      #'limit-rate': '10240'
      #'socks5': 'localhost:9050'

    if req.options.url?
      options.url = req.options.url
      # options.header.push 'Host: ' + req.options.url

    if req.options.method?
      options.method = req.options.method

    if req.options.encoding?
      options.encoding = req.options.encoding
      
    if req.data? and req.options.method is "POST"
      options.data = ""
      for key,value of req.data
        options.data += key + '=' + encodeURIComponent(value) + '&'

      options.headers["Content-Type"] = "application/x-www-form-urlencoded"
      options.headers['Content-Length'] = options.data.length      

    if req.options.cookies?
      #options.cookie = req.options.cookies.join('&');
      options.cookie = req.options.cookies;

    # make curl request
    curl_request = curl.request(options, (err, raw_res) ->
      #console.log "Scraping finished"

      # response
      res = {}

      if raw_res?
        # divide response into header and body
        raw_res = raw_res.split("\r\n\r\n") 

        # get header (first part of array)
        res.head = raw_res.shift()

        # get body (rest of array)
        res.body = raw_res.join()

        # set status code
        status_code = /\d\d\d/.exec(res.head);
        if status_code?
          res.status_code = status_code[0]

        # set location
        location = /^Location: (.+)/m.exec(res.head);
        if location?        
          res.location = location[1]

        # set cpr
        options.cpr = req.cpr

      callback options, res, err 
    )

  getCookie: (url, callback) ->

    options =
      url: url
      include: true

    curl_request = curl.request(options, (err, res) ->
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