var current_page = "";
var last_vid_id = maxid;
var first_vid_id = 984;
var current_active_element_id;
not_over_search_div = true;
var mouse_over_thumbnail=0;
var total_vids_on_page = document.getElementsByClassName('video-thumbnail-all').length

window.onload = function(){
    if(current_page !='play'){
     window.scrollTo(0, 380);


    document.getElementsByClassName('menu-a-divs ')[0].classList.add('active-menu-div');

    for(let i=0;i<total_vids_on_page;i++){
        

        let vido_temp = document.getElementsByClassName('video-thumbnail')[i];
        
        vido_temp.src = vido_temp.dataset.src;
        vido_temp.load();
        vido_temp.volume = 0.2;

        vido_temp.addEventListener("mouseover",function(){
             mouse_over_thumbnail=`${i+1}`;
             vido_temp.play();
        })

        vido_temp.addEventListener("mouseout",function(){
            mouse_over_thumbnail =0;
            vido_temp.pause();
        })
    }
        setTimeout(function(){
            
        for(let i=0;i<ids_for_dur.length;i++){
            let temp_time = document.getElementsByClassName(`video-thumbnail${ids_for_dur[i]}`)[0].duration
            add_duration(ids_for_dur[i],temp_time)
            document.getElementsByClassName(`thumbnail${ids_for_dur[i]}`)[0].dataset.duration = secToHourMinSec(temp_time)
           
        }},2500)
    
    }
    else{
        let vido_temp_src = document.getElementsByClassName("video-src")[0]
        let video_temp = document.getElementsByClassName("video-playing")[0]
        let video_desc_pre = document.getElementsByClassName("vid-desc-pre")[0]
        first_src =  vido_temp_src.src;
        first_src = friendly_link(first_src)

        vido_temp_src.src=first_src;
        video_temp.load();
        video_desc_pre.innerHTML = new_desc(video_desc_pre.innerHTML)

    }
}

function vid_play(x){
    if(current_page == "play"){
        let xmlhttp=new XMLHttpRequest();
        xmlhttp.open("POST","redirect.php",true);
        xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        curr_vid_id = x;
        add_view(curr_vid_id);
        xmlhttp.send(`work=b&vid_id=${curr_vid_id}`);
        xmlhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
            let temp_strng = xmlhttp.responseText;
            new_vid_data_arr= temp_strng.split('?')
            document.getElementsByClassName("video-src")[0].src = new_vid_data_arr[3];
            vid.load();
            change_all_data();
        };} 
    }
    else window.open(`./play.php?play_vid=${x}`,"_self");
}

function vid_play_search(x,y){
    if(current_page == "play"){
        let xmlhttp=new XMLHttpRequest();
        xmlhttp.open("POST","redirect.php",true);
        xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        curr_vid_id = x;
        add_view(curr_vid_id);
        xmlhttp.send(`work=b&vid_id=${curr_vid_id}`);
        xmlhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
            let temp_strng = xmlhttp.responseText;
            new_vid_data_arr= temp_strng.split('?')
            document.getElementsByClassName("video-src")[0].src = friendly_link(new_vid_data_arr[3])
            vid.load();
            change_all_data();
            switchplayicon("showpause",0)
        };} 
    }
    else window.open(`./play.php?play_vid=${x}`,"_self");
}

function toggleNav(){
    let menu_div = document.getElementsByClassName("Menu-div")[0];
    if(menu_div.classList.contains("put-width-100px")) menu_div.classList.remove("put-width-100px")
    if(menu_div.offsetWidth > 150){ 
        if(current_page != 'play')closeNav();
        else totalcloseNav()
    }
    else openNav()
}

function openNav(){
    if(document.getElementsByClassName("Menu-div")[0].classList.contains('hideme')){
        document.getElementsByClassName("Menu-div-sticky")[0].classList.add('hideme')
        setTimeout(function(){document.getElementsByClassName("Menu-div")[0].style.width = "240px";},10);
        document.getElementsByClassName("Menu-div")[0].classList.remove('hideme')
        setTimeout(function(){document.getElementsByClassName("Menu-div-sticky")[0].classList.remove('hideme');},150);
    }
    if(current_page!= "play"){
        document.getElementsByClassName("Menu-div")[0].style.width = "334px";
        for(let i=0;i<document.getElementsByClassName("thumbnail").length;i++) 
        {
            document.getElementsByClassName("thumbnail")[i].style.maxHeight ="170px";
            document.getElementsByClassName("video-thumbnail")[i].style.minHeight ="170px";
        }
       
    }

    var divs = document.querySelectorAll('.menu-links');
    var divs2 = document.querySelectorAll('.menu-a-divs');
    var divs3 = document.querySelectorAll('.menu-a-divs i');
    for (let i = 0; i < divs.length; i++) { 
        divs[i].classList.remove('toggle-style-links'); 
        divs2[i].classList.remove('toggle-style-div');  
        divs3[i].classList.remove('toggle-style-i');   
        document.getElementsByClassName("menu-div3")[0].classList.remove("hideme");
        document.getElementsByClassName("menu-div3")[0].classList.remove("invisible");
        divs[i].classList.remove('hideme');  
    }
    let xmlhttp=new XMLHttpRequest();
    xmlhttp.open("POST","redirect.php",true);
    xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlhttp.send(`work=c&menu_open=true`);
    /*setTimeout(function(){
    if (xmlhttp.readyState==4 && xmlhttp.status==200) {
        document.getElementsByClassName("category-btn")[0].innerText = xmlhttp.responseText;
    };},100)*/
}

