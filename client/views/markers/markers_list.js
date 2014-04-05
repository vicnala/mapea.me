Template.markersList.helpers({
  markersWithRank: function() {
    return this.markers.map(function(marker, index, cursor) {
      marker._rank = index;
      return marker;
    });
  },

  hasMoreMarkers: function(){
    this.markers.rewind();
    return Router.current().limit() == this.markers.fetch().length;
  }
});