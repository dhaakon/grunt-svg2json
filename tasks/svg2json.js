/*
 * grunt-svg2json
 * https://github.com/dhaakon/grunt-svg2json
 *
 * Copyright (c) 2014 David Poyner
 * Licensed under the MIT license.
 */

'use strict';

var     exec	= require('child_process').exec,
        path    = require('path'),
        comm	= path.join(__dirname , '../bin/svg2gfx.xslt');

module.exports = function(grunt) {
  var that = this;

  this.parseSVG = function(context) {
    var convert         = function(fp){

      var fpR             = fp.split('/'),
          filename        = fpR[fpR.length - 1].split('.svg')[0],
          filedest        = path.join(__dirname, '../tmp/', filename + '.json'),
          fileorigin      = fp,
          arr             = ['xsltproc', comm, fileorigin, '>', filedest].join(' '),
          fn	          = function(err, stdout, stderr){
            if (err) console.log(err);

            context.done()
          }

      exec(arr, fn);
    }

    var filterFunction  = function (filepath)   {
      var hasFile       = grunt.file.exists

      if(!hasFile(filepath)){
        grunt.log.warn('Source file"' + filepath + '" not found.');
        return false
      }else{
        return true
      }
    }

    var fileIterator    = function (f) {
      var src           = f.src.filter(filterFunction).map(convert);
    }

    context.files.forEach(fileIterator)
  }

  grunt.registerMultiTask('svg2json', 'svg to json', function(){
    var options = this.options({})
    this.done   = this.async()

    that.parseSVG(this);
  });
};

