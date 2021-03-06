var allTestFiles = [];
// var TEST_REGEXP = /test\.js$/;

var pathToModule = function(path) {
  return path.replace(/^\/base\//, '').replace(/\.js$/, '');
};

Object.keys(window.__karma__.files).forEach(function(file) {
  //if (TEST_REGEXP.test(file)) {
    // Normalize paths to RequireJS module names.
   // console.log(file);
  if(file.indexOf('Spec.js') != -1) {
  	allTestFiles.push(pathToModule(file));
  }
  //}
});

require.config({
  // Karma serves files under /base, which is the basePath from your config file
  baseUrl: '/base',

  // dynamically load all test files
  deps: allTestFiles,

  // we have to kickoff jasmine, as it is asynchronous
  callback: window.__karma__.start,
  	
  paths: {
      'text': 'src/vendor/requirejs_plugins/text',
      'json': 'src/vendor/requirejs_plugins/json'
  }
});