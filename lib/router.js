Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading',
  waitOn: function() { return Meteor.subscribe('markers'); }
});

Router.map(function() {
  this.route('markersList', {path: '/'});
  this.route('markerPage', {
    path: '/markers/:_id',
    data: function() { return Markers.findOne(this.params._id); }
  });
});