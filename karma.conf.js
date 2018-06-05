var fs = require('fs');
var stripJsonComments = require('strip-json-comments');

module.exports = function (config) {
  var tsconfig = JSON.parse(stripJsonComments(fs.readFileSync('./tsconfig.json', 'utf8')));

  config.set({
    frameworks: ['mocha', 'karma-typescript'],
    files: [
      { pattern: 'node_modules/expect.js/index.js' },
      { pattern: 'src/**/*.ts' }
    ],
    preprocessors: {
      '**/*.ts': ['karma-typescript']
    },
    reporters: ['progress', 'coverage', 'karma-typescript'],
    browsers: ['PhantomJS'],
    // browsers: ['Chrome'],
    coverageReporter: {
      dir: 'coverage',
      type: 'lcov'
    },
    karmaTypescriptConfig: {
      compilerOptions: tsconfig.compilerOptions
    }
  });
};
