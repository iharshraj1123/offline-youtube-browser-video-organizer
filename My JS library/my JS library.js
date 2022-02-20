/*Contents   
Dont increase lines in 'Contents' by pressing Enter, simply click to navigate betweeen lines

1.To make Random Numbers with limits          (line 100) : ConstrainedRan(min,max)
2.For constrained intervals                   (line 106) : ConstrainedInterval(function,rate,time)
3.To convert seconds into Min:sec             (line 112) : secToMinSec(seconds)
4.To convert seconds into hour:min:sec        (line 123) : secToHourMinSec(seconds)
5.To load a script                            (line 144) : loadScript(url)
6.To Round up a number                        (line 153) : RoundUp(number , numbers after decimal needed)
7.Cookies                                     (line 160) : SetCookie('x','value') , getCookie('x') 
8.Check if element is in view                 (line 195) : isElementInViewport('classname',class-index)

























































































*/
//1.to make random numbers
function ConstrainedRan(min,max) {
  var randomo = Math.floor(Math.random()*(max - min + 1) + min)
  return randomo
}

//2.For intervals that die out at fixed time
function ConstrainedInterval(function1,interval_rate,time_constrain){
   var make_interval = setInterval(function1 , interval_rate)
   setTimeout(function(){clearInterval(make_interval)},time_constrain)
}

//3.to convert seconds into minutes:seconds
function secToMinSec(input){
  input = Math.floor(parseInt(input))
  var m = (input - (input) % 60)/60 
  var s = input % 60
  var h = (m - (m % 60))/60

  if(s<10){return `${m}:0${s}`}
  else{return `${m}:${s}`}
}

//4.to convert seconds into hours:minutes:seconds
function secToHourMinSec(input){
  input = Math.floor(parseInt(input))
  var m = (input - (input) % 60)/60 
  var s = input % 60
  var h = (m - (m % 60))/60

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


//5 Load a script 
function loadScript(url){
  var script = document.createElement("script")
  script.type = "text/javascript";
  script.src = url ;
  document.getElementsByTagName("head")[0].appendChild(script);
}

//6 Round up a number
function roundUp(num, precision) {
  precision = Math.pow(10, precision)
  return Math.ceil(num * precision) / precision
}

//7 Cookies
function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  var expires = "expires="+d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
  var name = cname + "=";
  var ca = document.cookie.split(';');
  for(let i = 0; i < ca.length; i++) {
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

function isElementInViewport(x,y) {
  let el = document.getElementsByClassName(`${x}`)[y];

  let rect = el.getBoundingClientRect();

  return rect.bottom > 0 &&
      rect.right > 0 &&
      rect.left < (window.innerWidth || document.documentElement.clientWidth) &&
      rect.top < (window.innerHeight || document.documentElement.clientHeight) ;
}
