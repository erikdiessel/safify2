/*
Button subcomponent
===================

This component is a simple topcoat button,
with an attached clicked handler.
*/

define(['../vendor/mithril'], function(m) {
/*
We refrain from specifying a controller, since
this provides a code size overhead: the controller
for the button has to be initialized and referenced
in the view. Instead we include the control part in
a single function which is the view.
*/
// config: {
//   // required;  click handler
// 	 onclick: Function,
//   // required;  text on the button
//   label: String,
//   // if true, button is styled as call-to action button:
//   callToAction: bool, 
//   large: bool,
//   quiet: bool,
//   // string of additonally attached classes
//   classes: string
//   // whether this is is an input-submit button for a form
//   submit: bool
// }
return function(config) {
    var classes = "topcoat-button" + (config.large ? "--large" : "") +
                (config.callToAction ? "--cta" : "") +
                (config.quiet ? "--quiet": "") +
                " " + (config.classes || "");
                
    
    return config.submit ?
        m("input[type=submit]", {
            "class": classes,
            value: config.label,
            /* We can use the "onclick" event handler since
               somehow it is also activated, when the form
               is submitted by pressing the enter key.
            */
            onclick: function(event) {
                config.onclick();
                event.preventDefault();
            }
        }) :
    
        m("button", {
            "class": classes,
            onclick: config.onclick
        }, config.label);
};
});