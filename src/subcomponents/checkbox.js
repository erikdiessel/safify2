/*
Checkbox subcomponent
=====================

The checkbox subcomponent represents
the controller and view for a topcoat-
styled checkbox
*/

define(['../vendor/mithril'], function(m) {
    
// *config.checked* is a m.prop property which is 
// then bound to the checkbox
// *config.label* is the string which is shown next
// to the checkbox
    
return function(config) {
    return m("label.topcoat-checkbox", [
        m("input[type=checkbox]", {
            onchange: m.withAttr("checked", config.checked),
            checked: config.checked()
        }),
        m("div.topcoat-checkbox__checkmark"),
        config.label
    ]);
};

});
