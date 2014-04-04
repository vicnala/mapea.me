Template.markerPage.helpers({
  comments: function() {
    return Comments.find({markerId: this._id});
  }
});