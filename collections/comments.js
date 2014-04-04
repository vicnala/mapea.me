Comments = new Meteor.Collection('comments');

Meteor.methods({
  comment: function(commentAttributes) {
    var user = Meteor.user();
    var marker = Markers.findOne(commentAttributes.markerId);
    // ensure the user is logged in
    if (!user)
      throw new Meteor.Error(401, "You need to login to make comments");

    if (!commentAttributes.body)
      throw new Meteor.Error(422, 'Please write some content');

    if (!marker)
      throw new Meteor.Error(422, 'You must comment on a marker');

    comment = _.extend(_.pick(commentAttributes, 'markerId', 'body'), {
      userId: user._id,
      author: user.username,
      submitted: new Date().getTime()
    });

    // update the marker with the number of comments
    Markers.update(comment.markerId, {$inc: {commentsCount: 1}});

    // create the comment, save the id
    comment._id = Comments.insert(comment);

    return comment._id;
  }
});