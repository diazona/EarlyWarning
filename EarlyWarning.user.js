// ==UserScript==
// @name        Early Warning
// @namespace   https://github.com/normalhuman/EarlyWarning
// @description Posts temporary comments to (Math.SE) questions, suggesting improvements to title, text, or tags 
// @match       *://stackexchange.com/search
// @grant       none
// @run-at      document-end
// @version     15.10.14
// ==/UserScript==

// runs only if the browser is pointed at //stackexchange.com/search#bot

if (window.location.hash === '#bot') {
  var Token = 'ACCESS_TOKEN';    // get access token from the url hash at https://stackexchange.com/oauth/dialog?client_id=5748&scope=no_expiry,write_access&redirect_uri=https://stackexchange.com/
  var MyUserId = '147263';                   // UserId under which the bot is run, replace with yours 
  var ApiKey = 'vURDLnkgkrLc7qAq)D89tA(('; 
  var Site = 'math';
  var SiteUrl = 'http://math.stackexchange.com';
  var Commented = [], MaxUser = 0, CommentId, PostId; 
  
  // Tags with 500+ questions: 
  var Popular = ['calculus', 'real-analysis', 'linear-algebra', 'probability', 'abstract-algebra', 'integration', 'sequences-and-series', 'general-topology', 'combinatorics', 'matrices', 'complex-analysis', 'group-theory', 'algebra-precalculus', 'analysis', 'geometry', 'functional-analysis', 'number-theory', 'differential-equations', 'elementary-number-theory', 'limits', 'probability-theory', 'measure-theory', 'statistics', 'multivariable-calculus', 'functions', 'discrete-mathematics', 'elementary-set-theory', 'trigonometry', 'algebraic-geometry', 'differential-geometry', 'derivatives', 'inequality', 'reference-request', 'logic', 'polynomials', 'graph-theory', 'probability-distributions', 'ring-theory', 'pde', 'algebraic-topology', 'proof-strategy', 'convergence', 'commutative-algebra', 'optimization', 'proof-verification', 'vector-spaces', 'definite-integrals', 'soft-question', 'complex-numbers', 'algorithms', 'summation', 'metric-spaces', 'stochastic-processes', 'finite-groups', 'numerical-methods', 'notation', 'category-theory', 'prime-numbers', 'fourier-analysis', 'field-theory', 'proof-writing', 'continuity', 'eigenvalues-eigenvectors', 'permutations', 'induction', 'set-theory', 'modular-arithmetic', 'logarithms', 'recurrence-relations', 'terminology', 'modules', 'representation-theory', 'operator-theory', 'asymptotics', 'arithmetic', 'random-variables', 'manifolds', 'algebraic-number-theory', 'power-series', 'convex-analysis', 'computer-science', 'hilbert-spaces', 'galois-theory', 'binomial-coefficients', 'improper-integrals', 'differential-topology', 'definition', 'contest-math', 'vectors', 'banach-spaces', 'self-learning', 'special-functions', 'exponential-function', 'divisibility', 'taylor-expansion', 'lie-groups', 'diophantine-equations', 'lebesgue-integral', 'fourier-series', 'normal-distribution', 'ideals', 'euclidean-geometry', 'dynamical-systems', 'physics', 'lie-algebras', 'determinant', 'compactness', 'analytic-geometry', 'recreational-mathematics', 'roots', 'systems-of-equations', 'riemannian-geometry', 'norm', 'circle', 'relations', 'education', 'examples-counterexamples', 'graphing-functions', 'intuition', 'sobolev-spaces', 'indefinite-integrals', 'triangle', 'convex-optimization', 'exponentiation', 'markov-chains', 'partial-derivative', 'combinations', 'finite-fields', 'lebesgue-measure', 'inverse', 'homological-algebra', 'problem-solving', 'approximation', 'vector-analysis', 'stochastic-calculus', 'expectation', 'transformation', 'generating-functions', 'puzzle', 'matlab', 'normed-spaces', 'order-theory', 'propositional-calculus', 'laplace-transform', 'linear-programming', 'math-history', 'homology-cohomology', 'cardinals', 'computational-complexity', 'mathematical-physics', 'solution-verification', 'inner-product-space', 'conic-sections', 'lp-spaces', 'model-theory', 'analytic-number-theory', 'contour-integration', 'tensor-products', 'abelian-groups', 'brownian-motion', 'functional-equations', 'homotopy-theory', 'factorial', 'factoring', 'extension-field', 'quadratics', 'game-theory', 'coordinate-systems', 'numerical-linear-algebra', 'closed-form', '3d', 'boolean-algebra', 'algebraic-curves', 'uniform-convergence', 'predicate-logic', 'computability', 'statistical-inference', 'distribution-theory', 'regression', 'equivalence-relations', 'rotations', 'surfaces', 'elliptic-curves', 'calculus-of-variations', 'polar-coordinates', 'conditional-probability', 'infinity', 'big-list', 'matrix-equations', 'axiom-of-choice', 'operator-algebras', 'connectedness', 'spectral-theory', 'book-recommendation', 'parametric', 'linear-transformations', 'differential-forms', 'fractions', 'congruences', 'harmonic-analysis', 'convolution', 'finance', 'random', 'tensors', 'real-numbers', 'volume', 'gamma-function', 'absolute-value', 'fibonacci-numbers', 'signal-processing', 'martingales', 'complex-geometry', 'cryptography', 'interpolation', 'irreducible-polynomials', 'riemann-zeta', 'sheaf-theory', 'nonlinear-optimization', 'area', 'residue-calculus', 'topological-groups', 'radicals', 'irrational-numbers', 'formal-languages', 'projective-geometry', 'alternative-proof', 'c-star-algebras', 'mathematical-modeling', 'first-order-logic', 'automata', 'vector-bundles', 'smooth-manifolds', 'partitions', 'recursion', 'stochastic-integrals', 'riemann-surfaces', 'symmetric-groups', 'schemes', 'quadratic-forms', 'ordinals', 'divergent-series', 'coding-theory', 'information-theory', 'lagrange-multiplier', 'recursive-algorithms', 'math-software', 'markov-process', 'group-actions', 'trees', 'harmonic-functions', 'rational-numbers', 'economics', 'machine-learning', 'applications', 'random-walk', 'banach-algebras', 'limsup-and-liminf', 'cyclic-groups', 'plane-curves', 'binary', 'matrix-calculus', 'hyperbolic-geometry', 'average', 'weak-convergence', 'diagonalization', 'fixed-point-theorems', 'p-adic-number-theory', 'products', 'computational-geometry', 'pi', 'standard-deviation', 'dice', 'topological-vector-spaces', 'epsilon-delta', 'lattice-orders', 'prime-factorization', 'noncommutative-algebra', 'bayesian', 'control-theory'];

  // Okay as a top tag: either popular or otherwise sufficient
  var Okay = Popular.concat(['combinatorial-game-theory', 'context-free-grammar', 'descriptive-statistics', 'finite-automata', 'percentages', 'regular-expressions', 'regular-language']);     
  
  // These should not be used on their own
  var Vague = ['advice', 'big-list', 'book-recommendation', 'calculator', 'contest-math', 'definition', 'examples-counterexamples', 'gmat-exam', 'gre-exam', 'norm', 'notation', 'proof-strategy', 'proof-verification', 'proof-writing', 'reference-request', 'soft-question', 'terminology', 'transformation'];
  
  // Suggest Replacements for these: 
  var ReplaceTag = ['analysis']; 
  var Replacements = [['real-analysis', 'complex-analysis', 'functional-analysis', 'fourier-analysis', 'harmonic-analysis', 'measure-theory', 'calculus-of-variations', 'calculus', 'multivariable-calculus', 'pde']];
  var ReplaceText = ['Consider replacing (analysis) with a more specific tag for the relevant branch of analysis. ']; 
  
  startup();
}

