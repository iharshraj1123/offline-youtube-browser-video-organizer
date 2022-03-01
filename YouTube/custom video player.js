let nocursoonfulloscreno;
let mouseoverocontroloboco = false;

//this functions gets called when page loads
function cumstomvideoplayerupdatottt(){
    let tempos_videososos= document.getElementsByClassName("custom-videopls")[0];
    if(tempos_videososos.autoplay){
        switchplayicon("showpause",0);
        setTimeout(function(){
        let diciidodo = document.getElementsByClassName("video-summoner-divttte")[0];
        let diciidodotwo = document.getElementsByClassName("video-summoner-controlboxo")[0];
        let diciidodothree = document.getElementsByClassName("video-summoner-divttt")[0];
        diciidodothree.classList.add("nocursoronvidododo");
        diciidodo.style.visibility="hidden";
        diciidodotwo.style.visibility="hidden";
        },2500)
    }
    setTimeout(function(){refreshvolvideopl(0)},100)

    tempos_videososos.addEventListener("volumechange",function(){onvideosVol_change(0)} )
    tempos_videososos.addEventListener("playing" , function(){vidosplayer_playing(0)} )
    tempos_videososos.addEventListener("timeupdate" , function(){vidosplayer_playing(0)} )
    tempos_videososos.addEventListener("ended",function(){videosos_endedo(0);} )

    tempos_videososos.addEventListener("keydown", e => {

        //captions 'c'
        if(e.code == "KeyC"){
            e.preventDefault();
            turnonsubstitleso(0);
        }

        //delete history 'del'
        if(e.code == "NumpadDecimal"){
            e.preventDefault();
            if(prev_id_count>0){
                prev_id_count=0;
                curr_vid_id = prev_id;
                play_history = [];
            }
            prev_id_count = 0;
            curr_play_index = new_playlist_all_array[0].indexOf(`${curr_vid_id}`);
            make_icon("delete-history");
        }

        //opposite day 'Num 0'
        if(e.code == "Numpad0"){
            e.preventDefault();
            if(oppositeday){ oppositeday  = false; make_icon("not-opposite");}
            else{ oppositeday  = true; make_icon("opposite");}
        }

        //pause 'space'
        if(e.code == "Space"){
            e.preventDefault();
            togglevideoplaypause(0);
        }
        //loop press 'l'
        if(e.code == "KeyL") {
            e.preventDefault();
            if(vid_loop){
                vid_loop = false
                tempos_videososos.loop = false;
                make_icon("queue");
            }
            else{vid_loop = true;tempos_videososos.loop = true;make_icon("loop"); }
        }
        //seek 'left-right'
        if(e.code == "ArrowLeft"){
            e.preventDefault();
            tempos_videososos.currentTime -= 5;
        }
        if(e.code == "ArrowRight"){
            e.preventDefault();
            tempos_videososos.currentTime += 5;
        }

        //volume 'up-down'
        if(e.code == "ArrowDown"){
            e.preventDefault();
            if(tempos_videososos.volume < 0.06) tempos_videososos.volume = 0
            else tempos_videososos.volume -= 0.05;
            show_stattisticso(0,`Volume = ${Math.round(tempos_videososos.volume*1000)/10}%`)
        }
        if(e.code == "ArrowUp"){
            e.preventDefault();
            if(tempos_videososos.volume > 0.94) tempos_videososos.volume = 1
            else tempos_videososos.volume += 0.05;
            show_stattisticso(0,`Volume = ${Math.round(tempos_videososos.volume*1000)/10}%`)
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
    if(tempos_videososos.muted){
        tempos_videososos.muted = false;
        if(tempos_videososos.volume > 0.4) switchvolicon("highvol",x)
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

function fullscreno_clickod(x){
    let tempos_videososos = document.getElementsByClassName("custom-videopls")[x]
    if (!document.fullscreenElement){
        let outer_vid= document.getElementsByClassName("video-summoner-divttt")[0]
         outer_vid.requestFullscreen();
         tempos_videososos.classList.add("customovideo-fullscreen")
         document.getElementsByClassName("fullscrnvideovid")[x].classList.add("hidemepls")
         document.getElementsByClassName("extfullscrnvideovid")[x].classList.remove("hidemepls")
         document.getElementsByClassName("video-summoner-divttte3")[0].classList.add("video-summoner-divttte3-fullscreen")
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
         setTimeout(function(){removothecontroloboxo(x)},200)
         setTimeout(function(){removothecontroloboxo(x)},250)
         setTimeout(function(){removothecontroloboxo(x)},300)
         setTimeout(function(){removothecontroloboxo(x)},500)
         setTimeout(function(){removothecontroloboxo(x)},600)
        }
    else{ 
        tempos_videososos.classList.remove("customovideo-fullscreen")
        screen.orientation.unlock()
        setTimeout(function(){document.getElementsByClassName("video-summoner-divttt")[0].classList.remove("nocursoronvidododo")},200)
        document.exitFullscreen()
        let diciidodo = document.getElementsByClassName("video-summoner-divttte")[x];
        let diciidodotwo = document.getElementsByClassName("video-summoner-controlboxo")[x];
        diciidodo.style.visibility="visible"
        diciidodotwo.style.visibility="visible" 
        document.getElementsByClassName("fullscrnvideovid")[x].classList.remove("hidemepls")
        document.getElementsByClassName("extfullscrnvideovid")[x].classList.add("hidemepls")
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
    let tempos_videososos = document.getElementsByClassName("custom-videopls")[x]
    if(tempos_videososos.paused) {play_clickod(x); show_stattisticso(x,"Resume")}
    else {pause_clickod(x); show_stattisticso(x,"Pause")}
}

function mousemove_move(x){
    let tempos_videososos = document.getElementsByClassName("custom-videopls")[x];
    clearTimeout(nocursoonfulloscreno);
    let diciidodo = document.getElementsByClassName("video-summoner-divttte")[x];
    let diciidodotwo = document.getElementsByClassName("video-summoner-controlboxo")[x];
    let diciidodothree = document.getElementsByClassName("video-summoner-divttt")[x];

    diciidodo.style.visibility="visible"
    diciidodotwo.style.visibility="visible" 
    diciidodothree.classList.remove("nocursoronvidododo");
    nocursoonfulloscreno = setTimeout(function(){
        if(!tempos_videososos.paused && mouseoverocontroloboco == false){
            diciidodothree.classList.add("nocursoronvidododo");
            diciidodo.style.visibility="hidden";
            diciidodotwo.style.visibility="hidden";
        }
    },2000)
}

function removothecontroloboxo(x){
    let tempos_videososos = document.getElementsByClassName("custom-videopls")[x];
    clearTimeout(nocursoonfulloscreno);
    let diciidodo = document.getElementsByClassName("video-summoner-divttte")[x];
    let diciidodotwo = document.getElementsByClassName("video-summoner-controlboxo")[x];
    let diciidodothree = document.getElementsByClassName("video-summoner-divttt")[x];
    if(!tempos_videososos.paused){
        diciidodothree.classList.add("nocursoronvidododo");
        diciidodo.style.visibility="hidden";
        diciidodotwo.style.visibility="hidden";
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

            
            setTimeout(function(){
            let cueso = document.getElementsByClassName("temposos-trackos")[x].track.cues
            for(let i=0;i< cueso.length;i++){
            cueso[i].line = -2;
           // cueso[i].position = 50;
            //cueso[i].align = 'middle';
           // cueso[i].size = 90;
            }}
            ,300)
        }
        else{
            teracksdivo.track.mode="hidden";
            document.getElementsByClassName("subiitilesooovideos")[x].classList.remove("opacitiooneo");
            document.getElementsByClassName("subiitilesooovideos-innerdiv")[0].style.width="0px";

        }
    }
    else{
        show_stattisticso(0,"No Subtitles");
        document.getElementsByClassName("subiitilesooovideos-innerdiv")[0].style.width="0px";
        document.getElementsByClassName("subiitilesooovideos")[x].classList.remove("opacitiooneo");

    }
}

function previewcarreireshower(x,event){
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
        previeewevideoo_div.style.left = `${vid_mouse_cordino_x-vidoellmeterooffsets.left-(previeewevideoo_div.offsetWidth/2)}px`;
        previeewetimeline_div.style.width = `${vid_mouse_cordino_x-vidoellmeterooffsets.left}px`
    }
    else{
        previewcarreirehider(x)
    }
    
}

function previewcarreirehider(x){
    if(document.getElementsByClassName("video-progressometer-outer")[x].offsetHeight < 4){
    document.getElementsByClassName("previewcarrier-divos")[x].classList.add("hidemepls")
    document.getElementsByClassName("video-progressometer-preview")[x].style.width="0px"
    }
}


cumstomvideoplayerupdatottt()

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