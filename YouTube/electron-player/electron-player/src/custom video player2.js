let new_vol = getCookie("new_vol")|| 0.1;
let vid = document.getElementsByClassName("video-playing")[0];

function cumstomvideoplayerupdatottt(){
    let tempos_videososos= document.getElementsByClassName("custom-videopls")[0];
    tempos_videososos.getElementsByTagName("source")[0].src = recieved_param;
    tempos_videososos.load();
    if(tempos_videososos.autoplay){
        switchplayicon("showpause",0);
        mousemove_move(0);
    }
    setTimeout(function(){refreshvolvideopl(0)},100)
    tempos_videososos.addEventListener('loadeddata', function(){
        document.getElementsByClassName("previewcarrier-videosos")[0].getElementsByTagName("source")[0].src = tempos_videososos.getElementsByTagName("source")[0].src;
        document.getElementsByClassName("previewcarrier-videosos")[0].load();
        update_vid_infos(0);
        //if(customcode) get_filesize(0,tempos_videososos.getElementsByTagName("source")[0].src);
        getframerat(0);
        //get_filesize(0,vid.getElementsByTagName("source")[0].src)

    })
    tempos_videososos.volume = new_vol
    tempos_videososos.addEventListener("volumechange",function(){onvideosVol_change(0)} )
    tempos_videososos.addEventListener("playing" , function(){vidosplayer_playing(0)} )
    tempos_videososos.addEventListener("timeupdate" , function(){vidosplayer_playing(0)} )
    tempos_videososos.addEventListener("ended",function(){videosos_endedo(0);} )

    /*tempos_videososos.addEventListener("keydown", e => {

        switch(e.code){
            //captions 'c'
            case "KeyC" : {
                e.preventDefault();
                turnonsubstitleso(0);
            } break;

            //delete history 'del'
            case "NumpadDecimal" : {
                e.preventDefault();
                if(prev_id_count>0){
                    prev_id_count=0;
                    curr_vid_id = prev_id;
                }
                play_history = [];
                prev_id_count = 0;
                prev_id = 0;
                curr_play_index = new_playlist_all_array[0].indexOf(`${curr_vid_id}`);
                //make_icon("delete-history");
                //console.log(`${prev_id} = prev_id; ${play_history} = play history`)
            } break;

            //opposite day 'Num 0'
            case "Numpad0" : {
                e.preventDefault();
                if(oppositeday){ oppositeday  = false; make_icon("not-opposite");}
                else{ oppositeday  = true; make_icon("opposite");}
            } break;

            //increase speed 'Num +'
            case "NumpadAdd" : {
                e.preventDefault();
                let new_rateo = tempos_videososos.playbackRate + 0.125;
                document.getElementsByClassName("custom-videopls")[0].playbackRate = new_rateo;
                if(new_rateo == 1) new_rateo = "Normal"
                document.getElementsByClassName("playback-meter")[0].innerHTML = new_rateo + '<img class="settings-icon" src="./resources/custom video player/icons/chevron_right_white_24dp.svg"></span>';
                show_stattisticso(0,`Playback Speed = ${new_rateo}`)
            } break;
            
            //decrese speed 'Num -'
            case "NumpadSubtract" : {
                e.preventDefault();
                let new_rateo = tempos_videososos.playbackRate - 0.125;
                document.getElementsByClassName("custom-videopls")[0].playbackRate = new_rateo;
                if(new_rateo == 1) new_rateo = "Normal"
                document.getElementsByClassName("playback-meter")[0].innerHTML = new_rateo + '<img class="settings-icon" src="./resources/custom video player/icons/chevron_right_white_24dp.svg"></span>';
                show_stattisticso(0,`Playback Speed = ${new_rateo}`)
            } break;

            //pause 'Space'
            case "Space" : {
                e.preventDefault();
                togglevideoplaypause(0);
            } break;
            
            //options 'o'
            case "KeyO" : {
                e.preventDefault();
                mousemove_move(0);
                settingsoo_clickod(0);
            } break;
            //show Info 'I'
            case "KeyI" : {
                e.preventDefault();
                if(document.getElementsByClassName("video-summoner-divttte")[0].classList.contains("visible-v")) removothecontroloboxo(0)
                else mousemove_move(0)
            } break;

            //seek 'left-right''
            case "ArrowLeft" : {
                e.preventDefault();
                tempos_videososos.currentTime -= 5;
            } break;
            case "ArrowRight" : {
                e.preventDefault();
                tempos_videososos.currentTime += 5;
            } break;

            //loop press 'l'
            case "KeyL" : {
                e.preventDefault();
                if(vid_loop){
                    vid_loop = false
                    tempos_videososos.loop = false;
                    //make_icon("queue");
                    document.getElementsByClassName("loopo-meter")[0].innerText = "OFF";
                }
                else{vid_loop = true;tempos_videososos.loop = true;make_icon("loop"); document.getElementsByClassName("loopo-meter")[0].innerText = "ON"; }
            } break;

            //volume 'up-down'
            //0.02 = 2%
            case "ArrowDown" : {
                e.preventDefault();
                if(tempos_videososos.volume <= 0.02) tempos_videososos.volume = 0
                else tempos_videososos.volume -= 0.020;
                show_stattisticso(0,`Volume = ${Math.round(tempos_videososos.volume*1000)/10}%`)
            } break;
            case "ArrowUp" : {
                e.preventDefault();
                if(tempos_videososos.volume >= 0.98) tempos_videososos.volume = 1
                else tempos_videososos.volume += 0.020;
                show_stattisticso(0,`Volume = ${Math.round(tempos_videososos.volume*1000)/10}%`)
            } break;

            case "F1" : {
                e.preventDefault();
                let prompto = prompt("Please enter new source", "");
                if (prompto != null) new_src(0,prompto)
            } break;
            case "F2" : {
                e.preventDefault();
                let prompto = prompt("Please enter new source title", "");
                if (prompto != null) new_src2(0,prompto)
            } break;
            case "KeyF": {
                e.preventDefault();
                fullscreno_clickod(0)
            } break;
            case "KeyR": {
                if(vid_random){
                    vid_random = false;
                    setCookie("random_vid","false")
                    //make_icon("not-random");
                }
                else{
                    vid_random = true;
                    setCookie("random_vid","true")
                    //make_icon("random");
                }
            } break;
                    
        }
    })*/
    document.getElementsByClassName("video-summoner-divttte3")[0].addEventListener("wheel",function(e){
        //0.05 = 5%
        e.preventDefault();
        if(e.deltaY <0){
            if(tempos_videososos.volume >= 0.95) tempos_videososos.volume = 1
            else tempos_videososos.volume += 0.05;
            onvideosVol_change(0);
            mouseoverocontroloboco = false;
            show_stattisticso(0,`Volume = ${Math.round(tempos_videososos.volume*1000)/10}%`);
        }
        else{
            if(tempos_videososos.volume <= 0.05) tempos_videososos.volume = 0
            else tempos_videososos.volume -= 0.05;
            mouseoverocontroloboco = false;
            onvideosVol_change(0);
            show_stattisticso(0,`Volume = ${Math.round(tempos_videososos.volume*1000)/10}%`)
        }
    });
    
    document.getElementsByClassName("video-summoner-controlboxo-voldiv")[0].addEventListener("wheel",function(e){
        //0.025 = 2.5%
        e.preventDefault();
        if(e.deltaY <0){
            if(tempos_videososos.volume >= 0.975) tempos_videososos.volume = 1
            else tempos_videososos.volume += 0.025;
            onvideosVol_change(0);
            show_stattisticso(0,`Volume = ${Math.round(tempos_videososos.volume*1000)/10}%`);

        }
        else{
            if(tempos_videososos.volume <= 0.025) tempos_videososos.volume = 0
            else tempos_videososos.volume -= 0.025;
            onvideosVol_change(0);
            show_stattisticso(0,`Volume = ${Math.round(tempos_videososos.volume*1000)/10}%`);
        }
    });

    getframerat(0)
    document.getElementsByClassName("video-summoner-controlboxo")[0].addEventListener("mouseover",function(e){
        mouseoverocontroloboco = true;
    })
        document.getElementsByClassName("video-summoner-controlboxo")[0].addEventListener("mouseout",function(e){
        mouseoverocontroloboco = false;
    })
}


