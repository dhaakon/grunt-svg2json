/*
 * grunt-svg2json
 * https://github.com/dhaakon/grunt-svg2json
 *
 * Copyright (c) 2014 David Poyner
 * Licensed under the MIT license.
 */

'use strict';

var     exec    = require('child_process').exec,
        path    = require('path'),
        comm    = path.join(__dirname , '../bin/svg2gfx.xslt'); // our xlstproc

module.exports = function(grunt) {
  // self reference
  var self = this;
  var fileInfo = {};

  /*
   *
   * parseSVG - function to parse the SVG and call the xsltproc
   * @param - context - the context to refer to
   *
   */

  this.parseSVG = function(context) {
        // helper function to get the xslt command
    var getXSLTProcCommand = function( src, dest ){
     return ['xsltproc', comm, src, '>', dest].join(' ');
    };

    // if we are converting a single file
    var convertSingleFile = function(src, dest){
      var callback = function(err, stdout, stderr){
        if (err) console.log(err);

        context.done();
      };

      exec( getXSLTProcCommand( src, dest ) , callback);
    };

    // if we are converting multiple files
    var convertMultipleFiles = function( src, dest){
      fileInfo.tmpFiles = []

      var callback = function( err, stdout, stderr ){
        // If there are more files lets run this command again
        if (fileInfo.currentFile-- > 1){
          var tmpFile = path.join( __dirname, '../tmp/tmp__' + fileInfo.currentFile + '.json');
          fileInfo.tmpFiles.push(tmpFile);

          exec( getXSLTProcCommand( src[fileInfo.currentFile - 1], tmpFile ), callback);
          // if we are finished let's copy the files over and destroy the temp files
        }else{
          var str = '';
                    
          // iterate through our temporary files to copy to destination file
          for (var file in fileInfo.tmpFiles){
            var _f = fileInfo.tmpFiles[file]; // grab it
            str += grunt.file.read( _f );     // read it
            grunt.file.delete( _f );          // delete it
          }

          grunt.file.write( dest, str )       // write it

          context.done();                     // we are done here
        }
      };

      // create a temp file
      var tmpFile = path.join( __dirname, '../tmp/tmp__' + fileInfo.currentFile + '.json');
      // store it to retrieve later
      fileInfo.tmpFiles.push(tmpFile);

      // call the xslt process
      exec( getXSLTProcCommand( src[fileInfo.currentFile - 1], tmpFile ), callback );
    }

            // check to see if the file exists
    var doesFileExist  = function (filepath)   {
      var hasFile       = grunt.file.exists;

      if(!hasFile(filepath)){
        grunt.log.warn('Source file"' + filepath + '" not found.');
        return false;
      }else{
        return true;
      }
    };

    var fileIterator    = function (f) {
      // grab the src then filter and convert
      var isMoreThanOneFile = f.src.length > 1;
      var hasDestFile = grunt.file.exists( f.dest );

      // if there is no destination file we need to create one before running the;
      // xslt process.
      if (!hasDestFile){
        grunt.file.write( f.dest );
      }

      // if there is not more than one file we can just convert that file.
      // if there is we need added logic to create tmp files to then concatinate.
      if (!isMoreThanOneFile){
        var hasFile = doesFileExist(f.src[0]);
        convertSingleFile( f.src[0], f.dest );
      }else{
        fileInfo.currentFile = fileInfo.numFiles = f.src.length;
        convertMultipleFiles(f.src, f.dest);
      }
    };

        // iterate through all the files
    context.files.forEach(fileIterator);
  }

  grunt.registerMultiTask('svg2json', 'svg to json', function(){
    var options = this.options({});

    this.done   = this.async();

    self.parseSVG(this);
  });
};

