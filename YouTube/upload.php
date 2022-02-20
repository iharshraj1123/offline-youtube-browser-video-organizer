<?php 
session_start();
$servername = "localhost";
$username = "admin";
$password = "pwdpwd";
$dbname = "youtube";

$conn = new mysqli($servername, $username, $password, $dbname);

///////////////////////////////////FOUND ERRORS//////////////////////////////////////////
/*
File shouldnt contain, " its should be replaced with ''
File shouldnt contain, + its should be replaced with (dont know yet)


*/


//get playlist array
$vid_data = "SELECT * FROM video_metadatas WHERE vid_id='10'";

$result = $conn->query($vid_data);
$output_playlist_all = null;

if($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $output_playlist_all = unserialize($row["vid_name"]);
    }
}

$playlist_all_old = array("1","2","984","985","986","987","988","989","990","991","992","993","994","995","996","997","998","999","1000","1001","1002","1003","1004","1005","1006","1007","1008","1009","1010","1011","1012","1013","1014","1015","1016","1017","1018","1019","1020","1021","1022","1023","1024","1025","1026","1027","1028","1029","1030","1031","1032","1033","1034","1035","1036","1037","1038","1039","1040","1041","1042","1043","1044","1045","1046","1047","1048","1049","1050","1051","1052","1053","1054","1055","1056","1057","1058","1059","1060","1061","1062","1063","1064","1065","1066","1067","1068","1069","1070","1071","1072","1073","1074","1075","1076","1077","1078","1079","1080","1081","1082","1083","1084","1085","1086","1087","1088","1089","1090","1091","1092","1093","1094","1095","1096","1097","1098","1099","1100","1101","1102","1103","1104","1105","1106","1107","1108","1109","1110","1111","1112","1113","1114","1115","1116","1117","1118","1119","1120","1121","1122","1123","1124","1125","1126","1127","1128","1129","1130","1131","1132","1133","1134","1135","1136","1137","1138","1139","1140","1141","1142","1143","1144","1145","1146","1147","1148","1149","1150","1151","1152","1153","1154","1155","1156","1157","1158","1159","1160","1161","1162","1163","1164","1165","1166","1167","1168","1169","1170","1171","1172","1173","1174","1175","1176","1177","1178","1179","1180","1181","1182","1183","1184","1185","1186","1187","1188","1189","1190","1191","1192","1193","1194","1195","1196","1197","1198","1199","1200","1201","1202","1203","1204","1205","1206","1207","1208","1209","1210","1211","1212","1213","1214","1215","1216","1217","1218","1219","1220","1221","1222","1223","1224","1225","1226","1227","1228","1229","1230","1231","1232","1233","1234","1235","1236","1237","1238","1239","1240","1241","1242","1243","1244","1245","1246","1247","1248","1249","1250","1251","1252","1253","1254","1255","1256","1257","1258","1259","1260","1261","1262","1263","1264","1265","1266","1267","1268","1269","1270","1271","1272","1273","1274","1275","1276","1277","1278","1279","1280","1281","1282","1283","1284","1285","1286","1287","1288","1289","1290","1291","1292","1293","1294","1295","1296","1297","1298","1299","1300","1301","1302","1303","1304","1305","1306","1307","1308","1309","1310","1311","1312","1313","1314","1315","1316","1317","1318","1319","1320","1321","1322","1323","1324","1325","1326","1327","1328","1329","1330","1331","1332","1333","1334","1335","1336","1337","1338","1339","1340","1341","1342","1343","1344","1345","1346","1347","1348","1349","1350","1351","1352","1353","1354","1355","1356","1357","1358","1359","1360","1361","1362","1363","1364","1365","1366","1367","1368","1369","1370","1371","1372","1373","1374","1375","1376","1377","1378","1379","1380","1381","1382","1383","1384","1385","1386","1387","1388","1389","1390","1391","1392","1393","1394","1395","1396","1397","1398","1399","1400","1401","1402","1403","1404","1405","1406","1407","1408","1409","1410","1411","1412","1413","1414","1415","1416","1417","1418","1419","1420","1421","1422","1423","1424","1425","1426","1427","1428","1429","1430","1431","1432","1433","1434","1435","1436","1437","1438","1439","1440","1441","1442","1443","1444","1445","1446","1447","1448","1449","1450","1451","1452","1453","1454","1455","1456","1457","1458","1459","1460","1461","1462","1463","1464","1465","1466","1467","1468","1469","1470","1471","1472","1473","1474","1475","1476","1477","1478","1479","1480","1481","1482","1483","1484","1485","1486");
$playlist_all_old_serialized = serialize($playlist_all_old);

