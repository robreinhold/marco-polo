var http = require('http');
var httpProxy = require('http-proxy');

// Required Arg: consul agent URL
var args = process.argv.slice(2);
if(args.length != 1) {
    throw Error("Need 1 arguments: Consul agent URL")
}
var consulUrl = args[0];
var consul = require('consul')({host: consulUrl});

var proxy = httpProxy.createProxyServer({ignorePath: true});

var server = http.createServer(function(req, res) {
    try {
        var urlSegs = req.url.split('/');
        if (urlSegs.length >= 2) {
            var serviceName = urlSegs[1];
            consul.health.service(serviceName, function (err, healthCheckResponses) {
                var validUrls = [];
                for (var i = 0; i < healthCheckResponses.length; i++) {
                    var checkResponse = healthCheckResponses[i];
                    var serviceId = checkResponse.Service.ID;
                    var checks = checkResponse.Checks;
                    var destUrl = null;
                    for (var j = 0; j < checks.length; j++) {
                        var chk = checks[j];
                        if (chk.CheckID == "service:" + serviceId && chk.Status == "passing") {
                            validUrls.push("http://" + checkResponse.Node.Address + ":" + checkResponse.Service.Port);
                        }
                    }
                }
                var numUrls = validUrls.length;
                if (numUrls > 0) {
                    //Dumb load balancing - we have at least 1 healthy URL, pick one at random
                    var url_index = Math.floor(Math.random() * numUrls);
                    try {
                        proxy.web(req, res, {target: validUrls[url_index]});
                    } catch (err) {
                        console.log("Error during proxy call: " + err.toString());
                    }
                } else {
                    res.writeHead(404);
                    res.end("polo-proxy: parsed '" + serviceName + "' out of URL, but could not find healthy service with that name in consul.");
                }
            });
        }
    } catch (err) {
        console.log("Error setting up server: " + err.toString());
    }
});

port = 5050;
console.log("listening on port " + port);
server.listen(port);