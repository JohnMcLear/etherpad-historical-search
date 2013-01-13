<script type="text/javascript">
// Most of this is Bad Javascript.  It is bad because none of the hooks etc. I needed at the time were available.
// Apologies..  J -- I have now added the hooks but I need time to rewrite with them in..  


// A global object for search Results as I don't know a better way to make it work on resize
var historicalSearchResults = {};

// Stop the editbar being cropped in IE
$('#editbar').css({"width":"auto"});



// Prepare the UI (usually done w/ EJS)	
$('.editbarright ul').prepend("<li onclick='$(\".historicalSearch\").toggle();return false;'> \
  <a id=\"exportlink\" title=\"Search history of pad\"> \
  <div class=\"buttonicon\" style=\"font-size:14px;color:black;width:60px;background-image:none;\">Search</div></a> \
  </li></ul> \
");

$('#timeslider-top').append("<div class='historicalSearch popup' style='float:right;display:none;'> \
  Historical Search (Searches through entire history of document) \
  <form id='historicalSearchForm' style='display:inline;'> \
  <input id='historicalSearchQuery' type='text'><input type='submit' value='Search' style='padding:10px'></form> \
  </div> \
");



// Set up listeners

// Prepare a submit function to send the search query to the server
$('#historicalSearchForm').submit(function(event){ // Send query to server
  event.preventDefault(); // prevent default submit action
  var query = $('#historicalSearchQuery').val(); // get the input value
  var padId = currentPadId();

  // Due to limitations with the timeslider on the plugin framework we have to do an AJAX call here
  data = {
    "padId" : padId ,
    "type" : "historicalSearch",
    "query" : query
  }

  var url = '/historicalSearch?padId='+data.padId+'&query='+data.query;

  $.get(url, function(results, query){
    historicalSearchResults = results;
    updateTimesliderWithSearchResults(historicalSearchResults, query);
  });

});

$(window).resize(function() { // On browser resize draw the count results
  updateTimesliderWithSearchResults()
});

// End of listeners



function currentPadId(){ // get the current padId
  //get the padId out of the url -- stolen from timeslider.js
  var urlParts = document.location.pathname.split("/");
  padId = decodeURIComponent(urlParts[urlParts.length-2]);
  return padId;
}

function updateTimesliderWithSearchResults(){ // Updates the UI with results
  // Clean up first
  $('.countBlock').remove();

  results = JSON.parse(historicalSearchResults);

  // total # of revs
  var numberOfRevs = Object.size(results);

  // length of bar
  var sliderBarLength = parseFloat($('#ui-slider-bar').width() -8);

  // The amount of space assigned to each rev
  var pxPerRev = sliderBarLength / numberOfRevs;

  $.each(results, function(index, value){ // For each revision show the count
    var height = value * 5;
    var left = (index * pxPerRev)+8;
    var elementId = "countIndex"+index;
    var countBlock = "<div id="+elementId+" title=\"Search string appeared "+value+" times\"class='countBlock' pos="+index+" \
    style=\"background-color:black;bottom:8px;max-height:30px;opacity:.3;position:absolute;height: \
    "+height+"px;width:"+pxPerRev+"px;left:"+left+"px\"></div>";
    $('#timeslider-slider').append(countBlock);
 
    // $('#'+elementId).fadeIn(); // Commented out because it will prolly cause bugs
  });
}

Object.size = function(obj) { // Get the size of an object when .length doesn't work
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};
</script>
