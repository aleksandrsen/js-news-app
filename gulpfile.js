let gulp = require('gulp'),
    sass = require('gulp-sass'),
    concat = require('gulp-concat'),
    autoprefixer = require('gulp-autoprefixer'),
    browserSync = require('browser-sync'),
    cleanCss = require('gulp-clean-css');

const cssFiles = [
    './sass/style.scss'
];

const jsFiles = [
    './js/**/*.js'
];


function styles() {
    return gulp.src(cssFiles)
        .pipe(sass().on('error', sass.logError))
        .pipe(concat('style.css'))
        .pipe(autoprefixer({
            browsers: ['> 1%'],
            cascade: false
        }))
        .pipe(cleanCss({
            compatibility: 'ie8',
            level: 2
        }))
        .pipe(gulp.dest('./css'))
        .pipe(browserSync.stream());
}

function watch() {
    browserSync.init({
        server: {
            baseDir: "./"
        },
        notify: false
    });

    gulp.watch(cssFiles, styles);
    gulp.watch(jsFiles, browserSync.reload);
    gulp.watch("./*.html").on('change', browserSync.reload);
}

gulp.task('styles', styles);
gulp.task('watch', watch);













































