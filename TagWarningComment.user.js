// ==UserScript==
// @name        Tag Warning Comment
// @namespace   https://github.com/normalhuman/
// @description Detects and comments on questions with problematic tags
// @match       *://stackexchange.com/search
// @grant       none
// @run-at      document-end
// @version     15.10.1
// ==/UserScript==

var token = 'YOUR_ACCESS_TOKEN';    
// get access token from the url hash at https://stackexchange.com/oauth/dialog?client_id=5748&scope=no_expiry,write_access&redirect_uri=https://stackexchange.com/
var apiKey = 'vURDLnkgkrLc7qAq)D89tA(('; 
var site = 'math';
var siteUrl = 'http://math.stackexchange.com';

var qId, maxId = 0, topTag;
var standardComment = 'Consider adding a tag for a broader subject area to which the question belongs. This will improve the visibility of your question.';
var popular = ['calculus', 'real-analysis', 'linear-algebra', 'probability', 'abstract-algebra', 'general-topology', 'combinatorics'];
 // most popular tags are whitelisted to reduce API requests  
var okay = ['coding-theory', 'computability', 'harmonic-analysis', 'predicate-logic', 'information-theory']; 
 // These are rare (<1000 questions) but okay 
var special = ['cryptography', 'economics', 'philosophy'];
 // These warrant a more specific comment
var specialComments = ["If you haven't already, consider asking at [Cryptography.SE] instead.",
                       "If you haven't already, consider asking at [Economics.SE] instead.",
                       "If you haven't already, consider asking at [Philosophy.SE] instead."];
startup();


function startup() {
  var prot = (window.location.protocol === 'https' ? 'wss' : 'ws');
  ws = new WebSocket(prot+'://qa.sockets.stackexchange.com/');
  ws.onmessage = function(e) {
    processQuestion(JSON.parse(JSON.parse(e.data).data));
  };
  ws.onopen = function() { ws.send('69-questions-active'); };
  ws.onclose = function() {console.log('Websocket closed'); window.setTimeout(startup, 10000);};
}


function processQuestion(data) {
  qId = parseInt(data.id, 10);
  if (qId > maxId) {
    maxId = qId;
    topTag = data.tags[0];
    if (special.indexOf(topTag) > -1 ) {
      comment(qId, specialComment[special.indexOf(topTag)]);
    }
    if (popular.indexOf(topTag) == -1 && okay.indexOf(topTag) == -1) {
      var filter = '!GeBU7l0z-7CFD';
      var request = '//api.stackexchange.com/2.2/tags/'+topTag+'/info?order=desc&sort=popular&site='+site+'&filter='+filter+'&key='+apiKey;
      $.ajax({url: request, dataType: 'json', method: 'GET'}).done(function(data) {
        var count = data.items[0].count;
        var report = 'Count ' + count + ' for question '+siteUrl+'/q/' + qId + '\nTop tag: ' + topTag;
        console.log(report);
        if (count < 1000) {  
          comment(qId, standardComment);
        }
      });
    }
  }
}


function comment(id, text) {
  var filter = '!.UDq27j4ipL8j8W9';
  var request = 'https://api.stackexchange.com/2.2/posts/'+id+'/comments/add';
  var payload = {site: site, id: id, key: apiKey, access_token: token, body: text, preview: false, filter: filter};
  $.post(request, payload, handle, 'json');
}


function handle(data) {
  var report;
  if (data.error_message) {
    report = 'Failed to comment on '+siteUrl+'/q/'+qId+'\n'+data.error_message;
  }
  else {
    console.log(data);
    report = 'Commented on '+siteUrl+'/q/'+qId;
    window.setTimeout(deleteComment, 600000, data.items[0].comment_id);
  }
  console.log(report);
}


function deleteComment(cId) {
  var request = 'https://api.stackexchange.com/2.2/comments/'+cId+'/delete';
  var payload = {site: site, id: cId, key: apiKey, access_token: token};
  $.post(request, payload);
}
