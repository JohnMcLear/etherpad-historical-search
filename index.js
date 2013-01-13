var eejs = require('ep_etherpad-lite/node/eejs')
  , padManager = require('ep_etherpad-lite/node/db/PadManager')
  , log4js = require('ep_etherpad-lite/node_modules/log4js')
  , async = require('ep_etherpad-lite/node_modules/async')
  , logger = log4js.getLogger("plugin:historicalsearch")
;

// testing on /test
exports.registerRoute = function (hook_name, args, cb) {
  args.app.get('/historicalSearch', function(req, res) {
  // args.app.get('/test', function(req, res) { // Leaving in for further dev & testing

    var searchString = req.query["query"];
//    console.warn(req.query);
    var padId = req.query["padId"];

//    padId = "test"; // DELETE ME
//    searchString = "test"; // DELETE ME
//    console.warn("Searching for "+searchString+" in padID "+padId);

    // Holding values
//    var result = {0:1,1:1,2:2,3:2,4:2,5:3,6:3,7:4,8:4,9:5,10:3,11:2,12:1,13:0,13:0}; // example results
//    res.send(JSON.stringify(result)); // test sent TODO remove me

    var result = {};

    padManager.getPad(padId, function(err, _pad){
      pad = _pad;
      var num = pad.getHeadRevisionNumber(); // Gets the # of revisions in a pad
      var result = {}; // The object we store the result in before sending back to client
      var revs = []; // The array we will store the revs in for this pad

      for (var i=0; i <= num; i++) { // Push each revision # to an array
        revs.push(i);
      }
      async.forEachSeries(revs, function(revNo, callback){
        pad.getInternalRevisionAText(revNo, function(junk, text)
        {
          if(text.text.match(searchString, 'g')){ // If we find a match
            var count = text.text.match(searchString, 'g').length;
          }else{ // If we don't find amatch
            var count = 0;
          }
          result[revNo] = count; // Write the count to a result object

//          console.warn("String exists " + count + " times in revNo " +revNo);
          callback(err);
        });

      }, function(err){
        res.send(JSON.stringify(result));
      });

    });
  });
};


exports.eejsBlock_timesliderBody = function (hook_name, args, cb) {
  args.content = args.content + eejs.require("ep_historicalsearch/static/js/historySearch.js");
  return cb();
}

