"# offline-youtube" 

-> Copy-paste all the folders (eg, youtube, chatbox, comment section) in your htdocs of your localserver.

-> First add the userdata database then youtube database to your sql (simply copy paste it in sql section of your phpmyadmin)

-> Make sure your sql profile is like this : {username = "admin"; password = "pwdpwd";}

-> Now You Must allow localfile access in your browser using : 

(Alternative better way at bottom, I used firefox and it works fine)

(if ur on edge well get cucked)

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