function closeNav(){
    document.getElementsByClassName("Menu-div")[0].style.width = "100px";
    var divs = document.querySelectorAll('.menu-links');
    var divs2 = document.querySelectorAll('.menu-a-divs');
    var divs3 = document.querySelectorAll('.menu-a-divs i');
    for (let i = 0; i < divs.length; i++) {
        divs[i].classList.add('toggle-style-links');  
        divs2[i].classList.add('toggle-style-div');  
        divs3[i].classList.add('toggle-style-i');  
        document.getElementsByClassName("menu-div3")[0].classList.add("hideme");
    }
    for(let i=0;i<document.getElementsByClassName("thumbnail").length;i++) 
    {
        document.getElementsByClassName("thumbnail")[i].style.maxHeight ="190px";
        document.getElementsByClassName("video-thumbnail")[i].style.minHeight ="190px";
    }
    let xmlhttp=new XMLHttpRequest();
    xmlhttp.open("POST","redirect.php",true);
    xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlhttp.send(`work=c&menu_open=false`);
}

function totalcloseNav() {
    document.getElementsByClassName("Menu-div")[0].style.width = "0px";
    document.getElementsByClassName("Menu-div")[0].classList.add('hideme');
    var divs = document.querySelectorAll('.menu-links');
    for (let i = 0; i < divs.length; i++) {
        divs[i].classList.add('hideme');  
    }
}

function rando_songo(){
  let rannsdks = new_playlist_all_array[0][ConstrainedRan(0,total_vids-1)];
  if(current_page!="play"){
      window.open(`play.php?play_vid=${rannsdks}`,"_self");
   }
  else{
    prev_id_count =0;
    let xmlhttp=new XMLHttpRequest();
    xmlhttp.open("POST","redirect.php",true);
    xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    
    next_playlist_song();

    add_view(curr_vid_id);
    
    xmlhttp.send(`work=b&vid_id=${curr_vid_id}`);
    xmlhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
        let temp_strng = xmlhttp.responseText;
        new_vid_data_arr= temp_strng.split('?')
        let temp_src = new_vid_data_arr[3];
        temp_src =  friendly_link(temp_src)

        document.getElementsByClassName("video-src")[0].src = temp_src;
        vid.load();
        change_all_data();
    };} 
  }
}

function search_keydown(){
    setTimeout(function(){

  
    let rannsdks = document.getElementById("search-bar").value;

    let xmlhttp=new XMLHttpRequest();
    xmlhttp.open("POST","./files/body parts/search.php",true);
    xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlhttp.send(`search=${rannsdks}`);
    xmlhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
        document.getElementsByClassName("search-results-ul")[0].innerHTML = xmlhttp.responseText;
    };}
},50)
}

function article_click(x){
    let temp_vid = document.getElementsByClassName(`video-thumbnail${x}`)[0];
    if( temp_vid.paused){
        temp_vid.currentTime=0;
        temp_vid.play()
    }
    else{
        temp_vid.pause()
        temp_vid.currentTime=0;
    }
}

function mix_cross(){
 //document.getElementsByClassName("video-section")[1].scrollIntoView({behavior: 'smooth',block:'start'})
 window.scrollTo(0, 380);
 
}

setInterval(function(){
    current_active_element_id= document.activeElement.id;
    if(current_active_element_id == "search-bar"){
        if(document.getElementById("search-bar").value==""){
            if(document.getElementsByClassName("search-results")[0].classList.contains("hideme")){}
            else{document.getElementsByClassName("search-results")[0].classList.add("hideme");}
        }
        else{
            document.getElementsByClassName("search-results")[0].classList.remove("hideme");
            if(current_page != "play")document.getElementsByClassName("categories")[0].style.zIndex = "auto";
        }
    }
    else{
        if(not_over_search_div) document.getElementsByClassName("search-results")[0].classList.add("hideme")
        if(current_page != "play") if(not_over_search_div){
            if(ismouseoverheadicon == false){ 
                document.getElementsByClassName("categories")[0].style.zIndex = "1";
            }
            else{
                document.getElementsByClassName("categories")[0].style.zIndex = "auto";
            }
        }

    }

},150);


