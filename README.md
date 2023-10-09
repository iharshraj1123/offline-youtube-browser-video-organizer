# Offline YouTube - Video organizer

![home](https://user-images.githubusercontent.com/33609172/154853030-9ae920eb-3286-4526-90c4-b7bebdf3b8b0.jpg)

![play page](https://user-images.githubusercontent.com/33609172/154852861-5c026ea2-8436-447d-aa95-c4d3cfae514d.jpg)

![image](https://user-images.githubusercontent.com/33609172/156556331-19c255af-42c7-4dd2-a9e5-3d681e6b50d2.png)

![image](https://user-images.githubusercontent.com/33609172/156562151-12132a8c-ee8b-40d4-bf2e-dd391d0803f9.png)

First of all apologies since the code might be inefficient, left half way somewhere and not upto date cuz i was lazy. Im not a professional coder and this was the project from my high school times for my personal use so there are many places you can make improvements.

### About the project :

Its a web app it runs on php & mysql its like an organiser for your videos on your local disk. Do you hate going to VLC? hate leaving your browser? or hate being able to play only one song/media at a time? Offline youtube was made for these.

-very light weight on your disk space: It only stores local address of your videos in databases, it doesnt store your videos to your htdocs just where they are located in your videos. This saves a lot of space.

-Did i said it was light weight? : yes, but on your disk not your CPU or memory, I sacrificed them cuz space is a limited resource for me, i have a good enough specs to dont actually care about others. 

On Ryzen 7 4800H laptop cpu it will peak at 100% usage for few secs when you go on home page, cuz i did not saved thumbnail (MUST SAVE SPACE!)

but its not bothersome you wont notice

-Note that "comment section + chatbox" was a different project of mine, I integrated them here cuz I was too laze to build from scratch.

-There are a lot of features and also lot missing features. It can read subtitles as well in vtt format, add your subtitles in the "youtube/files/subtitles/"

## Requirements :

- Xampp 7.4.14 from [this link](https://sourceforge.net/projects/xampp/files/XAMPP%20Windows/7.4.14/xampp-windows-x64-7.4.14-1-VC15-installer.exe/download). You can do it other ways too but this is the simplest way.

- Browser with local file access turned on (discussed below)

- Patience. I was lazy so I didnt make a setup page where a lot of things could have been automated but it will take effort to make that.

## HOW to Setup :

1. Copy-paste all the folders (eg, youtube, chatbox, comment section) in your htdocs.
2. Install the [Electron player](https://drive.google.com/drive/u/0/folders/18UFdW4VaAEURjlz-P35kFZAp5TgF99ky)
3. Open your xampp, in Apache row click on config, then httpd.conf (first option)
First search for "\<IfModule alias_module>"
And add:
```
    Alias "/d:" "D:/"
    Alias "/c:" "C:/"
```
before "<\/IfModule>"

Add these codes in bottom of httpd.conf:
```
<Directory "D:/">
    Options Indexes FollowSymLinks Includes ExecCGI
    AllowOverride All
    Require all granted
</Directory>
<Directory "C:/">
    Options Indexes FollowSymLinks Includes ExecCGI
    AllowOverride All
    Require all granted
</Directory>
```

4. First add the "userdata" database then "youtube" database from the files provided to your sql (simply copy paste it in sql section of your phpmyadmin)

5. Add an account to Mysql/phpmyadmin : {username = "admin"; password = "pwdpwd"; Priviledges : All (optional)}

or run this SQL: 

```GRANT ALL PRIVILEGES ON * . * TO 'admin'@'%' IDENTIFIED BY 'pwdpwd' WITH GRANT OPTION;```
   
6. Now You Must allow localfile access in your browser using :

--------------------------------------------------
### Method 1 (best for firefox)

use "about:config" in URL to go to advanced config

now make variables (by searching them, one by one) and set their corresponding values :

capability.policy.policynames = "filelinks"

capability.policy.filelinks.checkloaduri.enabled = "allAccess"

capability.policy.filelinks.sites = "http://localhost/YouTube/play.php http://localhost/YouTube/index.php http://localhost/YouTube/"


--------------------------------------------------

### Method 2

// == FILE URI LINK POLICY (checkloaduri) ==

// Create policy enabling http: or https: pages to link to file:

user_pref("capability.policy.policynames", "filelinks");

user_pref("capability.policy.filelinks.checkloaduri.enabled", "allAccess");

// Sites to which the policy applies (protocol://hostname protocol://hostname)

user_pref("capability.policy.filelinks.sites", "http://localhost/YouTube/play.php http://localhost/YouTube/index.php http://localhost/YouTube/");


--------------------------------------------------

## HOT KEYs (the video must be focussed to use the ones below)

5 (from Numpad) :  focus video  (use this if video isnt focussed and you too lazy to move mouse)

N: next video, P: previous video, L: Loop, R: Random/in-queue

Space: Pause, F: fullscreen, T : theatre mode, C: captions/subtitles

0 (Numpad) = reverse (works in in-queue mode), 

. (decimal,from numpad): deletes play history

--------------------------------------------------

## Important instructions:

- upload.php and redirect.php is used to upload data, upload.php gives data to redirect.php on "work a" to upload to database, Use "other" category on upload.php to test if the app is working well.

- Change Video songs category, add your own categories by editing the upload.php acc to where you store your videos/songs. eg "video songs" in my case directs to "D:/video songs/"

- You can upload multiple videos at ones. Note only Mp4, webm & mp3 are supported. 