function fullscreno_clickod(x){
    just_fullscreened = true;
    let tempos_videososos = document.getElementsByClassName("custom-videopls")[x]
    let outer_vid= document.getElementsByClassName("video-summoner-divttt")[x]
    if (!document.fullscreenElement){
         if(outer_vid.classList.contains("pop-out-parent")) {
            tempos_videososos.classList.remove("pop-out")
            outer_vid.classList.remove("pop-out-parent")
            outer_vid.classList.add("pop-out-parent-temp")
        }
         outer_vid.requestFullscreen();
         ipcRenderer.send("fullscreenon")
         document.getElementsByClassName("pop-out-exit")[0].style.visibility = "hidden"
         outer_vid.classList.add("summoner-div-full")
         tempos_videososos.classList.add("customovideo-fullscreen")
         document.getElementsByClassName("fullscrnvideovid")[x].classList.add("hidemepls")
         //document.getElementsByClassName("theatremodevid")[x].classList.add("hidemepls")
         document.getElementsByClassName("popoutmodvid")[x].classList.add("hidemepls")
         document.getElementsByClassName("extfullscrnvideovid")[x].classList.remove("hidemepls")
         document.getElementsByClassName("video-summoner-divttte3")[0].classList.add("video-summoner-divttte3-fullscreen")
         document.getElementsByClassName("video-summoner-controlboxo")[0].classList.add("video-summoner-controlboxo-fullscreen")
         setTimeout(function(){
            window.screen.orientation.lock("landscape")
            .then( () => {
               // document.getElementsByClassName("debuger-div-bot")[0].innerHTML = `done`
              }
            )
            .catch ( error => {
              //  document.getElementsByClassName("debuger-div-bot")[0].innerHTML = `error`

            });
         },1000)
        }
    else{ 
        document.getElementsByClassName("pop-out-exit")[0].style.visibility = "visible"
         ipcRenderer.send("fullscreenoff")
        tempos_videososos.classList.remove("customovideo-fullscreen")
         outer_vid.classList.remove("summoner-div-full")
         screen.orientation.unlock()
        setTimeout(function(){outer_vid.classList.remove("nocursoronvidododo")},200)
        if(!escape_full)document.exitFullscreen()
        if(outer_vid.classList.contains("pop-out-parent-temp")) {
            tempos_videososos.classList.add("pop-out")
            outer_vid.classList.add("pop-out-parent")
            outer_vid.classList.remove("pop-out-parent-temp")
        }
        else{escape_full = false;console.log("yea")}
        let diciidodo = document.getElementsByClassName("video-summoner-divttte")[x];
        let diciidodotwo = document.getElementsByClassName("video-summoner-controlboxo")[x];
        diciidodo.classList.add("visible-v")
        diciidodotwo.classList.add("visible-v")
        diciidodo.classList.remove("hidden-v")
        diciidodotwo.classList.remove("hidden-v")
         document.getElementsByClassName("popoutmodvid")[x].classList.remove("hidemepls")
         //document.getElementsByClassName("theatremodevid")[x].classList.remove("hidemepls")
        document.getElementsByClassName("fullscrnvideovid")[x].classList.remove("hidemepls")
        document.getElementsByClassName("extfullscrnvideovid")[x].classList.add("hidemepls")
         document.getElementsByClassName("video-summoner-controlboxo")[0].classList.remove("video-summoner-controlboxo-fullscreen")
         document.getElementsByClassName("video-summoner-divttte3")[0].classList.remove("video-summoner-divttte3-fullscreen")
    }
}

