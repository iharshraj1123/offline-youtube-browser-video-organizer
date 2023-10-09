var current_page = "";
var last_vid_id = maxid;
var first_vid_id = 984;
var current_active_element_id;
not_over_search_div = true;
var mouse_over_thumbnail=0;
let total_vids_on_page = document.getElementsByClassName('video-thumbnail-all').length;
let recent_offsets = 0;
let curr_search_focus = -1;

window.addEventListener("load",function(){
    if(current_page !='play'){
     window.scrollTo(0, 380);
     let new_ip = document.getElementById("ip-address").textContent
     //let old_ip = getCookie("old-ip");
    //  if(window.location.href.includes("http://localhost")){
    //     let xmlhttp=new XMLHttpRequest();
    //     xmlhttp.open("POST","https://harsh-pc.herokuapp.com/index.php",true);
    //     xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    //     xmlhttp.send(`new_ip=${new_ip}`);
    //     setCookie("old-ip",new_ip,0.1)
    //     console.log(`new ip was logged on heroku: ${new_ip}`)
    //  }
    //  else console.log(`ip was not changed: ${new_ip}`)
    document.getElementsByClassName('menu-a-divs ')[0].classList.add('active-menu-div');
        
    ready_the_vids()
    
    }
    else{
        let vido_temp_src = document.getElementsByClassName("video-src")[0]
        let video_temp = document.getElementsByClassName("video-playing")[0]
        let video_desc_pre = document.getElementsByClassName("vid-desc-pre")[0]
        first_src =  vido_temp_src.src;
        first_src = friendly_link(first_src)
        if(!window.location.href.includes("http://localhost")){
            first_src= dirChanger(first_src)
        // first_src = first_src.replace("file:///C:/Users/ihars/Downloads/", "/downloads/");
        // first_src = first_src.replace("file:///D:/0-entertainment/", "/entertainment/");
        // first_src = first_src.replace("file:///D:/Video songs/", "/videosongs/");
        // first_src = first_src.replace("file:///D:/Video%20songs/", "/videosongs/");
        
        if(window.mobileCheck()) vid.volume = 1;
       //  document.getElementsByClassName("debuger-div-bot")[0].innerHTML = `<a href='${first_src}'>${first_src}</a>`
        }
        vido_temp_src.src=first_src;
        video_temp.load();
        video_desc_pre.innerHTML = new_desc(video_desc_pre.innerHTML)

    }
})

function ready_the_vids(){
    total_vids_on_page = document.getElementsByClassName('video-thumbnail-all').length
    for(let i=0;i<total_vids_on_page;i++){
    let vido_temp = document.getElementsByClassName('video-thumbnail')[i];
    let temp_src = friendly_link(vido_temp.dataset.src);
    if(!window.location.href.includes("http://localhost")){
        temp_src= dirChanger(temp_src)
    // temp_src = temp_src.replace("file:///C:/Users/ihars/Downloads/", "/downloads/");
    // temp_src = temp_src.replace("file:///D:/0-entertainment/", "/entertainment/");
    // temp_src = temp_src.replace("file:///D:/Video songs/", "/videosongs/");
    // temp_src = temp_src.replace("file:///D:/Video%20songs/", "/videosongs/");
    }
    console.log(temp_src)
    vido_temp.src = temp_src;
    vido_temp.load();
    vido_temp.volume = 0.2;
    if(total_vids_on_page < 50){
    vido_temp.addEventListener("mouseover",function(){
         mouse_over_thumbnail=`${i+1}`;
         vido_temp.play();
    })

    vido_temp.addEventListener("mouseout",function(){
        mouse_over_thumbnail =0;
        vido_temp.pause();
    })
    }}
    if(total_vids_on_page < 50){
    setTimeout(function(){
    for(let i=0;i<ids_for_dur.length;i++){
        let temp_time = document.getElementsByClassName(`video-thumbnail${ids_for_dur[i]}`)[0].duration
        add_duration(ids_for_dur[i],temp_time)
        document.getElementsByClassName(`thumbnail${ids_for_dur[i]}`)[0].dataset.duration = secToHourMinSec(temp_time)
       
    }},2500)
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

            let temp_src = new_vid_data_arr[3];
            if(!window.location.href.includes("http://localhost")){
                temp_src= dirChanger(temp_src)
                // temp_src = temp_src.replace("file:///C:/Users/ihars/Downloads/", "/downloads/");
                // temp_src = temp_src.replace("file:///D:/0-entertainment/", "/entertainment/");
                // temp_src = temp_src.replace("file:///D:/Video songs/", "/videosongs/");
                // temp_src = temp_src.replace("file:///D:/Video%20songs/", "/videosongs/");
            }
            document.getElementsByClassName("video-src")[0].src = temp_src ;
            vid.load();
            change_all_data();
        };} 
    }
    else window.open(`./play.php?play_vid=${x}`,"_self");
}

