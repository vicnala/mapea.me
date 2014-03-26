Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading',
  waitOn: function() { return Meteor.subscribe('markers'); }
});

Router.map(function() {
  this.route('mapMarkers', {path: '/'});
  this.route('markersList', {path: '/list'});
  this.route('markerPage', {
    path: '/markers/:_id',
    data: function() { return Markers.findOne(this.params._id); }
  });
});