
var myUserId;
var location;
var liveMarkerId;
var handle;

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

  // enable double click to place markers
  window.map.on('dblclick', onDbClick);

  location = Session.get('location');

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

      // Set the box for suscriptions
      var bounds = window.map.getBounds();
      var box = [
          [ bounds._southWest.lng, bounds._southWest.lat],
          [ bounds._northEast.lng, bounds._northEast.lat]
        ];
      Session.set('box', box);
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
      // Setup remote keepalive call
      Meteor.call('keepalive', liveMarkerId);
    }
    else {
      // setup the wellcome marker
      removeMapMarker('tempId');
      if (!location)
        location = [0,0];
      defaultMapMarker(location);
    }
  });


	// Observe the markers collection to add/change/remove the map markers
  handle = Markers.find({}).observe({
    added: function(mark) {
      //console.log('added', mark._id);
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
            //console.log('updated marker', mark._id);
            val.options.title = mark.nick;
            val._latlng.lat = mark.location[1];
            val._latlng.lon = mark.location[0];

            // TODO: update .bindPopup()

            if (val.options._id === liveMarkerId) {
              //console.log('  has my _id: blue and pan');
              val.setIcon(createIcon(mark.nick, 'blue'));
              window.map.setView([mark.location[1], mark.location[0]], 17);
            }
            else {
              //console.log('  does not have my _id: red');
              val.setIcon(createIcon(mark.nick, 'red'));
            }
            val.update();
          }
        }
      }
    },

    removed: function(mark) {
      //console.log('removed', mark._id);
      removeMapMarker(mark._id);
    }
  });
}

Template.mapMarkers.destroyed = function ( ) {
  handle.stop();
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


function onDbClick(e) {
  if (Meteor.userId()) {
    var marker = {
      nick: Meteor.user().profile.nick,
      userId: Meteor.userId(),
      message: 'Hi all!',
      location: [e.latlng.lng, e.latlng.lat],
      public: true,
      live: false
    };

    Meteor.call('marker', marker, function(error, id) {
      if (error) {
        throwError(error.reason);
      }
    });
  }
}

