# socket.io-demo

Based examples from the official [socket.io examples](https://github.com/socketio/socket.io/tree/master/examples), for my own use.

[![Deploy](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy?template=https://github.com/shanquan/socket.io-demo)

Available at <https://socket-io-demos.herokuapp.com/>

## todo
- [x] disabled pulling to refresh
- [x] image\audio and video links autoplay
  ```markdown
  <video controls="" autoplay="autoplay" width="320"><source src="https://share-xxx.cos.ap-guangzhou.myqcloud.com/video/sunshine.mp4" type="video/mp4"></video>
  <audio controls="" autoplay="autoplay"><source src="https://share-xxx.cos.ap-guangzhou.myqcloud.com/audio/%E6%82%AF%E5%86%9C.mp3"></audio>
  ```
- [x] use svg
- [x] add send button
- [x] add polyfills to support legacy browser
- [x] add user list,log list and files list
- [x] support multi-line and markdown(not yet) texts
- [x] support a private namespace
- [x] add datetime and download
- [x] support private room with a unique password
- [x] filetransform with websocket only in private namespace and files saved only for 24hours
- [ ] voice message
- maybe some webRTC support, or just get research into Rocket.Chat project or Skype

## Difference

### chat example
The source sample uses express and Jquery, This hasn't. Just dependant on socketio. besides it supports Mobile browser and messages of links(starts with http:// or https://) better.

It also supports noname login, image\audio and video links autoplay, barcode-auto generated( with service from [BarcodeTools](http://generator.barcodetools.com/)).

sample input:
- http://www.baidu.com
- image:https://www.bing.com/th?id=OHR.RhodesIsland_ZH-CN0674840850_1920x1080.jpg&rf=LaDigue_1920x1080.jpg&pid=HpEdgeAn
- audio:http://
- video:http://

### whiteboard
Add current color style and color input.

### disabled pulling to refresh notes
1. `meta viewport` add `user-scalable=no`, not working
2. `html,body` add `css`:`touch-action:none`, `index.html` and `chat.html login` pages pulling are disabled
3. Add `e.preventDefault()` in `onMouseDown` function of `whiteboard.js`, disable whiteboard page pulling
4. Add `document.querySelector(".chatArea").addEventListener('touchmove', function(e){e.preventDefault();},  { passive: false });` in `chat.js`, disable chat page pulling, notice can't replace `touchmove` with `touchstart` here, because with `touchstart` the buttons and tag-a links will also be disabled. 

### add polyfill for HTMLElement prepend and append

other polyfills(ie findIndex polyfill) ref: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/findIndex
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

PS: this script failed on Android [Termux](https://termux.com/) with node v12.16.1, because of some unknown error from `socket.io`, while works fine on PC node v12.16.1.

## legacy
Files in directory legacy are some based codes snippets, which do help for developing. run `node app.js` to start.

## Ref sites
- <https://github.com/socketio/socket.io>
- <https://github.com/socketio/chat-example>
- <https://github.com/socketio/socket.io-compression-demo>
- <https://socketio-chat-example.now.sh>
- <https://socket-io-whiteboard.now.sh/>
- <https://socket.io/blog/introducing-socket-io-1-0/#Binary-support>