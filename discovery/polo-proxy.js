var http = require('http');
var http_proxy = require('http-proxy');

// Required Arg: consul agent URL
var args = process.argv.slice(2);
if(args.length != 1) {
    throw Error("Need 1 arguments: Consul agent URL")
}
var consul_url = args[0];
var consul = require('consul')({host: consul_url});

var proxy = http_proxy.createProxyServer({ignorePath: true});

var server = http.createServer(function(req, res) {
    url_segs = req.url.split('/');
    if(url_segs.length >= 2) {
        service_name = url_segs[1];
        consul.health.service(service_name, function(err, health_check_responses) {
            for(var i=0; i<health_check_responses.length; i++) {
                check_response = health_check_responses[i];
                service_id = check_response.Service.ID;
                checks = check_response.Checks;
                var dest_url = null;
                for (var j=0; j<checks.length; j++) {
                    chk = checks[j];
                    if(chk.CheckID == "service:" + service_id && chk.Status == "passing") {
                        dest_url = "http://" + check_response.Node.Address + ":" + check_response.Service.Port;
                    }
                }
            }
            if(dest_url != null) {
                proxy.web(req, res, { target: dest_url });
            } else {
                res.writeHead(404);
                res.end("polo-proxy: parsed '" + service_name + "' out of URL, but could not find healthy service with that name in consul.");
            }
        });
    }

});

port = 5050;
console.log("listening on port " + port);
server.listen(port);