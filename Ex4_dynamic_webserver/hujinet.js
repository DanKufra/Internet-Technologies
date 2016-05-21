
var NETSERVER = require('net');
var HTTPREQUESTPARSER = require('./hujirequestparser.js');
var stream = require('stream');
/*
Decorates a net server object, which is used later on by the serverObject
returned by hujiwebserver.
 */
/*
 Writes the HTTP error response in case an error response is needed.
 */
function httpErrRes(socket){
    socket.write("HTTP/1.1 500 Internal Server Error\n");
    socket.write("Content-Type: text/html\n");
    socket.write("Date: " + Date.now() + "\n");
    socket.write("Connection: keep-alive\n");
    socket.write("Content-Length: 200\r\n\n");
    socket.write("\<html><head><title>500 internal error</title></head><body>" +
        "\ <h1>Internal Error</h1>   " +
        "\<p>The server encountered an unexpected condition which prevented" +
        "\ it from fulfilling the request.</p></body></html>");
};
/*
 Writes the HTTP error page not found if needed.
 */
function pageNotFound(socket){
    socket.write("HTTP/1.1 404 Not Found\n");
    socket.write("Content-Type: text/html\n");
    socket.write("Date: " + Date.now() + "\n");
    socket.write("Connection: keep-alive\n");
    socket.write("Content-Length: 32\r\n\n");
    socket.write("The requested resource not found");
};

/*
    This defines the responseObject entered as the parameter for the callback
    used by the dynamic server.
 */
var responseObject = function(socket){
    var self = this;
    var statusMsg =
    {
        200: "OK",
        404: "Not Found",
        500: "Internal Server Error"
    };
    self.cookies = {};
    self.headers= {
        "Content-Type": "text/html",
        "Connection": "keep-alive"
    };
    // What happens if status was not defined?
    var respond = function(streamBody) {
        if (typeof self.statusCode == "undefined")
        {
            httpErrRes(socket);
            return;
        }
        // Write all headers
        socket.write("HTTP/1.1 " + self.statusCode + " " +
            statusMsg[self.statusCode] +  "\r\n");
        socket.write("Date: " + Date.now() + "\r\n");
        for (var header in self.headers)
        {
            socket.write(header + ": " + self.get(header) + "\r\n");
        }
        for (var cookie in self.cookies)
        {
            socket.write("Set-Cookie: sessionToken=" + self.cookies.cookie.value
                + "; Expires=" + self.cookies.cookie.options.expire + "\r\n");
        }
        socket.write("\r\n");
        // Handles case where send was called without parameter.
        if (typeof streamBody == "undefined")
        {
            return;
        }else if (typeof streamBody === "string")
        {
            // If the stream is actually the body, write it.
           socket.write(self.body);
        }else if (streamBody instanceof stream.Stream){
            /*
            If the static hujiwebserv method was, called, pipe the readStream
             */
            streamBody.pipe(socket);
        }
    };
    /*
    Sets a headername and corresponding value for the response object.
     */
    self.set = function(headerName, headerValue){
        if (typeof headerValue != "undefined")
        {
            self.headers[headerName] = headerValue;
        }else{
            // If an object of parameters is passed to set.
            for (var key in headerName){
                if (headerName.hasOwnProperty(key))
                {
                    self.headers[key] = headerName[key];
                }
            }
        }
    };
    /*
     Sets the status code of the response object, returns the object for
     chaining in case necessary.
     */
    self.status = function(code){
        self.statusCode = code;
        return self;
    };
    /*
     A getter for the response object, which gets the value of the passed field.
     */
    self.get = function(field){
        return self.headers[field];
    };
    /*
     Sets the cookies for the response object, the assumption is that the user
     of the module keeps track of his own cookies.
     */
    self.cookie = function(name, value, options){

            self.cookies[name] = {value: value, options: options};
            if (typeof options === "undefined")
            {
                // If no expiration date is set, two days are given as the
                // default.
                self.cookies[name].options = {expire:  Date.now() + 2};
            }
    };
    /*
    Sends a json as the body via the response object.
     */
    self.json = function(body){
        if (body != null)
        {
            self.body = JSON.stringify(body);
            self.headers["Content-Length"] = self.body.length;
        }else{
            self.body = "";
        }
        respond("");
    };
    /*
    The body parameter defines the body, body can acccept either text or a
    stream, if given a stream this stream is used to pipe to the socket to be
    used by the response object. If an error is thrown, this will be caught
    later on.
     */
    self.send = function(body)
    {
       if (typeof body == "object" && !(body instanceof stream.Stream))
        {
            self.json(body);
           // self.send(JSON.stringify(body));
            return;
        }
        self.body = body;
        if (typeof body == "string")
        {
            /*
            If the body is a string, ASCII is assumed and the length of the
             string is also the content length.
             */
            self.headers["Content-Length"] = self.body.length;
        }
        respond(body);
    };
    return self;
};
/*
This is the main hujiNetObject returned by the hujinet module.
 */
