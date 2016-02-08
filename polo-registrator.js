var consul = require('consul')();

var args = process.argv.slice(2);
if(args.length != 2) {
    throw Error("Need 2 arguments: 1) service URL to poll 2) service name to use for registration")
}

var service_url = args[0];
var service_name = args[1];

//Just register it, see what happens
