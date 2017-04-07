/**
 * Created by alex.boyce on 4/6/17.
 */

var gulp = require('gulp');
var webpack = require('gulp-webpack');
var browserify = require('browserify');
var rename = require('gulp-rename');
var source = require('vinyl-source-stream');
var templateCache = require('gulp-angular-templatecache');

gulp.task('webpack', function() {
    return gulp.src('src/angular-datafree.ts')
        .pipe(webpack(require('./webpack.config.js')))
        .pipe(gulp.dest('dist/'))
    ;
});

gulp.task('browserify', ['webpack'], function() {
    return browserify('dist/angular-datafree.build.min.js')
        .bundle()
        .pipe(source('angular-datafree.min.js'))
        .pipe(gulp.dest('dist/'))
        ;
});

gulp.task('ng-template', function() {
    return gulp.src('views/**/*.html')
        .pipe(templateCache({
            filename: 'angular-datafree-templates.js',
            root: '/views/',
            module: 'ae.datafree.tpls',
            standalone: true
        }))
        .pipe(gulp.dest('dist/'))
    ;
});

gulp.task('default', ['browserify', 'ng-template']);