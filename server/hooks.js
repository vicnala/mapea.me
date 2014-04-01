Accounts.onCreateUser(function(options, user) {
  // setup an empty profile object
  user.profile = options.profile ? options.profile : {};
  user.profile.nick = user.username;
  return user;
});
