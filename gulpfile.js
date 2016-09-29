// Assigning modules to local variables
var gulp = require('gulp');
var webpack = require('webpack-stream');
var less = require('gulp-less');
var browserSync = require('browser-sync').create();
var header = require('gulp-header');
var cleanCSS = require('gulp-clean-css');
var rename = require("gulp-rename");
var uglify = require('gulp-uglify');
var pkg = require('./package.json');
var del = require('del');
var run = require('gulp-run');

// Default task
gulp.task('default', ['copy', 'webpack', 'dev']);

// clean
gulp.task('clean', function (cb) {
  return del([
    'public/**/*',
    '!public/static',
    '!public/static/video',
    '!public/static/video/**/*'
  ], cb);
});

// webpack
gulp.task('webpack', function() {
  return gulp.src('app/components/Main.js')
    .pipe(webpack(require('./webpack.config.js')))
    .pipe(gulp.dest('public/static/js'));
});

// Copy
gulp.task('copy-0', function() {
    return gulp.src(['img/**'])
        .pipe(gulp.dest('public/static/img'))
})

gulp.task('copy-1', function() {
    return gulp.src(['index.html'])
        .pipe(gulp.dest('public/templates/'))
})

gulp.task('copy-2', function() {
    return gulp.src(['app/app.py'])
        .pipe(gulp.dest('public/'))
})

gulp.task('copy-3', function() {
    return gulp.src(['app/templates/*'])
        .pipe(gulp.dest('public/templates/'))
})

gulp.task('copy-4', function() {
    return gulp.src(['app/login-assets/**'])
        .pipe(gulp.dest('public/static/login-assets/'))
})

// SQL
gulp.task('copy-5', function() {
    return gulp.src(['app/sql/init_tables.py'])
        .pipe(gulp.dest('public/sql/'))
})

gulp.task('copy-6', function() {
    return gulp.src(['app/sql/__init__.py'])
        .pipe(gulp.dest('public/sql/'))
})

gulp.task('copy-7', function() {
    return gulp.src(['app/sql/configs/config.json'])
        .pipe(gulp.dest('public/sql/configs/'))
})

gulp.task('copy-8', function() {
    return gulp.src(['app/sql/configs/options.json'])
        .pipe(gulp.dest('public/sql/configs/'))
})

gulp.task('copy-9', function() {
    return gulp.src(['app/app.wsgi'])
        .pipe(gulp.dest('public/'))
})

gulp.task('copy', ['copy-0', 'copy-1', 'copy-2', 'copy-3', 'copy-4', 'copy-5', 'copy-6', 'copy-7', 'copy-8', 'copy-9']);

// Configure the browserSync task
gulp.task('browserSync', function() {
    browserSync.init({
        server: {
            baseDir: ''
        },
    })
})

// Watch Tasks
gulp.task('dev', ['browserSync', 'webpack'], function() {
    gulp.watch('app/components/**/*.js', ['webpack']);
    gulp.watch('app/components/**/*.jsx', ['webpack']);
    gulp.watch('app/css/*.css', ['webpack']);
    gulp.watch('app/css/*.scss', ['webpack']);
    // Reloads the browser whenever HTML or JS files change
    gulp.watch('public/*.html', browserSync.reload);
    gulp.watch('public/*.js', browserSync.reload);
})

// // Run flask
// gulp.task('run-flask', function() {
//   return run('python public/app.py').exec();
// });
