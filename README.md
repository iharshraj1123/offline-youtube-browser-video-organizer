![play page](https://user-images.githubusercontent.com/33609172/154852861-5c026ea2-8436-447d-aa95-c4d3cfae514d.jpg)

![home](https://user-images.githubusercontent.com/33609172/154853030-9ae920eb-3286-4526-90c4-b7bebdf3b8b0.jpg)

First of all apologies since the code might be inefficient, left half way somewhere and not upto date cuz i was lazy. Im a civil engineer and this was the project from my high school times so there are many places you can make improvements.

**About the project :**

Its a web app that is like an organiser for your videos on your local disk. Do you hate going to VLC? hate leaving your browser? or hate being able to play only one song/media at a time? Offline youtube was made for these.

-very light weight on your disk space: It only stores local address of your videos in databases, it doesnt store your videos to your htdocs just where they are located in your videos. This saves a lot of space.

-Did i said it was light weight? : yes, but on your disk not your CPU or memory, I sacrificed them cuz space is a limited resource for me, i have a good enough specs to dont actually care about others. 

On Ryzen 7 4800H laptop cpu it will peak at 100% usage for few secs when you go on home page, cuz i did not saved thumbnail (MUST SAVE SPACE!)

but its not bothersome you wont notice

-Note that "comment section + chatbox" was a different project of mine, I integrated them here cuz I was too laze to build from scratch.

-There are a lot of features and also lot missing features. It can read subtitles as well in vtt format, add your subtitles in the "youtube/files/subtitles/"

***HOW to Setup :***

-> Copy-paste all the folders (eg, youtube, chatbox, comment section) in your htdocs of your localserver.

-> First add the userdata database then youtube database to your sql (simply copy paste it in sql section of your phpmyadmin)

-> Add an account your sql/phpmyadmin with : {username = "admin"; password = "pwdpwd"; Priviledges : All (optional)}

Its a personal project so i did not created a setup page to do all of this automatically, if someone requests i will make one 

-> Note that if you allow hearing requests (idk what it was called im a civil engineer lol) in your xampp you can access this app from within your LAN as well from any device. But i have written this project such that its easy on my HDD space not cpu or Ram, so its a bit inefficient if you want to use it in a LAN or through tunneling. I have a different personal project for those use.

-> Now You Must allow localfile access in your browser using : 


(Alternative method at bottom is better, the first method is the official way i think, but i use the bottom one.

Its best for firefox, use the above one if you cant use bottom one)

--------------------------------------------------

// == FILE URI LINK POLICY (checkloaduri) ==

// Create policy enabling http: or https: pages to link to file:

user_pref("capability.policy.policynames", "filelinks");

user_pref("capability.policy.filelinks.checkloaduri.enabled", "allAccess");

// Sites to which the policy applies (protocol://hostname protocol://hostname)

user_pref("capability.policy.filelinks.sites", "http://localhost/YouTube/play.php http://localhost/YouTube/index.php http://localhost/YouTube/");


--------------------------------------------------
//Alternative (better, works well in firefox)//

use "about:config" in URL to go to advanced config

now make variables (by searching them, one by one) and set their corresponding values :

capability.policy.policynames = "filelinks"

capability.policy.filelinks.checkloaduri.enabled = "allAccess"

capability.policy.filelinks.sites = "http://localhost/YouTube/play.php http://localhost/YouTube/index.php http://localhost/YouTube/"


--------------------------------------------------

**HOT KEYs** (the video must be focussed to use the ones below)

5 (from Numpad) :  focus video  (use this if video isnt focussed and you too lazy to move mouse)

N: next video, P: previous video, L: Loop, R: Random/in-queue

Space: Pause, F: fullscreen, T : theatre mode, C: captions/subtitles

0 (Numpad) = reverse (works in in-queue mode), 

. (decimal,from numpad): deletes history

--------------------------------------------------

**Important instructions:**

-> upload.php and in redirect.php is used to upload data upload.php gives data to redirect.php on work a to upload to database, Use "other" category on upload.php to test the app is working well.

Change Video songs category, add your own categories by editing the upload.php acc to where you store your videos/songs.

You can upload multiple videos at ones. Note only Mp4, webm & mp3 are supported. 
