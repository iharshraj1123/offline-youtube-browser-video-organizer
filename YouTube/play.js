var curr_vid_id = 0;
var vid_focussed = true;
var vid = document.getElementsByClassName("video-playing")[0];
var vid_loop = false;
var new_vid_data_arr;
var curr_duration;
var vid_random=true;
if(getCookie("random_vid")!=""){
    if(getCookie("random_vid")=="true") vid_random = true;
    else vid_random = false;
}
var play_history= new Array();
var prev_id=0;
var prev_id_count=0;
var first_src;
var justHidden = false;
var vid_desc = document.getElementsByClassName("vid-desc-pre")[0];
var vid_title = document.getElementsByClassName("vid-title-p")[0];
let oppositeday = false;
let customcode = true;

var trackso = document.getElementsByClassName("temposos-trackos")[0];

var playlist_all = ["984","985","986","987","988","989","990","991","992","993","994","995","996","997","998","999","1000","1001","1002","1003","1004","1005","1006","1007","1008","1009","1010","1011","1012","1013","1014","1015","1016","1017","1018","1019","1020","1021","1022","1023","1024","1025","1026","1027","1028","1029","1030","1031","1032","1033","1034","1035","1036","1037","1038","1039","1040","1041","1042","1043","1044","1045","1046","1047","1048","1049","1050","1051","1052","1053","1054","1055","1056","1057","1058","1059","1060","1061","1062","1063","1064","1065","1066","1067","1068","1069","1070","1071","1072","1073","1074","1075","1076","1077","1078","1079","1080","1081","1082","1083","1084","1085","1086","1087","1088","1089","1090","1091","1092","1093","1094","1095","1096","1097","1098","1099","1100","1101","1102","1103","1104","1105","1106","1107","1108","1109","1110","1111","1112","1113","1114","1115","1116","1117","1118","1119","1120","1121","1122","1123","1124","1125","1126","1127","1128","1129","1130","1131","1132","1133","1134","1135","1136","1137","1138","1139","1140","1141","1142","1143","1144","1145","1146","1147","1148","1149","1150","1151","1152","1153","1154","1155","1156","1157","1158","1159","1160","1161","1162","1163","1164","1165","1166","1167","1168","1169","1170","1171","1172","1173","1174","1175","1176","1177","1178","1179","1180","1181","1182","1183","1184","1185","1186","1187","1188","1189","1190","1191","1192","1193","1194","1195","1196","1197","1198","1199","1200","1201","1202","1203","1204","1205","1206","1207","1208","1209","1210","1211","1212","1213","1214","1215","1216","1217","1218","1219","1220","1221","1222","1223","1224","1225","1226","1227","1228","1229","1230","1231","1232","1233","1234","1235","1236","1237","1238","1239","1240","1241","1242","1243","1244","1245","1246","1247","1248","1249","1250","1251","1252","1253","1254","1255","1256","1257","1258","1259","1260","1261","1262","1263","1264","1265","1266","1267","1268","1269","1270","1271","1272","1273","1274","1275","1276","1277","1278","1279","1280","1281","1282","1283","1284","1285","1286","1287","1288","1289","1290","1291","1292","1293","1294","1295","1296","1297","1298","1299","1300","1301","1302","1303","1304","1305","1306","1307","1308","1309","1310","1311","1312","1313","1314","1315","1316","1317","1318","1319","1320","1321","1322","1323","1324","1325","1326","1327","1328","1329","1330","1331","1332","1333","1334","1335","1336","1337","1338","1339","1340","1341","1342","1343","1344","1345","1346","1347","1348","1349","1350","1351","1352","1353","1354","1355","1356","1357","1358","1359","1360","1361","1362","1363","1364","1365","1366","1367","1368","1369","1370","1371","1372","1373","1374","1375","1376","1377","1378","1379","1380","1381","1382","1383","1384","1385","1386","1387","1388","1389","1390","1391","1392","1393","1394","1395","1396","1397","1398","1399","1400","1401","1402","1403","1404","1405","1406","1407","1408","1409","1410","1411","1412","1413","1414","1415","1416","1417","1418","1419","1420","1421","1422","1423","1424","1425","1426","1427","1428","1429","1430","1431","1432","1433","1434","1435","1436","1437","1438","1439","1440","1441","1442","1443","1444","1445","1446","1447","1448","1449","1450","1451","1452","1453","1454","1455","1456","1457","1458","1459","1460","1461","1462","1463","1464","1465","1466","1467","1468","1469","1470","1471","1472","1473","1474","1475","1476","1477","1478","1479","1480","1481","1482","1483","1484","1485","1486"]

