define(function(require) {

var m = require('../vendor/mithril'),
  errorMessages = require('../components/errorMessages');
  
return function() {
    return m('div', [
        m('h1', 'Safify'),
        errorMessages()
    ]);
};

});