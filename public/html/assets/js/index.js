$(function () {
    /*用户ID*/
     var userid = null;
     var socket = null;
     var username = null;
     function genUid() {
          return new Date().getTime()+""+Math.floor(Math.random()*899+100);
     }
     function updateSysMsg(obj,type) {
         var onlineUsers = obj.onlineUsers;
         //更新在线人数
         var userhtml = '';
         var separator = '';
         for(key in onlineUsers) {
             if(onlineUsers.hasOwnProperty(key)){
                 userhtml += separator+onlineUsers[key];
                 separator = '、';
             }
         }
         var html ='<div class="am-text-secondary"><span class="am-icon-btn am-icon-user-md"></span>在线用户:'+obj.onlineCount+'</div>'
             html +='<div>在线列表：'+userhtml+'</div>';
         $("#userlist").html(html);
         var style = "am-alert";
         var text = "加入";
         if(type == 'logout'){
             style = "am-alert am-alert-warning";
             text="退出"
         }
         var perHtml ='<div class="'+style+'" data-am-alert="">';
         perHtml += '<button type="button" class="am-close">×</button>';
         perHtml += '<p><strong>'+obj.user.username+'</strong><span class="am-icon-check mr10"></span>'+text+'了聊天室</p>';
         perHtml += '</div>'
         $(perHtml).prependTo('#Personnel')
     }
     $(".userMsgBtn").click(function () {
         var userMessage = $(".userMessage").val();
         if(userMessage != ''){
             var obj = {
                 userid: userid,
                 username: username,
                 content: userMessage
             };
             socket.emit('message',obj)
         }

     });
     $(".am-login").click(function () {
         username = $(".am-form-name").val();
         if(username != ''){
             init(username);
             $('#login-modal').modal('close');
         }
     });
    
     function init(username){
         userid = genUid();
         $(".userText").text(username);
         //连接websocket后端服务器
          socket = io('http://localhost:18080/');
         //告诉服务器端有用户登录
          socket.emit('login',{userid:userid, username:username,login:true});
         //监听新用户登录
         socket.on('login', function(obj){
             updateSysMsg(obj, 'login');
         });
         //监听新用户退出
         socket.on('logout', function(obj){
             updateSysMsg(obj, 'logout');
         });
         //监听消息发送
         socket.on('message', function(obj){
             var isme = obj.userid == userid ? true : false;
             var style ="am-comment-bd"
             if(isme){
                 style ="am-comment-bd am-btn-secondary"
             }
             var html ='<li class="am-comment">';
                 html+='<img src="http://s.amazeui.org/media/i/demos/bw-2014-06-19.jpg?imageView/1/w/96/h/96" alt="" class="am-comment-avatar" width="48" height="48">';
                 html+=' <div class="am-comment-main">';
                 html+=' <header class="am-comment-hd">';
                 html+='<div class="am-comment-meta"><a href="#" class="am-comment-author">'+obj.username+'</a> 评论于 <time>'+obj.date+'</time></div></header>';
                 html+='<div class="'+style+'"><p>'+obj.content+'</p> </div>';
                 html+='</div>';
                 html+='</li>';
             $(html).appendTo("#admin-content-comment")
         });
     }
     $(".am-dropdown-content li a").click(function () {
         $(".userText").text("游客");
         $(".am-form-name").val("");
         $('#login-modal').modal();
         socket.emit('logout',{userid:userid, username:username,login:false});
     });
     $('#login-modal').modal();
});
