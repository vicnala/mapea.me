Accounts.onCreateUser(function(options, user) {
  // setup the default nick name
  user.profile = options.profile ? options.profile : {};
  user.profile.nick = user.username;

  var marker = {
    nick: user.profile.nick,
    userId: user._id,
    message: 'Hi all!',
    location: [0, 0],
    public: true,
    live: true,
    submitted: new Date().getTime()
  };

  var id = Markers.insert(marker);
  user.profile.liveMarkerId = id;

  return user;
});

Accounts.onLogin(function(info) {
	var user = Meteor.users.findOne(info.user._id);
	var marker = Markers.findOne(user.profile.liveMarkerId);
	Markers.update(marker._id, {$set: {public: true}});
});