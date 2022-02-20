Must allow localfile access using : 
(Alternative better way below,I used firefox and it works fine)
(if ur on edge well get cucked)

// == FILE URI LINK POLICY (checkloaduri) ==

// Create policy enabling http: or https: pages to link to file:
user_pref("capability.policy.policynames", "filelinks");
user_pref("capability.policy.filelinks.checkloaduri.enabled", "allAccess");

// Sites to which the policy applies (protocol://hostname protocol://hostname)
user_pref("capability.policy.filelinks.sites", "http://localhost/YouTube/play.php http://localhost/YouTube/index.php http://localhost/YouTube/");



///////////////////////////alternative (better, works well in firefox)///////////////////
use "about:config" in URL to go to advanced config
now make variables (by searching them, one by one) and set their corresponding values :

capability.policy.policynames = "filelinks"
capability.policy.filelinks.checkloaduri.enabled = "allAccess"
capability.policy.filelinks.sites = "http://localhost/YouTube/play.php http://localhost/YouTube/index.php http://localhost/YouTube/"
