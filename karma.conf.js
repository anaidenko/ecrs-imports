module.exports = function (config) {
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
    coverageReporter: {
      dir: 'coverage',
      type: 'lcov'
    }
  });
};
