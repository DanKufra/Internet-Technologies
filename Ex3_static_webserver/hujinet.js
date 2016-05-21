
var NETSERVER = require('net');
var HTTPREQUESTPARSER = require('./hujirequestparser.js');

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

var hujiNetObject = function(rootFolder) {
    var rootName = rootFolder;
    var server;
    this.stop = function () {
        try {
            server.close(function () {
            });
        }
        catch (closeError) {
            console.log(closeError.message);
        }
    }
    this.listen = function (port, fileStream) {
        try {
            server = NETSERVER.createServer(function (socket) {
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
                            // Use the hujiwebserver to fetch a file from disk.
                            fileStream(rootName, httpReq, socket, httpErrRes);
                            // Create the http response using the stream.
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
exports.createServer = function (rootName) {
    return new hujiNetObject(rootName);
};