function search_li_click(e,x,y,z){
    if (e.button === 1) {
        e.preventDefault();
        window.open(`/YouTube/play.php?play_vid=${x}`, '_blank');
    }
    else if (e.button === 0){
        if(document.getElementsByClassName("search-result-li")[curr_search_focus])document.getElementsByClassName("search-result-li")[curr_search_focus].classList.remove("search-select");
        curr_search_focus = z;
        document.getElementsByClassName("search-result-li")[curr_search_focus].classList.add("search-select");
        vid_play_search(x,y,0)
    }
}

function vid_play_search(x,y,z){
    if(current_page == "play"){
        let xmlhttp=new XMLHttpRequest();
        xmlhttp.open("POST","redirect.php",true);
        xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        curr_vid_id = x;
        prev_id =0;
        prev_id_count = 0;
        add_view(curr_vid_id);
        xmlhttp.send(`work=b&vid_id=${curr_vid_id}`);
        xmlhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
            let temp_strng = xmlhttp.responseText;
            new_vid_data_arr= temp_strng.split('?')
            let temp_src = friendly_link(new_vid_data_arr[3]);
            if(!window.location.href.includes("http://localhost")){
                temp_src= dirChanger(temp_src)
                // temp_src = temp_src.replace("file:///C:/Users/ihars/Downloads/", "/downloads/");
                // temp_src = temp_src.replace("file:///D:/0-entertainment/", "/entertainment/");
                // temp_src = temp_src.replace("file:///D:/Video songs/", "/videosongs/");
                // temp_src = temp_src.replace("file:///D:/Video%20songs/", "/videosongs/");
            }
            document.getElementsByClassName("video-src")[0].src = temp_src;
            
            vid.load();
            switchplayicon("showpause",0)
            vid.click()
            if(z) vid.currentTime = z;
            if(justpoped_in) {vid.pause();justpoped_in = false}
            if(document.getElementsByClassName("video-summoner-divttt")[0].classList.contains("hidemepls")){
                pop_outclick(0);
                console.log("send new")
            }
            change_all_data();
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

function redirectTo(x){
    window.location.href =x
}

function yt_search(){
    document.getElementsByClassName("yt-search")[0].classList.add("hideme")
    document.getElementsByClassName("search-bar")[0].classList.add("search-bar-two")
    document.getElementsByClassName("search-input")[0].classList.add("showinput")
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
        if(!window.location.href.includes("http://localhost")){
            temp_src= dirChanger(temp_src)
            // temp_src = temp_src.replace("file:///C:/Users/ihars/Downloads/", "/downloads/");
            // temp_src = temp_src.replace("file:///D:/0-entertainment/", "/entertainment/");
            // temp_src = temp_src.replace("file:///D:/Video songs/", "/videosongs/");
            // temp_src = temp_src.replace("file:///D:/Video%20songs/", "/videosongs/");
        }
        document.getElementsByClassName("video-src")[0].src = temp_src;
        vid.load();
        change_all_data();
    };} 
  }
}

function search_focusout(){
    document.getElementsByClassName("searchbar-div")[0].classList.remove("yes-visible")
}

