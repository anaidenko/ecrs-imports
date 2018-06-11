var clear = require('cli-clear');
var del = require('del');
var gulp = require('gulp');
var runSequence = require('run-sequence');
var sourcemaps = require('gulp-sourcemaps');
var ts = require('gulp-typescript');
var tslint = require('tslint');
var gulpTslint = require('gulp-tslint');
var KarmaServer = require('karma').Server;
var run = require('gulp-run');

var tsProject = ts.createProject('tsconfig.json');
var program = tslint.Linter.createProgram('./tsconfig.json');

gulp.task('clear', function (cb) {
  clear();
  cb();
});

gulp.task('clean', function () {
  return del(['./coverage', './build']);
});

gulp.task('scripts', function () {
  return tsProject.src()
    .pipe(sourcemaps.init())
    .pipe(tsProject())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(tsProject.options.outDir));
});

gulp.task('lint:ts', function () {
  return tsProject.src()
    .pipe(gulpTslint({
      configuration: 'tslint.json',
      program: program,
      formatter: 'verbose'
    }))
    .pipe(gulpTslint.report({
      summarizeFailureOutput: true
    }))
});

gulp.task('lint:ts:fix', function () {
  return tsProject.src()
    .pipe(gulpTslint({
      configuration: 'tslint.json',
      program: program,
      formatter: 'verbose',
      fix: true
    }))
    .pipe(gulpTslint.report({
      emitError: false
    }))
});

gulp.task('lint:ts:log', function () {
  return tsProject.src()
    .pipe(gulpTslint({
      configuration: 'tslint.json',
      program: program,
      formatter: 'verbose'
    }))
    .pipe(gulpTslint.report({
      emitError: false
    }))
});

gulp.task('lint', ['lint:ts'])
gulp.task('lint:fix', ['lint:ts:fix'])
gulp.task('lint:log', ['lint:ts:log'])

gulp.task('build', ['clean', 'scripts', 'lint'])
gulp.task('start', function (cb) {
  return runSequence('build', 'exec', cb);
})

gulp.task('exec', function () {
  return run('npm start').exec()    // run "npm start".
    .pipe(gulp.dest('output'));      // writes results to output/echo.
})

gulp.task('test', function (cb) {
  new KarmaServer({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true
  }, cb).start()
})

gulp.task('watch', ['scripts', 'lint:log'], function () {
  gulp.watch('src/**/*', ['scripts', 'lint:log'])
})

gulp.task('dev', function (cb) {
  return runSequence('clear', 'clean', 'watch', cb);
})

gulp.task('tdd', ['watch'], function (cb) {
  new KarmaServer({
    configFile: __dirname + '/karma.conf.js'
  }, cb).start()
})

// Aliases

gulp.task('b', ['build'])
gulp.task('s', ['start'])
gulp.task('gulpTslint', ['lint:ts'])
gulp.task('default', ['dev'])
