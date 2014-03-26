// watch fucntion
var options = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 0
};

navigator.geolocation.watchPosition(success, error, options);

function success(pos) {
  var location = [pos.coords.longitude, pos.coords.latitude];
  Session.set('location', location);
};

function error(err) {
  console.warn('ERROR(' + err.code + '): ' + err.message);
};
