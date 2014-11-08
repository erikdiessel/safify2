/*
Input-field subcomponent
========================
This subcomponent represents an input field,
with a label and automatic binding.
*/

/// <reference path="../vendor/mithril.d.ts" />

/*:
interface MithrilProperty {
    (value?: any): any
}
*/

/*:
interface InputOptions {
    label: string;
    value: MithrilProperty;
    type: string;
    autofocus: bool
}
*/

define(['../vendor/mithril'], function(m) {

return function(config/*::InputOptions*/) /*::MithrilVirtualElement*/ {
    return m('label', [
        m('input', {
            type: config.type,
            value: config.value(),
            onchange: m.withAttr('value', config.value),
            placeholder: config.label,
            autofocus: config.autofocus
        }),
        config.label
    ]);
};
    
});