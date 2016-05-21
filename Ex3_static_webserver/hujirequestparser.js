var HTTPObject;
function parseException(){
    var invalidHttpError = "Invalid HTTP Request Syntax";
    throw invalidHttpError;
}
exports.parse = function (string) {
    var res = string.split(/\r?\n/g);
    var requestLine = res[0].split(" ");
    var requestType, filePath, httpVersion, contentSize;
    var body = "";
    var endAtFinish = false;
    var i = 1;

    if(requestLine[0] === "GET"){
        requestType = "GET";
    }else{
        parseException()
    }
    if(requestLine[1] != null){
        filePath = requestLine[1];
    }else{
        parseException();

    }
    if(requestLine[2] === "HTTP/1.0" || requestLine[2] === "HTTP/1.1"){
        httpVersion = requestLine[2];
        if(httpVersion === "HTTP/1.0"){
            endAtFinish = true;
        }
    }else{
        parseException();
    }

    while(res[i]!= ""){
        res[i] = res[i].toLowerCase();
        if(res[i].match(/^connection:\s+keep-alive\s*$/)){
            endAtFinish = false;
        }else if(res[i].match(/^connection:\s+close\s*$/)){
            endAtFinish = true;
        }
        else if(res[i].match(/^content-length:\s[\d]+\s*$/)) {
            contentSize = res[i].match(/[\d]+/g)[0];
        }
        i++;
    }
    if(contentSize != null){
        while(body.length != contentSize)
        {
            i++;
            body = body.concat(res[i]);
            body = body.concat("\r\n");
        }
    }
    return new HTTPObject(requestType,filePath, httpVersion,
        contentSize, endAtFinish,body);
};

HTTPObject = function(requestType, fileLocation, httpVersion,
                          contentSize, endOnRequest,body)
{
   this.requestType = requestType;
   this.fileLocation = fileLocation;
   this.httpVersion = httpVersion;
   this.endOnRequest = endOnRequest;
   this.contentSize = contentSize;
   this.body = body;
};
