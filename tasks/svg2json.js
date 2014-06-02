/*
 * grunt-svg2json
 * https://github.com/dhaakon/grunt-svg2json
 *
 * Copyright (c) 2014 David Poyner
 * Licensed under the MIT license.
 */

'use strict';

var     exec      = require('child_process').exec,
        path      = require('path'),
        comm      = path.join(__dirname , '../bin/svg2gfx.xslt'), // our xlstproc
				_         = require('underscore'),
				Sanitizer = require('./lib/sanitize');

module.exports = function( grunt ) {
  // self reference
  var self = this;
  var fileInfo = {};
	var _sanitizer = Sanitizer( this );

  /*
   *
   * parseSVG - function to parse the SVG and call the xsltproc
   * @param - context - the context to refer to
   *
   */

  this.parseSVG = function( context ) {
    // helper function to get the xslt command
    function getXSLTProcCommand( src, dest ){
     return ['xsltproc', comm, src, '>', dest].join(' ');
    };

    // if we are converting a single file
    function convertSingleFile( src, dest ){
      var callback = function( err, stdout, stderr ){
        if ( err ) console.log( err );
 
        var obj = eval(grunt.file.read(dest));
				_sanitizer.clean( dest );

		    grunt.file.write( dest, JSON.stringify( obj ) );
        context.done();
      };

      exec( getXSLTProcCommand( src, dest ) , callback );
    };

    // if we are converting multiple files
    function convertMultipleFiles ( src, dest ){
      fileInfo.tmpFiles = []

      var callback = function( err, stdout, stderr ){
        // If there are more files lets run this command again
        if ( fileInfo.currentFile-- > 1 ){
          var tmpFile = path.join( __dirname, '../tmp/tmp__' + fileInfo.currentFile + '.json' );
          fileInfo.tmpFiles.push( tmpFile );

          exec( getXSLTProcCommand( src[fileInfo.currentFile - 1], tmpFile ), callback );
        // if we are finished let's copy the files over and destroy the temp files
        }else{
          var tmp = {};

          // iterate through our temporary files to copy to destination file
          for ( var file in fileInfo.tmpFiles ){
						//_sanitizer.clean(file);
						var _f = fileInfo.tmpFiles[file];				// grab it
						_.extend( tmp, _sanitizer.clean(_f) );  // read it

						grunt.file.delete( _f );								// delete it
          }

          grunt.file.write( dest, JSON.stringify(tmp) );       // write it

          context.done();                     // we are done here
        }
      };

      // create a temp file
      var tmpFile = path.join( __dirname, '../tmp/tmp__' + fileInfo.currentFile + '.json');
      // store it to retrieve later
      fileInfo.tmpFiles.push( tmpFile );

      // call the xslt process
      exec( getXSLTProcCommand( src[fileInfo.currentFile - 1], tmpFile ), callback );
    }

    // check to see if the file exists
    function doesFileExist ( filepath )   {
      var hasFile = grunt.file.exists;

      if( !hasFile( filepath ) ){
        grunt.log.warn('Source file"' + filepath + '" not found.');
        return false;
      }else{
        return true;
      }
    };

    function fileIterator ( files ) {
      // grab the src then filter and convert
      var isMoreThanOneFile = files.src.length > 1;
      var hasDestFile = grunt.file.exists( files.dest );

      // if there is no destination file we need to create one before running the;
      // xslt process.
      if ( !hasDestFile ){
        grunt.file.write( files.dest );
      }

      // if there is not more than one file we can just convert that file.
      if ( !isMoreThanOneFile ){
        var hasFile = doesFileExist( files.src[0] );
        convertSingleFile( files.src[0], files.dest );
      // if there is we need added logic to create tmp files to then concatinate.
      }else{
				var root = path.join( __dirname, '../', '/tmp/' );
				grunt.file.mkdir(root);

        fileInfo.currentFile = fileInfo.numFiles = files.src.length;
        convertMultipleFiles( files.src, files.dest );
      }
    };

    // iterate through all the files
    return context.files.forEach( fileIterator );
  }

  grunt.registerMultiTask('svg2json', 'svg to json', function(){
    var options = this.options({});

    this.done   = this.async();

    self.parseSVG(this);
  });
};
