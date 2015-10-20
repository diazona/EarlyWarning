# EarlyWarning

Leaves a temporary comment on (Math) Stack Exchange questions with problematic tags or titles

Some of the issues detected by the bot: 

* non-descriptive title
* a vague tag used as the only tag 
* all tags used are relatively obscure
* math formulas are not formatted using MathJax syntax

If a problem is detected, a temporarily comment is created to encourage the author to edit. The comment is deleted after 5 minutes. 

Motivated by the feature request [A warning to those who use only rare/new tags](http://meta.math.stackexchange.com/q/21669); consequently, the logic of tag handling is specific to Math site. Also, MathJax warnings would make sense only on MathJax-enabled sites. 

The required access token can be obtained from URL hash after following [this link](https://stackexchange.com/oauth/dialog?client_id=5748&scope=no_expiry,write_access&redirect_uri=https://stackexchange.com/) and authorizing the application.

License: [WTFPL](http://www.wtfpl.net)
