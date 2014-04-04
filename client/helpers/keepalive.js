Meteor.setInterval(function () {
	if (Meteor.userId()) {
		Meteor.call('keepalive', Meteor.user().profile.liveMarkerId);
	}
}, 10000);