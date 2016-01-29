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

	function parseShape( node, type ){
		switch( type ){
			case("circle"):
				var cx = node.cx;
				var cy = node.cy;
				var r = node.r;

				var d = "M " + cx + " " + cy;
				d += " m " + -r + ", 0";
				d += " a " + r + "," + r + " 0 1,0 " + (r * 2) + ",0";
				d += " a " + r + "," + r + " 0 1,0 " + -(r * 2) + ",0";

				// Empty out the Array of unused properties
				delete node.cx;
				delete node.cy;
				delete node.r;

				// Redefine the shape
				node.type = "path";
				node.d = d;
				
				break;

			case("polyline"):
				var d = "M";

				var i = 0;

				for( var point in node.points){
					++i;
					var _point = node.points[point];
					var _str = (node.points.length === i) ? 'z' : ' ';
					d+=_point.x + ',' + _point.y + _str;
				}

				delete node.points;

				node.type = "path";
				node.d = d;
				
				break;

			case("polygon"):
				break;
		}
	}

	function checkShape( node ){
		if(!node.shape && node.children[0] ){
			for( var child in node.children ){
				var _child = node.children[child];
				if( !_child.shape ){
					checkShape(_child);
				}else if( _child.shape.type !== 'path'){
					parseShape( _child.shape, _child.shape.type);
				}
			
			}
		}

		return null
	};

	function removeChildren( node ){
		var tmpObj = {};

		if (node.children[0] && node.children[0].length > 1){
			return removeChildren(node.children);
		}else if(typeof node.children[0] === 'object'){
			var tmp = {};
			tmp[node.name] = _.omit( node, 'name' );

			for( var i = 0; i < node.children.length; ++i){
				var tmpObj = node.children[i];

				var isShape = checkShape(node);

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
