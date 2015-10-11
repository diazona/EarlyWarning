# TagWarningComment

Leaves a temporary comment on Stack Exchange questions with problematic tags

This script scans the tags on new questions on a particular site (using websockets), and checks whether the top tag on the question indicates a problem: a typical problem is that the tag is rarely used, hence the question is poorly visible. In such a case, a temporarily comment is left to encourage adding a broader tag. The comment is deleted after a set time interval.

Motivated by the feature request [A warning to those who use only rare/new tags](http://meta.math.stackexchange.com/q/21669); consequently, the logic of tag handling is specific to Math site.

The required access token can be obtained from URL hash after following [this link](https://stackexchange.com/oauth/dialog?client_id=5748&scope=no_expiry,write_access&redirect_uri=https://stackexchange.com/) and authorizing the application.

License: [WTFPL](http://www.wtfpl.net)
