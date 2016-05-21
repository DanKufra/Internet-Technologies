
var hujiNet = require('./hujinet.js');
var FS = require('fs');
var path = require('path');


 var pathValidator = (function () {
     //Enables reference to outer scope variables in inner function.
    var self = this;
     // List of illegal file extensions
    this.illegalFileExtensions = {};
     // Gets the file name
    this.getFileName = function (str) {
                            return str.split('\\').pop().split('/').pop();
                        };

    function validate(fileLocation) {
        var fileName;
        var fileExtension;
        // Makes sure if .. exists in url, file cannot be accessed
        if (fileLocation.indexOf("..") > -1){
         return false;
        }
        fileName = self.getFileName(fileLocation);
        fileExtension = fileName.split('.').pop();
        if ( !(fileExtension in illegalFileExtensions)) {
            return true;
        } else {
            return false;
        }
    };
    return validate;
 } )();

/*
 Creates an http response to be sent to the socket.
 */
function createHTTPResponse(filePath, streamLength){
    // The supported mimeTypes for http responses.
    var mimeTypes =
    {
        html: 'text/html',
        ico : 'image/x-icon',
        jpg: 'image/jpeg',
        png: 'image/png',
        gif: 'image/gif',
        css: 'text/css',
        js: 'text/javascript',
        txt: 'text/plain'

    };
    var fileExtension =
                filePath.split('\\').pop().split('/').pop().split('.').pop();
    var responseString = "HTTP/1.1 200 OK\n" + "Content-Type: " +
        mimeTypes[fileExtension] + "\n" + "Date: " + Date.now() + "\n" +
        "Connection: keep-alive\n" + "Content-Length: " +
        streamLength + "\n\n";
    return responseString;
};

// Function that returns a readStream and uses a socket to pipe the required
//file from the disk.
function fileStream(rootFolder, requestObject, socket, onFail) {
    var filePath = requestObject.fileLocation;
    var responseObject = {
        response: "",
        fileStream: ""
    }
    if (pathValidator(filePath) === true) {
        try {
            //If on Windows run substring filepath from 1.
            responseObject['fileStream'] = FS.createReadStream(rootFolder +
                filePath.substring(0,filePath.length));
            responseObject['fileStream'].on('error', function(){});
            //Callback that sends the response
            //If on Windows run substring from 1.
            FS.stat(rootFolder + filePath.substring(0,filePath.length),
            function (err, stats) {
                // Creates a readStream
                if (err)
                {
                    onFail(socket);
                    return;
                }
                responseObject['response'] = createHTTPResponse(filePath,
                        stats.size);
                // Sends the HTTP headers for the response.
                socket.write(responseObject.response);
                // Pipes file to stream.
                responseObject.fileStream.pipe(socket);
                // Ends connection if necessary.
                if (requestObject.endOnRequest) {
                    socket.end("HTTP/1.1 200 OK\r\nConnection:" +
                        " close\r\n\r\n");
                }
            });
            } catch (invalidPathError) {
            /*
             Handles error thrown when the path is invalid (if error is thrown
                     by createReadStream).
              */
            throw new Error("Path is invalid.");
        }
    }
};

/*
Server Object returned to user when he uses the start function with the
hujiwebserver module.
 */
var serverObj = function (port,rootName) {
    // The server object composes a hujiNetObject.
    var hujiNetobj = hujiNet.createServer(rootName);
    // Calling stop on the server object actually stops the composed hujiNetObj.
    this.stop = function (callback) {
        hujiNetobj.stop();
        callback();
    };
    hujiNetobj.listen(port, fileStream);
 };

/*
This is the function which creates a server Object and returns it to the user
of the module.
 */
exports.start = function (port,rootName,callback) {
    try {
        // Ensures the root folder is a valid directory
        var ourServer;
        FS.open(rootName, 'r', function(err,fd) {
            FS.fstat(fd, function (err, stats) {
                if (!stats.isDirectory())
                {
                    throw new Error("Invalid root.");
                }
            })});

        // A new server Object is created.
        ourServer = new serverObj(port,rootName);

        //Defines a read-only port property for the server
        Object.defineProperty(ourServer, 'port', {
            value: port,
            writable: false,
            enumerable: false,
            configurable: false
        });
        //Defines a read-only rootFolder property for the server
        Object.defineProperty(ourServer, 'rootFolder', {
            value: rootName,
            writable: false,
            enumerable: false,
            configurable: false
        });
        /*
        It is assumed that the Interface for the hujiwebserver is one that
        requires the callback to handle a case where no error occurs and the
        entered parameter is null.
         */
        callback(null);

        // Return server object to the user of the hujiwebserver module.
        return ourServer;
    } catch (openServerError) {
        callback(openServerError);
    }
};
