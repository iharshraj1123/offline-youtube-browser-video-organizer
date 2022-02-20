var commented_buttonus = false;
var com_div_focus = false;
var origi_textdiv;
var com_upload;
var click_textoarea = false;
var loggedino = false;
var start = 0, end = 0;
var maths_counter = 0;
var replybox_purp;
var curr_edit;
var curr_reply;
var show_rep_count = 0;
var current_page;

function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  var expires = "expires="+d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
  var name = cname + "=";
  var ca = document.cookie.split(';');
  for(var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function checkCookie() {
  var user = getCookie("username");
  if (user != "") {
    alert("Welcome again " + user);
  } else {
    user = prompt("Please enter your name:", "");
    if (user != "" && user != null) {
      setCookie("username", user, 365);
    }
  }
} 

function textarea_focuso() {
  if(loggedino){
  document.getElementsByClassName('com-textarea')[0].classList.toggle('texarea-focuso')
}
}

function com_div_clicked() {
  if(loggedino){
  setTimeout(function(){

  document.getElementsByClassName('buttonus-container')[0].classList.remove('hidemepls')

  document.getElementsByClassName('com-textarea')[0].style.height = `${document.getElementsByClassName('edit-div')[0].scrollHeight + 33}px`
  },50)}
}

document.getElementsByTagName('body')[0].addEventListener('keyup',function(){
  if(loggedino){
  document.getElementById('com-textarea2').value = document.getElementsByClassName('com-textarea')[0].value
}})

document.getElementsByTagName('body')[0].addEventListener('keydown',function(e){
  document.getElementById('submit_buttonus').value = 'Post'
if(loggedino){
  
setTimeout(function(){
  if(click_textoarea && document.getElementsByClassName('com-textarea')[0].value != ""){
  document.getElementsByClassName('edit-div')[0].innerText = document.getElementById('com-textarea').value
  document.getElementsByClassName('com-textarea')[0].style.height = `${document.getElementsByClassName('edit-div')[0].scrollHeight + 40}px`;
}
},50)
}
})

//////////////Textarea icon clicked/////////////////////

function icon_clicked(x){
  document.getElementsByClassName('com-textarea')[0].focus()

  if(x === 'video'){
    let link_img = confirm("Do you wish to upload from your device or link a Video?\nPress 'OK' to upload from your local device\nIf you wish to link make sure your link ends with a mp4");
    if(link_img === true){
    com_upload = 'video';
    document.getElementById('ImageUpload').click();}
    else{
      inputin_textoareao('<video><source src="LINK"></video>', 24);
    }

  }

  if(x === 'image'){
    let link_img = confirm("Do you wish to upload from your device or link an image?\nPress 'OK' to upload from your local device\nIf you wish to link make sure your link ends with a png, jpg, jpeg or gif");
    if(link_img === true){
    com_upload = 'image';
    document.getElementById('ImageUpload').click();}
    else{
      inputin_textoareao('<img src="LINK">',14);
    }
  }

  if(x === 'bold'){inputin_textoareao('<b></b>','auto');}
  if(x === 'italic'){inputin_textoareao('<i></i>','auto');}
  if(x === 'underline'){inputin_textoareao('<u></u>','auto');}
  if(x === 'strike'){inputin_textoareao('<strike></strike>','auto');}
  if(x === 'link'){inputin_textoareao('<a target="_blank" href="LINK HERE">LINK TEXT HERE</a>',34);}
  if(x === 'spoiler'){inputin_textoareao('<spoiler></spoiler>','auto');}
  if(x === 'code'){inputin_textoareao('<ol class="com-code"></ol>',21);}
  if(x === 'quote'){inputin_textoareao('<quote></quote>','auto');}
  if(x === 'maths'){if(maths_counter % 2 === 0){ maths_counter = maths_counter + 1;
    inputin_textoareao('<eqn-space></eqn-space>','auto');}else{maths_counter = maths_counter + 1;}
  }

  if(x === 'limit'){inputin_textoareao('<limit>(x->0)</limit>',12);}
  if(x === 'integ'){inputin_textoareao('<integ>(lower limit)->[upper limit]</integ>',19);}
  if(x === 'power'){inputin_textoareao('!!Pn!!',4);}
  if(x === 'base'){inputin_textoareao('!!_n!!',4);}
  if(x === 'log'){inputin_textoareao('log<sub>(x)</sub>y', 10 );}
  if(x === 'matrice'){inputin_textoareao('<br><matrice>[!{1}{2}{3}][{4}{5}{6}][{7}{8}{9}!]</matrice>',16);}
  if(x === 'determinant'){inputin_textoareao('<determinant>[!{1}{2}{3}][{4}{5}{6}][{7}{8}{9}!]</determinant>',16);}

}

function reply_icon_clicked(x,y){
  document.getElementsByClassName('reply-textarea')[0].focus()
  if(x === 'video'){
    let link_img = confirm("Do you wish to upload from your device or link a Video?\nPress 'OK' to upload from your local device\nIf you wish to link make sure your link ends with a mp4");
    if(link_img === true){
    com_upload = 'video';
    document.getElementById('ImageUpload').click();}
    else{
      inputin_textoareao('<video><source src="LINK"></video>', 24);
    }
  }
  if(x === 'image'){
    let link_img = confirm("Do you wish to upload from your device or link an image?\nPress 'OK' to upload from your local device\nIf you wish to link make sure your link ends with a png, jpg, jpeg or gif");
    if(link_img === true){
    com_upload = 'image';
    document.getElementById('ImageUpload').click();}
    else{
      inputin_textoareao('<img src="LINK">',14);
    }
  }

  if(x === 'bold'){document.getElementsByClassName('reply-textarea')[0].value += '<b></b>'}
  if(x === 'italic'){document.getElementsByClassName('reply-textarea')[0].value += '<i></i>';}
  if(x === 'underline'){document.getElementsByClassName('reply-textarea')[0].value += '<u></u>';}
  if(x === 'strike'){document.getElementsByClassName('reply-textarea')[0].value += '<strike></strike>';}
  if(x === 'link'){document.getElementsByClassName('reply-textarea')[0].value += '<a target="_blank" href="LINK HERE">LINK TEXT HERE</a>';}
  if(x === 'spoiler'){document.getElementsByClassName('reply-textarea')[0].value += '<spoiler></spoiler>';}
  if(x === 'code'){document.getElementsByClassName('reply-textarea')[0].value += '<div class="com-code"></div>';}
  if(x === 'quote'){document.getElementsByClassName('reply-textarea')[0].value += '<quote></quote>';}
  if(x === 'maths'){document.getElementsByClassName('reply-textarea')[0].value += '<eqn-space></eqn-space>';}

  if(x === 'limit'){document.getElementsByClassName('reply-textarea')[0].value += '<limit>(x->0)</limit>';}
  if(x === 'integ'){document.getElementsByClassName('reply-textarea')[0].value += '<integ>(lower limit)->[upper limit]</integ>';}
  if(x === 'power'){document.getElementsByClassName('reply-textarea')[0].value += '!!Pn!!';}
  if(x === 'base'){document.getElementsByClassName('reply-textarea')[0].value += '!!_n!!';}
  if(x === 'log'){document.getElementsByClassName('reply-textarea')[0].value += 'log<sub>(x)</sub>y';}
  if(x === 'matrice'){document.getElementsByClassName('reply-textarea')[0].value += '<matrice>[!{1}{2}{3}][{4}{5}{6}][{7}{8}{9}!]</matrice>';}
  if(x === 'determinant'){document.getElementsByClassName('reply-textarea')[0].value += '<determinant rows="3" columns="3">[!{1}{2}{3}][{4}{5}{6}][{7}{8}{9}!]</determinant>';}

}

var filonamo;
var format;
function file_inputd() {
  let a_ran = Math.floor(Math.random()*100000000000000000000)
  let b_ran = Math.floor(Math.random()*100000000000000000000)
  let file_inp_button = document.getElementById('ImageUpload')
  if('files' in file_inp_button){
      let mime_type = file_inp_button.value.split('.')
      format = mime_type[mime_type.length - 1]
      if(com_upload === 'image'){
        inputin_textoareao(`<img src="/comment section/uploads/${a_ran}${b_ran}.${format}">`,'end');
        document.getElementById('com-textarea2').value = document.getElementsByClassName('com-textarea')[0].value;
        document.getElementById('file_name').value = `${a_ran}${b_ran}`
        filonamo = `${a_ran}${b_ran}`
      }
      if(com_upload === 'video'){
        inputin_textoareao(`<video><source src="/comment section/uploads/${a_ran}${b_ran}.${format}"></video>`,'end');
        document.getElementById('com-textarea2').value = document.getElementsByClassName('com-textarea')[0].value;
        document.getElementById('file_name').value = `${a_ran}${b_ran}`
        filonamo = `${a_ran}${b_ran}`
      }
}
}
///////////////////////////////


////////////////To input text ay cursor position////////////////
var textoareao = document.getElementsByClassName('com-textarea')[0];

textoareao.addEventListener('keyup',function(){
  start = textoareao.selectionStart ;
  end = textoareao.selectionEnd  ;
})

textoareao.addEventListener('click',function(){
  start = textoareao.selectionStart ;
  end = textoareao.selectionEnd  ;
})

function inputin_textoareao(x,y) { 
  var inputtedo = x ;
  var inputolen;
  if(y === 'auto'){
    inputolen = ((inputtedo.length + 1)/2)-1;
   }
  else if(y === 'end'){
    inputolen =  inputtedo.length
  }
  else{inputolen = y}
   textoareao.value =  textoareao.value.substring(0, start) + inputtedo + textoareao.value.substring(end, textoareao.textLength);textoareao.focus();textoareao.setSelectionRange(start + inputolen ,end + inputolen)
}

//////////////////////////submition///////////////////

document.getElementById('submit_buttonus').addEventListener('click',function(e){
  e.preventDefault()
  if(!filonamo){

    document.getElementById('submit_buttonus').value = 'Posting...'
    let xmlhttp=new XMLHttpRequest();
    let texo_to = document.getElementsByClassName('com-textarea')[0].value;
    texo_to = texo_to.replace(/&/g , "[!and!]");

    //below line is custom, remove it if ur not me
    if(current_page == "play") texo_to = vid_timestamp(texo_to)
    
   xmlhttp.open("POST","/comment section/insert.php",true);
   xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
   xmlhttp.send(`com_inp=${texo_to}`);
   document.getElementsByClassName('com-textarea')[0].value = '';
   
   
  setTimeout( function(){
    document.getElementById('submit_buttonus').value = 'Posted'
    if(!document.getElementsByClassName('no-post')[0].classList.contains('hidemepls')){
    document.getElementsByClassName('no-post')[0].classList.add('hidemepls');
    document.getElementsByClassName('comment-navbar2')[0].classList.remove('hidemepls');}

    //if (xmlhttp.request.readyState === XMLHttpRequest.DONE && xmlhttp.status==200) {
       var xmlhttp2 =new XMLHttpRequest();
       var comm_sumo = document.getElementsByClassName('comments-summoner')[0]
       xmlhttp2.onreadystatechange=function() {
       if (xmlhttp2.readyState==4 && xmlhttp2.status==200) {
           comm_sumo.innerHTML = xmlhttp2.responseText + comm_sumo.innerHTML ;
       }}
       xmlhttp2.open("POST","/comment section/output.php",true);
       xmlhttp2.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
 
       //&&fileToUpload=${document.getElementById('ImageUpload').value}
      // 
      xmlhttp2.send();
//     }
    },1000)
     }
  else{
       document.getElementById('formoplso').submit()
       document.getElementById('submit_buttonus').value = 'Posting...'
     }
})


/////////////////comments update/////////////////////////
var com_loaded = 19;
function com_updato(){
  
  let video_divo = document.getElementsByClassName('com_video')
  for(let i = 0;i< video_divo.length;i++){
    video_divo[i].controls = true
    video_divo[i].autoplay = false
    video_divo[i].volume = 0.4 
    video_divo[i].style.width = "50%"
  }
  let com_divos = document.getElementsByClassName('com-old')
  for(let i = com_loaded;i< com_divos.length;i++){
    com_divos[i].classList.add('hidemepls');
  }
 
  /////code comment div////////////
  let code_divdos = document.getElementsByClassName('com-code')
  for(let i = 0;i< code_divdos.length;i++){
  if(!code_divdos[i].classList.contains('code-edited')){
    let inner_texto = code_divdos[i].textContent;

    inner_texto = inner_texto.replace(/^/gm , "<li class='com-li'>");
    //for .func()
    inner_texto = inner_texto.replace(/\.(?=[a-z]{1,}\()/gi , ".<span style='color: #6ef587'>");

    inner_texto = inner_texto.replace(/for\u0028/g,"<span style='color: #b4a1ff'>for(</span>")
 
    // for //
    inner_texto = inner_texto.replace(/\u002F\u002F/g,"<span style='color: #a83131'>&#47;&#47;")
    //for /*
    inner_texto = inner_texto.replace(/\u002F\u002A/g,"</li><span style='color: #a83131'>&#47;&#42;")
    inner_texto = inner_texto.replace(/\u002A\u002F/g,"</li>&#42;&#47;</span>")
    /*for ?
    inner_texto = inner_texto.replace(/\u003F/g,"&#63;")
    //for < and >
    inner_texto = inner_texto.replace(/\u003C/g,"&#60;")
    inner_texto = inner_texto.replace(/\u003E/g,"&#62;")*/

    inner_texto = inner_texto.replace(/this/g,"<span style='color: #2577fa'>this</span>")

    inner_texto = inner_texto.replace(/function(?![/"'])/g,"<span style='color: #2577fa'>function</span><span style='color: #6ef587'>")
    inner_texto = inner_texto.replace(/\u0028/g,"</span>(")
    inner_texto = inner_texto.replace(/var/g,"<span style='color: #5d97f5'>var</span>")
    inner_texto = inner_texto.replace(/let/g,"<span style='color: #5d97f5'>let</span>")
    inner_texto = inner_texto.replace(/const/g,"<span style='color: #5d97f5'>const</span>")
    inner_texto = inner_texto.replace(/if(?!\w)/g,"<span style='color: #ff26c2'>if</span>")
    inner_texto = inner_texto.replace(/else/g,"<span style='color: #ff26c2'>else</span>")
    inner_texto = inner_texto.replace(/setTimeout/g,"<span style='color: #6ef587'>setTimeout</span>")
    inner_texto = inner_texto.replace(/setInterval/g,"<span style='color: #6ef587'>setInterval</span>")

   // inner_texto = inner_texto.replace(/addEventListener/g,"<span style='color: #6ef587'>addEventListener</span>")
    code_divdos[i].innerHTML = inner_texto
   /* let xmlhttp =new XMLHttpRequest();
    xmlhttp.open("POST","/comment section/update.php",true);
    xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlhttp.send(`comoid=${x}&usronum=${y}`);
    document.getElementsByClassName('com-body')[z].style.display = 'none';
    code_divdos[i].classList.add('code-edited');*/
    }
  }

}
com_updato()

///////////load more//////////////
function load_more_com() {
  let com_divos = document.getElementsByClassName('com-body')
  for(let i = (com_loaded) ;i< (com_loaded+20);i++){
    if(com_divos[i]){
    com_divos[i].classList.remove('hidemepls');}
    else{
      document.getElementsByClassName('load-more-p')[0].innerHTML = 'COMMENTS ENDED'
    }
    
  }
  com_loaded = com_loaded + 20
}


function tooltip_show(x,y) {
  if(x==='show'){
   document.getElementsByClassName(`com-tooltip${y}`)[0].classList.add('show_tooltiptextox')}

  else{
     document.getElementsByClassName(`com-tooltip${y}`)[0].classList.remove('show_tooltiptextox')}
}

function tooltip_reply_show(x,y) {
  if(y==='show'){
   document.getElementsByClassName(`reply-tooltip${x}`)[0].classList.add('show_tooltiptextox')}

  else{
     document.getElementsByClassName(`reply-tooltip${x}`)[0].classList.remove('show_tooltiptextox')}
}

function logout() {
  let query = confirm('are you sure you wanna log out ?')
  if(query){
    window.open('/comment section/logout.php','_self')
  }
}

function com_main_cancel_butn(){
  document.getElementsByClassName('buttonus-container')[0].classList.add('hidemepls')
  document.getElementsByClassName('com-textarea')[0].style.height = `${document.getElementsByClassName('edit-div')[0].scrollHeight}px`

}

function com_cancel_butn(){
  document.getElementsByClassName('reply-box')[0].classList.add('hidemepls');
  if(replybox_purp === 'edit'){
    let x = curr_edit[0] , y = curr_edit[1] , z= curr_edit[2]
    cancel_com(x,y,z)
  }
  else if(replybox_purp === 'reply edit'){
    let x = curr_edit[0] , y = curr_edit[1] 
    cancel_rep(x,y)
  }
  else if(replybox_purp === 'reply reply'){
    let x = curr_reply[0] , y = curr_reply[1] 
    cancel_rep(x,y)
  }
  else if(replybox_purp === 'reply'){
    let x = curr_reply[0] , y = curr_reply[1] , z= curr_reply[2]
    cancel_com(x,y,z)
  }
}

function delete_com(x,y,z){
  //x,y,z = $usrcomid,$usrnum,$com_div_num
  let confiromos = confirm('are you sure you wanna delete this comment ?')
  if(confiromos){
  let xmlhttp =new XMLHttpRequest();
 
  xmlhttp.open("POST","/comment section/delete.php",true);
  xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xmlhttp.send(`comoid=${x}&usronum=${y}`);
//  if(z === -1){location.reload();}
  //else{
    document.getElementsByClassName(`com-wrap${x}`)[0].style.display = 'none';
  //}
}}



function edit_com(x,y,z){
  //x,y,z = $usrcomid,$usrnum,$com_div_num
  
 // if(z === -1){alert('sorry you cant edit a new comment ,\nwe suggest deleting it or refreshing the page to edit it if you must')}
 // else{
  replybox_purp = 'edit';
  curr_edit = [x,y,z];

  document.getElementsByClassName(`com-editable-texto${x}`)[0].classList.add('edit-color')
  
  document.getElementsByClassName('reply-box')[0].classList.toggle('hidemepls')
  document.getElementsByClassName('reply-textarea')[0].value = document.getElementsByClassName(`com-editable-texto${x}`)[0].innerHTML
  document.getElementsByClassName('reply-textarea')[0].focus()
  document.getElementsByClassName('reply-textarea')[0].addEventListener('keyup',function(){
    if(replybox_purp === 'edit'){
    document.getElementsByClassName(`com-editable-texto${x}`)[0].innerHTML =   document.getElementsByClassName('reply-textarea')[0].value
  }})

  document.getElementsByClassName(`com-cancelEdit${z}`)[0].classList.remove('hidemepls')
  //alert('you can edit your comment now by clicking on the text\nTo cancel the edit refresh again or simply ignore what you changed without clicking "Save Edit"')
 // }
}

function save_edit_com(x,y,z){
  //x,y,z = $usrcomid,$usrnum,$com_div_num
  document.getElementsByClassName('reply-box')[0].classList.toggle('hidemepls')
  document.getElementsByClassName(`com-editable-texto${x}`)[0].classList.remove('edit-color')
  let new_texto =  document.getElementsByClassName(`com-editable-texto${x}`)[0].innerHTML
  new_texto = new_texto.replace(/&/g , "[!and!]");

  document.getElementsByClassName(`com-cancelEdit${z}`)[0].classList.add('hidemepls');
  let xmlhttp =new XMLHttpRequest();
 
  xmlhttp.open("POST","/comment section/update.php",true);
  xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xmlhttp.send(`comoid=${x}&usronum=${y}&nowcom=${new_texto}`);

  setTimeout(function(){
    document.getElementsByClassName('reply-textarea')[0].value = ''
    document.getElementsByClassName(`com-edited${x}`)[0].classList.remove('hidemepls')
  },100)
}

function share_com(x){
  //x = usrcomid
  let curr_pageo = window.location.href.split('?')[0]
  let curr_pageo2 = window.location.href.split('?')[1];
  curr_pageo2 = curr_pageo2.replace("com_highlight=","")

  navigator.clipboard.writeText(`${curr_pageo}?${curr_pageo2}&com_highlight=${x}`);
  
  document.getElementsByClassName('com-popup-summoner')[0].innerHTML = "<div class='com-link-copied-div'><span class='com-link-copied-span'>Link Copied !</span></div>"
  setTimeout(function(){document.getElementsByClassName('com-link-copied-div')[0].style.bottom = '10px'},50)
  setTimeout(function(){document.getElementsByClassName('com-link-copied-div')[0].style.opacity ='0.3'},1300)
  setTimeout(function(){document.getElementsByClassName('com-popup-summoner')[0].innerHTML =''},1450)
}

function cancel_com(x,y,z){
  document.getElementsByClassName(`com-cancelEdit${z}`)[0].classList.add('hidemepls');
  document.getElementsByClassName('reply-box')[0].classList.add('hidemepls');
  setTimeout(function(){
    document.getElementsByClassName('reply-textarea')[0].value = ''},100)
    //x,y,z = $usrcomid,$usrnum,$com_div_num
  if(replybox_purp === 'edit'){
      document.getElementsByClassName(`com-editable-texto${x}`)[0].classList.remove('edit-color')
      let xmlhttp =new XMLHttpRequest();
      xmlhttp.onreadystatechange=function() {
      if (xmlhttp.readyState==4 && xmlhttp.status==200) {
        document.getElementsByClassName(`com-editable-texto${x}`)[0].innerHTML = xmlhttp.responseText ;
      }}
      xmlhttp.open("POST","/comment section/edit cancel.php",true);
      xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
      xmlhttp.send(`comoid=${x}&usronum=${y}`);
  }
  else if(replybox_purp === 'reply'){
   
  }

}

function reply_com(x,y,z,u){
  if(loggedino){
  //x,y,z,u = $usrcomid,$usrnum,$com_div_num,$usrname
 // if(z === -1){alert('sorry you cant reply on a new comment ,\nwe suggest refreshing to reply')}
 // else{
  replybox_purp = 'reply';
  curr_reply = [x,y,z,u];
  document.getElementsByClassName('reply-box')[0].classList.toggle('hidemepls')
  document.getElementsByClassName(`com-cancelEdit${x}`)[0].classList.toggle('hidemepls');
  document.getElementsByClassName('reply-textarea')[0].focus()

  //alert('you can edit your comment now by clicking on the text\nTo cancel the edit refresh again or simply ignore what you changed without clicking "Save Edit"')
 // }
  }
  else{alert('Please login or Signup to reply')}
}

function reply_post(){
  if(replybox_purp === 'edit'){
    let x = curr_edit[0] , y = curr_edit[1] , z= curr_edit[2]
    save_edit_com(x,y,z)
  }
  else if(replybox_purp === 'reply'){
    
    let x = curr_reply[0] , y = curr_reply[1] , z= curr_reply[2] , u = curr_reply[3]
    //x,y,z,u = $usrcomid,$usrnum,$usrcomid,$repliedto
    document.getElementsByClassName('reply-box')[0].classList.add('hidemepls')
    document.getElementsByClassName(`com-cancelEdit${x}`)[0].classList.add('hidemepls');

    let new_replyo =  document.getElementsByClassName('reply-textarea')[0].value
    new_replyo = new_replyo.replace(/&/g , "[!and!]");

    //below line is custom, remove it if ur not me
    if(current_page == "play") new_replyo = vid_timestamp(new_replyo)

    let xmlhttp =new XMLHttpRequest();

    xmlhttp.open("POST","/comment section/reply.php",true);
    xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlhttp.send(`comoid=${x}&usronum=${y}&repliedto=${u}&newrep=${new_replyo}`);

    replybox_purp = ''
    setTimeout(function(){
    document.getElementsByClassName('reply-textarea')[0].value = ''
    refresh_replies(x)
    },200)
  }
  else if(replybox_purp === 'reply edit'){
    let x = curr_edit[0] , y = curr_edit[1];
    save_edit_rep(x,y)
  }
  else if(replybox_purp === 'reply reply'){
    //x,y,z,c = $usrreplyid ,$usrnum , $repliedto ,$usrcomid

    let x = curr_reply[0] , y = curr_reply[1] , z= curr_reply[2] , c = curr_reply[3];

    document.getElementsByClassName('reply-box')[0].classList.add('hidemepls')
    document.getElementsByClassName(`rep-cancelEdit${x}`)[0].classList.add('hidemepls');

    let new_replyo =  document.getElementsByClassName('reply-textarea')[0].value
    new_replyo = new_replyo.replace(/&/g , "[!and!]");

    let xmlhttp =new XMLHttpRequest();

    xmlhttp.open("POST","/comment section/reply.php",true);
    xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlhttp.send(`comoid=${c}&usronum=${y}&repliedto=${z}&newrep=${new_replyo}`);

    replybox_purp = ''
    setTimeout(function(){
    document.getElementsByClassName('reply-textarea')[0].value = ''
    refresh_replies(c)
    },200)
  }
}

function show_replies(x,z){
  if( document.getElementsByClassName(`com-show-replies${x}`)[0].innerText === 'Show Replies'){
   //x,z = $usrcomid,$usrcomid
  //if(z=== -1){}
 // else{
    document.getElementsByClassName(`com-show-replies${x}`)[0].innerText = 'Hide Replies'
    show_rep_count = 1;

    let reply_summ = document.getElementsByClassName(`com-reply-summoner${x}`)[0]

    reply_summ.innerHTML =  "<img class='com-loading-img' src='/comment section/loading1raw.png' >" 
    setTimeout(function(){
    let xmlhttp =new XMLHttpRequest();
    
    xmlhttp.onreadystatechange=function() {
    if (xmlhttp.readyState==4 && xmlhttp.status==200) {
      reply_summ.innerHTML = xmlhttp.responseText ;
    }}

    xmlhttp.open("POST","../comment section/show replies.php",true);
    xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlhttp.send(`comoid=${x}`);},800)
  }//}
  else{show_rep_count = 0;
    document.getElementsByClassName(`com-show-replies${x}`)[0].innerText = 'Show Replies'
    document.getElementsByClassName(`com-reply-summoner${x}`)[0].innerHTML = ''
  }
}

function refresh_replies(x){
  //x = $usrcomid

  document.getElementsByClassName(`com-show-replies${x}`)[0].innerText = 'Hide Replies'
  show_rep_count = 1;

   let reply_summ = document.getElementsByClassName(`com-reply-summoner${x}`)[0]

   let xmlhttp =new XMLHttpRequest();

   xmlhttp.onreadystatechange=function() {
   if (xmlhttp.readyState==4 && xmlhttp.status==200) {
     reply_summ.innerHTML = xmlhttp.responseText ;
   }}

   xmlhttp.open("POST","/comment section/show replies.php",true);
   xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
   xmlhttp.send(`comoid=${x}`);
   
}

function edit_rep(x,y){
  replybox_purp = 'reply edit';
  curr_edit = [x,y,0];

  document.getElementsByClassName(`reply-editable-texto${x}`)[0].classList.add('edit-color')
  
  document.getElementsByClassName('reply-box')[0].classList.toggle('hidemepls')
  document.getElementsByClassName('reply-textarea')[0].value = document.getElementsByClassName(`reply-editable-texto${x}`)[0].innerHTML
  document.getElementsByClassName('reply-textarea')[0].focus()
  document.getElementsByClassName('reply-textarea')[0].addEventListener('keyup',function(){
    if(replybox_purp === 'reply edit'){
    document.getElementsByClassName(`reply-editable-texto${x}`)[0].innerHTML =   document.getElementsByClassName('reply-textarea')[0].value
  }})

  document.getElementsByClassName(`rep-cancelEdit${x}`)[0].classList.remove('hidemepls')
}

function cancel_rep(x,y){
    //x,y = $usrreplyid,$usrnum

  document.getElementsByClassName(`rep-cancelEdit${x}`)[0].classList.add('hidemepls');
  document.getElementsByClassName('reply-box')[0].classList.add('hidemepls');
  setTimeout(function(){
    document.getElementsByClassName('reply-textarea')[0].value = ''},200)
  if(replybox_purp === 'reply edit'){
      document.getElementsByClassName(`reply-editable-texto${x}`)[0].classList.remove('edit-color')
      let xmlhttp =new XMLHttpRequest();
      xmlhttp.onreadystatechange=function() {
      if (xmlhttp.readyState==4 && xmlhttp.status==200) {
         document.getElementsByClassName(`reply-editable-texto${x}`)[0].innerHTML = xmlhttp.responseText ;
      }}
      xmlhttp.open("POST","/comment section/reply edit cancel.php",true);
      xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
      xmlhttp.send(`comoid=${x}&usronum=${y}`);

  }
  else if(replybox_purp === 'reply reply'){
   
  }

}

function save_edit_rep(x,y){
  //x,y = $usrreplyid,$usrnum
  document.getElementsByClassName('reply-box')[0].classList.toggle('hidemepls')
  document.getElementsByClassName(`reply-editable-texto${x}`)[0].classList.remove('edit-color')
  let new_texto =  document.getElementsByClassName(`reply-editable-texto${x}`)[0].innerHTML
  new_texto = new_texto.replace(/&/g , "[!and!]");

  document.getElementsByClassName(`rep-cancelEdit${x}`)[0].classList.add('hidemepls');
  let xmlhttp =new XMLHttpRequest();
 
  xmlhttp.open("POST","/comment section/update replies.php",true);
  xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xmlhttp.send(`comoid=${x}&usronum=${y}&nowcom=${new_texto}`);

  setTimeout(function(){
  document.getElementsByClassName('reply-textarea')[0].value = ''
  document.getElementsByClassName(`rep-edited${x}`)[0].classList.remove('hidemepls')
  },100)
}

function delete_rep(x,y,z){
  //x,y = $usrreplyid,$usrnum
  let confiromos = confirm('are you sure you wanna delete this comment ?')
  if(confiromos){
  let xmlhttp =new XMLHttpRequest();
 
  xmlhttp.open("POST","/comment section/delete reply.php",true);
  xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xmlhttp.send(`comoid=${x}&usronum=${y}&usrcomid=${z}`);
  
  document.getElementsByClassName(`outside-reply-body${x}`)[0].style.display = 'none';
  document.getElementsByClassName(`reply-body${x}`)[0].style.display = 'none';

}}

function reply_rep(x,y,z,c){
  if(loggedino){
  //x,y,z,c = $usrreplyid ,$usrnum , $repliedto ,$usrcomid
  if(z === -1){alert('sorry you cant reply on a new comment ,\nwe suggest refreshing to reply')}
  else{
  replybox_purp = 'reply reply';
  curr_reply = [x,y,z,c];
  document.getElementsByClassName('reply-box')[0].classList.toggle('hidemepls')
  document.getElementsByClassName(`rep-cancelEdit${x}`)[0].classList.toggle('hidemepls');
  document.getElementsByClassName('reply-textarea')[0].focus()


  //alert('you can edit your comment now by clicking on the text\nTo cancel the edit refresh again or simply ignore what you changed without clicking "Save Edit"')
  }}
  else{alert('Please login or Signup to reply')}
}

function com_vote(x,y,t){
  if(loggedino){
  //x,y,t = 'vote', $usrcomid/$usrreplyid2 , table  (ok i know this one is a little complex but... upvoting systems are little complex :])

  var upvote_but;var downvote_but;
  if(t === 'comment_store'){
   upvote_but = document.getElementsByClassName(`com-upvotes${y}`)[0]
   downvote_but = document.getElementsByClassName(`com-downvotes${y}`)[0]
  }
  else if(t === 'reply_store'){
    upvote_but = document.getElementsByClassName(`rep-upvotes${y}`)[0]
    downvote_but = document.getElementsByClassName(`rep-downvotes${y}`)[0]
  }

 //////////////////UPVOTE START///////////////////
  if(x === 'upvoted'){
    if(upvote_but.classList.contains('upvoted')){
      //remove upvote (condition 1)
      upvote_but.classList.remove('upvoted')
      if(upvote_but.innerHTML === '1'){upvote_but.innerText = ''}
      else{
      upvote_but.innerText = parseInt(upvote_but.innerHTML) - 1}
      let xmlhttp = new XMLHttpRequest();
 
      xmlhttp.open("POST","/comment section/upvote system.php",true);
      xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
      xmlhttp.send(`comoid=${y}&condition=1&table=${t}`);

    }
    else if(!upvote_but.classList.contains('upvoted')){    
      if(downvote_but.classList.contains('downvoted')){
        //add upvote and also remove downvote (condition2)
        if(upvote_but.innerHTML === ''){upvote_but.innerText = '1'}
        else{
        upvote_but.innerText = parseInt(upvote_but.innerHTML) +1}
        if(downvote_but.innerHTML === '1'){downvote_but.innerText = ''}
        else{
        downvote_but.innerText = parseInt(downvote_but.innerHTML) - 1}

        downvote_but.classList.remove('downvoted')
        upvote_but.classList.add('upvoted')
        let xmlhttp = new XMLHttpRequest();
   
        xmlhttp.open("POST","/comment section/upvote system.php",true);
        xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xmlhttp.send(`comoid=${y}&condition=2&table=${t}`);
      }
      else{
        //simple upvote (condition 3)
        upvote_but.classList.add('upvoted')
        if(upvote_but.innerHTML === ''){upvote_but.innerText = '1'}
        else{
        upvote_but.innerText = parseInt(upvote_but.innerHTML) +1}
        let xmlhttp = new XMLHttpRequest();
      
        xmlhttp.open("POST","/comment section/upvote system.php",true);
        xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xmlhttp.send(`comoid=${y}&condition=3&table=${t}`);
      }
    }
  }

  ///////////////////DOWNVOTE START///////////////////
  else if(x === 'downvoted'){
    if(downvote_but.classList.contains('downvoted')){
      //remove downvote (condition 4)
      downvote_but.classList.remove('downvoted')
      if(downvote_but.innerHTML === '1'){downvote_but.innerText = ''}
      else{
      downvote_but.innerText = parseInt(downvote_but.innerHTML) - 1}

      let xmlhttp = new XMLHttpRequest();
 
      xmlhttp.open("POST","/comment section/upvote system.php",true);
      xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
      xmlhttp.send(`comoid=${y}&condition=4&table=${t}`);
    }
    else if(!downvote_but.classList.contains('downvoted')){

      if(upvote_but.classList.contains('upvoted')){
        //add downvote and also remove upvote (condition5)
        if(downvote_but.innerHTML === ''){downvote_but.innerText = '1'}
        else{
        downvote_but.innerText = parseInt(downvote_but.innerHTML) +1}
        if(upvote_but.innerHTML === '1'){upvote_but.innerText = ''}
        else{
        upvote_but.innerText = parseInt(upvote_but.innerHTML) - 1}

        upvote_but.classList.remove('upvoted')
        downvote_but.classList.add('downvoted')
        let xmlhttp = new XMLHttpRequest();
   
        xmlhttp.open("POST","/comment section/upvote system.php",true);
        xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xmlhttp.send(`comoid=${y}&condition=5&table=${t}`);
      }
      else{
        //simple upvote (condition 6)
        downvote_but.classList.add('downvoted')
        if(downvote_but.innerHTML === ''){downvote_but.innerText = '1'}
        else{
        downvote_but.innerText = parseInt(downvote_but.innerHTML) +1}
        let xmlhttp = new XMLHttpRequest();
   
        xmlhttp.open("POST","/comment section/upvote system.php",true);
        xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xmlhttp.send(`comoid=${y}&condition=6&table=${t}`);
      }
    }
  }}
  else{alert('Please login or Signup to vote')}
}

//---------------------My equation library----------------------------//
/*
Creator = u/iharshraj ; Orignial File Created = 03-03-2020
last Modified = 05-03-2020

Put your codes in between <eqn-space></eqn-space> , only one such tag can be created

Although it wont matter much , I like to make least <eqn-space> tags , I just make 
1-2 big tags which covers my most of writing area.It wont affect your text
but be aware dont put entire <body> childnodes inside this tag it could hinder some processes
related to Html DOMs in javascript.

Just use it around text places.

*If you use Night mode for your websites ,
 make sure you turn <hr> tags white to make division slash visible
 set border-color for <table> white for determinants
 set border-color and background color for .mat-div1 (a class) and just background-color for .mat-div2 red or blue for matrices
 use !important for all above
 eg, 
      body.night hr , body.night table {
        border-color : white !important;
      }
      body.night .mat-div1 {
        border : 2px solid white !important;
        background-color: black !important;    (black or whatever color is ur night mode background)
      }
      body.night .mat-div2 {
        background-color: black !important;
      }



<------------Personal Notes------------------>
( = \u0028
) = \u0029
{ = \u007B
} = \u007D
[ = \u005B
] = \u005D
| = \u007C
/ = \u002F
\ = \u005C
+ = \u002B

<------------Calculus or High effort Operations--------->

Differentiation = {!d/dx} or {!d/dz} or etc

Integration = <integ>(a)->[b]</integ>

Division = <divide>{a+b+c+d}by[a+b]</divide>
      
limits ={!lim_x->0} or
        <limit>(x->0)</limit>

nCr or nPr = {!ncr} or {!npr}

^n = !!pn!!
_n = !!_n!!

<--------------------Chemistry---------------------->

First put it in <chem-eqn></chem-eqn>
^ = up arrow (for gases)
{!equilibrium} =  puts equilibrium sign
--UPTEXT__BELOWTEXT-> = reaction arrow
_ = base
_g = _(g)
_aq = _(aq)
_s = _(s)

*/

function eqn_start(){
  //Basic symbols

 var global_divs_all = document.getElementsByTagName('eqn-space')
  var arrow = '-&gt;';

  var globt1 = '!!alpha'             //  α
  var globt2 = '!!beta'              //  β
  var globt3 = '!!gamma'             //  γ
  var globt4 = '!!delta'             //  Δ
  var globt5 = '!!delta-2'           //  δ
  var globt6 = '!!eta'               //  η
  var globt7 = '!!theta'             //  θ
  var globt8 = '!!lemda'             //  λ
  var globt9 = '!!lambda'            //  λ
  var globt10 = '!!pi'               //  π
  var globt11 = '!!phi'              //  φ
  var globt12 = '!!phi2'             //  Φ
  var globt13 = '!!psi'              //  Ψ
  var globt14 = '!!psi2'             //  ψ
  var globt15 = '!!chi'              //  χ
  var globt16 = '!!suscept'          //  χ
  var globt17 = '!!greek-x'          //  χ
  var globt18 = '!!greek-t'          //  τ
  var globt19 = '!!tau'              //  τ
  var globt20 = '!!omega'            //  ω
  var globt21 = '!!omega'            //  Ω
  var globt22 = '!!ohm'              //  Ω
  var globt23 = '!!sigma'            //  σ
  var globt24 = '!!sigma2'           //  Σ
  var globt25 = '!!sum'              //  Σ
  var globt26 = '!!rho'              //  ρ
  var globt27 = '!!nu'               //  ν
  var globt28 = '!!mu'               //  μ
  var globt29 = '!!upsilon'          //  υ
  var globt30 = '!!greek-u'          //  υ
  var globt31 = '!!greek-v'          //  ν
  var globt32 = '!!xi'               //  ξ
  var globt33 = '!!pi2'              //  Π
  var globt34 = '!!product'          //  Π
  var globt35 = '!!zeta'             //  ζ
  var globt36 = '!!epsilon'          //  ε
  var globt37 = '!!greek-e'          //  ε
  var globt38 = '!!kappa'            //  κ
  var globt39 = '!!greek-k'          //  κ
  var globt40 = '!!integration'      //  ∫
  var globt41 = '!!for-all'          //  ∀
  var globt42 = '!!there-exists'     //  ∃
  var globt43 = '!!ulta-A'           //  ∀
  var globt44 = '!!ulta-E'           //  ∃
  var globt45 = '!!since'            //  ∵
  var globt46 = '!!hence'            //  ∴
  var globt47 = '!!dot-product'      //  ⋅
  var globt48 = '!!ne'               //  ≠
  var globt49 = '!!='                //  ≠
  var globt50 = '!!approx'           //  ≈
  var globt51 = '!!&lt;='            //  ≤
  var globt52 = '!!&gt;='            //  ≥
  var globt53 = '!!plus-minus'       //  ±
  var globt54 = '!!cross-product'    //  ×
  var globt55 = '!!divide'           //  ÷
  var globt56 = '!!sqrt'             //  √
  var globt57 = '!!deg'              //  °
  var globt58 = '!!perpendicular'    //  ⊥
  var globt59 = '!!parallel'         //  ∥
  var globt60 = '!!congurent'        //  ≅
  var globt61 = '!!proportional'     //  ∝
  var globt62 = '!!infinity'         //  ∞
  var globt63 = '!!degree'           //  °
  var globt64 = '!!not-equal'        //  ≠
  var globt65 = '!!square'           //  ^2 , use !!p2 instead
  var globt66 = '!!cube'             //  ^3
  var globt67 = '!!euler'            //  _e_
  var globt68 = '!!left-arrow'       //  ←
  var globt69 = '!!right-arrow'      //  →
  var globt70 = '!!up-arrow'         //  ↑
  var globt71 = '!!down-arrow'       //  ↓
  var globt72 = '!!left-right-arrow' //  ↔
  var globt73 = '!!up-down-arrow'    //  ↕
  var globt74 = '!!long-left-arrow'  //  ⟵
  var globt75 = '!!long-right-arrow' //  ⟶
  var globt76 = '!!long-left-right-arrow' //  ⟷
  var globt77 = '!!implies'          //  ⇒
  var globt78 = '!!long-implies'     //  ⟹
  var globt79 = '!!minus-plus'       //  ∓
  var globt80 = '!!belongs-to'       //  ∈
  var globt81 = '!!not-belongs-to'   //  ∉
  var globt82 = '!!intersection'     //  ∩
  var globt83 = '!!union'            //  ∪
  var globt84 = '!!subset'           //  ⊆
  var globt85 = '!!proper-subset'    //  ⊂ 
  var globt86 = '!!not-subset'       //  ⊄ 
  var globt87 = '!!superset'         //  ⊇ 
  var globt88 = '!!not-superset'     //  ⊅ 
  var globt89 = '!!proper-superset'  //  ⊃
  var globt90 = '!!equivalence'      //  ≡ 
  var globt91 = '!!division'         //  ÷
  var globt92 = '!!equilibrium'      //  ⇌
  var globt93 = '!!sp!!'             //  &nbsp 
  var globt94 = '</divide>'
 // var globt95 = '!&#42;'                 //<b>
 // var globt96 = '&#42;!'                 //</b>


 



for (let i = 0; i < global_divs_all.length; i++) {
    var global_divs = document.getElementsByTagName('eqn-space')[i];
    var global_text = global_divs.innerHTML ;

//!!vAB!! (vector)
global_text = global_text.replace(/!!v(.)!!/g,'<vector>{$1}</vector>&nbsp')
global_text = global_text.replace(/!!v(.)(.)!!/g,'<vector2>{$1$2}</vector2>&nbsp')


//!!ci!! (vcap)
global_text = global_text.replace(/!!c(.)!!/g,'<vcap>{$1}</vcap>&nbsp')
global_text = global_text.replace(/!!c(.)(.)!!/g,'<vcap>{$1$2}</vcap>&nbsp')

//!!nCr!! 
  global_text = global_text.replace(/!!(.)C(.)!!/g,'<sup>$1</sup>C<sub>$2</sub>')
  global_text = global_text.replace(/!!(.)(.)C(.)!!/g,'<sup>$1$2</sup>C<sub>$3</sub>')
  global_text = global_text.replace(/!!(.)(.)C(.)(.)!!/g,'<sup>$1$2</sup>C<sub>$3$4</sub>')
  global_text = global_text.replace(/!!(.)(.)(.)C(.)(.)!!/g,'<sup>$1$2$3</sup>C<sub>$4$5</sub>')
  global_text = global_text.replace(/!!(.)(.)(.)C(.)(.)(.)!!/g,'<sup>$1$2$3</sup>C<sub>$4$5$6</sub>')

//!!nPr!! 
global_text = global_text.replace(/!!(.)p(.)!!/g,'<sup>$1</sup>C<sub>$2</sub>')
global_text = global_text.replace(/!!(.)(.)p(.)!!/g,'<sup>$1$2</sup>C<sub>$3</sub>')
global_text = global_text.replace(/!!(.)(.)p(.)(.)!!/g,'<sup>$1$2</sup>C<sub>$3$4</sub>')
global_text = global_text.replace(/!!(.)(.)(.)p(.)(.)!!/g,'<sup>$1$2$3</sup>C<sub>$4$5</sub>')
global_text = global_text.replace(/!!(.)(.)(.)p(.)(.)(.)!!/g,'<sup>$1$2$3</sup>C<sub>$4$5$6</sub>')



// !!Pn!! = ^n
  global_text = global_text.replace(/!!P(.)!!/g,'<sup>$1</sup>')
  global_text = global_text.replace(/!!P(.)(.)!!/g,'<sup>$1$2</sup>')
  global_text = global_text.replace(/!!P(.)(.)(.)!!/g,'<sup>$1$2$3</sup>')
  global_text = global_text.replace(/!!P(.)(.)(.)(.)!!/g,'<sup>$1$2$3$4</sup>')
  global_text = global_text.replace(/!!P(.)(.)(.)(.)(.)!!/g,'<sup>$1$2$3$4$5</sup>')
  global_text = global_text.replace(/!!P(.)(.)(.)(.)(.)(.)!!/g,'<sup>$1$2$3$4$5$6</sup>')
  global_text = global_text.replace(/!!P(.)(.)(.)(.)(.)(.)(.)!!/g,'<sup>$1$2$3$4$5$6$7</sup>')
  global_text = global_text.replace(/!!P(.)(.)(.)(.)(.)(.)(.)(.)!!/g,'<sup>$1$2$3$4$5$6$7$8</sup>')
  global_text = global_text.replace(/!!P(.)(.)(.)(.)(.)(.)(.)(.)(.)!!/g,'<sup>$1$2$3$4$5$6$7$8$9</sup>')

//!!_n!! = _n
  global_text = global_text.replace(/!!_(.)!!/g,'<sub>$1</sub>')
  global_text = global_text.replace(/!!_(.)(.)!!/g,'<sub>$1$2</sub>')
  global_text = global_text.replace(/!!_(.)(.)(.)!!/g,'<sub>$1$2$3</sub>')
  global_text = global_text.replace(/!!_(.)(.)(.)(.)!!/g,'<sub>$1$2$3$4</sub>')
  global_text = global_text.replace(/!!_(.)(.)(.)(.)(.)!!/g,'<sub>$1$2$3$4$5</sub>')
  global_text = global_text.replace(/!!_(.)(.)(.)(.)(.)(.)!!/g,'<sub>$1$2$3$4$5$6</sub>')
  global_text = global_text.replace(/!!_(.)(.)(.)(.)(.)(.)(.)!!/g,'<sub>$1$2$3$4$5$6$7</sub>')
  global_text = global_text.replace(/!!_(.)(.)(.)(.)(.)(.)(.)(.)!!/g,'<sub>$1$2$3$4$5$6$7$8</sub>')
  global_text = global_text.replace(/!!_(.)(.)(.)(.)(.)(.)(.)(.)(.)!!/g,'<sub>$1$2$3$4$5$6$7$8$9</sub>')


//!!10pn!! = × 10^n
  global_text = global_text.replace(/!!10P(.)!!/g,' × 10<sup>$1</sup>')
  global_text = global_text.replace(/!!10P(.)(.)!!/g,' × 10<sup>$1$2</sup>')
  global_text = global_text.replace(/!!10P(.)(.)(.)!!/g,' × 10<sup>$1$2$3</sup>')
  global_text = global_text.replace(/!!10P(.)(.)(.)(.)!!/g,' × 10<sup>$1$2$3$4</sup>')
  global_text = global_text.replace(/!!10P(.)(.)(.)(.)(.)!!/g,' × 10<sup>$1$2$3$4$5</sup>')
  global_text = global_text.replace(/!!10P(.)(.)(.)(.)(.)(.)!!/g,' × 10<sup>$1$2$3$4$5$6</sup>')
  global_text = global_text.replace(/!!10P(.)(.)(.)(.)(.)(.)(.)!!/g,' × 10<sup>$1$2$3$4$5$6$7</sup>')
  global_text = global_text.replace(/!!10P(.)(.)(.)(.)(.)(.)(.)(.)!!/g,' × 10<sup>$1$2$3$4$5$6$7$8</sup>')
  global_text = global_text.replace(/!!10P(.)(.)(.)(.)(.)(.)(.)(.)(.)!!/g,' × 10<sup>$1$2$3$4$5$6$7$8$9</sup>')



//globt
  global_text = global_text.replace(new RegExp(globt1, 'g') , 'α' );
  global_text = global_text.replace(new RegExp(globt2, 'g') , 'β' );
  global_text = global_text.replace(new RegExp(globt3, 'g') , 'γ' );
  global_text = global_text.replace(new RegExp(globt4, 'g') , 'Δ' );
  global_text = global_text.replace(new RegExp(globt5, 'g') , 'δ' );
  global_text = global_text.replace(new RegExp(globt6, 'g') , 'η' );
  global_text = global_text.replace(new RegExp(globt7, 'g') , 'θ' );
  global_text = global_text.replace(new RegExp(globt8, 'g') , 'λ' );
  global_text = global_text.replace(new RegExp(globt9, 'g') , 'λ' );
  global_text = global_text.replace(new RegExp(globt10, 'g') , 'π' );
  global_text = global_text.replace(new RegExp(globt11, 'g') , 'φ' ); 
  global_text = global_text.replace(new RegExp(globt12, 'g') , 'Φ' );
  global_text = global_text.replace(new RegExp(globt13, 'g') , 'Ψ' );
  global_text = global_text.replace(new RegExp(globt14, 'g') , 'ψ' );
  global_text = global_text.replace(new RegExp(globt15, 'g') , 'χ' );
  global_text = global_text.replace(new RegExp(globt16, 'g') , 'χ' );
  global_text = global_text.replace(new RegExp(globt17, 'g') , 'χ' );
  global_text = global_text.replace(new RegExp(globt18, 'g') , 'τ' );
  global_text = global_text.replace(new RegExp(globt19, 'g') , 'τ' );
  global_text = global_text.replace(new RegExp(globt20, 'g') , 'ω' );
  global_text = global_text.replace(new RegExp(globt21, 'g') , 'Ω' );
  global_text = global_text.replace(new RegExp(globt22, 'g') , 'Ω' );
  global_text = global_text.replace(new RegExp(globt23, 'g') , 'σ' );
  global_text = global_text.replace(new RegExp(globt24, 'g') , 'Σ' );
  global_text = global_text.replace(new RegExp(globt25, 'g') , 'Σ' );
  global_text = global_text.replace(new RegExp(globt26, 'g') , 'ρ' );
  global_text = global_text.replace(new RegExp(globt27, 'g') , 'ν' ); 
  global_text = global_text.replace(new RegExp(globt28, 'g') , 'μ' );
  global_text = global_text.replace(new RegExp(globt29, 'g') , 'υ' );
  global_text = global_text.replace(new RegExp(globt30, 'g') , 'υ' );
  global_text = global_text.replace(new RegExp(globt31, 'g') , 'ν' );
  global_text = global_text.replace(new RegExp(globt32, 'g') , 'ξ' );
  global_text = global_text.replace(new RegExp(globt33, 'g') , 'Π' );
  global_text = global_text.replace(new RegExp(globt34, 'g') , 'Π' );
  global_text = global_text.replace(new RegExp(globt35, 'g') , 'ζ' );
  global_text = global_text.replace(new RegExp(globt36, 'g') , 'ε' );
  global_text = global_text.replace(new RegExp(globt37, 'g') , 'ε' );
  global_text = global_text.replace(new RegExp(globt38, 'g') , 'κ' );
  global_text = global_text.replace(new RegExp(globt39, 'g') , 'κ' );
  global_text = global_text.replace(new RegExp(globt40, 'g') , '∫' );
  global_text = global_text.replace(new RegExp(globt41, 'g') , '∀' );
  global_text = global_text.replace(new RegExp(globt42, 'g') , '∃' );
  global_text = global_text.replace(new RegExp(globt43, 'g') , '∀' );
  global_text = global_text.replace(new RegExp(globt44, 'g') , '∃' );
  global_text = global_text.replace(new RegExp(globt45, 'g') , '∵' );
  global_text = global_text.replace(new RegExp(globt46, 'g') , '∴' );
  global_text = global_text.replace(new RegExp(globt47, 'g') , '⋅' );
  global_text = global_text.replace(new RegExp(globt48, 'g') , '≠' );
  global_text = global_text.replace(new RegExp(globt49, 'g') , '≠' );
  global_text = global_text.replace(new RegExp(globt50, 'g') , '≈' );
  global_text = global_text.replace(new RegExp(globt51, 'g') , '≤' );
  global_text = global_text.replace(new RegExp(globt52, 'g') , '≥' ); 
  global_text = global_text.replace(new RegExp(globt53, 'g') , '±' );
  global_text = global_text.replace(new RegExp(globt54, 'g') , '×' ); 
  global_text = global_text.replace(new RegExp(globt55, 'g') , '÷' );
  global_text = global_text.replace(new RegExp(globt56, 'g') , '√' );
  global_text = global_text.replace(new RegExp(globt57, 'g') , '°' );
  global_text = global_text.replace(new RegExp(globt58, 'g') , '⊥' );
  global_text = global_text.replace(new RegExp(globt59, 'g') , '∥' );
  global_text = global_text.replace(new RegExp(globt60, 'g') , '≅' );
  global_text = global_text.replace(new RegExp(globt61, 'g') , '∝' );
  global_text = global_text.replace(new RegExp(globt62, 'g') , '∞' );
  global_text = global_text.replace(new RegExp(globt63, 'g') , '°' );
  global_text = global_text.replace(new RegExp(globt64, 'g') , '≠' );
  global_text = global_text.replace(new RegExp(globt65, 'g') , '<sup>2</sup>' );
  global_text = global_text.replace(new RegExp(globt66, 'g') , '<sup>3</sup>' );
  global_text = global_text.replace(new RegExp(globt67, 'g') , '<i>e</i>' );
  global_text = global_text.replace(new RegExp(globt68, 'g') , '←' ); 
  global_text = global_text.replace(new RegExp(globt69, 'g') , '→' );
  global_text = global_text.replace(new RegExp(globt70, 'g') , '↑' );
  global_text = global_text.replace(new RegExp(globt71, 'g') , '↓' );
  global_text = global_text.replace(new RegExp(globt72, 'g') , '↔' );
  global_text = global_text.replace(new RegExp(globt73, 'g') , '↕' );
  global_text = global_text.replace(new RegExp(globt74, 'g') , '⟵' );
  global_text = global_text.replace(new RegExp(globt75, 'g') , '⟶' );
  global_text = global_text.replace(new RegExp(globt76, 'g') , '⟷' );
  global_text = global_text.replace(new RegExp(globt77, 'g') , '⇒' );
  global_text = global_text.replace(new RegExp(globt78, 'g') , '⟹' );
  global_text = global_text.replace(new RegExp(globt79, 'g') , '∓' );

  global_text = global_text.replace(/!!\u002B-/g , '±' );
  global_text = global_text.replace(/!!-\u002B/g , '∓' );

//  global_text = global_text.replace(/!&#42;\/g , '<\b>' );
//  global_text = global_text.replace(/\&#42;!/g , '<\/b>' );

  global_text = global_text.replace(new RegExp(globt80, 'g') , '∈' );
  global_text = global_text.replace(new RegExp(globt81, 'g') , '∉' );
  global_text = global_text.replace(new RegExp(globt82, 'g') , '∩' );
  global_text = global_text.replace(new RegExp(globt83, 'g') , '∪' );
  global_text = global_text.replace(new RegExp(globt84, 'g') , '⊆' );
  global_text = global_text.replace(new RegExp(globt85, 'g') , '⊂' );
  global_text = global_text.replace(new RegExp(globt86, 'g') , '⊄' );
  global_text = global_text.replace(new RegExp(globt87, 'g') , '⊇' );
  global_text = global_text.replace(new RegExp(globt88, 'g') , '⊅' );
  global_text = global_text.replace(new RegExp(globt89, 'g') , '⊃' );
  global_text = global_text.replace(new RegExp(globt90, 'g') , '≡' );
  global_text = global_text.replace(new RegExp(globt91, 'g') , '÷' );
  global_text = global_text.replace(new RegExp(globt92, 'g') , '⇌' );
  global_text = global_text.replace(new RegExp(globt93, 'g') , '&nbsp' );
  global_text = global_text.replace(new RegExp(globt94, 'g') , '</divide> &nbsp;' );

//  global_text = global_text.replace(new RegExp(globt95, 'g') , '<b>' );
//  global_text = global_text.replace(new RegExp(globt96, 'g') , '</b>' );

  



  
//differentiation 
  global_text = global_text.replace(/{!(.)\u002F(.)(.)}/g , '<divide>{$1}by[$2$3]</divide>&nbsp' );
  
//limits
  global_text = global_text.replace(/{!lim_(.)-&gt;(.)}/g , '<limit>($1->$2)</limit>' );
  global_text = global_text.replace(/{!lim_(.)-&gt;(.)(.)}/g , '<limit>($1->$2$3)</limit>' );
  global_text = global_text.replace(/{!lim_(.)-&gt;(.)(.)(.)}/g , '<limit>($1->$2$3$4)</limit>' );


  global_divs.innerHTML = global_text}

// <integ>(l)->[u]</integ>
  
  var integ_divs = document.getElementsByTagName('integ');
  for (let i = 0; i < integ_divs.length; i++) {
  integ_divs[i].style.position = 'relative'
  var subsjsda = '-&gt;'
  var stro = document.getElementsByTagName('integ')[i].innerHTML;
  var reso = stro.replace( /\u0028/g, ' &nbsp <sub style="position:relative;font-size:13px;top:4px;right:2px;">');
  reso = reso.replace( /\u0029/g, '</sub>');
  reso = reso.replace(new RegExp(subsjsda, 'g'), '');
  reso = reso.replace( /\u005B/g, '<sup style="position:absolute;font-size:13px;bottom:7px;right:7px;">');
  reso = reso.replace( /\u005D/g, '</sup>∫');

  integ_divs[i].innerHTML = reso;
  }
  
//limits : <limit>(x->0+)</limit>
 
  var lim_divs = document.getElementsByTagName('limit');
  for (let i = 0; i < lim_divs.length; i++) {
  lim_divs[i].style.position = 'relative'

  var str0 = document.getElementsByTagName('limit')[i].innerHTML;
  var res0 = str0.replace( /\u0028/g, 'lim<sub style="position:absolute;left:0%;top:55%;font-size:14px;">');
  res0 = res0.replace( /\u0029/g, '</sub> &nbsp');

  lim_divs[i].innerHTML = res0;

  }

setTimeout(function(){

//division : <divide>(x)by[y]</divide>

var divide_divs = document.getElementsByTagName('divide');
for (let i = 0; i < divide_divs.length; i++) {
  divide_divs[i].style.position = 'relative'
  divide_divs[i].style.display = 'inline-block'

  var str2 = document.getElementsByTagName('divide')[i].innerHTML;
  var res2 = str2.replace( /\u007B/g, '<sup class="divide-sup" style="position:relative;">');
  res2 = res2.replace( /\u007D/g, '</sup>');
  res2 = res2.replace( 'by', '<hr class="divide-hr" style="display:inline-block;position:absolute;top:41%;right:-5%;width:100%;height:0;border:0;border-top:1.5px solid black;">');
  res2 = res2.replace( /\u005B/g, '<sub style="display:block ruby;" class="divide-sub" >');
  res2 = res2.replace( /\u005D/g, '</sub>');


  divide_divs[i].innerHTML = res2;
}

//divide part 2

setTimeout( function(){
 
  for (let i = 0; i < divide_divs.length; i++) {
  var divido_hr = document.getElementsByClassName('divide-hr')[i]
  var divido_sub = document.getElementsByClassName('divide-sub')[i]
  var divido_sub_width = divido_sub.offsetWidth
  var divido_sup = document.getElementsByClassName('divide-sup')[i]
  var divido_sup_width = divido_sup.offsetWidth
 
  if(divido_sub_width > divido_sup_width){ 
  divide_divs[i].style.width = `${divido_sub_width}px` ;
  divido_sub.style.position = 'absolute'
  divido_sub.style.top = '65%'
  divido_sub.style.left = '5%'
  divido_hr.style.top = '45%'
  divide_divs[i].style.textAlign = 'center'

}
else {
  divide_divs[i].style.textAlign = 'center'
  divido_sub.style.position = 'absolute'
  divido_sub.style.top = '60%'
  divido_sub.style.left = '45%'
}
 }
}, 200)
},100)
//Divide end

///////////////////////////Matrice & determinants///////////////////////////////
/*<determinant rows="3" columns="3">[!{Lois}{Griffin}{$150}][{Joe}{Swanson}{$300}][{Cleveland}{Brown}{$250}!]</determinant>
{ = \u007B
} = \u007D
[ = \u005B
] = \u005D*/


var determinant_divs = document.getElementsByTagName('determinant');
for (let i = 0; i < determinant_divs.length; i++) {
determinant_divs[i].style.display = "inline-flex"
var str3 = document.getElementsByTagName('determinant')[i].innerHTML;

var res3 = str3.replace( /\u005B!\u007B/g, '<table class="det-table" style="position:relative;border-left:2px solid black;border-right:2px solid black;><tr class="det-tr"><td style="padding:0px 10px">');

res3 = res3.replace( /\u007D\u007B/g, '</td><td style="padding:0px 10px">');
res3 = res3.replace( /\u007D\u005D/g, '</td></tr>');
res3 = res3.replace( /\u005B\u007B/g, '<tr><td style="padding:0px 10px">');
res3 = res3.replace( /\u007D!\u005D/g, '</td></tr></table> &nbsp &nbsp ');

determinant_divs[i].innerHTML = res3;

}

//------------------- matrice -------------


var matrice_divs = document.getElementsByTagName('matrice');

for (let i = 0; i < matrice_divs.length; i++) {
matrice_divs[i].style.display = "inline-flex"

var str4 = document.getElementsByTagName('matrice')[i].innerHTML;

var res4 = str4.replace( /\u005B!\u007B/g, '<div class="mat-div1"><div class="mat-div2"></div></div><table><tr><td class="mat-table" style="padding:0px 10px;position:relative;">');

res4 = res4.replace( /\u007D\u007B/g, '</td><td style="padding:0px 10px;position:relative;">');
res4 = res4.replace( /\u007D\u005D/g, '</td></tr>');
res4 = res4.replace( /\u005B\u007B/g, '<tr><td style="padding:0px 10px;position:relative;">');
res4 = res4.replace( /\u007D!\u005D/g, '</td></tr></div></table> &nbsp  &nbsp');

matrice_divs[i].innerHTML = res4;

}

setTimeout(function(){

for (let i = 0; i < matrice_divs.length; i++) {
var mat_table = document.getElementsByClassName('mat-table')

var mat_width = mat_table[i].offsetWidth*3
var mat_height =  mat_table[i].offsetHeight*3.5

//alert(`h=${mat_height};w=${mat_width}`)

var mat_div1 = document.getElementsByClassName('mat-div1')[i]
var mat_div2 = document.getElementsByClassName('mat-div2')[i]
mat_div1.style.border = '2px solid black'
mat_div1.style.position = 'absolute'
mat_div1.style.height = `${mat_height}px`
mat_div1.style.width = `${mat_width}px`


mat_div2.style.position = 'absolute'

mat_div2.style.mixBlendMode = 'normal'
mat_div1.style.mixBlendMode = 'darken'

mat_div2.style.height = `${mat_height+7}px`
mat_div2.style.width = `${mat_width-19}px`
mat_div2.style.left = '11%'
mat_div2.style.bottom = '-4%'

}
},300)

setTimeout( function(){
//Vectors , <vector>{B}</vector>
var vector_divs = document.getElementsByTagName('vector')
for (let i = 0; i < vector_divs.length; i++) {
var vector_cur = vector_divs[i]


vector_cur.style.position = 'relative'
var str5 = document.getElementsByTagName('vector')[i].innerHTML;
var res5 = str5.replace( /\u007B/g, '<hreg style="position:relative;left:5px;font-family:calibri;font-weight:600">');
res5 = res5.replace( /\u007D/g, '</hreg><hreg style="position:absolute;bottom:40%;left:-40%;">⟶</hreg>');
vector_cur.innerHTML = res5

}},100)


setTimeout( function(){
//vector2s , <vector2>{B}</vector2>
var vector2_divs = document.getElementsByTagName('vector2')
for (let i = 0; i < vector2_divs.length; i++) {
var vector2_cur = vector2_divs[i]
vector2_cur.style.position = 'relative'
var str7 = document.getElementsByTagName('vector2')[i].innerHTML;
var res7 = str7.replace( /\u007B/g, '<hreg style="position:relative;left:5px;font-family:calibri;font-weight:600">');
res7 = res7.replace( /\u007D/g, '</hreg><hreg style="position:absolute;bottom:40%;left:10%;">⟶</hreg>');
vector2_cur.innerHTML = res7
}},100)

setTimeout( function(){
//Vcap , <vcap>{B}</vcap>
var vcap_divs = document.getElementsByTagName('vcap')
for (let i = 0; i < vcap_divs.length; i++) {
var vcap_cur = vcap_divs[i]

vcap_cur.style.position = 'relative'
var str6 = document.getElementsByTagName('vcap')[i].innerHTML;
var res6 = str6.replace( /\u007B/g, '<hreg style="position:relative;left:4px;font-family:calibri;">');
res6 = res6.replace( /\u007D/g, '</hreg><hreg style="font-size:15px;position:absolute;bottom:45%;left:50%;">^</hreg>');
vcap_cur.innerHTML = res6
}},100)

//Chemistry <chem-eqn></chem-eqn>

 var chem_eqn_divs = document.getElementsByTagName('chem-eqn');
 var substr = '-&gt;';
 var substr2 = '--' ;
 var substr2b = '__' ;

 var substr3 = '_g' ;
 var substr4 = '_aq' ;
 var substr5 = '_s' ;

 for (let i = 0; i < chem_eqn_divs.length; i++) {
// chem_eqn_divs[i].style.backgroundColor = "grey"

 var str = document.getElementsByTagName('chem-eqn')[i].innerHTML;
 var res = str.replace(new RegExp(substr2, 'g'), '<divide style="position:relative;bottom:3px;">{&nbsp &nbsp &nbsp &nbsp');
 res = res.replace(new RegExp(substr2b, 'g'), '&nbsp &nbsp &nbsp}by[');
 res = res.replace(new RegExp(substr, 'g'), ']</divide>&nbsp<fjosa style="font-size:18px;">></fjosa>');
 res = res.replace(/_(\d)/g,'<sub>$1</sub>')
 res = res.replace(new RegExp(substr3, 'g'), '<sub>(g)</sub>');
 res = res.replace(new RegExp(substr4, 'g'), '<sub>(aq)</sub>');
 res = res.replace(new RegExp(substr5, 'g'), '<sub>(s)</sub>');
 res = res.replace(/\u005E/g,'↑')

 chem_eqn_divs[i].innerHTML = res;
 chem_eqn_divs[i].style.fontFamily = "Calisto MT,serif"

 }
  
}


setTimeout( function() {eqn_start()} , 1000)

/*
<------------Personal Notes------------------>
( = \u0028
) = \u0029
{ = \u007B
} = \u007D
[ = \u005B
] = \u005D
| = \u007C
/ = \u002F
\ = \u005C
+ = \u002B

*/