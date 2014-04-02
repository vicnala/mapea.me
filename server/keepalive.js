Connections = new Meteor.Collection('connections');

// keepalive method
Meteor.methods({
  keepalive: function (marker_id) {
    if (!Connections.findOne({marker_id: marker_id})) {
    	var connection = Connections.insert({marker_id: marker_id, last_seen: (new Date()).getTime()});
    	//console.log('new connection', connection, 'from arker', marker_id);
    }
    else {
	    console.log('keepalive from', marker_id);
    	Connections.update({marker_id: marker_id}, {$set: {last_seen: (new Date()).getTime()}});
    }
  }
});

// Clean up dead users after idle seconds
var idle = 20; // seconds
Meteor.setInterval(function () {
  var now = (new Date()).getTime();
  Connections.find({last_seen: {$lt: (now - idle * 1000)}}).forEach(function (connection) {
		var marker = Markers.findOne(connection.marker_id);
		if (marker) {
			if (marker.live) {
				//Markers.remove(marker);
        Markers.update({_id: marker._id}, {$set: {public: false}});
				console.log('removed live marker', marker._id);
			}
		}
		console.log('removed connection', connection._id);
		Connections.remove(connection._id);
  });
}, idle);