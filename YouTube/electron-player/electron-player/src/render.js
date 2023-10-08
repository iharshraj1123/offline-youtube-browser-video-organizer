let electronApp = true;
let recieved_param;

//show_vid_mode
function make_icon(x){
    /*
    let icon_divod = document.getElementsByClassName("show_vid_mode")[0];
    if(x=="loop"){
        icon_divod.classList.add("hideme")
        icon_divod.classList.remove("hideme")
        icon_divod.innerHTML='<img style="width:90px;margin-left:5%;margin-top:5%;opacity:0.9" src="./resources/icons/loop_white_24dp.svg">'
        setTimeout(function(){icon_divod.classList.add("hideme")},300)
    }
    else if(x=="queue"){
        icon_divod.classList.add("hideme")
        icon_divod.classList.remove("hideme")
        icon_divod.innerHTML='<img style="width:90px;margin-left:5%;margin-top:6%;opacity:0.9" src="./resources/icons/queue_music_white_24dp.svg">'
        setTimeout(function(){icon_divod.classList.add("hideme")},400)
    }
    else if(x=="random"){
        icon_divod.classList.add("hideme")
        icon_divod.classList.remove("hideme")
        icon_divod.innerHTML='<img style="width:90px;margin-left:5%;margin-top:6%;opacity:0.9" src="./resources/icons/shuffle_white_24dp.svg">'
        setTimeout(function(){icon_divod.classList.add("hideme")},400)
    }
    else if(x=="not-random"){
        icon_divod.classList.add("hideme")
        icon_divod.classList.remove("hideme")
        icon_divod.innerHTML='<img style="width:90px;margin-left:5%;margin-top:6%;opacity:0.9" src="./resources/icons/repeat_white_24dp.svg">'
        setTimeout(function(){icon_divod.classList.add("hideme")},400)
    }
    else if(x == "opposite"){
        icon_divod.classList.add("hideme")
        icon_divod.classList.remove("hideme")
        icon_divod.innerHTML='<img style="width:90px;margin-left:5%;margin-top:6%;opacity:0.9" src="./resources/icons/keyboard_return_white_24dp.svg">'
        setTimeout(function(){icon_divod.classList.add("hideme")},400)
    }
    else if(x == "not-opposite"){
        icon_divod.classList.add("hideme")
        icon_divod.classList.remove("hideme")
        icon_divod.innerHTML='<img style="width:90px;margin-left:5%;margin-top:6%;opacity:0.9" src="./resources/icons/arrow_forward_white_24dp.svg">'
        setTimeout(function(){icon_divod.classList.add("hideme")},400)
    }
    else if(x == "delete-history"){
        icon_divod.classList.add("hideme")
        icon_divod.classList.remove("hideme")
        icon_divod.innerHTML='<img style="width:55px;margin-left:26%;margin-top:22%;opacity:0.9" src="./resources/icons/auto_delete_white_24dp.svg">'
        setTimeout(function(){icon_divod.classList.add("hideme")},400)
    }*/
}

function get_vidformat(){
    let temp_Arerr = document.getElementsByClassName("video-src")[0].src.split(".");
    return temp_Arerr[temp_Arerr.length-1]
}

function popoutexit(x){
    let xmlhttp=new XMLHttpRequest();
    xmlhttp.open("POST",`${client_url}/YouTube/files/body parts/pip.php`,true);
    xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlhttp.send(`work=b&vid_id=${curr_vid_id}&time=${vid.currentTime}&play_history=${play_history}`);

    let tempos_videososos= document.getElementsByClassName("custom-videopls")[0];
    tempos_videososos.getElementsByTagName("source")[0].src = "";
    tempos_videososos.load();
    ipcRenderer.send("closeApp")
}

ipcRenderer.on('asynchronous-message', function (evt, message) {
    recieved_param = JSON.parse(decodeURI(message));
    console.log("1=>>")
    console.log(recieved_param)
    rerender_vid(recieved_param)
});

ipcRenderer.on('restart-app', function (evt, message) {
    console.log("2=>>")
    recieved_param = JSON.parse(decodeURI(message));
    console.log(recieved_param)
    rerender_vid(recieved_param)
});

ipcRenderer.on('debuggero', function (evt, message) {
    console.log(message)
});

// id : curr_vid_id
// opposite_day: oppositeday,
// loop: vid_loop,
// src: `${the_vidos.getElementsByTagName("source")[0].src}?#t=${the_vidos.currentTime}`,
// playlist_all_arr: new_playlist_all_array[0],
function rerender_vid(recieved_param){

    curr_vid_id = recieved_param.id;
    last_vid_id = recieved_param.last_id;
    total_vids = recieved_param.total_vids;
    client_url = recieved_param.client_url;
    
    let tempos_videososos= document.getElementsByClassName("custom-videopls")[0];
    tempos_videososos.getElementsByTagName("source")[0].src = url_corrector(recieved_param.src,client_url);
    tempos_videososos.load();
    let sub_tempos = recieved_param.subs
    console.log(recieved_param)
    if(recieved_param.random){
        vid_random = true;
        document.getElementsByClassName("rando-meter")[0].innerText = "ON";
    }
    else {
        vid_random = false;
        document.getElementsByClassName("rando-meter")[0].innerText = "OFF";
    }
    if(recieved_param.loop){
        vid_loop = true;
        tempos_videososos.loop = true;
        document.getElementsByClassName("loopo-meter")[0].innerText = "ON";
    }
    else{
        vid_loop = false;
        tempos_videososos.loop = false;
        document.getElementsByClassName("loopo-meter")[0].innerText = "OFF";
    }
    if(recieved_param.opposite_day){
        oppositeday  = true;
    }
    new_playlist_all_array = recieved_param.playlist_all_arr;
    play_history = recieved_param.play_history;
    first_subs = sub_tempos
    get_subsready(sub_tempos)
}

function url_corrector(temp_src){
   temp_src = temp_src.replace("file:///C:", `${client_url}/c:`);
   temp_src = temp_src.replace("file:///D:", `${client_url}/d:`);
   console.log(temp_src)
   return temp_src
}