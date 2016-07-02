var gulp = require('gulp');
var connect = require('gulp-connect');
var opn = require('opn');
var jade = require('gulp-jade');


var devPort = 8000;
var livePort = 8001;
var devServer = 'http://localhost:'+devPort+'/';
var liveServer = 'http://localhost:'+livePort+'/';


gulp.task('default', defaultTask);
gulp.task('startDevServer', startDevServer);
gulp.task('compileJade', compileJade);

function defaultTask() {
    gulp.start([
        // 'compileStylus',
        'compileJade',
        // 'setWatcher',
        'startDevServer'
    ]);
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
    gulp.src('./src/jade/**/*.jade')
        .pipe(jade({
            pretty: true
        }))
        .pipe(gulp.dest('./src'))
}
