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
//1000000 gives ~80M
// 100000 gives ~8M
//  10000 gives ~800K
big = "80K ";
bigger = "8MB ";
biggest = "80MB ";

for(var i=0; i < 10000; i++) {
    big += longStr;
    for(var j=0; j < 10; j++) {
        bigger += longStr;
        for(var k=0; k<10; k++) {
            biggest += longStr;
        }
    }
}

server.get('/big', function (req, res, next) {
    logit('/big');
    console.time('big');
    res.send(big);
    console.timeEnd('big');
    return next();
});

server.get('/bigger', function (req, res, next) {
    logit('/bigger');
    console.time('bigger');
    res.send(bigger);
    console.timeEnd('bigger');
    return next();
});

server.get('/biggest', function (req, res, next) {
    logit('/biggest');
    console.time('biggest');
    res.send(biggest);
    console.timeEnd('biggest');
    return next();
});

server.on('after', function (req, resp, route, err) {
    console.log(err);
});


server.listen(8080, function () {
    console.log('%s listening at %s', server.name, server.url);
});

