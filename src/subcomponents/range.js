/*
Input range subcomponent
========================

This subcompoenent representsa topcoat range input,
together with a display of the current value.

*/

var s = (function(s) {
    s.range = {};
    
    // config: {
    // 	   label: string,
    //	   value: m.prop,
    //     min:   int,
    //     max:   int
	// }
    s.range.controller = function(config) {
        s.copy(this, config);
    }
    
    s.range.view = function(ctrl) {
    	return m("label", [
            m("input[type=range].topcoat-range", {
                min: ctrl.min,
                max: ctrl.max,
                value: ctrl.value(),
                onchange: m.withAttr("value", ctrl.value)
            }),
            ctrl.label
        ]);
    };
    
    return s;
}(s || {}));