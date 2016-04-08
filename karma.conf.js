const path = require('path');

module.exports = function karmaConfig(config) {
  config.set({
    frameworks: [ 'mocha', 'chai' ],
    reporters: [ 'spec', 'coverage' ],
    files: [
      'node_modules/phantomjs-polyfill/bind-polyfill.js',
      'spec.js'
    ],
    browsers: [ 'PhantomJS' ],
    singleRun: true,
    coverageReporter: {
      dir: 'coverage/',
      type: 'html'
    },
  });
};
