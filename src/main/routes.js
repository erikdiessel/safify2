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

setTimeout(function() {
    // TODO replace "generator" by "/"
    m.route(document.body, "", {
   		"": s.login,
        "overview": s.overview,
        "edit/:entryId": s.edit,
        "generator": s.generator
    }); 
});
