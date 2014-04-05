Template.markerItem.helpers({
  ownMarker: function() {
    return this.userId == Meteor.userId();
  },
  location: function() {
    return this.location[0].toFixed(5).toString() + ', ' + this.location[1].toFixed(5).toString();
  },
  live: function() {
    return this.live;
  },
  followedClass: function() {
    var userId = Meteor.userId();
    if (userId && !_.include(this.followers, userId)) {
      return 'btn-primary followeable';
    } else {
      return 'disabled';
    }
  }
});

Template.markerItem.events({
	'click .follow': function(e) {
		e.preventDefault();
		Meteor.call('follow', this._id);
	}
});