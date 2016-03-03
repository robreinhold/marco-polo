var restify = require('restify');

var server = restify.createServer({
    name: 'alice',
    version: '1.0.0'
});
server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());

var logit = function(str) {
    ts = new Date().toISOString();
    console.log("%s - %s", ts, str);
};

server.get('/', function (req, res, next) {
    logit('/');
    res.send("Hello, I'm Alice");
    return next();
});

var longStr = "blahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblah";
var payload = longStr;
//1000000 gives ~80M
// 100000 gives ~8M
//  10000 gives ~800K
for(var i=0; i < 100000; i++) {
    payload += longStr
}

server.get('/big', function (req, res, next) {
    logit('/big');
    console.time('big');
    res.send(payload);
    console.timeEnd('big');
    return next();
});

server.on('after', function (req, resp, route, err) {
    console.log(err);
});

// Call this to use the localhost polo-proxy router
var client = restify.createJSONClient({url: 'http://localhost:5050'});
server.get('/remote/:name', function (req, res, next) {
    logit(req.params.name);
    client.get("/" + req.params.name, function(cerr, creq, cres) {
        res.send(cres.body);
    });
    return next();
});

server.listen(8080, function () {
    console.log('%s listening at %s', server.name, server.url);
});

