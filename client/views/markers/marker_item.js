Template.markerItem.helpers({
  ownMarker: function() {
    return this.userId == Meteor.userId();
  },
  location: function() {
    return this.location[0].toFixed(5).toString() + ', ' + this.location[1].toFixed(5).toString();
  }
});