var hujiNetObject = function() {
    //var rootName = rootFolder;
    var server;
    var self = this;
    // Handles all the usages defined on the hujiNetObject.
    self.usages = [];
    /*
    This method receives a path and returns an array of all matching usages.
     */
    self.checkUsageMatch = function(path){
        var regexMatches = [];
        for (var i =0; i < self.usages.length; i++)
        {
            var testMatch =
                path.match(self.usages[i].matchResourceRegex);
            if (testMatch != null)
            {
                regexMatches.push({"Matched Usage": self.usages[i].path});
            }
        }
        return regexMatches;
    };
    /*
     This method adds a resource and its appropriate callback to the usages
     array.
     */
    self.use =  function(path, callback){
        // The parameter names are extracted via this regex.
        var paramMatch = path.match(/(:(?:[^/]*)*)/g);
        // This will be the regex which catches the parameter values from URL.
        var paramRegex = path;
        // This regex will check if the url matches the resource.
        var matchResourceRegex = path;
        // Handles case where the path is general or undefined.
        if (path === '/'){
            matchResourceRegex = ".*";
        }
        if (paramMatch != null)
        {
            // Replaces all the parameters with regexes to catch in a URL
            for (var j = 0; j < paramMatch.length; j++)
            {
                paramRegex = paramRegex.replace(paramMatch[j], "([^/]*)");
            }
            /*
            Replaces all the parameters in matchResourceRegex to ensure a
            matching resource is caught.
             */
            for (var j = 0; j < paramMatch.length; j++)
            {
               matchResourceRegex =  matchResourceRegex.replace(paramMatch[j],
                   "[^/]+");
               paramMatch[j] = paramMatch[j].substring(1, paramMatch[j].length);
            }
        }
        // Another addition to the matchResourceRegex after preliminary parsing.
        matchResourceRegex = "^(" + matchResourceRegex + "(?:/[^/]+)*)$";
        // Turns matchResourceRegex into a RegExp
        matchResourceRegex = new RegExp(matchResourceRegex);
        /*
        After all the relevant parsing has been done, the usage object is
        pushed into the array.
         */
        self.usages.push({path: path,
            callback: callback,
            params: paramMatch,
            matchResourceRegex: matchResourceRegex,
            paramRegex: paramRegex
        });
    };
    /*
    This function closes the server.
     */
    this.stop = function () {
        try {
            server.close(function () {
            });
        }
        catch (closeError) {
            console.log(closeError.message);
        }
    };
    /*
    This function defines what the hujiNetObject does once it is up.
     */
    this.listen = function (port) {
        try {
            server = NETSERVER.createServer(function (socket) {
                /*
                Constant that defines the max idle time until timeout of the
                server.
                 */
                var MAX_IDLE_TIME = 2000;
                var httpReq;
                var data ="";

                // Set socket to timeout after MAX_IDLE_TIME
                 socket.setTimeout(MAX_IDLE_TIME, function(){
                     socket.end("HTTP/1.1 408 Request Timeout\r\n");

                });
                socket.on('data', function (chunk) {
                    /*
                     On reception of data parse the request and return an
                     httpRequest object.
                      */
                    // Ensure that data is chunked.
                    data += chunk;
                    if((/\r?\n\r?\n/g).test(data)) {
                        try {
                            httpReq =
                                HTTPREQUESTPARSER.parse(data.toString());
                            httpReq.jsonifyBody();
                            var i = 0;
                            function checkUsage(numUsage) {
                                var testMatch, paramValues;
                                /*
                                If all usages have been checked, no need to
                                check further.
                                 */
                                if (numUsage == self.usages.length)
                                {
                                    return false;
                                }
                                // Check if resource matches.
                                testMatch =
                                    httpReq.path.match(
                                    self.usages[numUsage].matchResourceRegex);
                                /*
                                If resource doesn't match regex, no need to
                                check further.
                                 */
                                if(testMatch === null){
                                    return false;
                                /*
                                If this is a partial match that doesn't
                                exactly fit - no need to continue.
                                */
                                }else if (httpReq.path != testMatch[0] &&
                                    self.usages[numUsage].params != null){
                                    return false;
                                }

                                /*
                                Extracts the parameter values from the url.
                                 */

                               paramValues =
                                    httpReq.path.match
                                    (self.usages[numUsage].paramRegex);

                                /*
                                Clears former parameters that were set to the
                                httpReq object.
                                 */
                                httpReq.clearParams();

                                if (self.usages[numUsage].params == null)
                                {
                                    /*
                                    Allows the static method to know what the
                                    actual path to be read is.
                                     */

                                    httpReq.setParams("resource",
                                        self.usages[numUsage].paramRegex );
                                    return true;
                                }
                                /*
                                Sets the relevant parameters in the URL after
                                extraction.
                                 */
                                for (var k = 1; k <
                                self.usages[numUsage].params.length + 1 && k <
                                paramValues.length; k++)
                                {
                                    httpReq.setParams
                                    (self.usages[numUsage].params[k - 1],
                                        paramValues[k]);
                                }
                                return true;
                            }
                            // Creates the new responseObject with socket.
                            var response = new responseObject(socket);

                            // Iterates through the relevant usages.
                            while (i < self.usages.length)
                            {
                                if (checkUsage(i))
                                {
                                    var current = i;
                                    self.usages[i].callback(
                                        httpReq, response, function(){
                                            /*
                                            If next is called, goes to
                                            next usage.
                                             */
                                            i++;
                                        }
                                    );
                                    /*
                                    If next wasn't called despite a match, no
                                    need to keep iterating.
                                     */
                                    if (current == i)
                                    {
                                        break;
                                    }
                                }else{
                                    i++;
                                }
                            }
                            /*
                            If all usages have been checked, send a page
                            found error.
                             */
                            if (i == self.usages.length)
                            {
                                pageNotFound(socket);
                            }
                        }catch (fileError) {
                            // If can't fetch file
                            httpErrRes(socket);
                            console.log(fileError.message);
                            }
                    }
                })
            });
            server.listen(port);
        }catch (createNetServerError) {
            console.log(createNetServerError.message);
            throw createNetServerError;
        }
    }
};
// Exposes the createServer function to the user of the hujinet module.
exports.createServer = function () {
    return new hujiNetObject();
};