function startup() {
  var report;
  var prot = (window.location.protocol === 'https' ? 'wss' : 'ws');
  ws = new WebSocket(prot+'://qa.sockets.stackexchange.com/');
  ws.onmessage = function(e) {
    var realData = JSON.parse(e.data).data;
    if (realData !== 'hb') {
      window.setTimeout(processQuestion, 15000, JSON.parse(realData).id);
    }
  };
  ws.onopen = function() { ws.send('69-questions-newest'); };
  ws.onclose = function() {console.log('Websocket closed'); window.setTimeout(startup, 10000);};
  report = 'Early Warning Bot started up.\n'+Date().toString();
  console.log(report); 
}


function processQuestion(id) {
  var filter = '!YOKGOFluQgi8nEi-oxAb5iZ*Wh';
  var request = '//api.stackexchange.com/2.2/questions/' + id + '?order=desc&sort=activity&site='+Site+'&filter='+filter+'&key='+ApiKey;
  $.ajax({url: request, dataType: 'json', method: 'GET'}).done(function(data) {
    var postData = data.items[0];
    if (!postData) {
      report = 'Failed to fetch:\n' + data;
      console.log(report); 
    }
    else {
      var comment = {};
      comment.postId = postData.question_id; 
      comment.text = '';
      comment = commentOnTitle(postData.title, comment);
      comment = commentOnBody(postData.body, comment);
      comment = commentOnTags(postData.tags, comment);
      if (comment.linkGood) {
        comment.text = comment.text + 'See also: [How to ask a good question?](//meta.math.stackexchange.com/q/9959) ';
      }
      var uId = 0;
      if (postData.owner.user_id) {
        uId = parseInt(postData.owner.user_id, 10);
      }
      if (comment.text.length > 0 && (postData.owner.reputation == 1 || postData.owner.reputation == 101) && uId > MaxUser - 10) {
        comment.text = 'Welcome to Math.SE, ' + postData.owner.display_name + '. ' + comment.text;
      }
      sendComment(comment); 
      if (uId > MaxUser) {
        MaxUser = uId; 
      }
    }
  });
}


