Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading',
  waitOn: function() { return Meteor.subscribe('markers'); }
});

Router.map(function() {
  this.route('mapMarkers', {
    path: '/'
  });
  
  this.route('markersList', {
    path: '/list'
  });
  
  this.route('markerPage', {
    path: '/markers/:_id',
    data: function() { return Markers.findOne(this.params._id); }
  });

  this.route('markerEdit', {
    path: '/markers/:_id/edit',
    data: function() { return Markers.findOne(this.params._id); }
  });
});

var requireLogin = function() {
  if (! Meteor.user()) {
    if (Meteor.loggingIn())
      this.render(this.loadingTemplate);
    else
      this.render('accessDenied');
      pause();
  }
}

Router.onBeforeAction('loading');
Router.onBeforeAction(requireLogin, {only: 'markerEdit'});
Router.onBeforeAction(function() { clearErrors() });