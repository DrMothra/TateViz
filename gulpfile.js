/**
 * Created by atg on 31/10/2016.
 */

var gulp = require('gulp');
var gutil = require('gulp-util');
var jshint = require('gulp-jshint');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var exceljson = require('gulp-excel2json');

gulp.task('jshint', function() {
    return gulp.src(['./js/*.js'])
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('build', function() {
    return gulp.src('./js/*.js')
        .pipe(concat('all.js'))
        .pipe(gulp.dest('./dist/'));
});

gulp.task("exceljson", function () {
    return gulp.src('./data/tate.xlsx')
        .pipe(exceljson())
        .pipe(gulp.dest('./js'))
});