function getframerate2(){
    for(let i= 0; i< document.getElementsByClassName("vid-framerateso").length; i++){
        if(!document.getElementsByClassName("custom-videopls")[i].paused){
            let getframeratesosos = document.getElementsByClassName("custom-videopls")[i].getVideoPlaybackQuality().totalVideoFrames
            framratetimeoutarr[i] = new Object({
                src : document.getElementsByClassName("custom-videopls")[i].getElementsByTagName("source")[i],
                time : (function(i){setTimeout(function(){
                        if(!document.getElementsByClassName("custom-videopls")[i].paused){
                            getframeratesosos = document.getElementsByClassName("custom-videopls")[i].getVideoPlaybackQuality().totalVideoFrames - getframeratesosos;
                            if(getframeratesosos > 28 && getframeratesosos< 35) getframeratesosos = 30;
                            else if(getframeratesosos > 22 && getframeratesosos< 26) getframeratesosos = 24;
                            else if(getframeratesosos > 55 && getframeratesosos< 65) getframeratesosos = 60;
                            if(framratetimeoutarr[i].src == document.getElementsByClassName("custom-videopls")[i].getElementsByTagName("source")[i])document.getElementsByClassName("vid-framerateso")[i].textContent = getframeratesosos
                            
                        }},1000)})(i)
            })
        }
    }
}

