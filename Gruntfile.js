'use strict';

var fs   = require('fs');
var path = require('path');

var test262FilesDir = path.join(__dirname, './tests/test262/pages/');

module.exports = function (grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        clean: {
            cldr   : ['tmp/cldr**', 'data/cldr**', 'locale-data/'],
            test262: ['tmp/test262**', 'data/test262**', 'tests/test262/'],
            lib    : ['lib/', 'dist/'],
        },

        curl: {
            cldr: {
                src : 'http://www.unicode.org/Public/cldr/26/json-full.zip',
                dest: 'tmp/cldr.zip',
            },
            test262: {
                src : 'https://github.com/tc39/test262/archive/master.zip',
                dest: 'tmp/test262.zip',
            }
        },

        unzip: {
            cldr: {
                src : 'tmp/cldr.zip',
                dest: 'tmp/cldr/',
            },
            test262: {
                src : 'tmp/test262.zip',
                dest: 'tmp/',
            }
        },

        copy: {
            cldr: {
                expand: true,
                cwd   : 'tmp/cldr/',
                dest  : 'data/',
                src   : [
                    '*-license.*',
                    'supplemental/parentLocales.json',
                    'main/*/ca-*.json',
                    'main/*/currencies.json',
                    'main/*/numbers.json',
                ]
            },
            test262: {
                expand: true,
                cwd   : 'tmp/test262-master/',
                dest  : 'tests/test262',
                src   : [
                    'LICENSE',
                    'test/intl402/*.js',
                    'harness/*.js',
                ]
            },
            src: {
                expand : true,
                flatten: true,
                src    : ['tmp/src/*.js'],
                dest   : 'lib/'
            }
        },

        concat: {
            complete: {
                src : ['dist/Intl.min.js', 'locale-data/complete.js'],
                dest: 'dist/Intl.complete.js',
            },
        },

        jshint: {
            all: ['index.js', 'src/*.js', '*.json']
        },

        bundle_jsnext: {
            dest: 'dist/Intl.js',
            options: {
                namespace: 'IntlPolyfill'
            }
        },

        cjs_jsnext: {
            dest: 'tmp/'
        },

        uglify: {
            options: {
                preserveComments: 'some'
            },
            build: {
                files: {
                    'dist/Intl.min.js': ['dist/Intl.js']
                }
            }
        },

        connect: {
            server: {
                options: {
                    base: '.',
                    port: 9999
                }
            }
        },

        'saucelabs-mocha': {
            all: {
                options: {
                    urls: fs.readdirSync(test262FilesDir).map(function (filename) {
                        return 'http://127.0.0.1:9999/tests/test262/pages/' + filename;
                    }),

                    build: process.env.TRAVIS_BUILD_NUMBER,
                    sauceConfig: {
                        'record-video': false,
                        'capture-html': false,
                        'record-screenshots': false,
                        'command-timeout': 60
                    },
                    throttled: 3,
                    browsers: [
                        {
                            browserName: 'internet explorer',
                            platform: 'Windows XP',
                            version: '7'
                        },
                        {
                            browserName: 'internet explorer',
                            platform: 'Windows 7',
                            version: '8'
                        },
                        {
                            browserName: 'internet explorer',
                            platform: 'Windows 7',
                            version: '9'
                        },
                        {
                            browserName: 'internet explorer',
                            platform: 'Windows 8',
                            version: '10'
                        },
                        {
                            browserName: 'internet explorer',
                            platform: 'Windows 8.1',
                            version: '11'
                        },
                        {
                            browserName: 'chrome',
                            platform: 'Windows 7',
                            version: '37'
                        },
                        {
                            browserName: 'firefox',
                            platform: 'Windows 7',
                            version: '32'
                        },
                        {
                            browserName: 'iphone',
                            platform: 'OS X 10.9',
                            version: '7.1'
                        },
                        {
                            browserName: 'android',
                            platform: 'Linux',
                            version: '4.4'
                        },
                        {
                            browserName: 'safari',
                            platform: 'OS X 10.9',
                            version: '7'
                        }
                    ]
                }
            }
        }
    });

    grunt.loadTasks('./tasks');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-bundle-jsnext-lib');
    grunt.loadNpmTasks('grunt-extract-cldr-data');
    grunt.loadNpmTasks('grunt-curl');
    grunt.loadNpmTasks('grunt-zip');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-saucelabs');

    grunt.registerTask('build', [
        'bundle_jsnext', 'uglify', 'cjs_jsnext', 'copy:src', 'concat:complete'
    ]);

    grunt.registerTask('cldr', ['extract-cldr-data', 'compile-data']);

    grunt.registerTask('default', ['jshint', 'clean:lib', 'build']);

    grunt.registerTask('update-cldr-data', [
        'clean:cldr',
        'curl:cldr',
        'unzip:cldr',
        'copy:cldr',
        'cldr',
    ]);

    grunt.registerTask('update-test262', [
        'clean:test262',
        'curl:test262',
        'unzip:test262',
        'copy:test262',
        'update-tests',
    ]);

};
