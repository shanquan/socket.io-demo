# socket.io-demo

Based examples from the official [socket.io examples](https://github.com/socketio/socket.io/tree/master/examples), for my own usecases.

[![Deploy](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy?template=https://github.com/shanquan/socket.io-demo)

## todo
- audio and video binary file supports
- filetransform and compression
- maybe some webRTC support, or just get research into Rocket.Chat project

## Difference

### chat example
The source sample uses express and Jquery, This hasn't. Just dependant on only socketio. Also it supports Mobile browser and messages of links(starts with http:// or https://) better.

It also supports noname login.

### whiteboard
Add current color style and color input.

## How to run
```bash
npm install
node index.js [Static Directory]
# for example: node index.js D:/mm/PDA
```

PS: this script failed on Android Termux with node v12.16.1, because of some unknown error from `socket.io`, while works fine on PC node v12.16.1.

## legacy
Files in directory legacy are some based codes snippets, which do help for developing. run `node app.js` to start.

## Ref sites
- <https://github.com/socketio/socket.io>
- <https://github.com/socketio/chat-example>
- <https://github.com/socketio/socket.io-compression-demo>
- <https://socketio-chat-example.now.sh>
- <https://socket-io-whiteboard.now.sh/>

