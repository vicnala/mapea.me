MapeaMe!
========

What's MapeaMe!
---------------

MapeaMe! is a real time geolocated micro social network.


Geolocation watch
-----------------

First thing we need is geolocate the user so we start a `navigator.geolocation.watchPosition` at the `geolocation.js` file inside the `client/lib` directory witch is supposed to load first. **Is this the right way?**

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

Then we use a `Deps.autorun` function inside the `Template.mapMarkers.rendered` function to update our marker when `location` changes. In `client/views/map/map.js`

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


Keepalive
---------

We WANT real time active users so if a marker is not updated, it's property `public` is set to false and this makes the marker disappear from publications. This is done with a keepalive function that refreshes a time stamp entry at the `Connections` collection. Then a `setInterval` function at the server, checks the time stamp and update the markers if a predefined timeout is reached.

We have the 'keepalive' server method and a `setInterval` function at `server/hooks.js` and the `setInterval` function for the client at `client/helpers/keepalive.js`.


The Map
-------

We use [leaflet](http://leafletjs.com/) Meteor package (`mrt add leaflet`).

The `client/views/map/map.js` initialize the map object and sets two reactive functions:


### Initializing

Inside `Template.mapMarkers.rendered` function:

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


### Double-click function to add markers for loggedin users

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


### Setting the view

We have our location updated into a (Session) reactive data source so we can keep the map always centered on the user location.

Inside `Template.mapMarkers.rendered` function:

		Deps.autorun(function () {
			var location = Session.get('location');
			if (location) {
				window.map.setView([location[1], location[0]]);
			}
		});


### Geolocated reactive subscriptions

We want view the markers within the map view so we need a geologated subscription. We can just get the map bounds in a map event like 'moveend' and setup a Session variable we can use in subscriptions.

On `client/views/map/map.js`:

		Template.mapMarkers.rendered = function() {
			//...
		  // Set box bounds on map move
		  window.map.on('moveend', onMapMove);
		  //...
		}

		function onMapMove(e) {
		  // Set the box for suscriptions
		  var bounds = window.map.getBounds();
		  var box = [
		      [ bounds._southWest.lng, bounds._southWest.lat],
		      [ bounds._northEast.lng, bounds._northEast.lat]
		    ];
		  Session.set('box', box);
		}

At the `findOptions` function of the `lib/router.js`

	  findOptions: function() {
      return {box: Session.get('box'), sort: this.sort, limit: this.limit()};
	  },

And finally at the `server/publications.js` file we ensure a GEO2D insdex at the location property of the  markers collection:

		Markers._ensureIndex({location: "2d"});

		Meteor.publish('markers', function(options) {
		  return Markers.find({$and: [{public: true}, {location: {$within: {$box: options.box}}}]}, {sort: options.sort, limit: options.limit});
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

As we are using pages with iron router we need to `stop` the `observe` function when we leave the map template.

		Template.mapMarkers.destroyed = function ( ) {
		  handle.stop();
		}


Following
---------

This is one of the most important feature of the app.

* Only live markers (created by the server/hooks.js) can have followers.



Groups
------

This the other most important feature 





TODOS

* Subscribe to the following marker

* onLogOut hook to remove 'public' flag of the user marker and make disappear the map marker instantaneously. (A work around will be remove it from the local collection).
* Create a method to delete markers that does not allow delete the user liveMarker
* Create a method to update live markers and update 'submitted' into it
* Disable HighAccuracy at geolocation.js and make it optional to the user
* [Deleting a post](https://github.com/DiscoverMeteor/Microscope/issues/90)
* Disable follow yourself


* Limitar el zoom del mapa
* Una colección local para meter a los que sigues y calcular los bounds?
	No creo ... el cliente tiene todos los datos que puede necesitar, habrá que hacer un find() en un Deps? y punto.

* Generar una notificación al hacer "Follow"

* Drop-down is not working! Loggin items not showing when logout




iOS/Android apps
================

* https://www.discovermeteor.com/blog/blonk-building-tinder-for-jobs-with-meteor-for-mobile/




I20140529-10:02:26.801(2)? keepalive from ni5qCjbL9pTmHNfpw
I20140529-10:02:36.801(2)? keepalive from ni5qCjbL9pTmHNfpw
I20140529-10:03:37.089(2)? removed live marker ni5qCjbL9pTmHNfpw
I20140529-10:03:37.093(2)? removed connection 6gGNmPcFNEHtk7JFg
I20140529-10:03:37.103(2)? removed live marker ni5qCjbL9pTmHNfpw
I20140529-10:03:37.105(2)? removed connection 6gGNmPcFNEHtk7JFg
I20140529-10:03:37.129(2)? removed live marker ni5qCjbL9pTmHNfpw
I20140529-10:03:37.131(2)? removed connection 6gGNmPcFNEHtk7JFg
I20140529-10:03:37.554(2)? removed live marker ni5qCjbL9pTmHNfpw
I20140529-10:03:37.559(2)? removed connection 6gGNmPcFNEHtk7JFg
I20140529-10:03:37.622(2)? removed live marker ni5qCjbL9pTmHNfpw
I20140529-10:03:37.625(2)? removed connection 6gGNmPcFNEHtk7JFg
