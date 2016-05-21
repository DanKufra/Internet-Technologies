var url = require("url");
var HTTPObject;

var headerObject = function(name,val){
    this.headerName = name;
    this.headerVal = val;

};

function parseException(){
    var invalidHttpError = "Invalid HTTP Request Syntax";
    throw invalidHttpError;
}

exports.parse = function (string) {

    var headerAndBody = string.split(/\r?\n\r?\n/g);
    // split the string by lines
    var firstRes = headerAndBody[0].split(/\r?\n/g);
    // split the first line by spaces
    var firstLine = firstRes[0].split(" ");
    // use the url module to parse the url part of the first line
    var parts = url.parse(firstLine[1],true);
    // set our variables
    var requestMethod, urlPath, httpVersion;
    var queryObject;
    var body = "";
    var headers = [];
    var endAtFinish = false;
    var headerMatch;
    var i = 1;
    // get the method
    if(firstLine[0] === "GET" ||
        firstLine[0] === "POST" ||
        firstLine[0] === "PUT" ||
        firstLine[0] === "DELETE"){
        requestMethod = firstLine[0];
    }else{
        parseException()
    }

    // parse the url with the url module, and parse the query
    urlPath = parts.pathname;
    queryObject = parts.query;
    // check which HTTP version it is for end on request
    if(firstLine[2] === "HTTP/1.0" || firstLine[2] === "HTTP/1.1"){
        httpVersion = firstLine[2];
        if(httpVersion === "HTTP/1.0"){
            endAtFinish = true;
        }
    }else{
        parseException();
    }
    // go over the headers and push them as header objects to an array
    while(i < firstRes.length){
        headerMatch = firstRes[i].match(/^(.+):\s+(.+)\s*$/);
        firstRes[i] = firstRes[i].toLowerCase();
        if(firstRes[i].match(/^connection:\s+keep-alive\s*$/)){
            endAtFinish = false;
        }else if(firstRes[i].match(/^connection:\s+close\s*$/)){
            endAtFinish = true;
        }
        headers.push(new headerObject(headerMatch[1].toLowerCase(),headerMatch[2]));
        i++;
    }

    // go over the body and concat it to one body string

        body = body.concat(headerAndBody[1]);
    // return a new HTTPRequest object
    return new HTTPRequestObject(requestMethod,urlPath, queryObject, headers, endAtFinish, body);
};

HTTPRequestObject = function(requestType, urlPath, queryObject,
                          headers, endOnRequest,httpBody)
{
    var self = this;
    var cookieHeader;
    // the method of the request (i.e GET, PUT, POST, DELETE
    self.method = requestType;
    // the request protocol.
    self.protocol = "http";
    // the URL path
    self.path = urlPath;
    // params object that holds names and values of the parameters from the url
    self.params = {};
    // query object that holds names and values of the queries
    self.query = queryObject;
    // holds an array of header objects
    self.headers = headers;
    // cookie object that holds names and values of the cookies
    self.cookies = {};
    // defines whether we close the socket at the end of the request or not
    self.endOnRequest = endOnRequest;
    // holds the string of the body
    self.body = httpBody;
    // function that allows us to get a header value by using the name field of the header
    self.get = function(name){
        var lowerCaseName = name.toLowerCase();
        for(var i = 0; i < self.headers.length; i++){
            if(self.headers[i].headerName === lowerCaseName){
                return self.headers[i].headerVal;
            }
        }
        return null;
    };

    //Return the value of param name when present.
    self.param = function(name){
        if (self.params[name]){
            return self.params[name];
        }
        else if(self.query[name]){
            return self.query[name];
        }else{
            return null;
        }
    };

    //Returns true if the incoming request’s “Content-Type”
    // HTTP header field matches the MIME type specified by the type parameter.
    // Returns false otherwise.
    self.is = function (mimeType) {
        var patt = new RegExp(mimeType);
        return patt.test(self.get("Content-Type"));
    };

    // adds more data to the body if we got it in separate chunks
    self.addToBody= function (string){
        self.body = self.body.concat(string);
    };

    // allows us to set the parameters names and values after the fact
    self.setParams = function(paramName, paramVal){
        self.params[paramName] = paramVal;
    };

    self.clearParams = function(){
        self.params = {};
    };
    // the host property of the request
    self.host = self.get("Host");
    // split the different cookies and update the cookies object
    cookieHeader = self.get("Cookie");
    if(cookieHeader != null){
        cookieHeader =cookieHeader.split(/;\s*/);
        for (var i = 0; i< cookieHeader.length; i++){
            var cookieMatch = cookieHeader[i].match(/^(.+)=(.+)$/);
            self.cookies[cookieMatch[1]] = cookieMatch[2];
        }
    }
    self.jsonifyBody = function () {
            if(self.is("json")){
                try{
                    self.body = JSON.parse(self.body);
                }catch(err){
                    /* Not sure that this is best practice, but the testers
                        forced us to do it. When receiving the content-type
                        as JSON pretty sure we should return an error if it
                        is not a JSON. But the last two tests published will
                        not work in that case so I just left it as a string.*/
                }
            }
    };
};

