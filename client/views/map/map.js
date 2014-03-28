var liveMarkerId;

Template.mapMarkers.rendered = function() {
	var intervalId;

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
			if(Meteor.userId()){
	      //var liveMarkerId = Session.get('liveMarkerId');
	      if (!liveMarkerId){
	        // remove the temp map marker
					removeMapTempMarker();
	        // insert a new marker
	        liveMarkerId = Markers.insert(defaultMarker(location));
	        // set the 'liveMarkerId' session variable
	        Session.set('liveMarkerId', liveMarkerId);
	        // Set the user profile variable 'liveMarker'
	        Meteor.users.update({_id:Meteor.user()._id}, {$set:{"profile.liveMarker": liveMarkerId}})
	        // Setup remote keepalive call
	        Meteor.call('keepalive', liveMarkerId);
	        intervalId = Meteor.setInterval(function () {
	          Meteor.call('keepalive', Session.get('liveMarkerId'));
	        }, 10000);

	        // enable double click to place markers
	        enabledbclick();
	      }
	      else {
	        // update my marker
	        Markers.update(liveMarkerId, {$set: {location: location}});
	      }
        // center the map
        window.map.setView([location[1], location[0]]);
			}
			else {
				// Clear Session variable liveMarkerId
				delete Session.keys['liveMarkerId'];
				// clear keepalive timer
				if (intervalId) {
					Meteor.clearInterval(intervalId);
				}

				// TODO: delete the database marker (to make disappear the map marker instantaneously)

				// disable dblclick
				window.map.off('dblclick', null);
				// setup a new temp map marker
				removeMapTempMarker();
				defaultMapMarker(location);
				// center the map
				window.map.setView([location[1], location[0]]);
			}
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
        '<b>' + mark.nick + '</b><br>' + mark.message + '<br><a href="/markers/' + mark._id + '" class="discuss btn">Comment</a>'
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
            console.log('this is the updated marker');
            val.options.title = mark.nick;
            val._latlng.lat = mark.location[1];
            val._latlng.lon = mark.location[0];

            // TODO: update .bindPopup()

            if (val.options._id === liveMarkerId) {
              console.log('  and has my _id: blue and pan');
              val.setIcon(createIcon(mark.nick, 'blue'));
              window.map.setView([mark.location[1], mark.location[0]], 17);
            }
            else {
              console.log('  and does NOT have my _id: red');
              val.setIcon(createIcon(mark.nick, 'red'));
            }
            val.update();
          }
          else {
            console.log('this is NOT the updated marker');
            if (val.options._id === liveMarkerId) {
              //do nothing
            }
            else {
              val.setIcon(createIcon(val.options.title, 'red'));
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


var removeMapTempMarker = function() {
  var key, layers, val;
  layers = window.map._layers;
  for (key in layers) {
    val = layers[key];
    if (val.options._id === 'tempId') {
  		window.map.removeLayer(val);
    }
  }
}

var defaultMarker = function(location) {
	return {
		nick: 'me!',
		message: 'Hi all!',
		location: [location[0], location[1]],
		public: true,
		live: true,
		submitted: new Date().getTime()
	};
}


var defaultMapMarker = function(location) {
  L.marker(
    {lon: location[0], lat: location[1]},
    {
      title: 'me!',
      _id: 'tempId',
      icon: createIcon('me!', 'blue')
    }
  ).addTo(window.map).bindPopup(
    '<b>Wellcome to <em>mapea.me!</em></b><br>Sing up to start using this <em>amazing</em> app!'
  ).openPopup();
}

var defaultMarker = function(location) {
	return {
		nick: 'me!',
		message: 'Hi all!',
		location: [location[0], location[1]],
		public: true,
		live: true,
		submitted: new Date().getTime()
	};
}

var clicks = 0;

var enabledbclick = function(location) {
  // enable double click marker insert for logged in user
  window.map.on('dblclick', function(e) {
  	if(Meteor.userId()){
  		clicks = clicks + 1;
  		console.log(clicks);
	    Markers.insert({
	      nick: 'new!',
	      message: 'Hi all!',
	      location: [e.latlng.lng, e.latlng.lat],
	      public: true,
	      submitted: new Date().getTime()
	    });
	  }
  });
}