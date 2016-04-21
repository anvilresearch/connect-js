'use strict'
module.exports = function (grunt) {
  grunt.initConfig({

    watch: {
      esm: {
        files: ['src/{,*/}*.js'],
        tasks: ['babel']
      }
    },
    babel: {
      compile: {
        options: {
          sourceMap: true,
          presets: ['es2015']
        },
        files: [{
          expand: true,
          cwd: 'src/',
          src: ['**/*.js'],
          dest: 'lib'
        }]
      }
    },
    clean: {
      dist: ['lib/*.js', 'lib/*.map']
    }
  })
  grunt.loadNpmTasks('grunt-contrib-clean')
  grunt.loadNpmTasks('grunt-release')
  grunt.loadNpmTasks('grunt-babel')
  grunt.loadNpmTasks('grunt-contrib-watch')

  grunt.registerTask('default', ['clean', 'babel'])
}
