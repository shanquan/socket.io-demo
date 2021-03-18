var FADE_TIME = 150; // ms
  var TYPING_TIMER_LENGTH = 400; // ms
  var COLORS = [
    '#e21400', '#91580f', '#f8a700', '#f78b00',
    '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
    '#3b88eb', '#3824aa', '#a700ff', '#d300e7'
  ];

  // Initialize variables
  var $usernameInput = document.querySelector('.usernameInput'); // Input for username
  var $messages = document.querySelector('.messages'); // Messages area
  var $inputMessage = document.querySelector('.inputMessage'); // Input message input box

  var $loginPage = document.querySelector('.login.page'); // The login page
  var $chatPage = document.querySelector('.chat.page'); // The chatroom page

  // Prompt for setting a username
  var username;
  var connected = false;
  var typing = false;
  var lastTypingTime;
  var $currentInput = document.querySelector('.inputMessage');

  var socket = io();
  // Polyfill
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
  function addParticipantsMessage (data) {
    var message = '';
    if (data.numUsers === 1) {
      message += "there's 1 participant";
    } else {
      message += "there are " + data.numUsers + " participants";
    }
    log(message);
  }
  /**
   ** generateRandom 产生任意长度随机字母数字组合
   ** randomFlag-是否任意长度 min-任意长度最小位[固定位数] max-任意长度最大位
   */
  function generateRandom(randomFlag, min, max){
    var str = "",
      range = min,
      arr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
    // 随机产生
    if(randomFlag){
      range = Math.round(Math.random() * (max-min)) + min;
    }
    for(var i=0; i<range; i++){
      var pos = Math.round(Math.random() * (arr.length-1));
      str += arr[pos];
    }
    return str;
  }
  // Sets the client's username
  function setUsername () {
      username = $usernameInput.value.trim();
    // If the username is valid
    if (!username) {
      username = generateRandom(false,4);
    }
    $loginPage.style.display = "none";
      $chatPage.style.display = "block";
      $currentInput.focus();

      // Tell the server your username
      socket.emit('add user', username);
  }
   // reveal special codes in str
  function reveal(str){
    let reg = /[\u0000-\u001F]/;
    let result;
    do{
      result = str.match(reg);
      if(null!=result && 0!=result.length){
          let nstr = result[0].charCodeAt();
          nstr = nstr.toString(16);
          if(nstr.length<4){
              let arr = [];
              while(arr.length<4 - nstr.length)
              arr.unshift('0')
              nstr = arr.join('')+nstr;
          }
          nstr = "\\u" + nstr;
          str = str.replace(reg,nstr);
      }
    }while(null!=result && 0!=result.length)
    return str;
  }
  // Sends a chat message
  function sendMessage () {
    var message = $inputMessage.value;
    // Prevent markup from being injected into the message
    // if there is a non-empty message and a socket connection
    if (message && connected) {
      message = reveal(message);
      $inputMessage.value="";
      addChatMessage({
        username: username,
        message: message
      });
      // tell server to execute 'new message' and send along one parameter
      socket.emit('new message', message);
    }
  }

  // Log a message
  function log (message, options) {
    var $el=document.createElement("li");
    $el.classList.add("log");
    $el.innerText = message;
    addMessageElement($el, options);
  }

  // Adds the visual chat message to the message list
  function addChatMessage (data, options) {
    // Don't fade the message in if there is an 'X was typing'
    var $typingMessages = getTypingMessages(data);
    options = options || {};
    if ($typingMessages.length !== 0) {
      options.fade = false;
      $typingMessages.forEach(function(i){
        i.parentNode.removeChild(i);
      })
    }

    var $usernameDiv = document.createElement("span");
    $usernameDiv.classList.add("username");
    $usernameDiv.style.color = getUsernameColor(data.username);
    $usernameDiv.innerText = data.username;
    var $messageBodyDiv = document.createElement("span");
    $messageBodyDiv.classList.add("messageBody");
    if(data.message.substring(0,7)=="http://"||data.message.substring(0,8)=="https://"){
      $messageBodyDiv.innerHTML = "<a target='_blank' href='"+data.message+"'>"+data.message+"</a>"
    }else if(data.message.substring(0,7)=="barcode"){
      var src = "https://generator.barcodetools.com/barcode.png?gen=0&data="+data.message.substring(8)+"&bcolor=FFFFFF&fcolor=000000&tcolor=000000&fh=14&bred=0&w2n=2.5&xdim=2&w=&h=120&debug=1&btype=7&angle=0&quiet=1&balign=2&talign=0&guarg=1&text=1&tdown=1&stst=1&schk=0&cchk=1&ntxt=1&c128=0";
      $messageBodyDiv.innerHTML = '<image src="'+src+'"/>';
    }else if(data.message.substring(0,6)=="qrcode"){
      var src = "https://generator.barcodetools.com/barcode.png?gen=3&data="+data.message.substring(7)+"&bcolor=FFFFFF&fcolor=000000&xdim=4&w=&h=&version=0&mode=0&ecl=1&angle=0&quiet=1";
      $messageBodyDiv.innerHTML = '<image src="'+src+'"/>';
    }else{
      // Use `innerText` Prevents input from having injected markup
      $messageBodyDiv.innerText = data.message;
    }

    var typingClass = data.typing ? 'typing' : '';
    var $messageDiv = document.createElement("div");
    $messageDiv.setAttribute("data-username",data.username);
    $messageDiv.classList.add("message");
    if(typingClass){
      $messageDiv.classList.add(typingClass);
    }
    $messageDiv.append($usernameDiv, $messageBodyDiv);

    addMessageElement($messageDiv, options);
  }

  // Adds the visual chat typing message
  function addChatTyping (data) {
    data.typing = true;
    data.message = 'is typing';
    addChatMessage(data);
  }

  // Removes the visual chat typing message
  function removeChatTyping (data) {
    var $el = getTypingMessages(data);
    $el.forEach(function(i){
      i.parentNode.removeChild(i);
    })
  }

  // Adds a message element to the messages and scrolls to the bottom
  // el - The element to add as a message
  // options.fade - If the element should fade-in (default = true)
  // options.prepend - If the element should prepend
  //   all other messages (default = false)
  function addMessageElement (el, options) {
    var $el = el;

    // Setup default options
    if (!options) {
      options = {};
    }
    // if (typeof options.fade === 'undefined') {
    //   options.fade = true;
    // }
    if (typeof options.prepend === 'undefined') {
      options.prepend = false;
    }

    // Apply options
    if (options.fade) {
      // $el.hide().fadeIn(FADE_TIME);
      $el.style.display="none";
    }
    if (options.prepend) {
      $messages.prepend($el);
    } else {
      $messages.append($el);
    }
    $messages.scrollTop = $messages.scrollHeight;
  }

  // Updates the typing event
  function updateTyping () {
    if (connected) {
      if (!typing) {
        typing = true;
        socket.emit('typing');
      }
      lastTypingTime = (new Date()).getTime();

      setTimeout(function () {
        var typingTimer = (new Date()).getTime();
        var timeDiff = typingTimer - lastTypingTime;
        if (timeDiff >= TYPING_TIMER_LENGTH && typing) {
          socket.emit('stop typing');
          typing = false;
        }
      }, TYPING_TIMER_LENGTH);
    }
  }

  // Gets the 'X is typing' messages of a user
  function getTypingMessages (data) {
    // return Array.from(document.querySelectorAll('.typing.message')).filter(function (i) {
    //   return i.getAttribute("data-username") === data.username;
    // });
    var arr=[];
    var mesels = document.querySelectorAll('.typing.message');
    for (var i = 0; i < mesels.length; i++) {
      if(mesels[i].getAttribute("data-username") === data.username){
        arr.push(mesels[i]);
      }
    }
    return arr;
  }

  // Gets the color of a username through our hash function
  function getUsernameColor (username) {
    // Compute hash code
    var hash = 7;
    for (var i = 0; i < username.length; i++) {
       hash = username.charCodeAt(i) + (hash << 5) - hash;
    }
    // Calculate color
    var index = Math.abs(hash % COLORS.length);
    return COLORS[index];
  }

  // Keyboard events
  document.addEventListener('keydown',function (event) {
    // Auto-focus the current input when a key is typed
    if (!(event.ctrlKey || event.metaKey || event.altKey)) {
      $currentInput.focus();
    }
    // When the client hits ENTER on their keyboard
    var code = event.keyCode || event.charCode || event.which;
    if (code === 13) {
      if (username) {
        sendMessage();
        socket.emit('stop typing');
        typing = false;
      } else {
        setUsername();
      }
    }
  },false);

  $inputMessage.addEventListener('input', function() {
    updateTyping();
  },false);

  document.querySelector(".btnLogin").addEventListener('click',function(){
    setUsername();
  },false);
  // Click events

  // Focus input when clicking anywhere on login page
  $loginPage.addEventListener('click',function () {
    $currentInput.focus();
  },false);

  // Focus input when clicking on the message input's border
  $inputMessage.addEventListener('click',function () {
    $inputMessage.focus();
  },false);

  // Socket events

  // Whenever the server emits 'login', log the login message
  socket.on('login', function (data) {
    connected = true;
    // Display the welcome message
    var message = "Welcome to Socket.IO Chat – ";
    log(message, {
      prepend: true
    });
    addParticipantsMessage(data);
  });

  // Whenever the server emits 'new message', update the chat body
  socket.on('new message', function (data) {
    addChatMessage(data);
  });

  // Whenever the server emits 'user joined', log it in the chat body
  socket.on('user joined', function (data) {
    log(data.username + ' joined');
    addParticipantsMessage(data);
  });

  // Whenever the server emits 'user left', log it in the chat body
  socket.on('user left', function (data) {
    log(data.username + ' left');
    addParticipantsMessage(data);
    removeChatTyping(data);
  });

  // Whenever the server emits 'typing', show the typing message
  socket.on('typing', function (data) {
    addChatTyping(data);
  });

  // Whenever the server emits 'stop typing', kill the typing message
  socket.on('stop typing', function (data) {
    removeChatTyping(data);
  });

  socket.on('disconnect', function () {
    log('you have been disconnected');
  });

  socket.on('reconnect', function () {
    log('you have been reconnected');
    if (username) {
      socket.emit('add user', username);
    }
  });

  socket.on('reconnect_error', function () {
    log('attempt to reconnect has failed');
  });
