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
    frameworks: ['jasmine'],

    // list of files / patterns to load in the browser
    files: [
      'bower_components/sjcl/sjcl.js',
      'bower_components/crypto-js/components/core.js',
      'bower_components/crypto-js/components/sha1.js',
      'bower_components/crypto-js/components/sha256.js',
      'bower_components/crypto-js/components/x64-core.js',
      'bower_components/crypto-js/components/sha512.js',
      'bower_components/jsrsasign/ext/base64.js',
      'bower_components/jsrsasign/ext/jsbn.js',
      'bower_components/jsrsasign/ext/jsnb2.js',
      'bower_components/jsrsasign/ext/rsa.js',
      'bower_components/jsrsasign/ext/rsa2.js',
      'bower_components/jsrsasign/rsapem-1.1.js',
      'bower_components/jsrsasign/rsasign-1.2.js',
      'bower_components/jsrsasign/asn1hex-1.1.js',
      'bower_components/jsrsasign/x509-1.1.js',
      'bower_components/jsrsasign/crypto-1.1.js',
      'bower_components/jsrsasign/base64x-1.1.js',
      'bower_components/jsrsasign/keyutil-1.0.js',
      'bower_components/jsjws/ext/json-sans-eval.js',
      'bower_components/jsjws/jws-2.0.js',
      'bower_components/angular/angular.js',
      'bower_components/angular-mocks/angular-mocks.js',
      'anvil-connect.angular.js',
      'test/anvil-connect.angular.coffee'
    ],

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
      'PhantomJS'
    ],

    customLaunchers: {
      ChromeOnTravis: {
        base: 'Chrome',
        flags: ['--no-sandbox']
      }
    },

    // Which plugins to enable
    plugins: [
      'karma-coffee-preprocessor',
      'karma-phantomjs-launcher',
      'karma-chrome-launcher',
      'karma-firefox-launcher',
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
