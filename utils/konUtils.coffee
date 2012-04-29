fs = require("fs")

class @kutils

  querystringOld: (data) ->
    qs = ""
    for key of data
      qs += key + "=" + escape(data[key]) + "&"
    data = qs.slice(0, -1)
    data

  getCookie: (cookieUrl, callback) ->
    exec = require("child_process").exec
    command = "curl -I " + cookieUrl
    child = exec(command, (error, stdout, stderr) ->
      regex = /^Set-Cookie: (.*?);/m
      result = stdout.match(regex)
      cookie = result[1]
      callback cookie
    )

  module.exports = kutils