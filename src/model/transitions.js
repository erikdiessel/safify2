define(function(require) {

var md = require('../framework/mediator'),
     m = require('../vendor/mithril');

md().on('loggedIn', function() {
	m.route('overview');
});

});