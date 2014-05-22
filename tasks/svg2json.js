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
	// self reference
  var self = this;

	/*
	 *
	 * parseSVG - function to parse the SVG and call the xsltproc
	 * @param - context - the context to refer to
	 *
	 */

  this.parseSVG = function(context) {
    var convert         = function(src, dest){
      var fpR             = src.split('/'),
          filedest        = context.files[0].dest,
          fileorigin      = src,
          arr							= ['xsltproc', comm, fileorigin, '>', filedest].join(' '),
          fn							= function(err, stdout, stderr){
            if (err) console.log(err);

            context.done();
          };

      exec(arr, fn);
    }

			// check to see if the file exists
    var filterFunction  = function (filepath)   {
      var hasFile       = grunt.file.exists;

      if(!hasFile(filepath)){
        grunt.log.warn('Source file"' + filepath + '" not found.');
        return false;
      }else{
        return true;
      }
    }

    var fileIterator    = function (f) {
			// grab the src then filter and convert
			var isMoreThanOneFile = f.src.length > 1;

      if (!isMoreThanOneFile) f.src.filter(filterFunction).map(convert);
    }

		// iterate through all the files
    context.files.forEach(fileIterator);
  }

  grunt.registerMultiTask('svg2json', 'svg to json', function(){
		console.log(this.files[0].src);
    var options = this.options({});

    this.done   = this.async();

    self.parseSVG(this);
  });
};

