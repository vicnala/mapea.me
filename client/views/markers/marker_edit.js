Template.markerEdit.events({
  'submit form': function(e) {
    e.preventDefault();

    var currentMarkerId = this._id;

    //console.log(publicChecked, $(e.target).find('[name=public]')[0].checked);

    var markerProperties = {
      //_id: currentMarkerId,
      nick: $(e.target).find('[name=nick]').val(),
      message: $(e.target).find('[name=message]').val(),
    }

    Markers.update(currentMarkerId, {$set: markerProperties}, function(error) {
      if (error) {
        // display the error to the user
        alert(error.reason);
      } else {
        if (this.live)
          Router.go('mapMarkers');
        else {
          Router.go('markerPage', {_id: currentMarkerId});
        }
      }
    });
  },

  'click .delete': function(e) {
    e.preventDefault();
    if (confirm("Delete this marker?")) {
      var currentMarkerId = this._id;
      Markers.remove(currentMarkerId);
      Router.go('mapMarkers');
    }
  }
});


Template.markerEdit.helpers({
  noLiveMarker: function() {
    return !this.live;
  },
});