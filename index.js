// ref: <https://socket.io/get-started/chat>
// source: https://github.com/socketio/socket.io/tree/master/examples/chat
var fs = require('fs')
    , http = require('http')
    , socketio = require('socket.io');
const { config } = require('process');
var mime = require("./mime").types
    , url = require("url")
    , path = require("path");

var port = process.env.PORT || 808;
const KEY="3345",PRIVATENS="5432";
// static server
var server = http.createServer(function (req, res) {
  var urlObj = url.parse(req.url,true);
  var pathname = urlObj.pathname;
  if (pathname.slice(-1) === "/") {
      pathname = pathname + "index.html";
  }
  if(pathname.startsWith('/api/')){
    var method = pathname.substring(5);
    var body = {
      result: "fail",
      data: "not available"
    }
    switch(method){
      case 'checkUser': 
        if(urlObj.query.name.startsWith(KEY)){
          body.result = "ok";
          body.data = PRIVATENS;
          body.key = KEY;
        }
        res.end(JSON.stringify(body));
        return;
    }
  }
    // 添加static Directory参数
    var realPath = process.argv[2] || "public";
    realPath = path.join(realPath, decodeURI(path.normalize(pathname.replace(/\.\./g, ""))));
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

var dbModel = {
  numUsers:0,
  users:[]
};
var nsList = {
  'default': dbModel,
  'private': {
    numUsers:0,
    users:[]
  }
}

var io = socketio.listen(server);
const nsp = io.of('/'+PRIVATENS);
nsp.on('connection', socket => {
  commonChat(socket,'private');
  // support file sharing
  socket.on('file', function(data){
    fs.writeFile('./public/assets/'+data.name, data.buffer, function(err) {
      if (err) {
          socket.emit('new message', {
            username: socket.username,
            message: 'upload Error:'+JSON.stringify(err)
          });
      }
      var url='http://'+socket.handshake.headers.host+'/assets/'+data.name;
      if(data.type.startsWith('image/')){
        url = "image:"+url;
      }else if(data.type.startsWith('audio/')){
        url = "audio:"+url;
      }else if(data.type.startsWith('video/')){
        url = "video:"+url;
      }
      socket.emit('new message', {
        username: socket.username,
        message: url
      });
      // saved only for 24 hours, or clear assets dir with fs.rmdir every day at 00:00
      setTimeout(function(){
        fs.unlink('./public/assets/'+data.name,function(err){
          if(err){
            console.log(err);
          }
        })
      },24*3600*1000)
    })
  });
});

io.on('connection', function (socket) {
  commonChat(socket,'default');
  // whiteboard
  socket.on('drawing', (data) => socket.broadcast.emit('drawing', data));
});

function commonChat(socket,tag){
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
    ++nsList[tag].numUsers;
    addedUser = true;
    nsList[tag].users.push(username);
    socket.emit('login', {
      users: nsList[tag].users,
      numUsers: nsList[tag].numUsers
    });
    // echo globally (all clients) that a person has connected
    socket.broadcast.emit('user joined', {
      username: socket.username,
      numUsers: nsList[tag].numUsers
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
      --nsList[tag].numUsers;
      var idx = nsList[tag].users.indexOf(socket.username);
      if(idx!=-1){
        nsList[tag].users.splice(idx,1);
      }
      // echo globally that this client has left
      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: nsList[tag].numUsers
      });
    }
  });
}