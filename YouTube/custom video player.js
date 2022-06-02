let nocursoonfulloscreno;
let mouseoverocontroloboco = false;
let just_fullscreened = false;
let first_time_getframe = true;

//this functions gets called when page loads
function cumstomvideoplayerupdatottt(){
    let tempos_videososos= document.getElementsByClassName("custom-videopls")[0];
    if(tempos_videososos.autoplay){
        switchplayicon("showpause",0);
        mousemove_move(0);
    }
    setTimeout(function(){refreshvolvideopl(0)},100)
    tempos_videososos.addEventListener('loadeddata', function(){
        update_vid_infos(0);
    })
    

    tempos_videososos.addEventListener("volumechange",function(){onvideosVol_change(0)} )
    tempos_videososos.addEventListener("playing" , function(){vidosplayer_playing(0)} )
    tempos_videososos.addEventListener("timeupdate" , function(){vidosplayer_playing(0)} )
    tempos_videososos.addEventListener("ended",function(){videosos_endedo(0);} )

    tempos_videososos.addEventListener("keydown", e => {

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
                    play_history = [];
                }
                prev_id_count = 0;
                curr_play_index = new_playlist_all_array[0].indexOf(`${curr_vid_id}`);
                make_icon("delete-history");
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
                    make_icon("queue");
                    document.getElementsByClassName("loopo-meter")[0].innerText = "OFF";
                }
                else{vid_loop = true;tempos_videososos.loop = true;make_icon("loop"); document.getElementsByClassName("loopo-meter")[0].innerText = "ON"; }
            } break;

            //volume 'up-down'
            case "ArrowDown" : {
                e.preventDefault();
                if(tempos_videososos.volume < 0.06) tempos_videososos.volume = 0
                else tempos_videososos.volume -= 0.05;
                show_stattisticso(0,`Volume = ${Math.round(tempos_videososos.volume*1000)/10}%`)
            } break;
            case "ArrowUp" : {
                e.preventDefault();
                if(tempos_videososos.volume > 0.94) tempos_videososos.volume = 1
                else tempos_videososos.volume += 0.05;
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
                    
        }
        
    })
    
    document.getElementsByClassName("video-summoner-divttte3")[0].addEventListener("wheel",function(e){
        e.preventDefault();
        if(e.deltaY <0){
            if(tempos_videososos.volume > 0.94) tempos_videososos.volume = 1
            else tempos_videososos.volume += 0.05;
            onvideosVol_change(0);
            mouseoverocontroloboco = false;
            show_stattisticso(0,`Volume = ${Math.round(tempos_videososos.volume*1000)/10}%`);
        }
        else{
            if(tempos_videososos.volume < 0.06) tempos_videososos.volume = 0
            else tempos_videososos.volume -= 0.05;
            mouseoverocontroloboco = false;
            onvideosVol_change(0);
            show_stattisticso(0,`Volume = ${Math.round(tempos_videososos.volume*1000)/10}%`)
        }
    });
    
    document.getElementsByClassName("video-summoner-controlboxo-voldiv")[0].addEventListener("wheel",function(e){
        e.preventDefault();
        if(e.deltaY <0){
            if(tempos_videososos.volume > 0.97) tempos_videososos.volume = 1
            else tempos_videososos.volume += 0.025;
            onvideosVol_change(0);
            show_stattisticso(0,`Volume = ${Math.round(tempos_videososos.volume*1000)/10}%`);

        }
        else{
            if(tempos_videososos.volume < 0.03) tempos_videososos.volume = 0
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

    document.getElementsByClassName("previewcarrier-videosos")[0].getElementsByTagName("source")[0].src = tempos_videososos.getElementsByTagName("source")[0].src;
    let temp_src=document.getElementsByClassName("previewcarrier-videosos")[0].getElementsByTagName("source")[0].src;
    if(!window.location.href.includes("http://localhost")){
        temp_src = temp_src.replace("file:///C:/Users/ihars/Downloads/", "/downloads/");
        temp_src = temp_src.replace("file:///D:/0-entertainment/", "/entertainment/");
        temp_src = temp_src.replace("file:///D:/Video songs/", "/videosongs/");
        temp_src = temp_src.replace("file:///D:/Video%20songs/", "/videosongs/");
    }
    document.getElementsByClassName("previewcarrier-videosos")[0].getElementsByTagName("source")[0].src = temp_src
    document.getElementsByClassName("previewcarrier-videosos")[0].load();
}

function update_vid_infos(x){
    let tempos_videososos= document.getElementsByClassName("custom-videopls")[x];
    let quality_vidos;
    function gcd (a, b) {
        return (b == 0) ? a : gcd (b, a%b);
    }
    let woo = tempos_videososos.videoWidth
    let hoo = tempos_videososos.videoHeight
    let roo = gcd(woo,hoo)
    switch(tempos_videososos.videoHeight){
        case 1440: quality_vidos = " (2K QHD)";break;
        case 2160: quality_vidos = " (4K UHD)";break;
        case 1080: quality_vidos = " (FHD)";break;
        case 720: quality_vidos = " (HD)";break;
        default:  quality_vidos = "";
    }

    document.getElementsByClassName("vid-lengthos")[x].innerText = `${tempos_videososos.duration} seconds`;
    document.getElementsByClassName("vid-sourceos")[x].innerText = decodeURIComponent(tempos_videososos.getElementsByTagName("source")[0].src);
    document.getElementsByClassName("vid-farmatos")[x].innerText = tempos_videososos.getElementsByTagName("source")[0].src.split(".")[tempos_videososos.getElementsByTagName("source")[0].src.split(".").length-1];
    document.getElementsByClassName("vid-quality")[x].innerText = `${hoo}p${quality_vidos}`;
    document.getElementsByClassName("vid-asprat")[x].innerText = `${woo/roo}:${hoo/roo}`;
    document.getElementsByClassName("vid-dimensos")[x].innerText =`${woo}×${hoo}`;
}

function do_the_vidloop(x){
    let tempos_videososos= document.getElementsByClassName("custom-videopls")[x];
    if(vid_loop){
        vid_loop = false
        tempos_videososos.loop = false;
        make_icon("queue");
        document.getElementsByClassName("loopo-meter")[x].innerText = "OFF";
        settingsoo_clickod(x);
    }
    else{vid_loop = true;tempos_videososos.loop = true;make_icon("loop"); document.getElementsByClassName("loopo-meter")[x].innerText = "ON";settingsoo_clickod(x)}
}

//shows change in vol and stuff on right top corner
let shdjsopdjpsodjs;
function show_stattisticso(x,y){
    clearTimeout(shdjsopdjpsodjs);
    document.getElementsByClassName("show-statistics-videomogoso")[x].innerText = y;
    document.getElementsByClassName("show-statistics-videomogoso")[x].classList.remove("hidemepls")
    shdjsopdjpsodjs = setTimeout(() => {
    document.getElementsByClassName("show-statistics-videomogoso")[x].classList.add("hidemepls")
        
    }, 500);
}

function videosos_endedo(x){
    let tempos_videososos= document.getElementsByClassName("custom-videopls")[x];
    document.getElementsByClassName("videos-curretimeo")[x].innerText = "0:00";
    document.getElementsByClassName("video-progressometer-progressed")[x].style.width = "0px";
    document.getElementsByClassName("prev-skip-icnos")[0].classList.remove("hidemepls")

    setTimeout(function(){
        if(!tempos_videososos.paused) switchplayicon("showpause",x)
    },300)
}

//play button clicked on video controller
function play_clickod(x){
    document.getElementsByClassName("custom-videopls")[x].play()
    switchplayicon("showpause",x)
    refreshvolvideopl(x)
}

function pause_clickod(x){
    document.getElementsByClassName("custom-videopls")[x].pause()
    switchplayicon("showplay",x)
}

function nextoskip_clickod(x){
    document.getElementsByClassName("video-progressometer-progressed")[x].style.width = "0px"
    document.getElementsByClassName("prev-skip-icnos")[0].classList.remove("hidemepls")
    plsplaynextovid()
}

function previoskip_clickod(x){
    document.getElementsByClassName("video-progressometer-progressed")[x].style.width = "0px"
    plsplayprevovid();

}

function volume_clickod(x){
    let tempos_videososos = document.getElementsByClassName("custom-videopls")[x]
    if(tempos_videososos.muted || tempos_videososos.volume == 0){
        tempos_videososos.muted = false;
        if(tempos_videososos.volume > 0.4) switchvolicon("highvol",x)
        if(tempos_videososos.volume == 0){ switchvolicon("lowvol",x);  tempos_videososos.volume = 0.2;}
        else switchvolicon("lowvol",x)
    }
    else{
        tempos_videososos.muted = true;
        switchvolicon("muted",x)
    }
}

function theatremod_clickod(){
    transition()
}

function settingsoo_clickod(x){
    let setting_divoo = document.getElementsByClassName("settings-div")[x]

    if(setting_divoo.classList.contains("setting-div-show")){
        backtomainset(x)
        document.getElementsByClassName("settingsoovideos")[x].classList.remove("rotate20deg")
        setting_divoo.classList.remove("setting-div-show")
        setting_divoo.style.height = "0px"
    }
    else{
        document.getElementsByClassName("settingsoovideos")[x].classList.add("rotate20deg")
        setting_divoo.classList.add("setting-div-show")
        setting_divoo.style.height = `${document.getElementsByClassName("settings-maino")[x].offsetHeight}px`
    }
}

function backtomainset(x){
    document.getElementsByClassName("settings-maino")[x].classList.remove("setting-menu-hide")
    document.getElementsByClassName("settings-playback-menu")[x].classList.remove("setting-menu-show")
    document.getElementsByClassName("vid-info-div")[x].classList.remove("show-data-info")
    document.getElementsByClassName("settings-div")[x].style.transition = "all 0s"
    document.getElementsByClassName("settings-div")[x].style.height = `${document.getElementsByClassName("settings-maino")[x].offsetHeight}px`
    setTimeout(function(){document.getElementsByClassName("settings-div")[x].style.transition = "width 0.3s, height 0.3s"},10) 
}

function playback_clickod(x){
    document.getElementsByClassName("settings-maino")[x].classList.add("setting-menu-hide")
    document.getElementsByClassName("settings-playback-menu")[x].classList.add("setting-menu-show")
    document.getElementsByClassName("settings-div")[x].style.height = `${document.getElementsByClassName("settings-playback-menu")[x].offsetHeight}px`
}

function vid_playbacko(x,y){
    document.getElementsByClassName("custom-videopls")[x].playbackRate = y;
    if(y == 1) y = "Normal"
    document.getElementsByClassName("playback-meter")[x].innerHTML = y + '<img class="settings-icon" src="./resources/custom video player/icons/chevron_right_white_24dp.svg"></span>';
    backtomainset(x);
}


function give_video_infop(x){
    settingsoo_clickod(x);
    document.getElementsByClassName("vid-info-div")[x].classList.add("show-data-info");
}

function show_timeline(x){
    clearTimeout(nocursoonfulloscreno);
    let diciidodo = document.getElementsByClassName("video-summoner-divttte")[x];
    let diciidodotwo = document.getElementsByClassName("video-summoner-controlboxo")[x];
    let diciidodothree = document.getElementsByClassName("video-summoner-divttt")[x];

    diciidodo.classList.add("visible-v")
    diciidodotwo.classList.add("visible-v")
    diciidodo.classList.remove("hidden-v")
    diciidodotwo.classList.remove("hidden-v")
    diciidodothree.classList.remove("nocursoronvidododo");
}

function fullscreno_clickod(x){
    just_fullscreened = true;
    let tempos_videososos = document.getElementsByClassName("custom-videopls")[x]
    if (!document.fullscreenElement){
        let outer_vid= document.getElementsByClassName("video-summoner-divttt")[0]
         outer_vid.requestFullscreen();
         tempos_videososos.classList.add("customovideo-fullscreen")
         document.getElementsByClassName("fullscrnvideovid")[x].classList.add("hidemepls")
         document.getElementsByClassName("theatremodevid")[x].classList.add("hidemepls")
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
        tempos_videososos.classList.remove("customovideo-fullscreen")
        screen.orientation.unlock()
        setTimeout(function(){document.getElementsByClassName("video-summoner-divttt")[0].classList.remove("nocursoronvidododo")},200)
        document.exitFullscreen()
        let diciidodo = document.getElementsByClassName("video-summoner-divttte")[x];
        let diciidodotwo = document.getElementsByClassName("video-summoner-controlboxo")[x];
        diciidodo.classList.add("visible-v")
        diciidodotwo.classList.add("visible-v")
        diciidodo.classList.remove("hidden-v")
        diciidodotwo.classList.remove("hidden-v")
        document.getElementsByClassName("theatremodevid")[x].classList.remove("hidemepls")
        document.getElementsByClassName("fullscrnvideovid")[x].classList.remove("hidemepls")
        document.getElementsByClassName("extfullscrnvideovid")[x].classList.add("hidemepls")
         document.getElementsByClassName("video-summoner-controlboxo")[0].classList.remove("video-summoner-controlboxo-fullscreen")
         document.getElementsByClassName("video-summoner-divttte3")[0].classList.remove("video-summoner-divttte3-fullscreen")
    }
}

function transition(){
    if(!vid.classList.contains("heightcinema")){
        vid.classList.add("heightcinema");
        document.getElementsByClassName("html-tag")[0].classList.add("scroll-inv")
        document.getElementsByClassName("outer-header")[0].classList.add("hideme")
    }
    else{
        vid.classList.remove("heightcinema");
        document.getElementsByClassName("html-tag")[0].classList.remove("scroll-inv")
        document.getElementsByClassName("outer-header")[0].classList.remove("hideme")
    }
}

function switchplayicon(x,y){
    if(x=="showpause"){
        document.getElementsByClassName("pause-buttonos-video")[y].classList.remove("hidemepls")
        document.getElementsByClassName("play-buttonos-video")[y].classList.add("hidemepls")
    }
    else{
        document.getElementsByClassName("pause-buttonos-video")[y].classList.add("hidemepls")
        document.getElementsByClassName("play-buttonos-video")[y].classList.remove("hidemepls")
    }
}

function switchvolicon(x,y){
    if(x=="lowvol"){
        document.getElementsByClassName("mutevol-videopl-icnos")[y].classList.add("hidemepls")
        document.getElementsByClassName("lowvol-videopl-icnos")[y].classList.remove("hidemepls")
        document.getElementsByClassName("highvol-videopl-icnos")[y].classList.add("hidemepls")
    }
    else if(x=="highvol"){
        document.getElementsByClassName("mutevol-videopl-icnos")[y].classList.add("hidemepls")
        document.getElementsByClassName("lowvol-videopl-icnos")[y].classList.add("hidemepls")
        document.getElementsByClassName("highvol-videopl-icnos")[y].classList.remove("hidemepls")
    }
    else{
        document.getElementsByClassName("mutevol-videopl-icnos")[y].classList.remove("hidemepls")
        document.getElementsByClassName("lowvol-videopl-icnos")[y].classList.add("hidemepls")
        document.getElementsByClassName("highvol-videopl-icnos")[y].classList.add("hidemepls")
    }
}

function refreshvolvideopl(x){
    let tempos_videososos= document.getElementsByClassName("custom-videopls")[x];
    if(tempos_videososos.volume > 0.4 && !tempos_videososos.muted) switchvolicon("highvol",0)
    else if(tempos_videososos.volume == 0 || tempos_videososos.muted) switchvolicon("muted",0)
    else switchvolicon("lowvol",0)
}

function vidosplayer_playing(x){
    
    let tempos_progreso = document.getElementsByClassName("video-progressometer-progressed")[x]
    let tempos_videososos = document.getElementsByClassName("custom-videopls")[x]
    if(!tempos_videososos.paused)switchplayicon("showpause",x)
    else switchplayicon("showplay",x)
    let temposos_tempwidtho = (tempos_videososos.currentTime/tempos_videososos.duration)*100
    tempos_progreso.style.width = `${temposos_tempwidtho}%`

    document.getElementsByClassName("videos-curretimeo")[x].innerText = secToHourMinSec(tempos_videososos.currentTime)
    if(!tempos_videososos.duration)document.getElementsByClassName("videos-dureationtimeo")[x].innerText = "0:00";
    setTimeout(function(){if(tempos_videososos.duration)document.getElementsByClassName("videos-dureationtimeo")[x].innerText = secToHourMinSec(tempos_videososos.duration)},200)
}

function setvideoometro(x,event){
    let vid_mouse_cordino_x = event.clientX;
    let vidoellmeterooffsets = document.getElementsByClassName('video-progressometer-outer')[x].getBoundingClientRect();
    let tempos_videososos = document.getElementsByClassName("custom-videopls")[x];
    let requorosds = ((vid_mouse_cordino_x-vidoellmeterooffsets.left)/document.getElementsByClassName("video-progressometer-outer")[x].offsetWidth);
    tempos_videososos.currentTime = requorosds*tempos_videososos.duration;
    document.getElementsByClassName("video-progressometer-progressed")[x].style.transition = "0s";
    document.getElementsByClassName("video-progressometer-progressed")[x].style.width = `${requorosds*100}%`
    setTimeout(function(){document.getElementsByClassName("video-progressometer-progressed")[x].style.transition = "width 0.2s linear"},100);
}

function setvolumometro(x,event){
    let vid_mouse_cordino_x = event.clientX;
    let volmeterooffsets = document.getElementsByClassName('vidoevolumo-meter-outer')[x].getBoundingClientRect();
    document.getElementsByClassName("custom-videopls")[x].volume = (vid_mouse_cordino_x-volmeterooffsets.left)/document.getElementsByClassName("vidoevolumo-meter-outer")[x].offsetWidth;
}

function onvideosVol_change(x){
    refreshvolvideopl(x)
    let tempos_videososos = document.getElementsByClassName("custom-videopls")[x]
    document.getElementsByClassName("vidoevolumo-meter-progressometer")[x].style.width = `${(document.getElementsByClassName("vidoevolumo-meter-outer")[x].offsetWidth)*(tempos_videososos.volume)}px`
}

function togglevideoplaypause(x){
    if(!document.getElementsByClassName("settings-div")[x].classList.contains("setting-div-show")){
        let tempos_videososos = document.getElementsByClassName("custom-videopls")[x]
        if(tempos_videososos.paused) {play_clickod(x); show_stattisticso(x,"Resume");
            if(!document.getElementsByClassName("video-summoner-controlboxo")[x].classList.contains("hidden-v")) mousemove_move(x);}
        else {pause_clickod(x); show_stattisticso(x,"Pause")}
    }
    else settingsoo_clickod(x)
}

function mousemove_move(x){
    if(!just_fullscreened){
        let tempos_videososos = document.getElementsByClassName("custom-videopls")[x];
        clearTimeout(nocursoonfulloscreno);
        let diciidodo = document.getElementsByClassName("video-summoner-divttte")[x];
        let diciidodotwo = document.getElementsByClassName("video-summoner-controlboxo")[x];
        let diciidodothree = document.getElementsByClassName("video-summoner-divttt")[x];

        diciidodo.classList.remove("hidden-v")
        diciidodotwo.classList.remove("hidden-v")
        diciidodo.classList.add("visible-v")
        diciidodotwo.classList.add("visible-v")

        diciidodothree.classList.remove("nocursoronvidododo");
        nocursoonfulloscreno = setTimeout(function(){
            if(!tempos_videososos.paused && mouseoverocontroloboco == false && !document.getElementsByClassName("settings-div")[x].classList.contains("setting-div-show")){
                diciidodothree.classList.add("nocursoronvidododo");
                diciidodo.classList.remove("visible-v")
                diciidodotwo.classList.remove("visible-v")
                diciidodo.classList.add("hidden-v")
                diciidodotwo.classList.add("hidden-v")
            }
        },1700)
    }
    else {
        let tempos_videososos = document.getElementsByClassName("custom-videopls")[x];
        let diciidodo = document.getElementsByClassName("video-summoner-divttte")[x];
        let diciidodotwo = document.getElementsByClassName("video-summoner-controlboxo")[x];
        let diciidodothree = document.getElementsByClassName("video-summoner-divttt")[x];

        just_fullscreened = false;
        nocursoonfulloscreno = setTimeout(function(){
            if(!tempos_videososos.paused && !document.getElementsByClassName("settings-div")[x].classList.contains("setting-div-show")){
                diciidodothree.classList.add("nocursoronvidododo");
                diciidodo.classList.remove("visible-v")
                diciidodotwo.classList.remove("visible-v")
                diciidodo.classList.add("hidden-v")
                diciidodotwo.classList.add("hidden-v")
            }
        },1500)
    }
}

function removothecontroloboxo(x){
    let tempos_videososos = document.getElementsByClassName("custom-videopls")[x];
    clearTimeout(nocursoonfulloscreno);
    let diciidodo = document.getElementsByClassName("video-summoner-divttte")[x];
    let diciidodotwo = document.getElementsByClassName("video-summoner-controlboxo")[x];
    let diciidodothree = document.getElementsByClassName("video-summoner-divttt")[x];
    if(!tempos_videososos.paused){
        diciidodothree.classList.add("nocursoronvidododo");
        diciidodo.classList.remove("visible-v")
        diciidodotwo.classList.remove("visible-v")
        diciidodo.classList.add("hidden-v")
        diciidodotwo.classList.add("hidden-v")
    }
}
let changednewvideoso = false;

function turnonsubstitleso(x){
    let teracksdivo = document.getElementsByClassName("temposos-trackos")[x]
    if(!teracksdivo.classList.contains("nosubtitloso")){
        if(teracksdivo.track.mode != "showing"|| changednewvideoso == true){
            changednewvideoso = false
            teracksdivo.track.mode="showing";
            document.getElementsByClassName("subiitilesooovideos")[x].classList.add("opacitiooneo");
            document.getElementsByClassName("subiitilesooovideos-div")[x].classList.remove("hidemepls")
            document.getElementsByClassName("subiitilesooovideos-innerdiv")[x].style.width="30px";
            if(customcode) {
            let sending_id;
            if(prev_id == 0) sending_id = curr_vid_id
            else sending_id = prev_id;
            if(!first_subs.autosubs){ 
                    first_subs.autosubs = true;
                    let new_subs = JSON.stringify(first_subs);
            
                    let xmlhttp=new XMLHttpRequest();
                    xmlhttp.open("POST","./files/body parts/edit captions.php",true);
                    xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                    xmlhttp.send(`work=b&vid_id=${sending_id}&new_captions=${new_subs}`);
                }
            }

            let default_subs = Object.values(first_subs.subs)[0];
            if(!default_subs.style.noedit){
                setTimeout(function(){
                    let cueso = document.getElementsByClassName("temposos-trackos")[0].track.cues
                    for(let i=0;i< cueso.length;i++){
                        
                        if(default_subs.style.vdist == "default") cueso[i].line = -2
                        else cueso[i].line = parseInt(default_subs.style.vdist)
                    }
                }
                ,300)}
                let newbg,font_size,text_shadow,font_color,font_family ;
        
                if(default_subs.style.bg.color == "colorless") newbg = "rgba(0, 0, 0, 0)";
                else newbg = default_subs.style.bg.color;
        
                if(default_subs.style.font.color  == null) font_color = "rgb(238, 235, 229)";
                else font_color = default_subs.style.font.color;
        
                if(default_subs.style.font.size == "default") font_size = "30px";
                else font_size = default_subs.style.font.size;
        
                if(default_subs.style.font.textShadow  == null) text_shadow = "1px 1px 1px #050000";
                else text_shadow = default_subs.style.font.text_shadow;
        
                if(default_subs.style.font.family != "default") font_family = default_subs.style.font.family;
                document.getElementById("subtitle-styleros").innerHTML=`.default-subtitles::cue{background-color:${newbg};color: ${font_color};font-size: ${font_size};text-shadow: ${text_shadow};}`;
                document.getElementsByClassName("custom-videopls")[0].classList.add("default-subtitles");
        }
        else{
            teracksdivo.track.mode="hidden";
            document.getElementsByClassName("subiitilesooovideos")[x].classList.remove("opacitiooneo");
            document.getElementsByClassName("subiitilesooovideos-innerdiv")[0].style.width="0px";

            //custom extra codes
            if(customcode) {
                let got_tags="";
                let sending_id;
                if(prev_id == 0) sending_id = curr_vid_id
                else sending_id = prev_id;
                if(first_subs.autosubs){
                    first_subs.autosubs = false;
                    let new_subs = JSON.stringify(first_subs);
            
                    let xmlhttp=new XMLHttpRequest();
                    xmlhttp.open("POST","./files/body parts/edit captions.php",true);
                    xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                    xmlhttp.send(`work=b&vid_id=${sending_id}&new_captions=${new_subs}`);
                }

            }

        }
    }
    else{
        show_stattisticso(0,"No Subtitles");
        document.getElementsByClassName("subiitilesooovideos-innerdiv")[0].style.width="0px";
        document.getElementsByClassName("subiitilesooovideos")[x].classList.remove("opacitiooneo");

    }
}

function previewcarreireshower(x,event){
    if(!window.mobileCheck()){
        let vid_mouse_cordino_x = event.clientX;
        let previeewevideoo = document.getElementsByClassName("previewcarrier-videosos")[x]
        let previeewevideoo_div = document.getElementsByClassName("previewcarrier-divos")[x]
        let previeewetimeline_div = document.getElementsByClassName("video-progressometer-preview")[x]
        let previeewevideoo_currtime = document.getElementsByClassName("previewcarrier-videosos-currtime")[x]
        let progressometerouter = document.getElementsByClassName("video-progressometer-outer")[x]
        let progressometerouter_width = progressometerouter.offsetWidth;
        let vidoellmeterooffsets = progressometerouter.getBoundingClientRect();
        let tempos_videososos = document.getElementsByClassName("custom-videopls")[x];
        let requorosds = ((vid_mouse_cordino_x-vidoellmeterooffsets.left)/progressometerouter_width);
        if(vid_mouse_cordino_x-vidoellmeterooffsets.left > 0 && vid_mouse_cordino_x-vidoellmeterooffsets.left < progressometerouter_width){
            if(previeewevideoo.videoWidth < 2000){if((requorosds*tempos_videososos.duration-previeewevideoo.currentTime)>2 || (requorosds*tempos_videososos.duration-previeewevideoo.currentTime)<-2)previeewevideoo.currentTime = requorosds*tempos_videososos.duration;}
            else{if((requorosds*tempos_videososos.duration-previeewevideoo.currentTime)>10 || (requorosds*tempos_videososos.duration-previeewevideoo.currentTime)<-10)previeewevideoo.currentTime = requorosds*tempos_videososos.duration;}
            previeewevideoo_currtime.innerHTML= secToHourMinSec(requorosds*tempos_videososos.duration);
            previeewevideoo_div.classList.remove("hidemepls");
    
            let new_leftoso = vid_mouse_cordino_x-vidoellmeterooffsets.left-(previeewevideoo_div.offsetWidth/2);
            let max_leftooso = vidoellmeterooffsets.width - previeewevideoo_div.offsetWidth
            if(new_leftoso < 0) new_leftoso = 0
            else if (new_leftoso > max_leftooso) new_leftoso = max_leftooso
            previeewevideoo_div.style.left = `${new_leftoso}px`;
            previeewetimeline_div.style.width = `${vid_mouse_cordino_x-vidoellmeterooffsets.left}px`
        }
        else{
            previewcarreirehider(x)
        }
    }
    
}

function previewcarreirehider(x){
    if(!window.mobileCheck()){
        if(document.getElementsByClassName("video-progressometer-outer")[x].offsetHeight < 4){
            document.getElementsByClassName("previewcarrier-divos")[x].classList.add("hidemepls")
            document.getElementsByClassName("video-progressometer-preview")[x].style.width="0px"
        }
    }
}


window.onload = function(){
    cumstomvideoplayerupdatottt()
}

function secToHourMinSec(input){
    input = Math.floor(parseInt(input))
    let m = (input - (input) % 60)/60 
    let s = input % 60
    let h = (m - (m % 60))/60
  
    if(s<10 && m<60){return `${m}:0${s}`}
    if(s>=10 && m<60){return `${m}:${s}`}
  
    if(m>=60){
      m = m % 60
      if(m<10 && s<10){return `${h}:0${m}:0${s}`}
      if(m<10 && s>=10){return `${h}:0${m}:${s}`}
      if(m>=10 && s<10){return `${h}:${m}:0${s}`}
      if(m>=10 && s>=10){return `${h}:${m}:${s}`}
    }
  
}

function new_src(x,y){
    document.getElementsByClassName("custom-videopls")[x].getElementsByTagName("source")[0].src = y;
    document.getElementsByClassName("custom-videopls")[x].load()
    document.getElementsByClassName("previewcarrier-videosos")[x].getElementsByTagName("source")[0].src= y;
    document.getElementsByClassName("previewcarrier-videosos")[x].load()
    if(customcode){
        let dkdidi = decodeURI(y).split('/');
        document.getElementsByClassName("vid-title-p")[0].textContent = dkdidi[dkdidi.length - 1]
    }
}


function new_src2(x,y){
    let tempo_surco = document.getElementsByClassName("custom-videopls")[0].getElementsByTagName("source")[0];
    let old_srco_arr = decodeURI(tempo_surco.src).split('/');
    y = y + '.' + old_srco_arr[old_srco_arr.length-1].split('.')[old_srco_arr[old_srco_arr.length-1].split('.').length - 1];
    console.log(y)
    old_srco_arr[old_srco_arr.length - 1] = y;
    let new_srco = old_srco_arr.join("/");
    new_srco = new_srco.replaceAll("#","%23")
    console.log(new_srco)
    if(customcode) document.getElementsByClassName("vid-title-p")[0].textContent = y
    
    tempo_surco.src = new_srco
    document.getElementsByClassName("custom-videopls")[x].load()
    document.getElementsByClassName("previewcarrier-videosos")[x].getElementsByTagName("source")[0].src= new_srco;
    document.getElementsByClassName("previewcarrier-videosos")[x].load()
}
function getframerat(x){
    document.getElementsByClassName("vid-framerateso")[x].textContent = "Calculating..."
    if(first_time_getframe){
        first_time_getframe = false;
        setTimeout(function(){
            let getframeratesosos = document.getElementsByClassName("custom-videopls")[x].getVideoPlaybackQuality().totalVideoFrames
            setTimeout(function(){
                getframeratesosos = document.getElementsByClassName("custom-videopls")[x].getVideoPlaybackQuality().totalVideoFrames - getframeratesosos;
                if(getframeratesosos%2 != 0) getframerat(x)
                else{document.getElementsByClassName("vid-framerateso")[x].textContent = getframeratesosos}
            },1000)
        },1500)
    }
    else{
        let getframeratesosos = document.getElementsByClassName("custom-videopls")[x].getVideoPlaybackQuality().totalVideoFrames
        setTimeout(function(){
            getframeratesosos = document.getElementsByClassName("custom-videopls")[x].getVideoPlaybackQuality().totalVideoFrames - getframeratesosos;
            if(getframeratesosos%2 != 0) getframerat(x)
            else {document.getElementsByClassName("vid-framerateso")[x].textContent = getframeratesosos;first_time_getframe = true;}
        },1000)
    }

} 

function download_clickok(x){
    let vid_a = document.getElementsByClassName("custom-vidoe-downloader")[x]
    vid_a.href = document.getElementsByClassName("custom-videopls")[x].getElementsByTagName("source")[0].src
    vid_a.click();
}


window.mobileCheck = function() {
    let check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
};