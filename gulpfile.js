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
var imagemin = require('gulp-imagemin');
var cache = require('gulp-cache');

gulp.task('jshint', function() {
    return gulp.src(['./js/*.js'])
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('build', ['minify', 'sync'], function() {

});

gulp.task('minify', function() {
    return gulp.src('tateWorldViz.html')
        .pipe(useref())
        .pipe(gulpIf('*.js', uglify()))
        .pipe(gulpIf('*.css', cssnano()))
        .pipe(gulp.dest('dist'));
});

gulp.task('sync', function() {
    return gulp.src('models/*.json')
        .pipe(gulp.dest('dist/models'))
});

gulp.task('buildimages', function() {
    return gulp.src('images/*.+(png|jpg)')
        .pipe(cache(imagemin()))
        .pipe(gulp.dest('dist/images'))
});

gulp.task('buildmodels', function() {
    return gulp.src('models/*.+(png|jpg)')
        .pipe(cache(imagemin()))
        .pipe(gulp.dest('dist/models'))
});

gulp.task('buildtextures', function() {
    return gulp.src('textures/*.+(png|jpg)')
        .pipe(cache(imagemin()))
        .pipe(gulp.dest('dist/textures'))
});

gulp.task('buildAllImages', ['buildimages', 'buildmodels', 'buildtextures'], function() {

});