vid.addEventListener('ended', function(){
    if(!vid_loop && vid_desc.contentEditable != "true"){
        
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
                temp_src = friendly_link(temp_src)
                if(!window.location.href.includes("http://localhost")){
                temp_src = temp_src.replace("file:///C:/Users/ihars/Downloads/", "/downloads/");
                temp_src = temp_src.replace("file:///D:/0-entertainment/", "/entertainment/");
                temp_src = temp_src.replace("file:///D:/Video songs/", "/videosongs/");
                temp_src = temp_src.replace("file:///D:/Video%20songs/", "/videosongs/");}
                document.getElementsByClassName("video-src")[0].src = temp_src;
                vid.load();
                change_all_data();
            };} 
       
    }
});


function play_page(x){
    current_page = 'play';
    curr_vid_id = x;
    vid.volume = 0.2;
    play_history.push(curr_vid_id);
    totalcloseNav();
    check_expand();
    vid.focus()
    document.getElementsByClassName("Menu-div")[0].style.position="fixed";
    document.getElementsByClassName("Menu-div")[0].style.height="100%";
    document.getElementsByClassName("Menu-div")[0].style.zIndex = '10';
    document.getElementsByClassName("vid-comment-numbers")[0].textContent = document.getElementsByClassName("com-texto").length;

    if(!document.getElementsByClassName("temposos-trackos")[0].classList.contains("nosubtitloso")){
        document.getElementsByClassName("temposos-trackos")[0].src = friendly_link(document.getElementsByClassName("temposos-trackos")[0].src)
            setTimeout(function(){
                    if(first_subs.autosubs){ 
                        turnonsubstitleso2()
                    }
                    else{
                        document.getElementsByClassName("subiitilesooovideos-div")[0].classList.remove("hidemepls")
                    }
                },100)
        ;}
}


function turnonsubstitleso2(){
    let teracksdivo = document.getElementsByClassName("temposos-trackos")[0]
    changednewvideoso = false
    teracksdivo.track.mode="showing";
    document.getElementsByClassName("subiitilesooovideos")[0].classList.add("opacitiooneo");
    document.getElementsByClassName("subiitilesooovideos-div")[0].classList.remove("hidemepls")
    document.getElementsByClassName("subiitilesooovideos-innerdiv")[0].style.width="30px";

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

function focusin(){
    setTimeout(function(){vid_focussed = true;vid.focus()},100)
}

function focusout(){
    vid_focussed = false;
}

document.addEventListener("keydown", e => {

if(vid_focussed){
  //  vid.focus()

  

  //previous 'p'
  if(e.keyCode == 80){
    plsplayprevovid()
  }

    //for next 'n'
    if(e.keyCode == 78) {
        document.getElementsByClassName("prev-skip-icnos")[0].classList.remove("hidemepls")
            plsplaynextovid()
    }
    
    //for fullscreen 'f'
    if(e.keyCode == 70) {
        fullscreno_clickod(0)
    }

      //for shuffle 'r'
        if(e.keyCode == 82) {
            if(vid_random){
                vid_random = false;
                setCookie("random_vid","false")
                make_icon("not-random");
            }
            else{
                vid_random = true;
                setCookie("random_vid","true")
                make_icon("random");
            }
        }
         //for cinemamode 't'
         if(e.keyCode == 84) {
            transition()
        }


}
else{
    //for focus '5' (in num pad)
    if(e.keyCode == 12) {
        vid_focussed =true;
        vid.focus()
    }
}
});



function plsplaynextovid(){
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
                temp_src = temp_src.replace("file:///C:/Users/ihars/Downloads/", "/downloads/");
                temp_src = temp_src.replace("file:///D:/0-entertainment/", "/entertainment/");
                temp_src = temp_src.replace("file:///D:/Video songs/", "/videosongs/");
                temp_src = temp_src.replace("file:///D:/Video%20songs/", "/videosongs/");}
                document.getElementsByClassName("video-src")[0].src = temp_src;
                vid.load();
                change_all_data();
                switchplayicon("showpause",0);
            };} 
            
}

