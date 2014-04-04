Meteor.publish('markers', function() {
  return Markers.find({public: true});
});

Meteor.publish('comments', function(markerId) {
	return Comments.find({markerId: markerId});
});
