var gulp = require('gulp');
var concat = require('gulp-concat');

var karma = require('gulp-karma');

gulp.task('default', ['compile', 'test']);

gulp.task('compile', function() {
    gulp.src('./src/*/*.js')
    	.pipe(concat('safify.js'))
    	.pipe(gulp.dest('./'));
});

gulp.task('test', function() {
  // Be sure to return the stream
  return gulp.src([
      'bower_components/mithril/mithril.js',
      'bower_components/sjcl/sjcl.js',
      'bower_components/underscore/underscore.js',
      'framework.js',
      'safify.js',
      'spec/*.js'
    ])
    .pipe(karma({
      configFile: 'karma-conf.js',
      action: 'run'
    }))
    .on('error', function(err) {
      // Make sure failed tests cause gulp to exit non-zero
      throw err;
    });
});