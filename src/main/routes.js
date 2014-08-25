/*
Routes
======

The routes specify which page is loaded
when a certain URL is loaded.
It also is sort of a table of contents 
of the app.

Since the definition of the routes also
activates directly the corresponding module,
we have to ensure, that all modules are loaded
before the routes are defined. For this we wrap
the definition in a setTimeout with interval 0,
so that it is placed at the end of the execution
queue.
*/

define(function(require) {

var m = require('../vendor/mithril'),
login = require('../pages/login'),
edit  = require('../pages/edit'),
generator = require('../pages/generator'),
overview  = require('../pages/overview'),
register  = require('../pages/register');

setTimeout(function() {
    m.route(document.body, "", {
   		"": login,
        "overview":overview,
        "edit/:entryId": edit,
        "generator": generator,
        // "autofill":
        "register": register
    }); 
});

});
