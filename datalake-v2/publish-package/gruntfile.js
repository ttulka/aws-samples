const {resolve} = require('path');

module.exports = function (grunt) {

    const nodeBin = (bin) =>
            resolve(
                    __dirname,
                    'node_modules',
                    '.bin',
                    `${bin}${process.platform == 'win32' ? '.cmd' : ''}`
            );

    // Project configuration.
    grunt.initConfig({
                         pkg: grunt.file.readJSON('package.json'),
                         run: {
                             build: {
                                 cmd: nodeBin('tsc'),
                                 args: [
                                     '--project',
                                     'tsconfig.json'
                                 ]
                             }
                         },
                         clean: {
                             dist: ['dist/*'],
                             build: ['build/*']
                         },
                         lambda_package: {
                             default: {
                                 options: {
                                     dist_folder: 'dist',
                                     base_folder: 'build'
                                 }
                             }
                         }
                     });

    grunt.loadNpmTasks('grunt-run');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-aws-lambda-package');

    grunt.registerTask('build', ['run:build']);
    grunt.registerTask('package', ['clean', 'run:build', 'lambda_package:default']);
};