function commentOnTitle(title, comment) {
  var badWords = title.match(/\b(anyone|challenging|difficult|doubt|help|interesting|please|query|question|someone|struggling|stuck|task|tough)\b/ig); 
  var punctuationMatch = title.match(/\w\?{2,}/ig);
  var tallReasons = []; 
  if (badWords && title.length <= 70) {
    var prepWords = '*' + badWords.join(', ').toLowerCase() + '*';
    comment.text = comment.text + 'Words such as ' + prepWords + ' do not add information to titles. Please [edit] the title so that it better describes the specifics of your question. Do not hesitate to make it longer or include a formula if needed. ';
    comment.linkGood = true;
  }
  if (punctuationMatch) {
    comment.text = comment.text + 'Please avoid excessive punctuation such as "' + punctuationMatch[0].slice(1) + '". ';
    comment.linkGood = true;
  }
  if (/\\dfrac/.test(title)) {
    tallReasons.push('replace `\\dfrac` with `\\frac`');
  }
  if (/\\displaystyle/.test(title)) {
    tallReasons.push('remove `\\displaystyle`');
  }  
  if (tallReasons.length > 0) {
    comment.text = comment.text + 'Tall formulas in titles break the layout of question lists. Please ' + tallReasons.join(', ') + ' in the title. ';
  }
  if (/^\$[^$]*\$$/.test(title)) {
    comment.text = comment.text + 'A title should not be all-MathJax; having some plain text helps with search and navigation. ';
  }
  return comment;
}


