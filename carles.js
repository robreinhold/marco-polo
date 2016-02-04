var restify = require('restify');

var server = restify.createServer({
    name: 'carles',
    version: '1.0.0'
});
server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());

server.get('/', function (req, res, next) {
    res.send("Hola, soy Carles");
    return next();
});

server.listen(9402, function () {
    console.log('%s listening at %s', server.name, server.url);
});