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