function commentOnBody(body, comment) {
  body = body.replace(/<pre>[\s\S]*?<\/pre>/g, "pre");
  body = body.replace(/<code>[\s\S]*?<\/code>/g, "code");
  body = body.replace(/<a[\s\S]*?<\/a>/g, "link");
  var math = body.match(/&lt;|&gt;|[*^+_]|\/\d|\b(sin|cos|tan|exp|log|ln|sqrt|pi)\b/g);
  if (!/\$/.test(body) && math && math.length >= 5) {
    comment.text = comment.text + 'This site uses MathJax for formulas: see [math notation guide](//math.stackexchange.com/help/notation). ';
    comment.linkGood = true;
  }
  return comment;
}


function commentOnTags(tags, comment) {
  var obscureTags = ['Consider adding a [tag for a broader subject area](/tags) to which the question belongs. This will improve the visibility of your question. ', 'Questions tend to get more attention when they have a [tag for a broad area of mathematics](/tags) relevant to the question. '];  
  var topTag = tags[0]; 
  var replacing = ReplaceTag.indexOf(topTag);
  if (tags.indexOf('self-learning') > -1 && arraysDisjoint(tags, ['soft-question', 'career-development', 'education', 'teaching', 'advice', 'book-recommendation', 'reference-request', 'big-list'])) {
    comment.text = comment.text + "Please don't use (self-learning) tag just because you were self-studying. This tag is only for questions *about the process of self-studying*. ";
  }
  if (replacing > -1 && arraysDisjoint(tags, Replacements[replacing])) {
    comment.text = comment.text + ReplaceText[replacing];
  } 
  else if (Vague.indexOf(topTag) > -1 && tags.length == 1) {
    comment.text = comment.text + 'Tag ('+topTag+') should not be the only tag a question has. Please add a tag for a subject area to which the question belongs. ';
  }
  else if (Okay.indexOf(topTag) === -1) {
    comment.text = comment.text + obscureTags[Math.floor(obscureTags.length*Math.random())];
  }
  return comment;
}


function sendComment(comment) {
  if (comment.text.length > 0 && Commented.indexOf(comment.postId) === -1) {
    Commented.push(comment.postId);
    PostId = comment.postId;
    var commentToPost = comment.text.slice(0,600);
    var filter = '!.UDq27j4ipL8j8W9';
    var request = 'https://api.stackexchange.com/2.2/posts/' + comment.postId + '/comments/add';
    var payload = {site: Site, key: ApiKey, access_Token: Token, body: commentToPost, preview: false, filter: filter};
    $.post(request, payload, handle, 'json');
    var report = Commented.length + '. Comment on ' + SiteUrl + '/q/' + comment.postId + '\n' + commentToPost; 
    console.log(report);
  }
}


function handle(data) {
  var report;
  if (data.error_message) {
    report = 'Failed to comment on '+SiteUrl+'/q/'+PostId+'\n'+data.error_message;
    console.log(report);
  }
  else {
    window.setTimeout(deleteComment, 300000, data.items[0].comment_id, PostId);
  }
}


function deleteComment(cId, qId) {
  CommentId = cId;
  PostId = qId;
  var filter = '!.UDs*ZSQi0fD212F'; 
  var request = 'https://api.stackexchange.com/2.2/users/' + MyUserId + '/mentioned?pagesize=5&order=desc&sort=creation&site=' + Site + '&filter=' + filter + '&key=' + ApiKey;
  $.ajax({url: request, dataType: 'json', method: 'GET'}).done(function(data) {
    var deleteComment = true; 
    var comments = data.items;
    for (var i = 0; i < comments.length; i++) {
      if (comments[i].post_id == PostId && /\?/.test(comments[i].body)) {
        deleteComment = false;
        break; 
      }
    }
    if (deleteComment) {
      var request = 'https://api.stackexchange.com/2.2/comments/'+CommentId+'/delete';
      var payload = {site: Site, key: ApiKey, access_Token: Token};
      $.post(request, payload);
    }
  });
}


function arraysDisjoint(arr1, arr2) {
  for (var i = 0; i < arr1.length; i++) {
    if (arr2.indexOf(arr1[i]) > -1) {
      return false;
    }
  }
  return true;
}
