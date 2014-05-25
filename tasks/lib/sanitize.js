module.exports = function( grunt ) {
	var _file, _obj;
	
	function init( filePath ){
		_file = grunt.file.read( filePath );
		try{
			_obj = eval( _file );
		}catch( e ){
			grunt.log.warn("Invalid JSON. Check properties to make sure they are valid.")
			return;
		}

		return JSON.stringify( cleanJSON( _obj ) );
	}

	function removeChildren( node ){
		console.log(node);
	}

	function cleanJSON( array ){
		for( var item in array ){
			var node = array[ item ];

			if(node.children){
				removeChildren( node );
			}else{

			}
		}
		return array;
	}


	return { clean : init };
}
