var restify = require('restify');

var server = restify.createServer({
    name: 'alice',
    version: '1.0.0'
});
server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());

server.get('/', function (req, res, next) {
    res.send("Hello, I'm Alice");
    return next();
});

server.listen(8080, function () {
    console.log('%s listening at %s', server.name, server.url);
});