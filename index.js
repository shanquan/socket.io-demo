// ref: <https://socket.io/get-started/chat>
// source: https://github.com/socketio/socket.io/tree/master/examples/chat
var fs = require('fs')
    , http = require('http')
    , socketio = require('socket.io');
var mime = require("./mime").types
    , url = require("url")
    , path = require("path");

var port = process.env.PORT || 808;
// static server
var server = http.createServer(function (req, res) {
  var pathname = url.parse(req.url).pathname;
    if (pathname.slice(-1) === "/") {
        pathname = pathname + "index.html";
    }
    // 添加static Directory参数
    var realPath = process.argv[2] || "public";
    realPath = path.join(realPath, path.normalize(pathname.replace(/\.\./g, "")));
    var ext = path.extname(realPath);
    ext = ext ? ext.slice(1) : 'unknown';
    if(ext=="unknown"){
      try{
        if(fs.statSync(realPath).isDirectory()){
          //redirect to req.url+"/",以支持baseURL
          res.writeHead(301, {'Location': req.url+"/"});
          res.end();
        }
      }catch(e){
        realPath += ".html";
      }
    }
    var contentType = mime[ext] || "text/html";
    // use pipe insteadof readFile
    try{
      var stat = fs.statSync(realPath);
      if(ext=="apk"){
        // for download
        res.writeHead(200,{'Content-type': contentType,"Content-Disposition":'attachment;filename="'+pathname.substring(1)+'"'});
      }else{
        res.writeHead(200, { 'Content-type': contentType });
      }
      var readStream = fs.createReadStream(realPath);
      readStream.pipe(res).once('close', function () {
        readStream.destroy();
      });
    }catch(err){
      console.log(err.toString());
      res.writeHead(404,{'Content-Type':'text/plain;charset=UFT8'});
      res.end("");
    }
}).listen(port, function () {
    console.log('listening on *:' + port);
});

var numUsers = 0;

var io = socketio.listen(server);
io.on('connection', function (socket) {
    var addedUser = false;

  // when the client emits 'new message', this listens and executes
  socket.on('new message', (data) => {
    // we tell the client to execute 'new message'
    socket.broadcast.emit('new message', {
      username: socket.username,
      message: data
    });
  });

  // when the client emits 'add user', this listens and executes
  socket.on('add user', (username) => {
    if (addedUser) return;

    // we store the username in the socket session for this client
    socket.username = username;
    ++numUsers;
    addedUser = true;
    socket.emit('login', {
      numUsers: numUsers
    });
    // echo globally (all clients) that a person has connected
    socket.broadcast.emit('user joined', {
      username: socket.username,
      numUsers: numUsers
    });
  });

  // when the client emits 'typing', we broadcast it to others
  socket.on('typing', () => {
    socket.broadcast.emit('typing', {
      username: socket.username
    });
  });

  // when the client emits 'stop typing', we broadcast it to others
  socket.on('stop typing', () => {
    socket.broadcast.emit('stop typing', {
      username: socket.username
    });
  });

  // when the user disconnects.. perform this
  socket.on('disconnect', () => {
    if (addedUser) {
      --numUsers;

      // echo globally that this client has left
      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: numUsers
      });
    }
  });

  // whiteboard
  socket.on('drawing', (data) => socket.broadcast.emit('drawing', data));
});