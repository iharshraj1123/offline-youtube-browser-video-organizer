"use strict";
//Known bugs: escape fullscreen messes everything, use fullscreenchange event listener
/*changes: 
async->sync cumstomvideoplayerupdatottt() fn
window mobile deleted

*/

let shdjsopdjpsodjs;

let nocursoonfulloscreno;
let mouseoverocontroloboco = false;
let just_fullscreened = false;
let first_time_getframe = true;
let framratetimeoutarr = [];
let under10kbitrate = true;
let escape_full = false;
let vid_random=true;
let CssSubFont;

function reverse_replace_lanlinks(temp_src){
    temp_src = getUrlParts(temp_src).pathname
    if(temp_src.includes("/c:/")) temp_src = temp_src.replace("/c:/", "file:///C:/")
    else if(temp_src.includes("/d:/")) temp_src = temp_src.replace("/d:/", "file:///D:/")
    else{
        if(temp_src.includes("/downloads/")) temp_src = temp_src.replace("/downloads/", "file:///C:/Users/ihars/Downloads/")
        else if(temp_src.includes("/entertainment/")) temp_src = temp_src.replace("/entertainment/", "file:///D:/0-entertainment/")
        else if(temp_src.includes("/videosongs/"))  temp_src = temp_src.replace("/videosongs/", "file:///D:/Video%20songs/")
    }
    temp_src = temp_src.replaceAll('+', '%2B')
    return temp_src;
}

function getUrlParts(url) {
    let a = document.createElement('a');
    a.href = url;

    return {
        href: a.href,
        host: a.host,
        hostname: a.hostname,
        port: a.port,
        pathname: a.pathname,
        protocol: a.protocol,
        hash: a.hash,
        search: a.search
    };
}

