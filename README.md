MapeaMe!
========

What's MapeaMe!
---------------

MapeaMe! is a real time geolocated micro social network.


Geolocation watch
-----------------

First thing we need is geolocate the user so we start a `navigator.geolocation.watchPosition` at the `geolocation.js` file inside the `client/lib` directory witch is supposed to load first.

**TODO: Is it the right way?**

When a location is triggered by the `success` function, it updates the Session variable `location`.

		// watch fucntion
		var options = {
		  enableHighAccuracy: true,
		  timeout: 10000,
		  maximumAge: 0
		};

		navigator.geolocation.watchPosition(success, error, options);

		function success(pos) {
		  var location = [pos.coords.longitude, pos.coords.latitude];
		  Session.set('location', location);
		};

		function error(err) {
		  console.warn('ERROR(' + err.code + '): ' + err.message);
		};

Then we use a `Deps.autorun` to update our marker when `location` changes. In `client/main.js`

		Deps.autorun(function () {
			var location = Session.get('location');
			if (location) {
				var myMarkerId = Session.get('myMarkerId');
				if (!myMarkerId){
					// insert a new marker
			  	var newMarkerId = Markers.insert({
			      nick: 'me!',
			      message: 'Hi all!',
			      location: [location[0], location[1]],
			      public: true,
			      submitted: new Date().getTime()
			    });
			    Session.set('myMarkerId', newMarkerId);
				}
				else {
					// update my marker
					Markers.update(myMarkerId, {$set: {location: location}});
				}
			}
		});


Keepalive
---------

We WANT real time active users so if a marker is not updated, it is removed. This is done with a keepalive function that refreshes an entry at the `Connections` collection.

Also, this make us have a sub-list of the real time markers we have them separated from statically added (login required) user markers.

		commit dbdb83af8503407b8b55e459f448640bb44ce0f0


The Map
-------

We use [leaflet](http://leafletjs.com/) Meteor package (`mrt add leaflet`).

The `client/views/map/map.js` initialize the map object and sets two reactive functions:


### Setting the view

We have our location updated into a (Session) reactive data source so we can keep the map always centered on the user location.

Inside `Template.mapMarkers.rendered` function:

		Deps.autorun(function () {
			var location = Session.get('location');
			if (location) {
				window.map.setView([location[1], location[0]]);
			}
		});


### Managing map markers

We have to synchronize the database markers with the map markers. To do so we set up an `[observe](http://docs.meteor.com/#observe)` on the markers cursor to easily add/change/remove the map markers in real time.

		Markers.find({}).observe({
	    added: function(mark) {
	    	// add a map marker
	    },

	    changed: function(mark) {
	    	// update a map marker
	    },

	    removed: function(mark) {
	    	// remove a map marker
	    }
  	});


### Enable double-click to add markers for loggedin users

		Deps.autorun(function(){
		  if(Meteor.userId()){
			  window.map.on('dblclick', function(e) {
			    Markers.insert({
			      nick: 'new!',
			      location: [e.latlng.lng, e.latlng.lat],
			      //...
			    });
			  });
		  }
		  else {
		  	window.map.off('dblclick', null);
		  }
		});


TODOS

* onLogOut hook to remove 'public' flag of the user marker and make dissapear the map marker instantaneously.
* Create a method to delete markers that does not allow delete the user liveMarker
* Create a method to update live markers and update 'submitted' into it
* Disable HighAccuracy at geolocation.js and make it optional to the user