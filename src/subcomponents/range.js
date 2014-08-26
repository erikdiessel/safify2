/*
Input range subcomponent
========================

This subcompoenent represents a topcoat range input,
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
                min: config.min,
                max: config.max,
                value: config.value(),
                onchange: m.withAttr("value", config.value)
            }),
            config.label
        ]);
    };
});