function plsplayprevovid(){
    let xmlhttp=new XMLHttpRequest();
    xmlhttp.open("POST","redirect.php",true);
    xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    prev_id = play_history[play_history.length-2-prev_id_count];
    console.log(prev_id)
    if(prev_id == undefined){ 
        if(curr_play_index == undefined) curr_play_index = new_playlist_all_array[0].indexOf(`${curr_vid_id}`);
        if(oppositeday) prev_id = new_playlist_all_array[0][curr_play_index+1+prev_id_count];
        else prev_id = new_playlist_all_array[0][curr_play_index-1-prev_id_count];
    }  
    prev_id_count++;
    add_view(prev_id);
    xmlhttp.send(`work=b&vid_id=${prev_id}`);
    xmlhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
        let temp_strng = xmlhttp.responseText;
        new_vid_data_arr= temp_strng.split('?')
        let temp_src = new_vid_data_arr[3];
        temp_src = friendly_link(temp_src)
        if(!window.location.href.includes("http://localhost")){
        temp_src = temp_src.replace("file:///C:/Users/ihars/Downloads/", "/downloads/");
        temp_src = temp_src.replace("file:///D:/0-entertainment/", "/entertainment/");
        temp_src = temp_src.replace("file:///D:/Video songs/", "/videosongs/");
        temp_src = temp_src.replace("file:///D:/Video%20songs/", "/videosongs/");}
        document.getElementsByClassName("video-src")[0].src = temp_src;
        vid.load();
        change_all_data();
    };} 
}

let curr_play_index;
function next_playlist_song(){
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

function nice_date(x){
    let ms = new Array('Jan','Feb','March','April','May','June','Jul','Aug','Sept','Oct','Nov','Dec');
    let returni ='';
    let day = x.substr(8, 2)
    returni = returni + day;
    let month = x.substr(5, 2)
    returni = returni + ' '+ ms[month-1]
    let year = x.substr(0,4)
    returni = returni + ' '+  year;

    return returni;
}

function add_view(x){
    let xmlhttp=new XMLHttpRequest();
    xmlhttp.open("POST","./files/body parts/add view.php",true);
    xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlhttp.send(`vid_id=${x}`);
}

function check_expand(){
    let recent_section = document.getElementsByClassName('vid-desc-pre')[0];
    let arrow= document.getElementsByClassName("section-close-btn2")[0];
    if(recent_section.scrollHeight > 150){
        if(arrow.classList.contains("hidemepls")) arrow.classList.remove("hidemepls")
    }
    else{
        arrow.classList.add("hidemepls")
    }
}

function expand_desc(){
    let down_icon = document.getElementsByClassName('down-arrow-section')[0];
    let recent_section = document.getElementsByClassName('vid-desc-pre')[0];
    if(recent_section.offsetHeight > 150){
        recent_section.style.maxHeight = "150px"
        down_icon.style.transform = "rotate(0deg)"
    }
    else{
        recent_section.style.maxHeight = "100%"
        down_icon.style.transform = "rotate(180deg)"
    }
}

//    1        2       3         4              5             6          7         8         9         10           11            12          13      14          15          16      
// vid_id, vid_name ,link , uploader_id , uploader_name, uploader_img, likes , dislikes , duration , views  , uploaded_date, uploaded_time ,tags , description, comments, subtitles

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

    if(new_vid_data_arr[16] != "null" && new_vid_data_arr[16] != "" && Object.values(JSON.parse(new_vid_data_arr[16]).subs)[0].url != "url1" && new_vid_data_arr[16] != " "){
        let temp_subsos = JSON.parse(new_vid_data_arr[16])
        first_subs = temp_subsos;
        document.getElementsByClassName("temposos-trackos")[0].src = friendly_link(first_subs.loc + Object.values(first_subs.subs)[0].url);
        document.getElementsByClassName("temposos-trackos")[0].classList.remove("nosubtitloso")
        changednewvideoso = true;
            let sending_id;
            if(prev_id == 0) sending_id = curr_vid_id
            else sending_id = prev_id;
            
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
        document.getElementsByClassName("temposos-trackos")[0].classList.add("nosubtitloso")
        document.getElementsByClassName("temposos-trackos")[0].src = ""
        document.getElementsByClassName("subiitilesooovideos")[0].classList.remove("opacitiooneo")
        document.getElementsByClassName("subiitilesooovideos-div")[0].classList.add("hidemepls")
        document.getElementsByClassName("subiitilesooovideos-innerdiv")[0].style.width="0px";
        console.log(`no subtitles`)
    }

    document.getElementsByClassName("previewcarrier-videosos")[0].getElementsByTagName("source")[0].src = vid.getElementsByTagName("source")[0].src;
    document.getElementsByClassName("previewcarrier-videosos")[0].load();
    update_vid_infos(0)
    getframerat(0);
  //  document.getElementsByClassName("pleaserefresh-com")[0].classList.remove("hidemepls")
 //   document.getElementsByClassName("video-play-comments-summoner")[0].innerHTML = "Please Refresh to get new comments" + document.getElementsByClassName("video-play-comments-summoner")[0].innerHTML;
}

