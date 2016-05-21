
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
    var responseString = {
        "Content-Type":  mimeTypes[fileExtension],
        "Connection": "keep-alive",
        "Content-Length": streamLength
    };
    return responseString;
};

// Function that returns a readStream and uses a socket to pipe the required
//file from the disk.
function fileStream(rootFolder, requestObject, res, onFail) {
    var filePath = requestObject.path;
    var responseObject = {
        fileStream: ""
    }
    if (pathValidator(filePath) === true) {
        try {
            //If on Windows run substring filepath from 1.
            var resourceLength;
            if (requestObject.param("resource") === "/")
            {
                resourceLength = 0;
            }else{
                resourceLength = requestObject.param("resource").length;
            }
            responseObject['fileStream'] = FS.createReadStream(rootFolder +
                filePath.substring(resourceLength,
                    filePath.length));
            responseObject['fileStream'].on('error', function(){});
            //Callback that sends the response
            //If on Windows run substring from 1.
            FS.stat(rootFolder + filePath.substring(
                    resourceLength ,filePath.length),
            function (err, stats) {
                // Creates a readStream
                if (err)
                {
                    onFail();
                    return;
                }
                // Sends the HTTP headers for the response.
                res.set(createHTTPResponse(filePath,
                        stats.size));
                // Pipes file to stream.
                res.status(200).send(responseObject.fileStream);
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
var serverObj = function (port) {
    // The server object composes a hujiNetObject.
    var hujiNetobj = hujiNet.createServer();
    // Calling stop on the server object actually stops the composed hujiNetObj.
    this.stop = function (callback) {
        hujiNetobj.stop();
        callback();
    };
    this.use = function(path, callback)
    {
        if (callback == undefined)
        {
            callback = path;
            path = '/';
        }
        hujiNetobj.use(path,callback);
    };
    /*
    This function is essentially a decorator for the hujiNetObject
    checkUsageMatch function, which takes a path and checks it against all the
    matching resources in its usages array.
     */
    this.getPathMatches = function(path){
       return hujiNetobj.checkUsageMatch(path);
    };
    hujiNetobj.listen(port);
 };

/*
This is the function which creates a server Object and returns it to the user
of the module.
 */
exports.static = function(rootFolder)
{
    return fileStream.bind(null, rootFolder);
};
exports.start = function (port, callback) {
    try {
        var ourServer;

        // A new server Object is created.
        ourServer = new serverObj(port);

        //Defines a read-only port property for the server
        Object.defineProperty(ourServer, 'port', {
            value: port,
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
/*
The myUse function, an explanation of the function exists inside the toString
function.
 */
exports.myUse = function()
{
    function getMatches(server, path){
       return server.getPathMatches(path);
    };
    getMatches.toString = function()
    {
        console.log("This function returns a function which can be called with"
            + " parameters (serverObject, path), and the array of matched usages" +
            " in the corresponding server for that path is returned");
    };
    return getMatches;
}