function get_filesize(y,x){
    if(!x.includes("http://localhost") &&  !x.includes("file:///")) x = reverse_replace_lanlinks(x);
    x=x.replaceAll("+","&#43;")
    x=x.replaceAll("&","[!and!]")
    let xmlhttp=new XMLHttpRequest();
    xmlhttp.open("POST","./files/body parts/get filesize.php",true);
    xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlhttp.send(`url=${x}`);
    xmlhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            document.getElementsByClassName("vid-bitrate")[y].textContent = "Calculating..."
            let file_sizeo = Math.floor(((parseInt(xmlhttp.responseText)/1024)/1024)*100)/100;
            document.getElementsByClassName("vid-filesize")[y].textContent = file_sizeo + " MB";
            setTimeout(() => {
                let vid_duratio = document.getElementsByClassName("custom-videopls")[y].duration;
                let bitrateo=Math.floor(((file_sizeo*8*1024*1024/vid_duratio)/1024)*100)/100
                document.getElementsByClassName("vid-bitrate")[y].textContent = bitrateo + " kbps";
            }, 400);
    };} 
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

    if(tempos_videososos.videoHeight > 1400) {under10kbitrate = false;
        document.getElementsByClassName("previewcarrier-divos")[x].classList.add("hidemepreviewoe")
        document.getElementsByClassName("previewcarrier-videosos")[x].classList.add("hidemepls")
        console.log("too hd!! removing preview")
    }
    else {
        under10kbitrate = true;
        document.getElementsByClassName("previewcarrier-divos")[x].classList.remove("hidemepreviewoe")
        document.getElementsByClassName("previewcarrier-videosos")[x].classList.remove("hidemepls")
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

function do_the_vidrand(x){
    let tempos_videososos= document.getElementsByClassName("custom-videopls")[x];

    if(vid_random){
        vid_random = false;
        setCookie("random_vid","false")
        make_icon("not-random");
        document.getElementsByClassName("rando-meter")[x].innerText = "OFF";
        settingsoo_clickod(x);
    }
    else{
        vid_random = true;
        setCookie("random_vid","true");
        make_icon("random");
        document.getElementsByClassName("rando-meter")[x].innerText = "ON";
        settingsoo_clickod(x);
    }
}

//shows change in vol and stuff on right top corner
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
    document.getElementsByClassName("prev-skip-icnos")[x].classList.remove("hidemepls")
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

// function theatremod_clickod(){
//     transition()
// }

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

function popoutexit(x){
    if(customcode){
        if(current_page=="play") pop_outclick(x) 
        else document.getElementsByClassName("pop-out-parent")[x].remove()
    }
    else pop_outclick(x) 
}

function pop_outclick(x){
    let css_root = document.querySelector(':root')
    let the_vidos = document.getElementsByClassName("custom-videopls")[x];
    let the_vidos_parent = document.getElementsByClassName("video-summoner-divttt")[x];
    if(!the_vidos.classList.contains("pop-out")){
        the_vidos.classList.add("pop-out")
        the_vidos_parent.classList.add("pop-out-parent")
        CssSubFont = getComputedStyle(css_root).getPropertyValue('--subFont')
        css_root.style.setProperty('--subFont', '20px');
    }
    else{
        the_vidos.classList.remove("pop-out")
        the_vidos_parent.classList.remove("pop-out-parent")
        if(CssSubFont) css_root.style.setProperty('--subFont', CssSubFont)
        else css_root.style.setProperty('--subFont', '30px')
    }
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

//occurs when pressed captions
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
                let cueso = document.getElementsByClassName("temposos-trackos")[0].track.cues
                if(default_subs.style.editpos){
                    setTimeout(function(){
                        console.log(default_subs.style.vdist)
                        for(let i=0;i< cueso.length;i++){
                            if(default_subs.style.vdist == "default") cueso[i].line = -2
                            else cueso[i].line = parseInt(default_subs.style.vdist)
                        }
                    }
                    ,300)
                }
                for(let i=1; i < cueso.length;i++){
                    let divexp1 = document.createElement("div");
                    divexp1.innerHTML = cueso[i].text;
                    let divexp2 = document.createElement("div");
                    divexp2.innerHTML = cueso[i-1].text;
                    if(divexp1.textContent.toLowerCase() == divexp2.textContent.toLowerCase()) {
                        cueso[i].text = ""
                    }
                    if(cueso[i].line == "auto") {cueso[i].line = -2;}
                }
                
                let newbg,font_size,text_shadow,font_color,font_family ;
                let custom_font_css = default_subs.style.font.custom;
                let root_var = default_subs.style.font.root;

                if(default_subs.style.bg.color == "colorless") newbg = "rgba(0, 0, 0, 0)";
                else newbg = default_subs.style.bg.color;
        
                if(default_subs.style.font.color == "default") font_color = "rgb(238, 235, 229)";
                else font_color = default_subs.style.font.color;    
    
                if(default_subs.style.font.size == "default") font_size = "var(--subFont)";
                else font_size = default_subs.style.font.size;
        
                if(default_subs.style.font.textShadow  == null) text_shadow = "1px 1px 1px #050000";
                else text_shadow = default_subs.style.font.textShadow;
    
                if(default_subs.style.font.family != "default") {
                    let temp_fontos =  default_subs.style.font.family;
                    font_family = temp_fontos;
                    if(!isFontAvailable(temp_fontos)){
                        temp_fontos = temp_fontos.replaceAll(" ", "+")
                        document.getElementsByClassName("importfont-style")[x].innerHTML = `@import url('https://fonts.googleapis.com/css2?family=${temp_fontos}&display=swap');`
                    }
                }
                else{font_family="inherit"}
    
                document.getElementById("subtitle-styleros").innerHTML=`${root_var}} .default-subtitles::cue{background-color:${newbg};color: ${font_color};font-size: ${font_size};text-shadow: ${text_shadow};font-family: ${font_family};${custom_font_css}}`;
                document.getElementsByClassName("custom-videopls")[0].classList.add("default-subtitles");
            }
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
            if(under10kbitrate && !tempos_videososos.classList.contains("pop-out")){
                if(previeewevideoo.videoWidth < 2000){if((requorosds*tempos_videososos.duration-previeewevideoo.currentTime)>2 || (requorosds*tempos_videososos.duration-previeewevideoo.currentTime)<-2)previeewevideoo.currentTime = requorosds*tempos_videososos.duration;}
                else{if((requorosds*tempos_videososos.duration-previeewevideoo.currentTime)>10 || (requorosds*tempos_videososos.duration-previeewevideoo.currentTime)<-10)previeewevideoo.currentTime = requorosds*tempos_videososos.duration;}
            }
            previeewevideoo_currtime.innerHTML= secToHourMinSec(requorosds*tempos_videososos.duration);
            previeewevideoo_div.classList.remove("hidemepls");
    
            let new_leftoso = vid_mouse_cordino_x-vidoellmeterooffsets.left-(previeewevideoo_div.offsetWidth/2);
            let max_leftooso = vidoellmeterooffsets.width - previeewevideoo_div.offsetWidth
            if(new_leftoso < 0) new_leftoso = 0
            else if (new_leftoso > max_leftooso) new_leftoso = max_leftooso

            if(!under10kbitrate || tempos_videososos.classList.contains("pop-out")) new_leftoso = vid_mouse_cordino_x-vidoellmeterooffsets.left-(previeewevideoo_div.offsetWidth/2);
            previeewevideoo_div.style.left = `${new_leftoso}px`;
            previeewetimeline_div.style.width = `${vid_mouse_cordino_x-vidoellmeterooffsets.left}px`
        
    }
    
}

