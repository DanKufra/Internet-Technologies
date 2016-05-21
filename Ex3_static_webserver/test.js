var http = require('http');
var fs = require('fs');
var webserver = require('./hujiwebserver.js');

// set our const variables
// Linux assumed
var rootFlder = 'ex2/';
// list of files to check
var fileList = ['/index.html', '/style.css','/main.js','/invalidFile.txt'];

// expected results and the actual result array
var expectedResults = [true,true,true,false];
var actualResults = [];

// http request format for our check, start with the first file.
var i = 0;
var options ={
    'host': 'localhost',
    'path': fileList[i],
    'port': '8080',
    'agent': false,
    headers: {connection: 'keep-alive', accept: '*/*'}
};

// start our server object
var serverObject = webserver.start(8080, rootFlder, function (err){
    if(err){
        console.log(err.message);
    }else {
        console.log("Server is up and running!")
    }});


// define a callback function to be used by the http.request()
var callBackFunction = function (res) {
    var dataString = "";
    // get the response from our http.request callback
    res.on('data', function (data) {
        dataString += data;
    });

    //check if the data was what we expected
    res.on('end', function () {
        var filePath = rootFlder.substring(0,rootFlder.length -1) + fileList[i];
        // read the desired file and push the actual result into the array
        fs.readFile(filePath, function (err, data) {
            if (err) {
                actualResults.push(false);
            } else if (data) {
                actualResults.push(data.toString() === dataString);
            }
            // print the result
            console.log("For test "+ (i + 1) +"\nExpected: "+ expectedResults[i]
                +"\nActual: "+ actualResults[i]);
            // move our index up by one and update options.
            // Then send a new request
            if (i < fileList.length - 1) {
                i++;
                options['path'] = fileList[i];
                http.request(options,callBackFunction).end();
            }
        })
    });
};
// send an http request with our callBackFunction as its callback.
http.request(options, callBackFunction).end();
