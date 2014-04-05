Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading',
  waitOn: function() {
    return Meteor.subscribe('notifications');
  }
});

MarkersListController = RouteController.extend({
  template: this.template,
  increment: 5,
  limit: function() {
    return parseInt(this.params.markersLimit) || this.increment;
  },
  findOptions: function() {
    if (Session.get('box'))
      return {box: Session.get('box'), sort: this.sort, limit: this.limit()};
    else
      return {box: [[0,0],[0,0]], sort: this.sort, limit: this.limit()};
  },
  waitOn: function() {
    return Meteor.subscribe('markers', this.findOptions());
  },
  markers: function() {
    return Markers.find({}, this.findOptions());
  },
  data: function() {
    var hasMore = this.markers().fetch().length === this.limit();
    return {
      markers: this.markers(),
      nextPath: hasMore ? this.nextPath() : null
    };
  }
});

BestMarkersListController = MarkersListController.extend({
  sort: {follows: -1, submitted: -1, _id: -1},
  template: 'markersList',
  nextPath: function() {
    return Router.routes.markersList.path({markersLimit: this.limit() + this.increment})
  }
});

MapMarkersListController = MarkersListController.extend({
  sort: {follows: -1, submitted: -1, _id: -1},
  template: 'mapMarkers',
  nextPath: function() {
    return Router.routes.mapMarkers.path({markersLimit: this.limit() + this.increment})
  }
});


userMarkersListController = RouteController.extend({
  template: 'markersList',
  increment: 5,
  limit: function() {
    return parseInt(this.params.markersLimit) || this.increment;
  },
  findOptions: function() {
    return {sort: this.sort, limit: this.limit()};
  },
  waitOn: function() {
    return Meteor.subscribe('myMarkers', this.findOptions());
  },
  markers: function() {
      return Markers.find({userId: Meteor.user()._id}, this.findOptions());
  },
  data: function() {
    var hasMore = this.markers().fetch().length === this.limit();
    return {
      markers: this.markers(),
      nextPath: hasMore ? this.nextPath() : null
    };
  }
});

UserMarkersListController = userMarkersListController.extend({
  sort: {follows: -1, submitted: -1, _id: -1},
  nextPath: function() {
    return Router.routes.userMarkers.path({markersLimit: this.limit() + this.increment})
  }
});



Router.map(function() {
  this.route('home', {
    path: '/',
    controller: MapMarkersListController
  });

  this.route('mapMarkers', {
    path: '/map/:markersLimit?',
    controller: MapMarkersListController,
  });

  this.route('markersList', {
    path: '/list/:markersLimit?',
    controller: BestMarkersListController
  });

  this.route('userMarkers', {
    path: '/mine/:markersLimit?',
    controller: UserMarkersListController
  });

  this.route('markerPage', {
    path: '/markers/:_id',
    waitOn: function() {
      return [
        Meteor.subscribe('singleMarker', this.params._id),
        Meteor.subscribe('comments', this.params._id)
      ];
    },
    data: function() { return Markers.findOne(this.params._id); }
  });


  this.route('markerEdit', {
    path: '/markers/:_id/edit',
    waitOn: function() {
      return Meteor.subscribe('singleMarker', this.params._id);
    },
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
Router.onBeforeAction(requireLogin, {only: ['markerEdit', 'userMarkers']});
Router.onBeforeAction(function() { clearErrors() });