//echo "new array =". $output_playlist_all[504];

//   var jArray = <?php echo json_encode($phpArray); >?

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Upload</title>
    <style>
        .hidemepls{ 
            display:none;
        }
        label,input{
            cursor: pointer;
        }
    </style>
</head>
<body>

<form enctype="multipart/form-data">
    <div class="upload-form">
        <h1>Upload details</h1><br>

        <p>Select the file location: </p>

        <input onclick="other_off()"  type="radio" id="downloads" name="location1" value="file:///C:/Users/ihars/Downloads/">
           <label onclick="other_off()"  for="downloads">Downloads</label><br>

        <input onclick="other_off()" type="radio" id="video-songs" name="location1" value="file:///D:/Video%20songs/">
           <label onclick="other_off()" for="video-songs">Video Songs</label><br>

        <input onclick="other_on()" type="radio" id="others" name="location1" value="others">
           <label onclick="other_on()" for="others">others</label><br><br>

        <label id="custom_location_label" class="hidemepls" for="custom_location">custom location prefix (URL) : </label><br>
        <textarea id="custom_location" class="hidemepls" name="custom_location" cols="100" rows="2" style="font-family:sans-serif;font-size:14px;background-color: smokewhite;border:0;border:2px solid rgb(211, 199, 199);">file:///D:/</textarea>
        <br><br>

        <input accept="video/mp4 video/webm" id="select-input" name="files[]" type="file" multiple><br>
        <span onclick="document.getElementById('select-input').value = '';" class="clearfile">Clear selected file</span><br><br>

        <input id="submit" name="submit" type="submit" value="Upload">
    </div>
</form>
<!--
<video preload="auto" id="playing-video" controls>
        <source class="video-src" src="file:///D:/Video%20songs/Hatsune%20Miku%20_%20Triple%20Baka%20-%20Full%20Song%20(English%20Subtitles%20v2).mp4">
        <track class="temposos-trackos" src="sample vtt.vtt" kind="subtitles" srclang="en" label="English">
    </video>
        -->
<p id="response-p"></p>
<p id="response-p2">reponse end</p>

<script>

document.addEventListener("submit", (e) => {
    e.preventDefault();
    var location1 = document.querySelector('input[name="location1"]:checked').value;
    if(location1 == "others"){
        location1 = document.getElementById("custom_location").value
    }

    var file_no = document.getElementById("select-input").files.length;
    
    var file_name_arr = new Array();
    var file = document.getElementById('select-input');
    for(var i = 0; i < file.files.length; i++){
        if(file.files[i].name){
           let temp_word = file.files[i].name;

           temp_word = temp_word.replaceAll("\”","&quote&;")
           temp_word = temp_word.replaceAll("\“","&quote;")
           temp_word = temp_word.replaceAll("\'","&#39;")
           temp_word = temp_word.replaceAll("\"","&quot;")
           temp_word = temp_word.replaceAll("\+","&#43;")
           temp_word = temp_word.replaceAll("&","!1and1!")


           file_name_arr.push(temp_word);}
        else{
            alert("only 1 file")
           let temp_word = file.files.item(0).name;
           temp_word = temp_word.replace("&","!1and1!")
           file_name_arr.push(temp_word);
        }
    }
    var json_arr = JSON.stringify(file_name_arr);

    let xmlhttp=new XMLHttpRequest();
    xmlhttp.open("POST","redirect.php",true);
    xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlhttp.send(`work=a&location1=${location1}&file_no=${file_no}&json_arr=${json_arr}`);
    setTimeout(function(){
    if (xmlhttp.readyState==4 && xmlhttp.status==200) {
    document.getElementById("response-p").innerHTML = xmlhttp.responseText;
    };},100)
    
});

function other_on(){
    document.getElementById("custom_location").classList.remove("hidemepls")
    document.getElementById("custom_location_label").classList.remove("hidemepls")
}

function other_off(){
    document.getElementById("custom_location").classList.add("hidemepls")
    document.getElementById("custom_location_label").classList.add("hidemepls")
}

</script>

</body>
</html>