function plsplaynextovid(){
            prev_id_count =0;
            // let xmlhttp=new XMLHttpRequest();
            // xmlhttp.open("POST","redirect.php",true);
            // xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            next_playlist_song();
            if(prev_id_count==0){play_history.push(curr_vid_id);prev_id=0;}
            ipcRenderer.invoke('getVidUrl', curr_vid_id).then((result) => {
                get_subsready(result.subtitles)
                let temp_src = result.link;
                temp_src =  friendly_link(temp_src);
                document.getElementsByClassName("video-src")[0].src = temp_src;
                document.getElementsByClassName("custom-videopls")[0].load();
                switchplayicon("showpause",0);
            })
            //add_view(curr_vid_id);
            
            // xmlhttp.send(`work=b&vid_id=${curr_vid_id}`);
            // xmlhttp.onreadystatechange = function () {
            //     if (this.readyState == 4 && this.status == 200) {
            //     let temp_strng = xmlhttp.responseText;
            //     new_vid_data_arr= temp_strng.split('?')
            //     let temp_src = new_vid_data_arr[3];
            //     temp_src =  friendly_link(temp_src)
            //     if(!window.location.href.includes("http://localhost")){
            //     temp_src = temp_src.replace("file:///C:/Users/ihars/Downloads/", "/downloads/");
            //     temp_src = temp_src.replace("file:///D:/0-entertainment/", "/entertainment/");
            //     temp_src = temp_src.replace("file:///D:/Video songs/", "/videosongs/");
            //     temp_src = temp_src.replace("file:///D:/Video%20songs/", "/videosongs/");}
            //     document.getElementsByClassName("video-src")[0].src = temp_src;
            //     vid.load();
            //     change_all_data();
            //     switchplayicon("showpause",0);
            // };} 
            
}

function change_all_data(){
    window.history.pushState("object or string", "Title", `/YouTube/play.php?play_vid=${new_vid_data_arr[1]}`); 
    if(prev_id_count==0){play_history.push(new_vid_data_arr[1]);prev_id=0;}
    let temp_title = new_vid_data_arr[2];
    let temp_uploadername = new_vid_data_arr[5];
    temp_title = friendly_text(temp_title);

    let nicw_dato = nice_date(`${new_vid_data_arr[11]}`);

    document.getElementsByClassName("vid-title-p")[0].innerText = temp_title;
    document.title = vid_title.textContent;
    document.getElementsByClassName("video-title")[0].innerText = temp_uploadername;
    document.getElementsByClassName("video-channel-name")[0].innerText = temp_uploadername;
    document.getElementsByClassName("video-title")[0].href = `/comment%20section/Userdatabase/user.php?usr_name=${temp_uploadername}`;
    document.getElementsByClassName("video-channel-name")[0].href = `/comment%20section/Userdatabase/user.php?usr_name=${temp_uploadername}`;

    document.getElementsByClassName("channel-icon")[0].src=new_vid_data_arr[6];
    document.getElementsByClassName("vid-likes-div")[0].innerText = new_vid_data_arr[7];
    document.getElementsByClassName("vid-dislikes-div")[0].innerText = new_vid_data_arr[8];
    document.getElementsByClassName("vid-views-upload-date")[0].innerHTML = `${new_vid_data_arr[10]} views <span style='font-size:12px;'>• </span>${nicw_dato}`
    document.getElementsByClassName("vid-desc-pre")[0].innerHTML = new_desc(new_vid_data_arr[14]);
    check_expand();

    if(new_vid_data_arr[9]=="0"){
    let playana_vid = document.getElementById("playing-video");
    setTimeout(function(){
    let viddurna = Math.ceil(playana_vid.duration);
    add_duration(new_vid_data_arr[1],viddurna);
   
    },1000)}
    
   // document.getElementsByClassName("previewcarrier-videosos")[0].getElementsByTagName("source")[0].src = vid.getElementsByTagName("source")[0].src;
  //  document.getElementsByClassName("previewcarrier-videosos")[0].load();
  //  update_vid_infos(0)
  //  document.getElementsByClassName("pleaserefresh-com")[0].classList.remove("hidemepls")
 //   document.getElementsByClassName("video-play-comments-summoner")[0].innerHTML = "Please Refresh to get new comments" + document.getElementsByClassName("video-play-comments-summoner")[0].innerHTML;
}

