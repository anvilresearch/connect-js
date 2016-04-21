// Karma configuration
// http://karma-runner.github.io/0.12/config/configuration-file.html

var baseconf = require('./karma.conf.js')

module.exports = function(config) {
  baseconf(config)
  config.set({
    jspm: {
      config: 'config.js',
      loadFiles: ['test/**/*', 'test.extended/**/*'],
      serveFiles: ['src/*.js'],
      paths: {
        //   'src/*': 'base/src/*',
        //   'test/*': 'base/test2/*',
        //   'github:*': 'base/client/jspm_packages/github/*',
        //   'npm:*': 'base/client/jspm_packages/npm/*'
      }
    },
  })
}
