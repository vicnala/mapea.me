Template.markersList.helpers({
  markers: function() {
    return Markers.find({}, {sort: {submitted: -1}});
  }
});
