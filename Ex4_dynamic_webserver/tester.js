
var hujiwebserver = require('./hujiwebserver');
var http = require('http');
var net = require('net');
var PORT = 8080;
var HOST = 'localhost';
var testNumber = 1;
var totalTests = 23;
var totalPassed = 0;
var totalFailed = 0;

var server = hujiwebserver.start(PORT, function(err) {
    if (err) {
        console.log("The server was not able to start. Received error: " + err.message);
    }
});

console.log("Server started and listening to port  " + PORT);
console.log("Beginning tests:");

// Registering usages in our server object:

// test 1 which checks a default path
server.use(function(req, res, next) {
    if(req.path == '/caught/by/default/usage'){
        res.status(200);
        res.send("First test passed.");
    }else{
        next();
    }
});

// test 2 which checks single cookies.
server.use('/test2/singleCookieTest', function(req, res, next) {
    res.status(200);
    res.send(JSON.stringify(req.cookies));
});

// test 3 which checks double cookies.
server.use('/test3/doubleCookieTest', function(req, res, next) {
    res.status(200);
    res.send(JSON.stringify(req.cookies));
});

// test 4 which test a single query
server.use('/test4/singleQueryTest', function(req, res, next) {
    res.status(200);
    res.send(JSON.stringify(req.query));
});

// test 5 which test two queries
server.use('/test5/twoQueryTest', function(req, res, next) {
    res.status(200);
    res.send(JSON.stringify(req.query));
});

// test 6 which test no queries
server.use('/test6/noQueryTest', function(req, res, next) {
    res.status(200);
    res.send(JSON.stringify(req.query));
});

// test 7 which test hosts
server.use('/test7/host', function(req, res, next) {
    res.status(200);
    res.send(req.host);
});

// test 8 which test protocol
server.use('/test8/protocol', function(req, res, next) {
    res.status(200);
    res.send(req.protocol);
});

// test 9 which test method
server.use('/test9/method', function(req, res, next) {
    res.status(200);
    res.send(req.method);
});

// test 10 which test get in proper format
server.use('/test10/get/proper', function(req, res, next) {
    res.status(200);
    res.send(req.get("Content-Type"));
});

// test 11 which test get in wrong type format
server.use('/test11/get/weirdCase', function(req, res, next) {
    res.status(200);
    res.send(req.get("coNteNt-tyPe"));
});

// test 12 which test is() in simple case
server.use('/test12/is/simpleCase', function(req, res, next) {
    res.status(200);
    if(req.is("text/html")){
        res.send("correct");
    } else{
        res.send("wrong");
    }
});
// test 13 which test is() in not simple case
server.use('/test13/is/notSimpleCase1', function(req, res, next) {
    res.status(200);
    if(req.is("html")){
        res.send("correct");
    } else{
        res.send("wrong");
    }
});


// test 14 which test is() in not simple case2
server.use('/test14/is/notSimpleCase2', function(req, res, next) {
    res.status(200);
    if(req.is("html")){
        res.send("correct");
    } else{
        res.send("wrong");
    }
});

// test 15 which test next
server.use('/test15/next', function(req, res, next) {
    res.body = "next1";
    next();
});

server.use('/test15/next', function(req, res, next) {
    res.body += " next2";
    next();
});

server.use('/test15/next', function(req, res, next) {
    res.body += " next3";
    next();
});

// if we entered here this usage it means there is a problem in the recursion
server.use('/test15/wrongNext', function(req, res, next) {
    res.body += " Wrongly entereed";
});

server.use('/test15/next', function(req, res, next) {
    res.status(200);
    res.body += " next4";
    res.send(res.body);
});


// test 16 which tests a param at end
server.use('/test16/params/:param1', function(req, res, next) {
    res.status(200);
    res.send(req.param("param1"));
});

// test 17 which tests a param in the middle
server.use('/test17/params/:param1/restOfTest', function(req, res, next) {
    res.status(200);
    res.send(req.param("param1"));
});

// test 18 which tests 2 param in the middle and end
server.use('/test18/params/:param1/restOfTest/:param2', function(req, res, next) {
    res.status(200);
    res.send(req.param("param1") + "  " + req.param("param2"));
});
// test 19 which tests a param and a query of same name using param() to check
server.use('/test19/params/:param1/restOfTest', function(req, res, next) {
    res.status(200);
    res.send(req.param("param1") + "  " + req.param("param1"));
});

