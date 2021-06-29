## socket.io whiteboard demo

whiteboard，中文白板，通俗意义就是一个可以协作的简单在线画板，浏览器（桌面）访问<https://socket-io-whiteboard.now.sh/>就可以打开，当有多人同时打开并随手绘的时候，可以实时看见所有人一起画的线条。当一个人首次打开或刷新时会显示空白，这时如果另一个人同时访问并绘制了线条，之前访问的网页上就会看见白板上有线条自动画了出来。

但通常的画风是这样的：（看起来像不像某个淘气的小孩，或者大家都太无聊了？）

![I'm Boring](https://user-images.githubusercontent.com/8649688/123745176-76118400-d8e2-11eb-80e9-897622b0e351.jpg)

<video controls="" preload="none" width="320"><source src="https://user-images.githubusercontent.com/8649688/123745412-d99bb180-d8e2-11eb-982d-088bf42104b9.mp4" type="video/mp4"></video>

无意中我随手画了三笔，如下图下方的三个黑色线条，然后过了一会儿，我看见有人用红色画出了一副眼镜，3秒后我又在上方补了一条黑色的镜框。过了几分钟，我看见红色线条画出了一个鼻子和嘴巴😄。过了许久没有看到新的线条出现，于是我截图并关掉了网页。

![masterpiece](https://user-images.githubusercontent.com/8649688/123745309-ae18c700-d8e2-11eb-98c4-42601863b992.jpg)

第一次和陌生人无意中合作了一幅画，多么有趣的体验！想起这个和孩子一起玩应该会很有趣，但我却发现不支持触摸绘制么？手机上只能看别人画自己不能画😅。

socket.io是一个websocket开发库，它在zeit.co上部署了两个[demo](https://socket.io/demos/), whiteboard是其中之一，有兴趣可以看源码。我看了whiteboard的源码有触摸支持的，但是在其部署`Now`上的版本却没有。

本来打算复制一个部署在`Now`上，但是没弄明白`Serveless Function`or`JAMStack`服务(持久化)应该怎么部署，所以只好退而求其次部署至[Heroku](https://socket-io-demos.herokuapp.com/whiteboard)了，可以手机上和孩子玩起来了😉。

我在github上新建了代码仓库[socket-io-demo](https://github.com/shanquan/socket.io-demo)，并免费部署至heroku(当然也支持局域网部署，而且非常简单)，虽然国内网络访问速度不如`zeit.co`，而且域名被微信屏蔽，但是部署很简单一路`Next`几分钟就完成了，我女儿兴趣盎然地玩了很久，我妈对白板也有兴趣，只是她们在（微信外应用的）使用上需要一点学习😓。

