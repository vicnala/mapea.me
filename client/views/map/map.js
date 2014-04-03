var intervalId;
var myUserId;
var location;
var liveMarkerId;

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


  Deps.autorun(function () {
    location = Session.get('location');
    if (location) {
      if(myUserId) {
        Markers.update(Meteor.user().profile.liveMarkerId, {$set: {location: location}});
      }
      else {
        // setup the wellcome marker
        removeMapMarker('tempId');
        defaultMapMarker(location);
      }
      window.map.setView([location[1], location[0]]);
    }
  });


  Deps.autorun(function () {
    myUserId = Meteor.userId();
    if(myUserId) {
      liveMarkerId = Meteor.user().profile.liveMarkerId;
      // remove the temp map marker
      removeMapMarker('tempId');
      // enable the user marker
      Markers.update(liveMarkerId, {$set: {public: true}});
      // enable double click to place markers
      window.map.on('dblclick', function(e) {
        insertMarker([e.latlng.lng, e.latlng.lat]);
      });
      // Setup remote keepalive call
      Meteor.call('keepalive', liveMarkerId);
      if (!intervalId) {
        intervalId = Meteor.setInterval(function () {
          Meteor.call('keepalive', liveMarkerId);
        }, 10000);
      }
    }
    else {
      // disable dblclick
      window.map.off('dblclick', null);
      // clear keepalive timer
      Meteor.clearInterval(intervalId);
      intervalId = undefined;
      // setup the wellcome marker
      removeMapMarker('tempId');
      if (!location)
        location = [0,0];
      defaultMapMarker(location);
    }
  });


	// Obderve the markers collection to add/change/remove the map markers
  Markers.find({}).observe({
    added: function(mark) {
      var marker;
      marker = L.marker(
        {lon: mark.location[0], lat: mark.location[1]},
        {
          title: mark.nick,
          _id: mark._id,
          icon: createIcon(mark.nick, 'red')
        }
      ).addTo(window.map).bindPopup(
        '<b>' + mark.nick + '</b><br>' + mark.message + 
        '<br><a href="/markers/' + mark._id + 
        '" class="discuss btn">Comment</a>'
      );
      return marker;
    },

    changed: function(mark) {
      var key, layers, val, _results;
      layers = window.map._layers;
      _results = [];
      for (key in layers) {
        val = layers[key];
        if (!val._latlng) {

        } else {
          if (val.options._id === mark._id){
            console.log('updated marker', mark._id);
            val.options.title = mark.nick;
            val._latlng.lat = mark.location[1];
            val._latlng.lon = mark.location[0];

            // TODO: update .bindPopup()

            if (val.options._id === liveMarkerId) {
              console.log('  has my _id: blue and pan');
              val.setIcon(createIcon(mark.nick, 'blue'));
              window.map.setView([mark.location[1], mark.location[0]], 17);
            }
            else {
              console.log('  does not have my _id: red');
              val.setIcon(createIcon(mark.nick, 'red'));
            }
            val.update();
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


var removeMapMarker = function(markId) {
  var key, layers, val;
  layers = window.map._layers;
  for (key in layers) {
    val = layers[key];
    if (val.options._id === markId) {
  		window.map.removeLayer(val);
    }
  }
}


var defaultMapMarker = function(loc) {
  L.marker(
    {lon: loc[0], lat: loc[1]},
    {
      title: 'me!',
      _id: 'tempId',
      icon: createIcon('me!', 'blue')
    }
  ).addTo(window.map).bindPopup(
    '<b>Wellcome to <em>mapea.me!</em></b><br>Sing up to start using this <em>amazing</em> app!'
  ).openPopup();
}


var insertMarker = function(loc) {
  var marker = {
    nick: Meteor.user().profile.nick,
    userId: Meteor.userId(),
    message: 'Hi all!',
    location: [loc[0], loc[1]],
    public: true,
    live: false
  };

  Meteor.call('marker', marker, function(error, id) {
    if (error) {
      throwError(error.reason);
    }
  });
}
