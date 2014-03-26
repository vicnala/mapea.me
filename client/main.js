Meteor.subscribe('markers');

Deps.autorun(function () {
	var location = Session.get('location');
	console.log('Session:location', location, 'changed!');

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