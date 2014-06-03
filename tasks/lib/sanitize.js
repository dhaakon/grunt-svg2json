var _ = require('underscore');

module.exports = function( grunt ) {
	var _file, _obj, _cleanObj = {};

	function init( filePath ){
		_cleanObj = {};
		_file = grunt.file.read( filePath );
		try{
			_obj = eval( _file );
		}catch( e ){
			grunt.log.warn("Invalid JSON. Check properties to make sure they are valid.")
			return;
		}

		return cleanJSON( _obj );
	}

	function parseName( name ){
		var obj = {};
		var isPropertySet = name.split(':').length > 1;
		name = name.replace(/_x3B_/g, ';');

		if (!isPropertySet){
			obj['id'] = name;
		}else{
			var props = name.split(';');
			for(prop in props){
				var tmp = props[prop];
				if(!!tmp){
					var s = tmp.split(':');
					obj[s[0]] = s[1];
				}
			}
		}

		return obj;
	}

	function removeChildren( node ){
		var tmpObj = {};

		if (node.children[0] && node.children[0].length > 1){
			return removeChildren(node.children);
		}else if(typeof node.children[0] === 'object'){
			var tmp = {};
			tmp[node.name] = _.omit( node, 'name' );

			for( var i = 0; i < node.children.length; ++i){
				var tmpObj = node.children[i];
				if (tmpObj.name){
					var obj = _.extend( _.omit(tmpObj, 'name'), parseName(tmpObj.name) );
					node.children[i] = obj;
				}
			}

			return tmp;
		}
	}

	function cleanJSON( array ){
		for( var item in array ){
			var node = array[ item ];

			if(node.children){
				_.extend(_cleanObj, removeChildren( node ));
			}else{
				var name = String(node.name);
				var tmp = {};
				tmp[node.name] = _.omit(node, 'name');

				_.extend(_cleanObj, tmp);
			}
		}
		return _cleanObj;
	}


	return { clean : init };
}
