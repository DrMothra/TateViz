/**
 * Created by atg on 31/10/2016.
 */

var gulp = require('gulp');
var gutil = require('gulp-util');
var jshint = require('gulp-jshint');
var useref = require('gulp-useref');
var uglify = require('gulp-uglify');
var gulpIf = require('gulp-if');
var cssnano = require('gulp-cssnano');

gulp.task('jshint', function() {
    return gulp.src(['./js/*.js'])
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('build', function() {
    return gulp.src('tateWorldViz.html')
        .pipe(useref())
        .pipe(gulpIf('*.js', uglify()))
        .pipe(gulpIf('*.css', cssnano()))
        .pipe(gulp.dest('dist'));
});
