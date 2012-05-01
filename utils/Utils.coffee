Utils =
     splitResponse: (raw_response) ->
          # response
          res = 
            head: ""
            body: ""
            status_code: 0
            location: ""

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

     # url encode data
     dataUrlEncode: (data, encoding) ->
          data_new = [];
          if encoding is "utf8"
               data_new.push encodeURIComponent(key) + "=" + encodeURIComponent(data[key]) for key of data
          else
               data_new.push escape(key) + "=" + escape(data[key]) for key of data
          data_new = data_new.join('&');
          return data_new

module.exports = Utils
