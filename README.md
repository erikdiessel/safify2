safify2
=======

Version 2.0 of the safify webapp: Storing passwords securely
and accessible from every device

Lessons learned from safify (version 1)
---------------------------------------

* **jquery-mobile is slow**, to slow for many mobile devices.
While it supports almost all devices, it sacrifices performance
for compatability. Which makes it useless for mobile support on
not so fast devices.

* **Styling should not be done by javascript**. jquery-mobile 
modifies the dom with classes and add html tags. This uncontrollable
behaviour makes it nearly impossible to adjust the layout and design.
Adapting css-properties is hard in this situation because it's not
easy to see in which tags the corresponding css-classes are inserted.

Goals for the rewrite (version 2)
---------------------------------

* **performance**: only have the essential (the *visible*) html tags
in the DOM. Attach only the event handlers which are needed.
Use as many native browser features as possible (no emulations for
ui components, e.g input ranges). Defer any computation to the time
point where it's needed.

* **documentation**: The code should be literal: Don't only insert
comments about the behaviour of a piece of code but also explain
the higher-level reasons for the design. For this we use **plidoc**,
the literate-programming documentation generator.

Libraries, tools and technologies used to arrive at this goal
-------------------------------------------------------------

* **topcoat**: provides base CSS-styling.
Utilizes only css, no js included. Therefore it is flexible and 
easy to adapt.

* **mithril**: templating and binding of the view to the model.
It allows us to keep only the relevant parts in the DOM and 
to create dynamically the html from the javascript-models.
Because it doesn't impose on us special classes to use, we can
use a plain-old javascript model and controller.