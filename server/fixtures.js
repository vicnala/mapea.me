if (Markers.find().count() === 0) {
  // Chiva 39.4748, -0.7201
  addTestMarkers ('lucas', 'Chiva', 39.47474839, -0.7202346, 0.001, 1);
  addTestMarkers ('mateo', 'Cheste', 39.491124, -0.686181, 0.0015, 1);
}


function addTestMarkers (user, place, lat, lon, rad, count) {
  var now = new Date().getTime();
  var lt, ln;

  for (var i = 1; i < count + 1; i++) {
    var pmlon = Math.random() < 0.5 ? -1 : 1;
    var pmlat = Math.random() < 0.5 ? -1 : 1;
    Markers.insert({
      nick: place + i,
      message: 'Hi all!',
      location: [lon + pmlon*Math.random()*rad, lat + pmlat*Math.random()*rad],
      public: true,
      submitted: now - i * 3600 * 1000
    });
  }
}