function plsplayprevovid(){
    prev_id = play_history[play_history.length-2-prev_id_count];
    console.log(`${prev_id} = prev_id; ${play_history} = play history`)
    if(prev_id == undefined || prev_id == 0){ 
        if(curr_play_index == undefined) curr_play_index = new_playlist_all_array[0].indexOf(`${curr_vid_id}`);
        if(oppositeday) prev_id = new_playlist_all_array[0][curr_play_index+1+prev_id_count];
        else prev_id = new_playlist_all_array[0][curr_play_index-1-prev_id_count];
    }
    prev_id_count++;
    ipcRenderer.invoke('getVidUrl', prev_id).then((result) => {
        get_subsready(result.subtitles);
        let temp_src = result.link;
        temp_src =  friendly_link(temp_src);
        document.getElementsByClassName("video-src")[0].src = temp_src;
        document.getElementsByClassName("custom-videopls")[0].load();
        switchplayicon("showpause",0);
    })
}

function get_subsready(x){
    let temp_subsos;
    if(typeof(x) != "object") temp_subsos = JSON.parse(x)
    else temp_subsos = x;

    if(x != "null" && x != "" && Object.values(temp_subsos.subs)[0].url != "url1" && x != " "){
        first_subs = temp_subsos;
        document.getElementsByClassName("temposos-trackos")[0].src = friendly_link(client_url+ "/YouTube/" + first_subs.loc + Object.values(first_subs.subs)[0].url);
        //document.getElementsByClassName("temposos-trackos")[0].src = url_corrector(document.getElementsByClassName("temposos-trackos")[0].src)
        document.getElementsByClassName("temposos-trackos")[0].classList.remove("nosubtitloso")
        changednewvideoso = true;
            
            if(temp_subsos.autosubs) turnonsubstitleso2()
            else{
                let teracksdivo = document.getElementsByClassName("temposos-trackos")[0]
                document.getElementsByClassName("subiitilesooovideos-div")[0].classList.remove("hidemepls")
                teracksdivo.track.mode="hidden";
                document.getElementsByClassName("subiitilesooovideos")[0].classList.remove("opacitiooneo");
                document.getElementsByClassName("subiitilesooovideos-innerdiv")[0].style.width="0px";
            }
        console.log(`yes subtitles = ${temp_subsos}`)
    }
    else{
        let teracksdivo = document.getElementsByClassName("temposos-trackos")[0]
        teracksdivo.classList.add("nosubtitloso")
        teracksdivo.track.mode="hidden";
        teracksdivo.src = ""
        document.getElementsByClassName("subiitilesooovideos")[0].classList.remove("opacitiooneo")
        document.getElementsByClassName("subiitilesooovideos-div")[0].classList.add("hidemepls")
        document.getElementsByClassName("subiitilesooovideos-innerdiv")[0].style.width="0px";
        console.log(`no subtitles`)

    }
}