// test 20 which tests a param and a query of different name using param() to check
server.use('/test20/params/:param1/restOfTest', function(req, res, next) {
    res.status(200);
    res.send(req.param("param1") + "  " + req.param("query1"));
});

// test 21 wwhich tests the res.set() and res.get() functions
server.use('/test21/whatevs', function(req, res, next) {
    res.set("Content-Type", "text/*");
    res.status(200).send(res.get("Content-Type"));
});

// test 22 which tests 404 exception page not found
server.use('/test22/exception/path/does/not/exist', function(req, res, next) {
    res.status(404);
    res.send("Should not have found this path");
});

// test 23 checks the static method of the hujiweserver
server.use('/test23',hujiwebserver.static('./www'));




var testsObject= [
    {
        // test 1 which checks a default path
        options : {
            path: "/caught/by/default/usage",
            method: "GET",
            test_name: "test1"
        },
        expected : {
            status: 200,
            data: "First test passed."
        }
    },
    // test 2 which checks single cookies.
    {
        options: {
            path: "/test2/singleCookieTest",
            method: "GET",
            test_name: "test2",
            headers: {"Cookie": "cookie1 = cookie1Val"}
        },
        expected: {
            status: 200,
            data:"{\"cookie1 \":\" cookie1Val\"}"
        }
    },
    // test 3 which checks multiple cookies.
    {
        options: {
            path: "/test3/doubleCookieTest",
            method: "GET",
            test_name: "test3",
            headers: {"Cookie" : "cookie1 = cookie1Val; cookie2 = cookie2Val"}
        },
        expected: {
            status: 200,
            data:"{\"cookie1 \":\" cookie1Val\",\"cookie2 \":\" cookie2Val\"}"
        }
    },
    // test 4 which tests a single query
    {
        options: {
            path: "/test4/singleQueryTest?query1=query1Val",
            method: "GET",
            test_name: "test4",
        },
        expected: {
            status: 200,
            data:"{\"query1\":\"query1Val\"}"
        }
    },
    // test 5 which tests multiple query
    {
        options: {
            path: "/test5/twoQueryTest?query1=query1Val&query2=query2Val",
            method: "GET",
            test_name: "test5",
        },
        expected: {
            status: 200,
            data:"{\"query1\":\"query1Val\",\"query2\":\"query2Val\"}"
        }
    },
    // test 6 which tests no queries
    {
        options: {
            path: "/test6/noQueryTest",
            method: "GET",
            test_name: "test6",
        },
        expected: {
            status: 200,
            data: null
        }
    },
    // test 7 which test hosts
    {
        options: {
            path: "/test7/host",
            method: "GET",
            test_name: "test7",
        },
        expected: {
            status: 200,
            data: "localhost:8080"
        }
    },
    // test 8 which test hosts
    {
        options: {
            path: "/test8/protocol",
            method: "GET",
            test_name: "test8",
        },
        expected: {
            status: 200,
            data: "http"
        }
    },
    // test 9 which tests methods
    {
        options: {
            path: "/test9/method",
            method: "GET",
            test_name: "test9",
        },
        expected: {
            status: 200,
            data: "GET"
        }
    },
    // test 10 which tests get() in a proper format
    {
        options: {
            path: "/test10/get/proper",
            method: "GET",
            test_name: "test10",
            headers: {"Content-Type" : "text/html"}
        },
        expected: {
            status: 200,
            data: "text/html"
        }
    },
    // test 11 which tests get() in a proper format
    {
        options: {
            path: "/test11/get/weirdCase",
            method: "GET",
            test_name: "test11",
            headers: {"Content-Type" : "text/html"}
        },
        expected: {
            status: 200,
            data: "text/html"
        }
    },

    // test 12 which tests is in simple case of req.is("text/html")
    {
        options: {
            path: "/test12/is/simpleCase",
            method: "GET",
            test_name: "test12",
            headers: {"Content-Type" : "text/html"}
        },
        expected: {
            status: 200,
            data: "correct"
        }
    },

    // test 13 which tests is in none simple case of req.is("html")
    {
        options: {
            path: "/test13/is/notSimpleCase1",
            method: "GET",
            test_name: "test13",
            headers: {"Content-Type" : "text/html"}
        },
        expected: {
            status: 200,
            data: "correct"
        }
    },
    // test 14 which tests is in none simple case of req.is("html") should be false
    {
        options: {
            path: "/test14/is/notSimpleCase2",
            method: "GET",
            test_name: "test14",
            headers: {"Content-Type" : "text/html"}
        },
        expected: {
            status: 200,
            data: "correct"
        }
    },
    // test 15 which tests multiple calls to next and also adding to a body of the request
    {
        options: {
            path: "/test15/next",
            method: "GET",
            test_name: "test15",
        },
        expected: {
            status: 200,
            data: "next1 next2 next3 next4"
        }
    },
    // test 16 which tests params at the end of the path
    {
        options: {
            path: "/test16/params/param1Val",
            method: "GET",
            test_name: "test16",
        },
        expected: {
            status: 200,
            data: "param1Val"
        }
    },
    // test 17 which tests params in the middle of the path
    {
        options: {
            path: "/test17/params/param1Val/restOfTest",
            method: "GET",
            test_name: "test17",
        },
        expected: {
            status: 200,
            data: "param1Val"
        }
    },
    // test 18 which tests params in the middle and end of the path
    {
        options: {
            path: '/test18/params/param1Val/restOfTest/param2Val',
            method: "GET",
            test_name: "test18",
        },
        expected: {
            status: 200,
            data: "param1Val  param2Val"
        }
    },
    // test 19 which tests a param and a query with same name
    {
        options: {
            path: '/test19/params/param1Val/restOfTest?param1Val=query1Val',
            method: "GET",
            test_name: "test19",
        },
        expected: {
            status: 200,
            data: "param1Val  param1Val"
        }
    },
    // test 20 which tests a param and a query with different names
    {
        options: {
            path: '/test20/params/param1Val/restOfTest?query1=query1Val',
            method: "GET",
            test_name: "test20",
        },
        expected: {
            status: 200,
            data: "param1Val  query1Val"
        }
    },
    // test 21 which tests a param and a query with different names
    {
        options: {
            path: '/test21/whatevs',
            method: "GET",
            test_name: "test21",
        },
        expected: {
            status: 200,
            data: "text/*"
        }
    },
    // test 22 which checks for page not found exception
    {
        options: {
            path: '/path/does/not/exist/at/all/not/here/ever',
            method: "GET",
            test_name: "test22"
        },
        expected: {
            status: 404,
            data: "The requested resource not found"
        }
    },
    // test 23 to test for static server usage
    {
        options: {
            path: "/test23/index.html",
            method: "GET",
            test_name: "test23"
        },
        expected: {
            status: 200
        }
    }
]

