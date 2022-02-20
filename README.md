"# offline-youtube" 

![play page](https://user-images.githubusercontent.com/33609172/154852861-5c026ea2-8436-447d-aa95-c4d3cfae514d.jpg)

![home](https://user-images.githubusercontent.com/33609172/154853030-9ae920eb-3286-4526-90c4-b7bebdf3b8b0.jpg)

-> Copy-paste all the folders (eg, youtube, chatbox, comment section) in your htdocs of your localserver.

-> First add the userdata database then youtube database to your sql (simply copy paste it in sql section of your phpmyadmin)

-> Add an account your sql/phpmyadmin with : {username = "admin"; password = "pwdpwd"; Priviledges : All (optional)}

Its a personal project so i did not created a setup page to do all of this automatically, if someone requests i will make one 

-> Note that if you allow hearing requests in your xampp you can access this app from within your LAN as well from any device. But i have written this project such that its easy on my HDD space not cpu or Ram, so its a bit inefficient if you want to use it in a LAN or through tunneling. I have a different personal project for those use.

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

