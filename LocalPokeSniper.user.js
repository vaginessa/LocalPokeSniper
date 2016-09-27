// ==UserScript==
// @name        LocalPokeSniper
// @author      dfns_
// @namespace   https://pokezz.com/
// @include     https://pokezz.com/*
// @version     1
// @grant       none
// @require       http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js
// @require       https://raw.githubusercontent.com/brandonaaron/livequery/master/jquery.livequery.min.js
// ==/UserScript==
// @description This Script filters Pokezz.com Site for local Pokemons only.

var showLocalOnly = true; // Hide Entries not matching
var useMiles = false; // km / miles
var onlyShowMatches = true;
var locations = [
  [
  'Köln', // Name
  50.941357, // Lat
  6.958307, // Long
  100 // Max Distance Radius
  ],
  [
    'Carcasonne',
    43.20687,
    2.363466,
    20
  ],
  [
    'Freiburg',
    47.999008,
    7.842104,
    5000
  ]
]
// End  Of Config


Number.prototype.toRad = function () {
  return this * Math.PI / 180;
}
function haversineDistance(from, to) {
  var lat1 = Number(from[1]);
  var lon1 = Number(from[2]);
  var lat2 = Number(to[0].trim());
  var lon2 = Number(to[1].trim());
  var R =  6371;
  
  //has a problem with the .toRad() method below.
  var x1 = lat2 - lat1;
  var dLat = x1.toRad();
  var x2 = lon2 - lon1;
  var dLon = x2.toRad();
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1.toRad()) * Math.cos(lat2.toRad()) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;
          
  if(useMiles) d /= 1.60934;
          
  return d.toFixed(2);
}

function notifyMe(node, dist, loc) {
  if (Notification.permission !== "granted")
    Notification.requestPermission();
  else {
    var notification = new Notification('Local Pokemon found', {
      icon: node.parent().siblings("img").attr("src"),
      body: "Distance to " + loc + " : " + dist
    });

    notification.onclick = function () {
      window.open(node.attr("href"));      
    };

  }

}

$(document).ready(function () {
  
  if (!Notification) {
    alert('Desktop notifications not available in your browser. Try Chromium.'); 
    return;
  }

  if (Notification.permission !== "granted")
    Notification.requestPermission();
 
 
  $('.url-list[href^=\'pokesniper2\']').livequery(function () {
    var temp = $(this).find('.url-list[href^=\'pokesniper2\'][tagged!=\'true\']');
    if (temp.is('.url-list[href^=\'pokesniper2\'][tagged!=\'true\']')) {
      var val = temp.next().attr('data-clipboard-text');
     // console.log(val);
      var isLocal = false;
      var closeTo = "";
      var minDistance = 40000;
      var result = "";
      locations.forEach(function (entry) {
        var distance = haversineDistance(entry, val.split(','));
        if ( distance <= entry[3]){
          isLocal = true;
          if (distance < minDistance){
            minDistance = distance;
            closeTo = entry[0];
          }
        }
        if (distance <= entry[3] || !onlyShowMatches)
          result += '&nbsp;<span style=\'color:' + (distance > entry[3] ? "red;" : "green;" ) + '\'> ' + distance + (useMiles ? " miles" : "km") + '  from ' + entry[0] + "</span> " ;
      });
      if ( showLocalOnly && !isLocal){
        $(temp).closest("li.collection-item").hide();
      }else{
        temp.attr('tagged', 'true').append(result);
        notifyMe(temp, minDistance, closeTo);
      }
    }
  });
});
