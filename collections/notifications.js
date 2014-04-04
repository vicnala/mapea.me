Notifications = new Meteor.Collection('notifications');

Notifications.allow({
  update: ownsDocument
});

createCommentNotification = function(comment) {
  var marker = Markers.findOne(comment.markerId);
  if (comment.userId !== marker.userId) {
    Notifications.insert({
      userId: marker.userId,
      markerId: marker._id,
      commentId: comment._id,
      commenterName: comment.author,
      read: false
    });
  }
};