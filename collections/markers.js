Markers = new Meteor.Collection('markers');


Markers.allow({
  update: ownsDocument,
  remove: ownsDocument
});

Meteor.methods({
  marker: function(markerAttributes) {
    var user = Meteor.user(),
      markerWithSameNick = Markers.findOne({nick: markerAttributes.nick});

    // ensure the user is logged in
    if (!user)
      throw new Meteor.Error(401, "You need to login to enter new markers");

    // ensure the marker has a nick
    if (!markerAttributes.nick)
      throw new Meteor.Error(422, 'Please fill the nick');

    /*
    if (markerWithSameNick)
    	throw new Meteor.Error(422, 'This nick is already in use');
    */

    if (isNaN(markerAttributes.location[0])) {
      throw new Meteor.Error(422, 'Please use numbers as latitude parameter');
    }
    else {
      if (markerAttributes.location[0] < -90 || markerAttributes.location[0] > 90)
        throw new Meteor.Error(422, 'Latitude must be betwin -90 and 90)');
    }

    if (isNaN(markerAttributes.location[1])) {
      throw new Meteor.Error(422, 'Please use numbers as longitude parameter');
    }
    else {
      if (markerAttributes.location[1] < -180 || markerAttributes.location[1] > 180)
        throw new Meteor.Error(422, 'Longitude must be betwin -180 and 180');
    }

    var markerId = markerAttributes._id;

    if (markerId) {
      delete markerAttributes._id;
      Markers.update(markerId, {$set: markerAttributes}, function(error) {
        if (error) {
          // display the error to the user
          alert(error.reason);
        }
      });
    }
    else {
      // pick out the whitelisted keys
      var marker = _.extend(_.pick(markerAttributes, 'nick', 'location', 'public', 'message'), {
        userId: user._id,
        submitted: new Date().getTime()
      });
      markerId = Markers.insert(marker);
    }

    return markerId;
  },
});