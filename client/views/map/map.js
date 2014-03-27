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
	      var myMarkerId = Session.get('myMarkerId');

	      if (!myMarkerId){
	        // remove the temp map marker
	        var key, layers, val;
	        layers = window.map._layers;
	        for (key in layers) {
	          val = layers[key];
	          if (val.options._id === 'tempId') {
	            window.map.removeLayer(val);
	          }
	        }

	        // insert a new marker
	        var newMarkerId = Markers.insert({
	          nick: 'me!',
	          message: 'Hi all!',
	          location: [location[0], location[1]],
	          public: true,
	          live: true,
	          submitted: new Date().getTime()
	        });

	        Session.set('myMarkerId', newMarkerId);

	        // Setup remote keepalive call
	        Meteor.call('keepalive', newMarkerId);
	        intervalId = Meteor.setInterval(function () {
	          Meteor.call('keepalive', Session.get('myMarkerId'));
	        }, 10000);
	      }
	      else {
	        // update my marker
	        Markers.update(myMarkerId, {$set: {location: location}});
	      }
        // center the map
        window.map.setView([location[1], location[0]]);
			}
			else {
				// clear keepalive timer
				if (intervalId) {
					Meteor.clearInterval(intervalId);
				}

				// TODO: delete the database marker (to make disappear the map marker instantaneously)

				// setup a temp map marker
	      var marker = L.marker(
	        {lon: location[0], lat: location[1]},
	        {
	          title: 'me!',
	          _id: 'tempId',
	          icon: createIcon('me!', 'blue')
	        }
	      ).addTo(window.map).bindPopup(
	        '<b>Wellcome to <em>mapea.me!</em></b><br>Login to start using this <em>amazing</em> app!'
	      ).openPopup();

				// center the map
				window.map.setView([location[1], location[0]]);
			}
		}
	});



	// Enable double click marker insert for logged in user
	Deps.autorun(function(){
	  if(Meteor.userId()){
		  window.map.on('dblclick', function(e) {
		    Markers.insert({
		      nick: 'new!',
		      message: 'Hi all!',
		      location: [e.latlng.lng, e.latlng.lat],
		      public: true,
		      submitted: new Date().getTime()
		    });
		  });
	  }
	  else {
	  	window.map.off('dblclick', null);
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
          icon: createIcon(mark.nick, 'red')
        }
      ).addTo(window.map).bindPopup(
        '<b>' + mark.nick + '</b><br>' + mark.message + '<br><a href="/markers/' + mark._id + '" class="discuss btn">Comment</a>'
      );

      return marker;
    },

    changed: function(mark) {
      var key, layers, val, _results;
      var id = Session.get('myMarkerId');
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
            val._latlng.lat = mark.location[1];
            val._latlng.lon = mark.location[0];

            // TODO: update .bindPopup()

            if (val.options._id === id) {
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
            if (val.options._id === id) {
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
