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
    var url_segs = req.url.split('/');
    if(url_segs.length >= 2) {
        var service_name = url_segs[1];
        consul.health.service(service_name, function(err, health_check_responses) {
            try {
                var valid_urls = [];
                for (var i = 0; i < health_check_responses.length; i++) {
                    var check_response = health_check_responses[i];
                    var service_id = check_response.Service.ID;
                    var checks = check_response.Checks;
                    var dest_url = null;
                    for (var j = 0; j < checks.length; j++) {
                        var chk = checks[j];
                        if (chk.CheckID == "service:" + service_id && chk.Status == "passing") {
                            valid_urls.push("http://" + check_response.Node.Address + ":" + check_response.Service.Port);
                        }
                    }
                }
                var num_urls = valid_urls.length;
                if (num_urls > 0) {
                    //Dumb load balancing - we have at least 1 healthy URL, pick one at random
                    var url_index = Math.floor(Math.random() * num_urls);
                    proxy.web(req, res, {target: valid_urls[url_index]});
                } else {
                    res.writeHead(404);
                    res.end("polo-proxy: parsed '" + service_name + "' out of URL, but could not find healthy service with that name in consul.");
                }
            } catch (ex) {
                res.writeHead(500);
                var vDebug = "";
                for (var prop in ex)
                {
                    vDebug += "property: "+ prop+ " value: ["+ ex[prop]+ "]\n";
                }
                vDebug += "toString(): " + " value: [" + ex.toString() + "]";
                res.end(vDebug);
            }
        });
    }
});

port = 5050;
console.log("listening on port " + port);
server.listen(port);