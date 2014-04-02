Meteor.publish('markers', function() {
  return Markers.find({public: true});
})