var gulp = require('gulp');
var connect = require('gulp-connect');
var opn = require('opn');

var devPort = 8000;
var livePort = 8001;
var devServer = 'http://localhost:'+devPort+'/';
var liveServer = 'http://localhost:'+livePort+'/';


gulp.task('default', defaultTask);
gulp.task('startDevServer', startDevServer);

function defaultTask() {
    gulp.start([
        // 'compileStylus',
        // 'compileJade',
        // 'setWatcher',
        'startDevServer'
    ]);
}

function startDevServer() {
    connect.server({
        port: 8000,
        root: './src',
        livereload: true
    });
    opn(devServer)
}

