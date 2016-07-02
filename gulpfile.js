var gulp = require('gulp');
var connect = require('gulp-connect');
var opn = require('opn');
var jade = require('gulp-jade');
var watch = require('gulp-watch');
var batch = require('gulp-batch');

var devPort = 8000;
var livePort = 8001;
var devServer = 'http://localhost:'+devPort+'/';
var liveServer = 'http://localhost:'+livePort+'/';
var srcPath = './src';


gulp.task('default', defaultTask);
gulp.task('startDevServer', startDevServer);
gulp.task('setWatcher', setWatcher);
gulp.task('compileJade', compileJade);


function defaultTask() {
    gulp.start([
        // 'compileStylus',
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
