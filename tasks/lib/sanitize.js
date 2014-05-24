module.exports = function( grunt ) {
	var _file, _obj;
	
	function init( filePath ){
		_file = grunt.file.read( filePath );
		try{
			_obj = eval(_file);
		}catch( e ){
			grunt.log.warn("Invalid JSON. Check properties to make sure they are valid.")
			return;
		}

		removeChildren( _obj );
	}

	function removeChildren( tree ){
		for( var branch in tree ){

		}
	}


	return { init : init };
}
