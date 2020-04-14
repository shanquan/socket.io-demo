// ref: <https://socket.io/get-started/chat>
var fs = require('fs')
    , http = require('http')
    , socketio = require('socket.io');

var port = process.env.PORT || 3000;
var server = http.createServer(function (req, res) {
    res.writeHead(200, { 'Content-type': 'text/html' });
    res.end(fs.readFileSync(__dirname + '/index.html'));
}).listen(port, function () {
    console.log('listening on *:' + port);
});

var io = socketio.listen(server);
io.on('connection', function (socket) {
    socket.on('message', function (msg) {
        console.log('Message Received: ', msg);
        // If you want to send a message to everyone except for a certain emitting socket, we have the broadcast flag for emitting from that socket
        // socket.broadcast.emit('message', msg);
        // In this case, for the sake of simplicity we’ll send the message to everyone, including the sender.
        io.emit('message', msg);
    });
});