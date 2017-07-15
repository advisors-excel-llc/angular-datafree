/**
 * Created by alex.boyce on 4/6/17.
 */

var gulp = require('gulp');
var webpack = require('webpack-stream');
var rename = require('gulp-rename');
var templateCache = require('gulp-angular-templatecache');
var less = require('gulp-less');

gulp.task('webpack', function() {
    return gulp.src('src/angular-datafree.ts')
        .pipe(webpack(require('./webpack.gulp.config.js')))
        .pipe(gulp.dest('dist/'))
    ;
});

gulp.task('less', function() {
    gulp.src('less/angular-datafree.less')
        .pipe(less({
            paths: ['less/**/*.less'],
            compress: true
        }))
        .pipe(rename({
            extname: '.min.css'
        }))
        .pipe(gulp.dest('dist/'))
    ;
});

gulp.task('ng-template', function() {
    return gulp.src('views/**/*.html')
        .pipe(templateCache({
            filename: 'angular-datafree-templates.js',
            module: 'ae.datafree.tpls',
            standalone: true
        }))
        .pipe(gulp.dest('dist/'))
    ;
});

gulp.task('default', ['webpack', 'less', 'ng-template']);