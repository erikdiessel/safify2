/*
Button subcomponent
===================

This component is a simple topcoat button,
with an attached clicked handler.
*/

var s = (function(s) {
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
    //   // if true, button is tyled as dangerous action (red)
    //   danger: bool,
    //   large: bool,
    //   quiet: bool,
    //   // string of additonally attached classes
    //   classes: string
    // }
    s.button = function(config) {
        return m("button", {
            "class": 
            	"topcoat-button" + (config.large ? "--large" : "") +
            		(config.callToAction ? "--cta" : "") +
            		(config.quiet ? "--quiet": "") +
            	" " + (config.classes || ""),
            onclick: config.onclick
        }, config.label);
    };
    
    
    return s;
}(s || {}));