function previewcarreirehider(x){
        if(document.getElementsByClassName("video-progressometer-outer")[x].offsetHeight < 4){
            document.getElementsByClassName("previewcarrier-divos")[x].classList.add("hidemepls")
            document.getElementsByClassName("video-progressometer-preview")[x].style.width="0px"
        
    }
}

let curr_play_index;
function next_playlist_song(){
    if(customcode){
        console.log("beginning next song")
        if(curr_vid_id == last_vid_id && !oppositeday){
            curr_play_index = ConstrainedRan(0,total_vids-1);
            curr_vid_id =  new_playlist_all_array[0][curr_play_index];
        }
        else{
            if(curr_vid_id!=2){
                if(vid_random){curr_play_index = ConstrainedRan(0,total_vids-1);curr_vid_id =  new_playlist_all_array[0][curr_play_index];}
                else{
                    if(curr_play_index == undefined) curr_play_index = new_playlist_all_array[0].indexOf(`${curr_vid_id}`);
                    if(oppositeday) curr_play_index--;
                    else curr_play_index++;
                    curr_vid_id =  new_playlist_all_array[0][curr_play_index]
                }
            }
            else{
                curr_play_index = ConstrainedRan(0,total_vids-1);
                curr_vid_id =  new_playlist_all_array[0][curr_play_index];
            }
        }
    }
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
    getframerate2()

} 

setTimeout(() => {
    getframerate2()
}, 1000);

setInterval(() => {
    getframerate2()
}, 5000);

function download_clickok(x){
    let vid_a = document.getElementsByClassName("custom-vidoe-downloader")[x]
    vid_a.href = document.getElementsByClassName("custom-videopls")[x].getElementsByTagName("source")[0].src
    vid_a.click();
}

(function (document) {
    let width;
    let body = document.body;

    let container = document.createElement('span');
    container.innerHTML = Array(100).join('wi');
    container.style.cssText = [
        'position:absolute',
        'width:auto',
        'font-size:128px',
        'left:-99999px'
    ].join(' !important;');

    let getWidth = function (fontFamily) {
        container.style.fontFamily = fontFamily;

        body.appendChild(container);
        width = container.clientWidth;
        body.removeChild(container);

        return width;
    };

    // Pre compute the widths of monospace, serif & sans-serif
    // to improve performance.
    let monoWidth  = getWidth('monospace');
    let serifWidth = getWidth('serif');
    let sansWidth  = getWidth('sans-serif');

    window.isFontAvailable = function (font) {
        return monoWidth !== getWidth(font + ',monospace') ||
        sansWidth !== getWidth(font + ',sans-serif') ||
        serifWidth !== getWidth(font + ',serif');
    };
})(document);
//console.log(isFontAvailable('Arial'))
// Evaluates true

window.addEventListener("load",function(){
    cumstomvideoplayerupdatottt()
})