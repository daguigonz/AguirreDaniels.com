module.exports = function(grunt) {
  'use strict';

  require('time-grunt')(grunt);
  require('jit-grunt')(grunt, {
    useminPrepare: 'grunt-usemin'
  });

  var config = {
    app: 'app',
    dist: 'dist',
    style: 'style',
    banner: '/*! Built on <%= grunt.template.today("yyyy-mm-dd H:MM:ss Z") %> */\n'
  };

  grunt.initConfig({
    config: config,
    pkg: grunt.file.readJSON('package.json'),
    watch: {
      sass: {
        files: ['<%= config.app %>/scss/**/*.{scss,sass}'],
        tasks: ['sass:dist', 'autoprefixer']
      },
      js: {
        files: ['<%= config.app %>/js/{,*/}*.js'],
        tasks: ['jshint'],
        options: {
          livereload: true
        }
      },
      gruntfile: {
        files: ['Gruntfile.js']
      },
      livereload: {
        options: {
          livereload: '<%= connect.options.livereload %>'
        },
        files: [
          '<%= config.app %>/{,*/}*.html',
          '<%= config.app %>/css/{,*/}*.css',
          '<%= config.app %>/img/{,*/}*.{gif,ico,jpg,jpeg,png,svg,webp}'
        ]
      }
    },
    connect: {
      options: {
        port: 7000,
        open: true,
        livereload: 35729,
        // Change this to '0.0.0.0' to access the server from outside
        hostname: '127.0.0.1'
      },
      livereload: {
        options: {
          middleware: function(connect) {
            return [
              connect.static('css'),
              connect().use('/bower_components', connect.static('./bower_components')),
              connect.static(config.app)
            ];
          }
        }
      },
      dist: {
        options: {
          base: '<%= config.dist %>',
          livereload: false
        }
      }
    },
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '<%= config.dist %>/*',
            '!<%= config.dist %>/.git*'
          ]
        }]
      },
      server: {
        files: [{
          dot: true,
          src: '<%= config.app %>/css/{,*/}*.css'
        }]
      }
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      all: [
        'Gruntfile.js',
        '<%= config.app %>/js/{,*/}*.js',
        '!<%= config.app %>/js/vendor/*',
        'test/spec/{,*/}*.js'
      ]
    },
    sass: {
      options: {
        sourceMap: true,
        loadPath: 'bower_components'
      },
      dist: {
        files: [{
          expand: true,
          cwd: '<%= config.app %>/scss',
          src: ['<%= config.style %>.{scss,sass}'],
          dest: '<%= config.app %>/css',
          ext: '.css'
        }]
      }
    },
    autoprefixer: {
      options: {
        browsers: ['> 1%', 'last 2 versions', 'Firefox ESR', 'Opera 12.1']
      },
      dist: {
        files: [{
          expand: true,
          cwd: '<%= config.app %>/css/',
          src: '{,*/}*.css',
          dest: '<%= config.app %>/css/'
        }]
      }
    },
    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= config.app %>',
          dest: '<%= config.dist %>',
          src: [
            '*.{ico,png,txt,htaccess}',
            'img/**/*.{webp,png,jpg,gif,svg}',
            '{,*/}*.html',
            'fonts/**/*.{eot,otf,svg,ttf,woff}',
            'css/{,*/}*.css'
          ]
        }]
      }
    },
    cssmin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= config.dist %>/css/',
          src: ['*.css', '!*.min.css'],
          dest: '<%= config.dist %>/css/',
          ext: '.css'
        }]
      }
    },
    filerev: {
      options: {
        length: 4
      },
      dist: {
        files: [{
          src: [
            '<%= config.dist %>/js/**/*.js',
            '<%= config.dist %>/css/**/*.css',
            '<%= config.dist %>/img/**/*.{gif,jpg,jpeg,png,svg,webp}',
            '<%= config.dist %>/fonts/**/*.{eot,otf,svg,ttf,woff}'
          ]
        }]
      }
    },
    htmlmin: {
      dist: {
        options: {
          collapseBooleanAttributes: true,
          collapseWhitespace: true,
          conservativeCollapse: true,
          removeAttributeQuotes: true,
          removeCommentsFromCDATA: true,
          removeEmptyAttributes: true,
          removeOptionalTags: true,
          removeRedundantAttributes: false,
          useShortDoctype: true
        },
        files: [{
          expand: true,
          cwd: '<%= config.dist %>',
          src: '{,*/}*.html',
          dest: '<%= config.dist %>'
        }]
      }
    },
    imagemin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= config.dist %>/img/',
          src: ['**/*.{png,jpg,gif}'],
          dest: '<%= config.dist %>/img/'
        }]
      }
    },
    svgmin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= config.dist %>/img/',
          src: ['**/*.svg'],
          dest: '<%= config.dist %>/img/'
        }]
      }
    },
    useminPrepare: {
      options: {
        dest: '<%= config.dist %>'
      },
      html: '<%= config.app %>/index.html'
    },
    usemin: {
      options: {
        assetsDirs: ['<%= config.dist %>', '<%= config.dist %>/img']
      },
      html: ['<%= config.dist %>/{,*/}*.html'],
      css: ['<%= config.dist %>/css/{,*/}*.css']
    },
    uncss: {
      dist: {
        options: {
          stylesheets: ['css/<%= config.style %>.css'],
          report: 'min',
          // `.uncss-` prefix class will be ignored by uncss
          ignore: [/.uncss-?\S*/]
        },
        files: [{
          src: ['<%= config.dist %>/{,*/}*.html'],
          dest: '<%= config.dist %>/css/<%= config.style %>.css'
        }]
      }
    }
  });

  // Serve Tasks
  grunt.registerTask('serve', 'Start the development server and preview your app. --remote-access to allow remote access', function() {
    if (grunt.option('remote-access')) {
      grunt.config.set('connect.options.hostname', '0.0.0.0');
    }

    grunt.task.run([
      'clean:server',
      'sass:dist',
      'autoprefixer',
      'connect:livereload',
      'watch'
    ]);
  });

  // Dist Tasks
  grunt.registerTask('dist', 'Start the dist server and preview your app. --remote-access to allow remote access', function() {
    if (grunt.option('remote-access')) {
      grunt.config.set('connect.options.hostname', '0.0.0.0');
    }

    grunt.task.run([
      'connect:dist',
      'watch'
    ]);
  });

  // Build Tasks
  grunt.registerTask('build', function() {
    grunt.task.run([
      'clean:dist',
      'copy:dist',
      'sass:dist',
      'autoprefixer',
      'imagemin',
      'svgmin',
      'useminPrepare',
      'concat',
      'uglify',
      //'uncss:dist',
      'cssmin:dist',
      //'filerev',
      'usemin',
      'htmlmin'
    ]);
  });
};
