var http = require('http');
var webserver = require('./hujiwebserver.js');

// Test is set for local file
var serv1 = webserver.start(8080, function (err){
    if (err === null){
        console.log("server up!");
    } else{
        console.log(err.message);
    }});
serv1.use("/ex2", webserver.static("./www"))
var options =
{
    hostname: 'localhost',
    port: '8080',
    path: 'ex2/index.html',
    agent: false,
    headers: {connection: 'keep-alive', accept:
        'text/html,application/xhtml+xml,application/xml'}
};

// Test multiple concurrent requests.
for (var i=0; i < 500; i++) {
    http.get(options, function (res) {
                          res.on('data', function (data) {
                          console.log("Response received");
                          })
            });
};

