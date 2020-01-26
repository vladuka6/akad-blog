var gulp = require('gulp');
var sass = require('gulp-sass');
var rename = require('gulp-rename');
var autoprefixer = require('gulp-autoprefixer');
var browserSync = require('browser-sync').create();
var imagemin = require('gulp-imagemin');
var sourcemaps = require('gulp-sourcemaps');
var notify = require('gulp-notify');
var plumber = require('gulp-plumber'); // модуль для отслеживания ошибок
var include = require('gulp-include');


const paths = {
    src: {
        baseDir: './src/',
        scss: './src/scss/app.scss',
        html: './src/**/*.html',
        js: './src/js/**/*.js',
        img: './src/img/**/*.*',
        allFiles: ''
    },
    build: {
        baseDir: './build/',
        css: './build/css/',
        html: './build/',
        js: './build/js/',
        img: './build/img/'
    }
}

function compileStyles(cb) {
    gulp.src('./src/scss/app.scss')
        .pipe(sourcemaps.init())
            .pipe(sass({
                // outputStyle: "compressed",
                errLogToConsole: true
            }))
            .on('error', notify.onError({
                title: "SCSS Error!!!",
                message: "<%= error.message %> 😢"
            }))
            .pipe(autoprefixer({
                cascade: false,
                overrideBrowserslist: ['last 2 versions']
            }))
            .pipe(rename({suffix: '.min'}))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./build/css/'))
        .pipe(notify({
            message: 'Styles task complete 🤮',
            sound: true
        }));

    cb();
}

gulp.task('compileStyles', compileStyles)

function buildHtml(cb) {
    gulp.src('./src/*.html')
    .pipe(gulp.dest('./build/'));

    cb();
}
gulp.task('buildHtml', buildHtml)

function buildJs(cb) {
    gulp.src('./src/js/**/*.js')
        .pipe(sourcemaps.init())
        .pipe(include({
            includePaths: './node_modules'
        }))
        .on('error', notify.onError({
            title: "JS Error!!!",
            message: "<%= error.message %> 😢"
        }))
        .pipe(sourcemaps.write())
    .pipe(gulp.dest('./build/js/'));

    cb();
}
gulp.task('buildJs', buildJs)

function imageTransfer(cb) {
    gulp.src('./src/img/**/*.*')
       .pipe(gulp.dest('./build/img/'));

    cb();
}
gulp.task('imageTransfer', imageTransfer);

function imageOptimize(cb) {
    gulp.src('./src/img/**/*.*')
        .pipe(imagemin({
            progressive: true,
            interlaced: true,
            svgoPlugins: [ { removeViewBox:false } ]
        }))
       .pipe(gulp.dest('./build/img/'));

    cb();
}
gulp.task('imageOptimize', imageOptimize);


function watchFiles(cb) {
    gulp.watch('./src/*.html', buildHtml);
    gulp.watch('./src/scss/**/*.scss', compileStyles);
    gulp.watch('./src/js/**/*.js', buildJs);
    gulp.watch('./src/img/**/*.*', imageTransfer);
    gulp.watch('./src/**/*.*', browserReload);

    cb();
}

function sync(cb) {
    browserSync.init({
        server: {
            baseDir: "./build/"
        },
        port: 3000
    })

    cb();
}

function browserReload(cb) {
    browserSync.reload();
    cb();
}

function devBuild(cb) {
    buildHtml(cb);
    compileStyles(cb);
    buildJs(cb);
    imageTransfer(cb);

    cb();
}
gulp.task('devBuild', devBuild);

gulp.task('default', gulp.series(devBuild, gulp.parallel(sync, watchFiles)));


var browserSyncServer = require('browser-sync');
function server(cb) {
    browserSyncServer({
        proxy: "https://beetroot.academy",
        files: "./build/css/app.min.css",
        middleware: require('serve-static')('./build/'),
        rewriteRules: [
            {
                match: new RegExp('</head>'),
                fn: function() {
                    return '<link rel="stylesheet" href="/css/app.min.css">'
                }
            }
        ],
        port: 9001
    })
}

gulp.task('server', server);
