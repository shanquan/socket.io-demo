# socket.io-demo

Based examples from the official [socket.io examples](https://github.com/socketio/socket.io/tree/master/examples), for my own usecases.

[![Deploy](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy?template=https://github.com/shanquan/socket.io-demo)

Available at <https://socket-io-demos.herokuapp.com/>

## todo
- [x] disabled pulling to refresh
- [x] image\audio and video links autoplay
  ```markdown
  <video controls="" autoplay="autoplay" width="320"><source src="https://share-xxx.cos.ap-guangzhou.myqcloud.com/video/sunshine.mp4" type="video/mp4"></video>
  <audio controls="" autoplay="autoplay"><source src="https://share-xxx.cos.ap-guangzhou.myqcloud.com/audio/%E6%82%AF%E5%86%9C.mp3"></audio>
  ```
- [x] svg use
- [x] add send button
- [x] add polyfills to support legacy browser
- [ ] filetransform and compression with CDN
- [ ] voice message
- maybe some webRTC support, or just get research into Rocket.Chat project

## Difference

### chat example
The source sample uses express and Jquery, This hasn't. Just dependant on only socketio. Also it supports Mobile browser and messages of links(starts with http:// or https://) better.

It also supports noname login.

### whiteboard
Add current color style and color input.

### disabled pulling to refresh notes
1. `meta viewport` add `user-scalable=no`, not working
2. `html,body` add `css`:`touch-action:none`, `index.html` and `chat.html login` pages pulling are disabled
3. Add `e.preventDefault()` in `onMouseDown` function of `whiteboard.js`, disable whiteboard page pulling
4. Add `document.querySelector(".chatArea").addEventListener('touchmove', function(e){e.preventDefault();},  { passive: false });` in `chat.js`, disable chat page pulling, notice can't replace `touchmove` with `touchstart` here, because with `touchstart` the buttons and a-links will also be disabled. 

### add polyfill for HTMLElement prepend and append
```js
 if(!HTMLElement.prototype.append){
    // HTMLElement.prototype.append = HTMLElement.prototype.appendChild;
    HTMLElement.prototype.append = function(){
      for(var i=0;i < arguments.length;i++){
        if(arguments[i] instanceof HTMLElement){
          this.appendChild(arguments[i]);
        }
      }
    };
  }

  if(!HTMLElement.prototype.prepend){
    HTMLElement.prototype.prepend = function(){
      for(var i=0;i < arguments.length;i++){
        if(arguments[i] instanceof HTMLElement){
          if(this.hasChildNodes()){
            this.insertBefore(arguments[i],this.firstChild);
          }else{
            this.appendChild(arguments[i]);
          }
        }
      }
    };
  }
```

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