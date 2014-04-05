Markers._ensureIndex({location: "2d"});

Meteor.publish('markers', function(options) {
  return Markers.find({$and: [{public: true}, {location: {$within: {$box: options.box}}}]}, {sort: options.sort, limit: options.limit});
});

Meteor.publish('myMarkers', function(options) {
  return Markers.find({userId: this.userId}, options);
});

Meteor.publish('singleMarker', function(id) {
  return id && Markers.find(id);
});

Meteor.publish('comments', function(markerId) {
	return Comments.find({markerId: markerId});
});

Meteor.publish('notifications', function() {
  return Notifications.find({userId: this.userId});
});