function videosos_endedo(x){
    let tempos_videososos= document.getElementsByClassName("custom-videopls")[x];
    document.getElementsByClassName("videos-curretimeo")[x].innerText = "0:00";
    document.getElementsByClassName("video-progressometer-progressed")[x].style.width = "0px";
    document.getElementsByClassName("prev-skip-icnos")[x].classList.remove("hidemepls")
    nextoskip_clickod(x)

    setTimeout(function(){
        if(!tempos_videososos.paused) switchplayicon("showpause",x)
    },300)
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

function togglevideoplaypause(x){
    setTimeout(function(){
        if(!longmousedown){
            if(!document.getElementsByClassName("settings-div")[x].classList.contains("setting-div-show")){
                let tempos_videososos = document.getElementsByClassName("custom-videopls")[x]
                if(tempos_videososos.paused) {play_clickod(x); show_stattisticso(x,"Resume");
                    if(!document.getElementsByClassName("video-summoner-controlboxo")[x].classList.contains("hidden-v")) mousemove_move(x);}
                else {pause_clickod(x); show_stattisticso(x,"Pause")}
            }
            else settingsoo_clickod(x)
        }
        else longmousedown = false;
    },30)
}

document.getElementsByClassName("video-summoner-divttt")[0].addEventListener("mousedown", function(event){
    longmousedowntimout = setTimeout(function(){longmousedown = true},200)
    is_mousedownvid = true;
    earlymouseX = event.screenX;
    earlymouseY = event.screenY;
});
document.getElementsByClassName("video-summoner-divttt")[0].addEventListener("mouseup", function(event){
    clearTimeout(longmousedowntimout)
    is_mousedownvid = false;
    ipcRenderer.invoke('settlenewpos', {x:(event.screenX - earlymouseX),y:(event.screenY - earlymouseY)})
});
document.getElementsByClassName("video-summoner-divttt")[0].addEventListener("mousemove", dragMouse);
document.getElementsByClassName("video-summoner-divttt")[0].addEventListener("mouseleave", ()=>{
    if(is_mousedownvid){
        is_mousedownvid = false;
        ipcRenderer.send("settlemergency")
    }
});


function turnonsubstitleso2(){
    let teracksdivo = document.getElementsByClassName("temposos-trackos")[0]
    changednewvideoso = false
    teracksdivo.track.mode="showing";
    document.getElementsByClassName("subiitilesooovideos")[0].classList.add("opacitiooneo");
    document.getElementsByClassName("subiitilesooovideos-div")[0].classList.remove("hidemepls")
    document.getElementsByClassName("subiitilesooovideos-innerdiv")[0].style.width="30px";

    let default_subs = Object.values(first_subs.subs)[0];

    if(!default_subs.style.noedit){
        if(default_subs.style.editpos){
            setTimeout(function(){
                console.log(default_subs.style.vdist)
                let cueso = document.getElementsByClassName("temposos-trackos")[0].track.cues
                for(let i=0;i< cueso.length;i++){
                    if(default_subs.style.vdist == "default") cueso[i].line = -2
                    else cueso[i].line = parseInt(default_subs.style.vdist)
                }
            }
            ,300)

        }
        let newbg,font_size,text_shadow,font_color,font_family ;

        if(default_subs.style.bg.color == "colorless") newbg = "rgba(0, 0, 0, 0)";
        else newbg = default_subs.style.bg.color;

        if(default_subs.style.font.color  == "default") font_color = "rgb(238, 235, 229)";
        else font_color = default_subs.style.font.color;    

        if(default_subs.style.font.size == "default") font_size = "var(--subFont)";
        else font_size = default_subs.style.font.size;

        if(default_subs.style.font.textShadow  == null) text_shadow = "1px 1px 1px #050000";
        else text_shadow = default_subs.style.font.text_shadow;

        if(default_subs.style.font.family != "default") {
            let temp_fontos =  default_subs.style.font.family;
            font_family = temp_fontos;
            if(!isFontAvailable(temp_fontos)){
                temp_fontos = temp_fontos.replaceAll(" ", "+")
                document.getElementsByClassName("importfont-style")[0].innerHTML = `@import url('https://fonts.googleapis.com/css2?family=${temp_fontos}&display=swap');`
            }
        }
        else{font_family="inherit"}

        document.getElementById("subtitle-styleros").innerHTML=`.default-subtitles::cue{background-color:${newbg};color: ${font_color};font-size: ${font_size};text-shadow: ${text_shadow};font-family: ${font_family};}`;
        document.getElementsByClassName("custom-videopls")[0].classList.add("default-subtitles");
    }
    
}


function dragMouse(e){
    if(is_mousedownvid){
        e = e || window.event;
        e.preventDefault();
        e.screenX - earlymouseX
        e.screenY - earlymouseY
        ipcRenderer.invoke('setnewpos', {x:(e.screenX - earlymouseX),y:(e.screenY - earlymouseY)})
    }
}