function runTest(options,expected) {
    console.log("CURRENTLY TESTING TEST number " + testNumber + "\n\n");
    var httpRequest = {
        hostname: HOST,
        port: PORT,
        path: options.path,
        method: options.method
    };

    if (options.headers) {
        httpRequest.headers = options.headers;
    }

    var req = http.request(httpRequest,function(res) {

        var completeRes = "";

        res.on('data', function (dataChunk) {
            completeRes += dataChunk;
        });

        res.on('end', function () {
            res.buffer = completeRes;
            if (res.statusCode != expected.status || ((res.buffer != expected.data) && expected.data)) {
                console.warn("Test number " + options.test_name + " FAILED\n");
                console.warn("##############################################\n");
                if (res.statusCode != expected.status) {
                    console.log("Expect: " + expected.status + "Received: " + res.statusCode + "\n");
                }
                if ((res.buffer != expected.data) && expected.data) {
                    console.log("Expect: " + expected.data + "Received: " + res.buffer);
                }
                totalFailed++;
            } else{
                console.log("Test number " + options.test_name + " PASSED\n");
                totalPassed++;
            }

            if (totalFailed + totalPassed == totalTests) {
                console.log("TOTAL PASSED: " + totalPassed + "\nTOTAL FAILED: " + totalFailed);
                server.stop(function(){});
            }
        })
    })
    req.on('error', function(err){
        console.log("ERROR CAUGHT IN REQUEST: " + err.message);
    });

    if (options.data){
        req.write(options.data);
    }
    req.end();
    if(testNumber < totalTests){
        testNumber++;
        setTimeout(function() {
            runTest(testsObject[testNumber - 1].options, testsObject[testNumber -1].expected);
        }, 20);

    }
}

function runAllTests(){
    setTimeout(function () {
        runTest(testsObject[testNumber - 1].options, testsObject[testNumber - 1].expected);
    }, 1000);
}
runAllTests();



