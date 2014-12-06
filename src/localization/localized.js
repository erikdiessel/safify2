define(['../helpers/bind', '../helpers/reduce_polyfill',
		'../helpers/extend',
		'json!./main.json', 'json!./generator.json',
        'json!./login.json', 'json!./errorMessages.json',
        'json!./entry.json', 'json!./edit.json',
        'json!./overview.json',
        'json!./register.json'],
       /*function(__, __, extend, main, generator, login,
                errorMessages, entry, edit, overview,
                register) {*/
         function(__, __, extend) {


var localizations = Array.prototype.slice.call(arguments, 3);

/*var localizations = [main, generator, login,
      errorMessages, entry, edit, overview, register];*/

var locale = (navigator.language || navigator.userLanguage).substring(0, 2);

// Combine all localizations into one object
var localized = localizations.reduce(function(acc, addition) {
	return extend(acc, addition[locale]);
}, {});

return localized;

});