//show_vid_mode
function make_icon(x){
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
    }
}

function share_vid(){
    let link_text = window.location.href;
    navigator.clipboard.writeText(link_text);

    document.getElementsByClassName('com-popup-summoner')[0].innerHTML = "<div class='com-link-copied-div'><span class='com-link-copied-span'>Link Copied !</span></div>"
    setTimeout(function(){document.getElementsByClassName('com-link-copied-div')[0].style.bottom = '10px'},50)
    setTimeout(function(){document.getElementsByClassName('com-link-copied-div')[0].style.opacity ='0.3'},1300)
    setTimeout(function(){document.getElementsByClassName('com-popup-summoner')[0].innerHTML =''},1450)
}

function delete_vid(){
    let sending_id;
    if(prev_id == 0) sending_id = curr_vid_id
    else sending_id = prev_id
    let isconfirm = confirm(`Please confirm, This video (id=${sending_id}) will be deleted forever!`);
    if(isconfirm){
    let xmlhttp=new XMLHttpRequest();

    xmlhttp.open("POST","./files/body parts/delete vid.php",true);
    xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlhttp.send(`vid_id=${sending_id}`);
    }
    vid.focus()
}

function new_desc(x){
    x = friendly_link(x);
    x = linkify(x);
    x =  vid_timestamp(x);
    return x;
}

function vid_stamp(x){
    if(vid_desc.contentEditable != "true"){
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
    vid.currentTime = x;
    vid.play();}
}

let olddesc;
let olddeschtml;
let saved = false;

function editdesc_vid(){
    olddesc = vid_desc.textContent;
    olddeschtml = vid_desc.innerHTML;

    vid_desc.contentEditable = true;
    vid_desc.classList.add("editablebg");
    document.getElementsByClassName("desc_edit_div")[0].classList.remove("hidemepls")
    vid_desc.focus()
}
function canceleditdesc_vid(){
    vid_desc.contentEditable = false;
    vid_desc.classList.remove("editablebg");
    document.getElementsByClassName("desc_edit_div")[0].classList.add("hidemepls")
    if(!saved){vid_desc.innerHTML = olddeschtml;}
    else{saved = false;}
}


function saveeditdesc_vid(){
    saved = true;
    vid_desc.innerHTML = vid_desc.innerHTML.replace(/<br>/g, "\n")
    vid_desc.innerHTML = vid_desc.innerHTML.replace(/!"/g, "『")
    vid_desc.innerHTML = vid_desc.innerHTML.replace(/"!/g, "』")
    let sending_id;
    if(prev_id == 0) sending_id = curr_vid_id
    else sending_id = prev_id

    let new_desc = readyforparcel(vid_desc.textContent);
    vid_desc.innerHTML = vid_timestamp(vid_desc.textContent)
    vid_desc.innerHTML = linkify(vid_desc.innerHTML)

    let xmlhttp=new XMLHttpRequest();
    xmlhttp.open("POST","./files/body parts/edit description.php",true);
    xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlhttp.send(`vid_id=${sending_id}&new_desc=${new_desc}`);

    vid_desc.contentEditable = false;
    vid_desc.classList.remove("editablebg");
    document.getElementsByClassName("desc_edit_div")[0].classList.add("hidemepls")
}

let oldtitle;
let title_saved = false;

function edit_title(){
    oldtitle = vid_title.textContent;
    vid_title.contentEditable = true;
    vid_title.classList.add("editablebg");
    document.getElementsByClassName("title_edit_div")[0].classList.remove("hidemepls")
    vid_title.focus()
}

function canceledittitle_vid(){
    vid_title.contentEditable = false;
    vid_title.classList.remove("editablebg");
    document.getElementsByClassName("title_edit_div")[0].classList.add("hidemepls")
    if(!title_saved){vid_title.innerText = oldtitle;}
    else{title_saved = false;}
}

function saveedittitle_vid(){
    let sending_id;
    if(prev_id == 0) sending_id = curr_vid_id
    else sending_id = prev_id

    let new_title = readyforparcel(vid_title.innerHTML)
    new_title = new_title + '.' + get_vidformat();
    console.log(`new title = ${new_title}`)
    let xmlhttp=new XMLHttpRequest();
    xmlhttp.open("POST","./files/body parts/edit title.php",true);
    xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlhttp.send(`vid_id=${sending_id}&new_title=${new_title}`);

    vid_title.contentEditable = false;
    vid_title.classList.remove("editablebg");
    document.getElementsByClassName("title_edit_div")[0].classList.add("hidemepls")
    document.title = vid_title.textContent
}

let curr_viddata_change;
function edit_tags(){
    let sending_id;
    if(prev_id == 0) sending_id = curr_vid_id
    else sending_id = prev_id
    document.getElementsByClassName("change-data-div")[0].classList.add("change-data-div-active");
    document.getElementsByClassName("changedata_ctrl_div")[0].classList.remove("hidemepls");
    curr_viddata_change = "tags";
    let xmlhttp=new XMLHttpRequest();
    xmlhttp.open("POST","./files/body parts/edit tags.php",true);
    xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlhttp.send(`work=a&vid_id=${sending_id}`);
    xmlhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            document.getElementsByClassName("change-data-div")[0].innerHTML = xmlhttp.responseText;
    };} 

    document.getElementsByClassName("change-data-div")[0].contentEditable = true;
    document.getElementsByClassName("change-data-div")[0].focus();
}

