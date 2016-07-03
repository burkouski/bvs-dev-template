var gulp = require('gulp');
var connect = require('gulp-connect');
var opn = require('opn');
var jade = require('gulp-jade');
var watch = require('gulp-watch');
var batch = require('gulp-batch');
var stylus = require('gulp-stylus');
var autoprefixer = require('gulp-autoprefixer');
var promise = require('es6-promise').polyfill();
var spritesmith = require('gulp.spritesmith');
var plumber = require('gulp-plumber');

var devPort = 8000;
var livePort = 8001;
var devServer = 'http://localhost:' + devPort + '/';
var liveServer = 'http://localhost:' + livePort + '/';
var srcPath = './src';


gulp.task('default', defaultTask);
gulp.task('startDevServer', startDevServer);
gulp.task('setWatcher', setWatcher);
gulp.task('compileJade', compileJade);
gulp.task('compileStylus', compileStylus);
gulp.task('generateSprite', generateSprite);


function defaultTask() {
    gulp.start([
        'compileStylus',
        'compileJade',
        'setWatcher',
        'startDevServer'
    ]);
}
function setWatcher() {
    // gulp.src('./src/jade/**/*.jade')
    //     .pipe(plumber())
    //     .pipe(
    //         watch('./src/jade/**/*.jade', batch(function (events, done) {
    //             gulp.start('compileJade', done)})
    //         )
    //     );
    watch('./src/jade/**/*.jade', batch(function (events, done) {
        gulp.start('compileJade', done)
    }));
    watch('./src/stylus/**/*.styl', batch(function (events, done) {
        gulp.start('compileStylus', done)
    }));
    watch(srcPath+'/img/sprite/*.{png,gif,jpg}', batch(function (events, done) {
        gulp.start('generateSprite', done);
    }));
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
    gulp.src(srcPath + '/jade/**/*.jade')
        .pipe(jade({
            pretty: true
        }))
        .pipe(gulp.dest('./src'))
        .pipe(connect.reload());
}
function compileStylus() {
    gulp.src('./src/stylus/**/*styl')
        .pipe(stylus())
        .pipe(autoprefixer())
        .pipe(gulp.dest(srcPath + '/css/'))
        .pipe(connect.reload());
}

function generateSprite() {
    var spriteData = gulp.src(srcPath + '/img/sprite/*.*') // путь, откуда берем картинки для спрайта
        .pipe(spritesmith({
            imgName: 'sprite.png',
            cssName: 'sprite.styl',
            cssFormat: 'stylus',
            algorithm: 'binary-tree',
            cssTemplate: srcPath + '/stylus/stylus.template.mustache',
        }));

    spriteData.img.pipe(gulp.dest(srcPath + '/img/bg')); // путь, куда сохраняем спрайт
    spriteData.css.pipe(gulp.dest(srcPath + '/stylus/mixins/')).pipe(connect.reload()); // путь, куда сохраняем стили
}
