/**
 * HTML workers.
 * 
 * Copyright 2015 Juha Auvinen.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * 
 * @package     No package
 * @subpackage  
 * @copyright   Copyright (c) 2015 Juha Auvinen (http://www.saimiri.fi/)
 * @author      Juha Auvinen <juha@saimiri.fi>
 * @license     http://www.apache.org/licenses/LICENSE-2.0 Apache License 2.0
 * @version     Release: @package_version@
 * @link        http://www.saimiri.fi/
 * @since       File available since Release 1.0.0
 */
module.exports = {
	/**
	 * 
	 * @see  https://www.npmjs.com/package/html-minifier for options
	 */
	minify: function( dataSet, options ){
		var minify = require( "html-minifier" ).minify;

		dataSet.forEach( function( item ){
			item.data = minify( item.data, options );
		} );
		
		return dataSet;
		
	},
	/**
	 * TODO
	 */
	validate: function( dataSet, options ){
	
	}
};