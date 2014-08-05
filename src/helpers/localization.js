/*
Localization helper
===================

For localization we need to detect the
user's language. Because we want the localization
to be placed in sperate files but also to be bound
to a specific page, we create a helper which can be
used in the controller to specify the localization 
strings.
*/

var s = (function(s) {
    s.localize = function(localization) {
        // set page.l to the localized strings
        var locale = (navigator.language || navigator.userLanguage)
        	.substring(0, 2);
        // english localization as fallback
        return localization[locale] || localization['en'];
    };
    
    return s;
}(s || {}));