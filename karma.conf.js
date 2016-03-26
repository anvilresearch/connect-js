// Karma configuration
// http://karma-runner.github.io/0.12/config/configuration-file.html
// Generated on 2014-06-18 using
// generator-karma 0.8.2

module.exports = function (config) {
  config.set({
    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // base path, that will be used to resolve files and exclude
    basePath: '',

    // testing framework to use (jasmine/mocha/qunit/...)
    // frameworks: ['systemjs', 'jspm', 'jasmine'],
    frameworks: ['jspm', 'jasmine'],

    // list of files / patterns to load in the browser
    files: [],

    jspm: {
      config: 'config.js',
      loadFiles: ['test/**/*'],
      serveFiles: ['src/*.js'],
      paths: {
      //   'src/*': 'base/src/*',
      //   'test/*': 'base/test2/*',
      //   'github:*': 'base/client/jspm_packages/github/*',
      //   'npm:*': 'base/client/jspm_packages/npm/*'
      }
    },
    // urlRoot: '/static/foo/',

    // list of files / patterns to exclude
    exclude: [],

    // web server port
    port: 8080,

    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: [
      'Chrome'
    ],

    customLaunchers: {
      ChromeOnTravis: {
        base: 'Chrome',
        flags: ['--no-sandbox']
      }
    },

    // Which plugins to enable
    plugins: [
      'karma-jspm',
      // 'karma-systemjs',
      'karma-coffee-preprocessor',
      'karma-phantomjs-launcher',
      'karma-chrome-launcher',
      'karma-firefox-launcher',
      'karma-safari-launcher',
      'karma-jasmine'
    ],

    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false,

    colors: true,

    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_INFO,

    preprocessors: {
      '**/*.coffee': ['coffee']
    }
  // Uncomment the following lines if you are using grunt's server to run the tests
  // proxies: {
  //   '/': 'http://localhost:9000/'
  // },
  // URL root prevent conflicts with the site root
  // urlRoot: '_karma_'
  })
}
