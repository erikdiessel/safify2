/*
Input range subcomponent
========================

This subcompoenent representsa topcoat range input,
together with a display of the current value.

*/

/// <reference path="../vendor/mithril.d.ts" />

define(['../vendor/mithril'], function(m) {

    // config: {
    // 	   label: string,
    //	   value: m.prop,
    //     min:   int,
    //     max:   int
	// }    
    return function(config) {
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
});