define(['../helpers/bind', '../helpers/reduce_polyfill',
		'../helpers/extend',
		'json!./main.json', 'json!./generator.json',
        'json!./login.json'],
       function(__, __, extend, main, generator, login) {
	

/*function(require) {

var __ = require('../helpers/bind'),
__ = require('../helpers/reduce_polyfill'),
main = require('json!./main.json');*/



var localizations = [main, generator, login];

var locale = (navigator.language || navigator.userLanguage).substring(0, 2);

// Combine all localizations into one object
var localized = localizations.reduce(function(acc, addition) {
	return extend(acc, addition[locale]);
}, {});

return localized;

});