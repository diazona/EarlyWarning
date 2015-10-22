// ==UserScript==
// @name        Early Warning
// @namespace   https://github.com/normalhuman/EarlyWarning
// @description Posts temporary comments to (Math.SE) questions with problematic titles or tags 
// @match       *://stackexchange.com/search
// @grant       none
// @run-at      document-end
// @version     15.10.10
// ==/UserScript==

// runs only if a browser is pointed at the page //stackexchange.com/search#bot

if (window.location.hash === '#bot') {
  var token = 'ACCESS_TOKEN';    // get access token from the url hash at https://stackexchange.com/oauth/dialog?client_id=5748&scope=no_expiry,write_access&redirect_uri=https://stackexchange.com/
  var apiKey = 'vURDLnkgkrLc7qAq)D89tA(('; 
  var site = 'math';
  var siteUrl = 'http://math.stackexchange.com';
  var qId, topTag, comment, linkGood;
  var commented = [];
  
  // most popular tags are whitelisted to reduce API requests:  
  var popular = ['calculus', 'real-analysis', 'linear-algebra', 'probability', 'abstract-algebra', 'general-topology', 'combinatorics', 'complex-analysis', 
                 'algebra-precalculus', 'geometry', 'functional-analysis', 'number-theory', 'differential-equations', 'elementary-number-theory', 'limits', 
                 'probability-theory', 'measure-theory', 'statistics', 'multivariable-calculus', 'elementary-set-theory'];
  
  // These are rare (<1000 questions) but okay: 
  var okay = ['automata', 'analytic-number-theory', 'boolean-algebra', 'calculus-of-variations', 'coding-theory', 'computability', 'complex-geometry', 'formal-languages',
              'game-theory', 'harmonic-analysis', 'homological-algebra', 'homotopy-theory', 'laplace-transform', 'linear-programming', 'mathematical-physics', 
              'model-theory', 'numerical-linear-algebra', 'order-theory', 'predicate-logic', 'propositional-calculus', 'puzzle', 'regular-language', 'stochastic-calculus'];  
  
  // These should not be used on their own
  var vague = ['advice', 'big-list', 'book-recommendation', 'contest-math', 'definition', 'norm', 'notation', 'proof-strategy', 'proof-verification', 
               'proof-writing', 'reference-request', 'soft-question', 'terminology', 'transformation'];
  
  // Suggest replacements for these: 
  var replaceTag = ['analysis']; 
  var replacements = [['real-analysis', 'complex-analysis', 'functional-analysis', 'fourier-analysis', 'measure-theory', 'calculus-of-variations']];

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
  comment = '';
  linkGood = false; 
  commentOnTitle(title);
  window.setTimeout(commentOnTags, 15000, data.tags);  
}  


function commentOnTags(tags) {
  topTag = tags[0]; 
  var replacing = replaceTag.indexOf(topTag);
  if (popular.indexOf(topTag) > -1 || okay.indexOf(topTag) > -1) {
    commentOnBody();
  }
  else if (tags.indexOf('self-learning') > -1 && arraysDisjoint(tags, ['soft-question', 'career-development', 'education', 'teaching', 'advice', 'book-recommendation', 'reference-request', 'big-list'])) {
    comment = comment + "Please don't use (self-learning) tag just because you were self-studying when you came across this question. This tag is only for questions *about the process of self-studying*. ";
    commentOnBody();
  }
  else if (replacing > -1 && arraysDisjoint(tags, replacements[replacing])) {
    comment = comment + 'Consider replacing (' + topTag + ') with a more specific tag, such as ' + replacements[replacing].slice(0,3).map(function(a) {return '('+a+')';}).join(', ') + '... ';
    commentOnBody();
  }
  else if (vague.indexOf(topTag) > -1 && tags.length == 1) {
    comment = comment + 'Tag ('+topTag+') should not be the only tag a question has. Please add a tag for a subject area to which the question belongs. ';
    commentOnBody();
  }
  else {
    var filter = '!GeBU7l0z-7CFD';
    var request = '//api.stackexchange.com/2.2/tags/'+topTag+'/info?order=desc&sort=popular&site='+site+'&filter='+filter+'&key='+apiKey;
    $.ajax({url: request, dataType: 'json', method: 'GET'}).done(function(data) {
      var count = data.items[0].count;
      if (count > 0 && count < 1500) {  
        comment = comment + 'Consider adding a tag for a broader subject area to which the question belongs. This will improve the visibility of your question. ';
      }
      commentOnBody();
    });
  }
}


function commentOnTitle(title) {
  var badWords = title.match(/\b(anyone|difficult|doubt|hard|help|interesting|please|query|question|someone|task|tough)\b/ig); 
  var badPunctuation = title.match(/\?{2,}/ig);
  var linkGood = false;
  if (badWords && title.length <= 70) {
    var prepWords = '*' + badWords.join(', ').toLowerCase() + '*';
    comment = comment + 'Words such as ' + prepWords + ' do not add information to titles. Please [edit] the title so that it better describes the specifics of your question. Do not hesitate to make it longer or include a formula if needed. ';
    linkGood = true;
  }
  if (badPunctuation) {
    comment = comment + 'Please remove excessive punctuation such as "' + badPunctuation[0] + '". ';
    linkGood = true;
  }
  if (/\\dfrac/.test(title)) {
    comment = comment + 'Please replace `\\dfrac` with `\\frac` in the title; tall formulas in titles break the layout of question lists. ';
  }
  else if (/\\displaystyle/.test(title)) {
    comment = comment + 'Please remove `\\displaystyle` from the title; tall formulas in titles break the layout of question lists. ';
  }  
  else if (/(\\int|\\sum)\s*\\limits/.test(title)) {
    comment = comment + 'Please remove `\\limits` from the title; tall formulas in titles break the layout of question lists. ';
  }  
}


function commentOnBody() {
  var filter = '!GeEyUcJFJO6t)';
  var request = '//api.stackexchange.com/2.2/questions/' + qId + '?order=desc&sort=activity&site='+site+'&filter='+filter+'&key='+apiKey;
  $.ajax({url: request, dataType: 'json', method: 'GET'}).done(function(data) {
    var body = data.items[0].body;
    var math = body.match(/&lt;|&gt;|[*^]|\/\d|\b(sin|cos|tan|exp|log|ln|sqrt|pi)\b/g);
    if (!/\$/.test(body) && math && math.length >= 5) {
      comment = comment + 'Formulas should be MathJax-formatted: see [math notation guide](//math.stackexchange.com/help/notation). ';
      linkGood = true;   
    }
    if (linkGood) {
      comment = comment + 'See also: [How to ask a good question?](//meta.math.stackexchange.com/q/9959) ';
    }
    sendComment(); 
  });  
}


function sendComment() {
  if (comment.length > 0 && commented.indexOf(qId) == -1) {
    commented.push(qId);
    comment = comment.slice(0,600);
    var filter = '!.UDq27j4ipL8j8W9';
    var request = 'https://api.stackexchange.com/2.2/posts/'+qId+'/comments/add';
    var payload = {site: site, key: apiKey, access_token: token, body: comment, preview: false, filter: filter};
    $.post(request, payload, handle, 'json');
    var report = commented.length + '. Comment on ' + siteUrl + '/q/' + qId + '\n' + comment; 
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
  var payload = {site: site, key: apiKey, access_token: token};
  $.post(request, payload);
}


function arraysDisjoint(arr1, arr2) {
  for (var i = 0; i < arr1.length; i++) {
    if (arr2.indexOf(arr1[i]) > -1) {
      return false;
    }
  }
  return true;
}
  
