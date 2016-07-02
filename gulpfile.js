var gulp = require('gulp');
var connect = require('gulp-connect');
var opn = require('opn');
var jade = require('gulp-jade');
var watch = require('gulp-watch');
var batch = require('gulp-batch');
var stylus = require('gulp-stylus');
var autoprefixer = require('gulp-autoprefixer');
var promise = require('es6-promise').polyfill();

var devPort = 8000;
var livePort = 8001;
var devServer = 'http://localhost:'+devPort+'/';
var liveServer = 'http://localhost:'+livePort+'/';
var srcPath = './src';


gulp.task('default', defaultTask);
gulp.task('startDevServer', startDevServer);
gulp.task('setWatcher', setWatcher);
gulp.task('compileJade', compileJade);
gulp.task('compileStylus', compileStylus);


function defaultTask() {
    gulp.start([
        'compileStylus',
        'compileJade',
        'setWatcher',
        'startDevServer'
    ]);
}
function setWatcher() {
    //gulp.watch([srcPath+'/*.html',srcPath+'/css/*.css','./src/js/*.js'], ['reloadBrowser']);
    //gulp.watch([srcPath+'/jade/**/*.jade'], ['compileJade']);
    watch(srcPath+'/jade/**/*.jade', batch(function (events, done) {
        gulp.start('compileJade', done);
    }));
    watch(srcPath+'/stylus/**/*.styl', batch(function (events, done) {
        gulp.start('compileStylus', done);
    }));
    //gulp.watch(['./src/stylus/*.styl'], ['compileStylus']);
    //gulp.watch(['bower.json'], ['wiredep']);
}

function startDevServer() {
    connect.server({
        port: devPort,
        root: './src',
        livereload: true
    });
    opn(devServer)
}

function compileJade() {
    gulp.src(srcPath+'/jade/**/*.jade')
        .pipe(jade({
            pretty: true
        }))
        .pipe(gulp.dest('./src'))
        .pipe(connect.reload());
}
function compileStylus() {
    gulp.src('./src/stylus/*styl')
        .pipe(stylus())
        .pipe(autoprefixer())
        .pipe(gulp.dest('./src/css/'))
        .pipe(connect.reload());
};