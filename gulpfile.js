var clear = require('cli-clear');
var del = require('del');
var gulp = require('gulp');
var runSequence = require('run-sequence');
var sourcemaps = require('gulp-sourcemaps');
var ts = require('gulp-typescript');
var tslint = require('tslint');
var gulpTslint = require('gulp-tslint');
var Server = require('karma').Server;

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
gulp.task('lint:log', ['lint:ts:log'])

gulp.task('build', ['clean', 'scripts', 'lint'])

gulp.task('test', function (cb) {
  new Server({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true
  }, cb).start()
})

gulp.task('tdd', function (cb) {
  new Server({
    configFile: __dirname + '/karma.conf.js'
  }, cb).start()
})

gulp.task('watch', ['scripts', 'lint:log', 'tdd'], function () {
  gulp.watch('src/**/*', ['scripts', 'lint:log'])
})

gulp.task('dev', function (cb) {
  return runSequence('clear', 'clean', 'watch', cb);
});

// Aliases

gulp.task('gulpTslint', ['lint:ts'])
gulp.task('default', ['dev'])
