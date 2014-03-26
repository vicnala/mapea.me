Template.mapMarkers.rendered = function() {
	// initialize the map
	window.map = L.map('map', {
    doubleClickZoom: false
  }).setView([0,0], 17);

  L.tileLayer.provider('CloudMade', {
    apiKey: 'fb852d3401af4315bb0aa4ed825090f3',
    styleID: '997',
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>'
  }).addTo(window.map);

  // Set the view of the map constantly centered in the user location
	Deps.autorun(function () {
		var location = Session.get('location');
		if (location) {
			window.map.setView([location[1], location[0]]);
		}
	});

	// Obderve the markers collection to add/change/remove the map markers
  Markers.find({}).observe({
    added: function(mark) {
      var marker;
      //console.log(mark);
      marker = L.marker(
        {lon: mark.location[0], lat: mark.location[1]},
        {
          title: mark.nick,
          _id: mark._id,
          secret: mark.secret,
          icon: createIcon(mark.nick, 'red')
        }
      ).addTo(window.map).bindPopup(
        '<b>' + mark.nick + '</b><br>' + mark.message + '<br><a href="/markers/' + mark._id + '" class="discuss btn">Discuss</a>'
      );

      return marker;
    },

    changed: function(mark) {
      var key, layers, val, _results;
      var id = Session.get('myMarkerId');
      var secret = Session.get('secret');
      layers = window.map._layers;
      _results = [];
      for (key in layers) {
        val = layers[key];
        if (!val._latlng) {

        } else {
          //console.log('val', val);
          if (val.options._id === mark._id){
            console.log('this is the updated marker');
            val.options.title = mark.nick;
            val.options.secret = mark.secret;
            val._latlng.lat = mark.location[1];
            val._latlng.lon = mark.location[0];

            // TODO: update .bindPopup()

            if (val.options._id === id) {
              console.log('  and has my _id: blue and pan');
              val.setIcon(createIcon(mark.nick, 'blue'));
              window.map.setView([mark.location[1], mark.location[0]], 17);
            }
            else {
              console.log('  and does NOT have my _id');
              if (val.options.secret === secret) {
                console.log('    but has my secret: orange');
                val.setIcon(createIcon(mark.nick, 'orange'));
              }
              else {
                console.log('    and does NOT have my secret: red');
                val.setIcon(createIcon(mark.nick, 'red'));
              }
            }
            val.update();
          }
          else {
            console.log('this is NOT the updated marker');
            if (val.options._id === id) {
              //do nothing
            }
            else {
              if (val.options.secret === secret) {
                console.log('  but has my secret: orange');
                val.setIcon(createIcon(val.options.title, 'orange'));
              }
              else {
                if (val.hasOwnProperty('_icon')) {
                  console.log('  and does NOT have my secret: red');
                  val.setIcon(createIcon(val.options.title, 'red'));
                }
              }
            }
          }
        }
      }
      return _results;
    },

    removed: function(mark) {
      var key, layers, val, _results;
      layers = window.map._layers;
      _results = [];
      for (key in layers) {
        val = layers[key];
        if (val.options._id === mark._id) {
          _results.push(window.map.removeLayer(val));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    }
  });
}


var createIcon = function(nick, color) {
  var className = 'leaflet-div-icon ';
  className += color;
  return L.divIcon({
    iconSize: [10, 10],
    html: '<b>' + nick + '</b>',
    className: className  
  });
}