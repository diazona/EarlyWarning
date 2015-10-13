// ==UserScript==
// @name        Early Warning
// @namespace   https://github.com/normalhuman/EarlyWarning
// @description Posts temporary comments to (Math.SE) questions with problematic titles or tags 
// @match       *://stackexchange.com/search
// @grant       none
// @run-at      document-end
// @version     15.10.4
// ==/UserScript==

// runs only if a browser is pointed at the page //stackexchange.com/search#bot

if (window.location.hash === '#bot') {
  var token = 'ACCESS_TOKEN';    // get access token from the url hash at https://stackexchange.com/oauth/dialog?client_id=5748&scope=no_expiry,write_access&redirect_uri=https://stackexchange.com/
  var apiKey = 'vURDLnkgkrLc7qAq)D89tA(('; 
  var site = 'math';
  var siteUrl = 'http://math.stackexchange.com';

  var qId, topTag, comment;
  var standardComment = 'Consider adding a tag for a broader subject area to which the question belongs. This will improve the visibility of your question.';
     // most popular tags are whitelisted to reduce API requests:  
  var popular = ['calculus', 'real-analysis', 'linear-algebra', 'probability', 'abstract-algebra', 'general-topology', 'combinatorics'];
     // These are rare (<1000 questions) but okay: 
  var okay = ['analytic-number-theory', 'boolean-algebra', 'coding-theory', 'computability', 'game-theory', 'harmonic-analysis', 'homological-algebra', 'homotopy-theory', 
              'laplace-transform', 'linear-programming', 'mathematical-physics', 'model-theory', 'numerical-linear-algebra', 'predicate-logic', 'propositional-calculus', 'stochastic-calculus'];  
     // These should not be used on their own
  var vague = ['advice', 'big-list', 'book-recommendation', 'contest-math', 'definition', 'norm', 'notation', 'proof-strategy', 'proof-verification', 'proof-writing', 'reference-request', 'soft-question', 'terminology', 'transformation'];
     // These warrant a more specific comment:
  var special = ['analysis', 'computer-science', 'cryptography', 'economics', 'math-history', 'philosophy', 'signal-processing'];
  var specialComments = ["Consider replacing (analysis) with a more specific tag, such as (real-analysis), (complex-analysis), (functional-analysis), (fourier-analysis), (measure-theory), etc",
                         "If you haven't already, consider asking at [CS.SE] instead.",
                         "If you haven't already, consider asking at [Cryptography.SE] instead.",
                         "If you haven't already, consider asking at [Economics.SE] instead.",
                         "If you haven't already, consider asking at [HSM.SE] instead.",
                         "If you haven't already, consider asking at [Philosophy.SE] instead.",
                         "If you haven't already, consider asking at [DSP.SE] instead."];
  startup();
}

function startup() {
  var report;
  var prot = (window.location.protocol === 'https' ? 'wss' : 'ws');
  ws = new WebSocket(prot+'://qa.sockets.stackexchange.com/');
  ws.onmessage = function(e) {
    var realData = JSON.parse(e.data).data;
    if (realData !== 'hb') {
      processQuestion(JSON.parse(realData));
    }
  };
  ws.onopen = function() { ws.send('69-questions-newest'); };
  ws.onclose = function() {console.log('Websocket closed'); window.setTimeout(startup, 10000);};
  report = 'Early Warning Bot started up.\n'+Date().toString();
  console.log(report); 
}


function processQuestion(data) {
  qId = data.id;
  var title = data.body.split('"question-hyperlink">')[1].split('</a>')[0];
  comment = commentOnTitle(title);
  topTag = data.tags[0];
  if (data.tags.indexOf('self-learning') > 0 && data.tags.indexOf('soft-question') == -1 && data.tags.indexOf('career-development') == -1 && data.tags.indexOf('education') == -1 && data.tags.indexOf('advice') == -1) {
    comment = comment + "Please don't use (self-learning) tag just because you were self-studying when you came across this question. This tag is only for questions *about the process of self-studying*";
    sendComment(qId, comment);
  }
  else if (special.indexOf(topTag) > -1 ) {
    comment = comment + specialComments[special.indexOf(topTag)];
    sendComment(qId, comment);
  }
  else if (vague.indexOf(topTag) > -1 && data.tags == 1) {
    comment = comment + 'Tag ('+topTag+') should not be the only tag a question has. Please add a tag for a subject area to which the question belongs.';
    sendComment(qId, comment);
  }
  else if (popular.indexOf(topTag) > -1 || okay.indexOf(topTag) > -1) {
    sendComment(qId, comment);    
  }
  else {
    var filter = '!GeBU7l0z-7CFD';
    var request = '//api.stackexchange.com/2.2/tags/'+topTag+'/info?order=desc&sort=popular&site='+site+'&filter='+filter+'&key='+apiKey;
    $.ajax({url: request, dataType: 'json', method: 'GET'}).done(function(data) {
      var count = data.items[0].count;
      if (count < 1500) {  
        comment = comment + standardComment;
      }
      sendComment(qId, comment);
    });
  }
}


function commentOnTitle(title) {
  var onTitle = '', badWords = title.match(/anyone|difficult|doubt|easy|hard|help|interesting|please|problem|query|question|someone|tough/ig);
  if (badWords && title.length <= 70) {
    var prepWords = '*' + badWords.join(', ').toLowerCase() + '*';
    onTitle = 'Words such as ' + prepWords + ' do not add information. Please [edit] the title so that it better describes the specifics of your question. Do not hesitate to make it longer. ';
  }
  return onTitle;
}


function sendComment(id, text) {
  if (text.length > 0) {
    var filter = '!.UDq27j4ipL8j8W9';
    var request = 'https://api.stackexchange.com/2.2/posts/'+id+'/comments/add';
    var payload = {site: site, id: id, key: apiKey, access_token: token, body: text, preview: false, filter: filter};
    $.post(request, payload, handle, 'json');
    var report = 'Comment on ' + siteUrl + '/q/' + qId + '\n' + text; 
    console.log(report);
  }
}


function handle(data) {
  var report;
  if (data.error_message) {
    report = 'Failed to comment on '+siteUrl+'/q/'+qId+'\n'+data.error_message;
    console.log(report);
  }
  else {
    window.setTimeout(deleteComment, 300000, data.items[0].comment_id);
  }
}


function deleteComment(cId) {
  var request = 'https://api.stackexchange.com/2.2/comments/'+cId+'/delete';
  var payload = {site: site, id: cId, key: apiKey, access_token: token};
  $.post(request, payload);
}