document.addEventListener("keydown", e => {
    
     if(mouse_over_thumbnail !=0 ){
        mouse_over_thumbnail = parseInt(mouse_over_thumbnail);
        
        let vido_temp = document.getElementsByClassName('video-thumbnail')[mouse_over_thumbnail-1];
             //for next 'f'
        if(e.keyCode == 70) {
          if (!document.fullscreenElement) {vido_temp.requestFullscreen();vido_temp.volume=0.4;vido_temp.muted=false;}
          else {document.exitFullscreen(); vido_temp.volume=0;vido_temp.muted=true;}
        }
     }
})


function add_duration(x,y){
    let xmlhttp=new XMLHttpRequest();
    xmlhttp.open("POST","./files/body parts/add duration.php",true);
    xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlhttp.send(`vid_id=${x}&vid_dur=${y}`);
}

function recent_sort(){

}

function show_recent(){
    let down_icon = document.getElementsByClassName('down-arrow-section')[0];
    let recent_section = document.getElementsByClassName('recent-section')[0];
    if(recent_section.offsetHeight > 500){
        recent_section.style.maxHeight = "370px"
        down_icon.style.transform = "rotate(0deg)"
    }
    else{
        recent_section.style.maxHeight = "100%"
        down_icon.style.transform = "rotate(180deg)"
    }
}

function isElementInViewport(x,y) {

    let el = document.getElementsByClassName(`${x}`)[y];

    let rect = el.getBoundingClientRect();

    return rect.bottom > 0 &&
        rect.right > 0 &&
        rect.left < (window.innerWidth || document.documentElement.clientWidth) &&
        rect.top < (window.innerHeight || document.documentElement.clientHeight) ;
}

function friendly_link(temp_src){
    temp_src = temp_src.replaceAll("!1and1!","&")
    temp_src = temp_src.replaceAll("&#39;","\'")
    temp_src = temp_src.replaceAll("&quote&;","\”")
    temp_src = temp_src.replaceAll("&quote;","\“")
    temp_src = temp_src.replaceAll("&quot;","\"")
    temp_src = temp_src.replaceAll("&#43;","+")
    temp_src = temp_src.replaceAll("&#63;","?")
    temp_src = temp_src.replaceAll("#","%23")

    return temp_src;
}

function friendly_text(temp_src){
    temp_src = temp_src.replaceAll("!1and1!","&")
    temp_src = temp_src.replaceAll("&#39;","\'")
    temp_src = temp_src.replaceAll("&quote&;","\”")
    temp_src = temp_src.replaceAll("&quote;","\“")
    temp_src = temp_src.replaceAll("&quot;","\"")
    temp_src = temp_src.replaceAll("&#43;","+")
    temp_src = temp_src.replaceAll("&#63;","?")

    return temp_src;
}

function readyforparcel(temp_word){
    temp_word = temp_word.replaceAll("\”","&quote&;")
    temp_word = temp_word.replaceAll("\“","&quote;")
    temp_word = temp_word.replaceAll("\'","&#39;")
    temp_word = temp_word.replaceAll("\"","&quot;")
    temp_word = temp_word.replaceAll("\+","&#43;")
    temp_word = temp_word.replaceAll("?","&#63;")
    temp_word = temp_word.replaceAll("&","!1and1!")

    return temp_word;
}

function linkify(text) {
    let urlRegex =/(\b(https?|ftp|file):\/\/[-A-Z0-9一-龠ぁ-ゔァ-ヴー+&@#\/%?=×~_|!:,.;()]*[-A-Z0-9一-龠ぁ-ゔァ-ヴー+&@#\/%=×~_|()])/ig;
    return text.replace(urlRegex, function(url) {
        return '<a target="_blank" class="desc-link" href="' + url + '">' + url + '</a>';
    });
}
function vid_timestamp(text){

    let urlRegex =/(?<!:)[0-9]{1,9}:[0-5][0-9]:[0-5][0-9](?!:)/ig;
    text = text.replace(urlRegex, function(url) {
        let time_arr = url.split(":");
        let temp_dur = parseInt(time_arr[time_arr.length-1]) + parseInt(time_arr[time_arr.length-2])*60 + parseInt(time_arr[time_arr.length-3])*60*60

        return '<span class="vid-timestamps" onclick="vid_stamp('+temp_dur+')">' + url +'</span>';
    });

    urlRegex =/(?<!:)([0-5]|)[0-9]:[0-5][0-9](?!:)/ig;

    text = text.replace(urlRegex, function(url) {
        let time_arr = url.split(":");
        let temp_dur = parseInt(time_arr[time_arr.length-1]) + parseInt(time_arr[time_arr.length-2])*60

        return '<span class="vid-timestamps" onclick="vid_stamp('+temp_dur+')">' + url +'</span>';
    });


    return text;
}

function HtmlEncode(s)
{
  var el = document.createElement("div");
  el.innerText = el.textContent = s;
  s = el.innerHTML;
  return s;
}
