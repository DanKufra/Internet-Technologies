var http = require('http');
var webserver = require('./hujiwebserver.js');

// Test is set for local file
// Linux OS assumed, if not change rootname to ./ex2
var serv1 = webserver.start(1050 , 'ex2/', function (err){
    if (err === null){
        console.log("server up!");
    } else{
        console.log(err.message);
    }});

var options =
{
    hostname: 'localhost',
    port: '1050',
    path: '/index.html',
    agent: false,
    headers: {connection: 'keep-alive', accept:
        'text/html,application/xhtml+xml,application/xml'}
};

// Test multiple concurrent requests.
for (var i=0; i < 300; i++) {
    http.get(options, function (res) {
                          res.on('data', function (data) {
                          console.log("Response received");
                          })
            });
};

