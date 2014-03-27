Deps.autorun(function () {
  var location = Session.get('location');
  //console.log('Session:location', location, 'changed!');

  if (location) {
    var myMarkerId = Session.get('myMarkerId');

    if (!myMarkerId){
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
      Meteor.setInterval(function () {
        Meteor.call('keepalive', Session.get('myMarkerId'));
      }, 10000);
    }
    else {
      // update my marker
      Markers.update(myMarkerId, {$set: {location: location}});
    }
  }
});
