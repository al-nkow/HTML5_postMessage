'use strict';

var gulp = require('gulp');

var autoprefixer = require('gulp-autoprefixer');
var concat = require('gulp-concat');
var minifyCss = require('gulp-minify-css');
var uglify = require('gulp-uglify');
var stylus = require('gulp-stylus');
var browserSync = require('browser-sync').create();
var plumber = require('gulp-plumber');

// html
gulp.task('html', function () {
    gulp.src('./app/**/*.html')
        .pipe(gulp.dest('./dist/'))
        .pipe(browserSync.reload({stream: true}));
});

// копирует файлы
gulp.task('copy', function () {
    gulp.src('./assets/images/*')
        .pipe(gulp.dest('./dist/images/'));
    gulp.src('./assets/fonts/*')
        .pipe(gulp.dest('./dist/fonts/'));
});

// stylus
gulp.task('stylus', function () {
    gulp.src('./app/**/*.styl')
        .pipe(plumber())
        .pipe(stylus({compress: true}))
        .pipe(autoprefixer('> 1%', 'last 15 versions', 'ie 8', 'Firefox ESR', 'Opera 12.1'))
        .pipe(concat('style.min.css'))
        .pipe(minifyCss())
        .pipe(gulp.dest('./dist/css/'))
        .pipe(browserSync.reload({stream: true}));
});

// js
gulp.task('js', function () {
    gulp.src(['./app/**/*.js'])
        .pipe(plumber())
        .pipe(concat('main.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./dist/js/'))
        .pipe(browserSync.reload({stream: true}));
});

// watch
gulp.task('watch', function () {
    gulp.watch('./app/**/*.styl', ['stylus']);
    gulp.watch('./app/**/*.html', ['html']);
    gulp.watch('./app/**/*.js', ['js']);
});

// serve
gulp.task('serve', function () {
    browserSync.init({
        server: "./dist",
        open: true
    });
});


gulp.task('default', ['stylus', 'copy', 'html', 'js', 'serve', 'watch']);

gulp.task('build', ['stylus', 'copy', 'html', 'libs', 'js']);