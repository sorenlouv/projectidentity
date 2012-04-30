splitResponse = (raw_response) ->
     # response
     res = {}

     # divide response into header and body
     raw_response = raw_response.split("\r\n\r\n") 

     # get header (first part of array)
     res.head = raw_response.shift()

     # get body (rest of array)
     res.body = raw_response.join()

     # set status code
     status_code = /\d\d\d/.exec(res.head);
     if status_code?
       res.status_code = status_code[0]

     # set location
     location = /^Location: (.+)/m.exec(res.head);
     if location?        
       res.location = location[1]

     return res

module.exports = splitResponse