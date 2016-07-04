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
var inject = require('gulp-inject');
var jshint = require('gulp-jshint');
var concat = require('gulp-concat');

var devPort = 8000;
var livePort = 8001;
var devServer = 'http://localhost:' + devPort + '/';
var liveServer = 'http://localhost:' + livePort + '/';
var srcPath = './src/';
var cssPath = srcPath+'css/';
var jsPath = srcPath+'js/';

var mainCss = [cssPath+'global.css',
                cssPath+'blocks.css', ''];

gulp.task('default', defaultTask);
gulp.task('startDevServer', startDevServer);
gulp.task('setWatcher', setWatcher);
gulp.task('compileJade', compileJade);
gulp.task('compileStylus', compileStylus);
gulp.task('generateSprite', generateSprite);
gulp.task('injectMainCss', injectMainCss);
gulp.task('injectVendorCss', injectVendorCss);
gulp.task('injectMainJs', injectMainJs);
gulp.task('injectVendorJs', injectVendorJs);
gulp.task('lint', lint);
gulp.task('build', build);


function defaultTask() {
    gulp.start([
        'compileStylus',
        'compileJade',
        'setWatcher',
        'startDevServer'
    ]);
}
function setWatcher() {
    
    watch('./src/jade/**/*.jade', batch(function (events, done) {
        gulp.start('compileJade', done)
    }));

    watch('./src/stylus/**/*.styl', batch(function (events, done) {
        gulp.start('compileStylus', done)
    }));

    watch(srcPath+'/img/sprite/*.{png,gif,jpg}', batch(function (events, done) {
        gulp.start('generateSprite', done);
    }));

    watch(cssPath+'*.css', batch(function (events, done) {
        if(events._list[0].event) {
            gulp.start('injectMainCss', done);
        }
        gulp.start('lint', done);
    }));

    watch(jsPath+'*.js', batch(function (events, done) {
        console.log(events);
        if(isAdded(events._list[0])) {
            gulp.start('injectMainJs', done);
        }
        gulp.start('lint', done);
    }));

    watch('./vendorSrc.json', batch(function (events, done) {
        gulp.start('injectVendorCss', done);
        gulp.start('injectVendorJs', done);
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
    gulp.src('./src/stylus/*.styl')
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

function injectMainCss() {
    var target = gulp.src('./src/jade/layout.jade');
  // It's not necessary to read the files (will speed up things), we're only after their paths:
  var sources = gulp.src(['./src/css/*.css'], {read: false});

  return target.pipe(inject(sources)).pipe(gulp.dest('./src/jade/'));
}

function injectVendorCss() {
    var target = gulp.src('./src/jade/layout.jade');
    var vendorSrc = require('./vendorSrc.json');
    var sources = gulp.src(vendorSrc.css, {read: false});

  return target
      .pipe(inject(sources)).pipe(gulp.dest('./src/jade/'));
}

function injectMainJs() {
    var target = gulp.src('./src/jade/layout.jade');
  // It's not necessary to read the files (will speed up things), we're only after their paths:
  var sources = gulp.src(['./src/js/*.js'], {read: false});

  return target.pipe(inject(sources)).pipe(gulp.dest('./src/jade/'));
}

function injectVendorJs() {
    var target = gulp.src('./src/jade/layout.jade');
    var vendorSrc = require('./vendorSrc.json');
    var sources = gulp.src(vendorSrc.js, {read: false});

  return target
      .pipe(inject(sources)).pipe(gulp.dest('./src/jade/'));
}

function lint() {
    return gulp.src('./src/js/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
}

function isAdded(file) {
    return file.event === 'add';
}

function build() {
    gulp.src(['./src/css/*.css'], {base: '.'})
        .pipe(concat('build.css'))
        .pipe(gulp.dest('./dist/assets'));
        
    gulp.src(['./src/js/*.js'], {base: '.'})
        .pipe(concat('build.js'))
        .pipe(gulp.dest('./dist/assets'));

    gulp.src([srcPath + '/**/*.html'], {base: './src'})
        .pipe(gulp.dest('./dist'))
}
