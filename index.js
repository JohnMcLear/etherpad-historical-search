var eejs = require('ep_etherpad-lite/node/eejs')
  , padManager = require('ep_etherpad-lite/node/db/PadManager')
  , log4js = require('ep_etherpad-lite/node_modules/log4js')
  , async = require('ep_etherpad-lite/node_modules/async')
  , logger = log4js.getLogger("plugin:historicalsearch")
;

// testing on /test
exports.registerRoute = function (hook_name, args, cb) {
  args.app.get('/historicalSearch', function(req, res) {

    var searchString = req.query["query"];
    searchString = escapeRegExp(searchString);
    var padId = req.query["padId"];

    var result = {};

    padManager.getPad(padId, function(err, _pad){
      var pad = _pad;
      var num = pad.getHeadRevisionNumber(); // Gets the # of revisions in a pad
      var result = {}; // The object we store the result in before sending back to client
      var revs = []; // The array we will store the revs in for this pad

      for (var i=0; i <= num; i++) { // Push each revision # to an array
        revs.push(i);
      }
      async.forEachSeries(revs, function(revNo, callback){
        pad.getInternalRevisionAText(revNo, function(junk, text)
        {
          if(text.text.match(new RegExp(searchString, 'i'))){ // If we find a match
            var count = text.text.match(new RegExp(searchString, 'gi')).length; // Thanks to rKnLa
          }else{ // If we don't find amatch
            var count = 0;
          }
          result[revNo] = count; // Write the count to a result object

//          console.warn("String exists " + count + " times in revNo " +revNo);
          callback();
        });

      }, function(err){
        res.send(JSON.stringify(result));
      });

    });
  });
};


function escapeRegExp(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

exports.eejsBlock_timesliderEditbarRight = function (hook_name, args, cb) { 
  args.content = eejs.require("ep_historicalsearch/templates/historySearch.ejs") + args.content;
  return cb();
}

exports.eejsBlock_timesliderTop = function (hook_name, args, cb) {
  args.content = args.content + eejs.require("ep_historicalsearch/templates/historySearchForm.ejs");
  return cb();
}

exports.eejsBlock_timesliderBody = function (hook_name, args, cb) {
  args.content = args.content + eejs.require("ep_historicalsearch/static/js/historySearch.js");
  return cb();
}
