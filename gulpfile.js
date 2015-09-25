/**
 *  Amaze UI Starter Kit
 */

'use strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var del = require('del');
var runSequence = require('run-sequence');
var browserSync = require('browser-sync');
var browserify = require('browserify');
var watchify = require('watchify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var reload = browserSync.reload;
var isProduction = process.env.NODE_ENV === "production";

var AUTOPREFIXER_BROWSERS = [
  'ie >= 9',
  'ie_mob >= 10',
  'ff >= 30',
  'chrome >= 34',
  'safari >= 7',
  'opera >= 23',
  'ios >= 7',
  'android >= 2.3',
  'bb >= 10'
];

var paths = {
  dist: {
    base: 'dist',
    js: 'dist/js',
    css: 'dist/css',
    i: 'dist/i',
    fonts: 'dist/fonts'
  }
};

// JavaScript 格式校验
gulp.task('jshint', function () {
  return gulp.src('app/js/**/*.js')
    .pipe(reload({stream: true, once: true}))
    .pipe($.eslint())
    .pipe($.eslint.format())
    .pipe($.eslint.failOnError());
});

// 图片优化
gulp.task('images', function () {
  return gulp.src('app/i/**/*')
    // .pipe($.cache($.imagemin({
    //   progressive: true,
    //   interlaced: true
    // })))
    .pipe(gulp.dest(paths.dist.i))
    .pipe($.size({title: 'images'}));
});

// 拷贝相关资源
gulp.task('copy', function () {
  return gulp.src([
    'app/*',
    '!app/event.js',
    '!app/*.html',
    '!app/js',
    '!app/less',
    '!app/i',
    'node_modules/amazeui/dist/css/amazeui.min.css',
    'node_modules/amazeui/dist/fonts/*',
    'node_modules/react/dist/react.min.js',
    'node_modules/jquery/dist/jquery.min.js',
    'node_modules/jquery/dist/jquery.min.map'
  ], {
    dot: true
  }).pipe(gulp.dest(function(file) {
    var filePath = file.path.toLowerCase();
    if (filePath.indexOf('.css') > -1) {
      return paths.dist.css;
    } else if(filePath.indexOf('react.min.js') > -1 ||
        filePath.indexOf('jquery.min.js') > -1 ||
        filePath.indexOf('jquery.min.map') > -1) {
      return paths.dist.js;
    } else if (filePath.indexOf('fontawesome') > -1) {
      return paths.dist.fonts;
    }
    return paths.dist.base;
  }))
    .pipe($.size({title: 'copy'}));
});

// 编译 Less，添加浏览器前缀
gulp.task('styles', function () {
  return gulp.src(['app/less/app.less'])
    .pipe($.less())
    .pipe($.autoprefixer({browsers: AUTOPREFIXER_BROWSERS}))
    .pipe(gulp.dest('dist/css'))
    .pipe($.csso())
    .pipe($.rename({suffix: '.min'}))
    .pipe(gulp.dest('dist/css'))
    .pipe($.size({title: 'styles'}));
});

// 打包 Common JS 模块
var b = browserify({
  cache: {},
  packageCache: {},
  entries: ['./app/js/app.js'],
  debug: !isProduction,
  transform: ['babelify']
});

if (!isProduction) {
  b = watchify(b);
}

// 如果不想把 React 打包进去，可以把下面一行注释去掉
b.transform('browserify-shim', {global: true});

var bundle = function() {
  var s = (
    b.bundle()
      .on('error', $.util.log.bind($.util, 'Browserify Error'))
      .pipe(source('app.js'))
      .pipe(buffer())
      .pipe(gulp.dest(paths.dist.js))
      .pipe($.size({title: 'script'}))
  );

  return !isProduction ? s : s.pipe($.uglify())
    .pipe($.rename({suffix: '.min'}))
    .pipe(gulp.dest(paths.dist.js))
    .pipe($.size({
      title: 'script minify'
    }));
};

gulp.task('browserify', function() {
  if (!isProduction) {
    b.on('update', bundle).on('log', $.util.log);
  }

  return bundle();
});

// 压缩 HTML
gulp.task('html', function () {
  return gulp.src('app/**/*.html')
    .pipe($.minifyHtml())
    .pipe($.replace(/\{\{__VERSION__\}\}/g, isProduction ? '.min' : ''))
    .pipe(gulp.dest('dist'))
    .pipe($.size({title: 'html'}));
});

// 加密event.js
gulp.task('eventJs', function() {
  return gulp.src('app/event.js')
    // .pipe($.uglify())
    .pipe(gulp.dest(paths.dist.base));
});

// 洗刷刷
gulp.task('clean', function(cb) {
  del(['dist/*', '!dist/.git'], {dot: true}, cb);
});

// 监视源文件变化自动cd编译
gulp.task('watch', function() {
  gulp.watch('app/**/*.html', ['html']);
  gulp.watch('app/less/**/*less', ['styles']);
  gulp.watch('app/i/**/*', ['images']);
  gulp.watch('app/event.js', ['eventJs']);
});

// 启动预览服务，并监视 Dist 目录变化自动刷新浏览器
gulp.task('dev', ['default', 'watch'], function () {
  browserSync({
    notify: false,
    logPrefix: 'CA',
    server: {
      baseDir: 'dist',
      index: 'popup.html'
    },
    port: '3001'
  });

  gulp.watch(['dist/**/*'], reload);
});

// 默认任务
gulp.task('default', function (cb) {
  runSequence(
    'clean',
    ['styles', 'jshint', 'html', 'images', 'copy',
      'browserify', 'eventJs'],
    cb
  );
});
