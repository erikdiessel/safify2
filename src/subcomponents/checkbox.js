/*
Checkbox subcomponent
=====================

The checkbox subcomponent represents
the controller and view for a topcoat-
styled checkbox
*/

var s = (function(s) {
    
    s.checkbox = {};
    
    
    // *setting.checked* is a m.prop property which is 
    // then bound to the checkbox
    // *setting.label* is the string which is shown next
    // to the checkbox
    s.checkbox.controller = function(setting) {
    	s.copy(this, setting);
    };
    
    s.checkbox.view = function(ctrl) {
        return m("label.topcoat-checkbox", [
            m("input[type=checkbox]", {
                onchange: m.withAttr("checked", ctrl.checked),
                checked: ctrl.checked()
            }),
            m("div.topcoat-checkbox__checkmark"),
            ctrl.label
        ]);
    };
    
    return s;
}(s || {}));