function edit_captions(){
    let sending_id;
    if(prev_id == 0) sending_id = curr_vid_id
    else sending_id = prev_id
    document.getElementsByClassName("change-data-div")[0].classList.add("change-data-div-active");
    document.getElementsByClassName("changedata_ctrl_div")[0].classList.remove("hidemepls");
    curr_viddata_change = "captions";

    let xmlhttp=new XMLHttpRequest();
    xmlhttp.open("POST","./files/body parts/edit captions.php",true);
    xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlhttp.send(`work=a&vid_id=${sending_id}`);
    xmlhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            document.getElementsByClassName("change-data-div")[0].innerHTML = xmlhttp.responseText;
            if(document.getElementsByClassName("change-data-div")[0].innerHTML == "" || document.getElementsByClassName("change-data-div")[0].innerHTML == "null" || document.getElementsByClassName("change-data-div")[0].innerHTML == "<br>"){
                document.getElementsByClassName("change-data-div")[0].innerHTML = `{
                    "loc": "files/subtitles/",
                    "subs": {
                      "en": {
                        "url": "url1",
                        "style": {
                          "noedit": false,
                          "bg": {
                            "color": "colorless",
                            "padding": "default"
                          },
                          "font": {
                            "family": "default",
                            "style": "default",
                            "size": "default"
                          },
                          "align": "bottom",
                          "vdist": "default",
                          "hdist": "default"
                        }
                      }
                    },
                    "autosubs": true
                  }`
            }
    };} 
    document.getElementsByClassName("change-data-div")[0].contentEditable = true;
    document.getElementsByClassName("change-data-div")[0].focus();

}

function cancel_change_data(){
    document.getElementsByClassName("change-data-div")[0].classList.remove("change-data-div-active")
    document.getElementsByClassName("changedata_ctrl_div")[0].classList.add("hidemepls");
    document.getElementsByClassName("change-data-div")[0].contentEditable = false;
    curr_viddata_change = "";
    document.getElementsByClassName("change-data-div")[0].innerHTML = "";
}

function save_change_data(){
    let sending_id;
    if(prev_id == 0) sending_id = curr_vid_id
    else sending_id = prev_id

    if(curr_viddata_change === "tags"){
        let new_tags = document.getElementsByClassName("change-data-div")[0].textContent;

        let xmlhttp=new XMLHttpRequest();
        xmlhttp.open("POST","./files/body parts/edit tags.php",true);
        xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xmlhttp.send(`work=b&vid_id=${sending_id}&new_tags=${new_tags}`);
    }
    else if(curr_viddata_change === "captions"){
        let new_subs = document.getElementsByClassName("change-data-div")[0].textContent;
        first_subs = JSON.parse(new_subs)
        let xmlhttp=new XMLHttpRequest();
        xmlhttp.open("POST","./files/body parts/edit captions.php",true);
        xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xmlhttp.send(`work=b&vid_id=${sending_id}&new_captions=${new_subs}`);
    }

    cancel_change_data();
}

function get_vidformat(){
    let temp_Arerr = document.getElementsByClassName("video-src")[0].src.split(".");
    return temp_Arerr[temp_Arerr.length-1]
}