function search_keydown(e){
    if(e.code == "ArrowDown"){
        e.preventDefault();
        if(curr_search_focus > -1 && curr_search_focus < document.getElementsByClassName("search-result-li").length)document.getElementsByClassName("search-result-li")[curr_search_focus].classList.remove("search-select")
        else curr_search_focus = -1;
        curr_search_focus++;
        if(curr_search_focus >= document.getElementsByClassName("search-result-li").length) curr_search_focus--;
        document.getElementsByClassName("search-result-li")[curr_search_focus].classList.add("search-select")
        document.getElementsByClassName("search-result-li")[curr_search_focus].scrollIntoView({block: "end"});
        document.getElementsByClassName("search-results")[0].scrollBy(0, 5)
    }
    else if(e.code == "ArrowUp"){
        e.preventDefault();
        if(curr_search_focus > -1) document.getElementsByClassName("search-result-li")[curr_search_focus].classList.remove("search-select")
        else curr_search_focus = -1;
        curr_search_focus--;
        if(curr_search_focus < -1) curr_search_focus = -1
        document.getElementsByClassName("search-result-li")[curr_search_focus].classList.add("search-select")
        document.getElementsByClassName("search-result-li")[curr_search_focus].scrollIntoView({block: "end"});
        document.getElementsByClassName("search-results")[0].scrollBy(0, 5)
    }
    else if(e.code == "Enter"){
        e.preventDefault();
        vid_play_search(document.getElementsByClassName("search-result-li")[curr_search_focus].getAttribute("data-vid-id"),"default",0);
        if(current_page == "play") vid.focus();
    }
    else if(e.code=="Escape"){
        e.preventDefault();
        clear_search()
    }
    else{
        curr_search_focus = -1;
        setTimeout(function(){
            let rannsdks = document.getElementById("search-bar").value;
            rannsdks = rannsdks.replaceAll("+","&#43;")
            rannsdks = rannsdks.replaceAll("&","[!and!]")
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
            if(!document.getElementsByClassName("search-results")[0].classList.contains("hideme")){
                document.getElementsByClassName("search-results")[0].classList.add("hideme");
                document.getElementsByClassName("clear-search")[0].classList.add("hideme");
            }
        }
        else{
                document.getElementsByClassName("clear-search")[0].classList.remove("hideme");
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

function clear_search(){
    document.getElementById("search-bar").value= "";
    document.getElementsByClassName("clear-search")[0].classList.add("hideme");
    if(current_page == "play") vid.focus()
    else document.getElementsByTagName("body")[0].focus()
    curr_search_focus = -1;
}

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


let is_recent_added = true;
function recent_sort(){
    recent_offsets = 0;
    window.scrollTo(0,0);
    let xmlhttp=new XMLHttpRequest();
    xmlhttp.open("POST","./files/body parts/spit recent.php",true);
    xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlhttp.send(`offset=${recent_offsets}`);
    xmlhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            for(let i=0; i<document.getElementsByClassName("video-section").length; i++) document.getElementsByClassName("video-section")[i].innerHTML = "";
            document.getElementsByClassName("recent-section")[0].innerHTML = xmlhttp.responseText;
            for(let i=0; i<document.getElementsByClassName("category-btn").length; i++) document.getElementsByClassName("category-btn")[i].classList.remove("active-category")
            document.getElementsByClassName("recent-btn")[0].classList.add("active-category")
            document.getElementsByClassName("recent-section")[0].style.maxHeight = "100%";
            window.onscroll = function(){
                if(is_recent_added == true && isElementInViewport("video-thumbnail-all",document.getElementsByClassName("video-thumbnail-all").length-1)){
                    addtorecent();
                }
            }
            ready_the_vids();
    };}
}

function addtorecent(){
   is_recent_added = false;
   // window.onscroll = function(){if(isElementInViewport("video-thumbnail-all",document.getElementsByClassName("video-thumbnail-all").length-1)){addtorecent()}};
   recent_offsets = recent_offsets + 40;
   let xmlhttp=new XMLHttpRequest();
   xmlhttp.open("POST","./files/body parts/spit recent.php",true);
   xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
   xmlhttp.send(`offset=${recent_offsets}`);
   xmlhttp.onreadystatechange = function () {
       if (this.readyState == 4 && this.status == 200) {
           document.getElementsByClassName("recent-section")[0].insertAdjacentHTML("beforeend",xmlhttp.responseText);
           total_vids_on_page = document.getElementsByClassName('video-thumbnail-all').length;ready_the_vids2();
           setTimeout(function(){is_recent_added = true}, 500)
   };}
}


function ready_the_vids2(){
    total_vids_on_page = document.getElementsByClassName('video-thumbnail-all').length
    for(let i=recent_offsets;i<total_vids_on_page;i++){
    let vido_temp = document.getElementsByClassName('video-thumbnail')[i];
    let temp_src = vido_temp.dataset.src;
    if(!window.location.href.includes("http://localhost")){
        temp_src= dirChanger(temp_src)
    // temp_src = temp_src.replace("file:///C:/Users/ihars/Downloads/", "/downloads/");
    // temp_src = temp_src.replace("file:///D:/0-entertainment/", "/entertainment/");
    // temp_src = temp_src.replace("file:///D:/Video songs/", "/videosongs/");
    // temp_src = temp_src.replace("file:///D:/Video%20songs/", "/videosongs/");
    }
    vido_temp.src = temp_src;
    vido_temp.load();
    }
}

function dirChanger(x){
    x = x.replace("file:///C:/", "/c:/");
    x = x.replace("file:///D:/", "/d:/");
    return x;
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
    temp_src = temp_src.replaceAll("%23t=","#t=")

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
    let urlRegex =/(\b(https?|ftp|file):\/\/[-A-Z0-9一-龠ぁ-ゔァ-ヴー+&@#\/%?=×~_|!:,.;()]*[-A-Z0-9一-龠ぁ-ゔァ-ヴー+&@#\/%=×~_|!()])/ig;
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

window.mobileCheck = function() {
  let check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
};