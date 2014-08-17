(function() {
	namespace('s');
    s.errorMessage = function(config) {
    	return config.visible() ? 
            m('span', {
                'class': 'error_message'
            }, config.message)
            :
            "";
    };
}());