/**
 * Template workers.
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
	 * Worker for Hogan templating engine. Not working properly yet.
	 */
	hogan: function( dataSet, options ) {
		var fs = require( "fs" );
		var Hogan = require( "hogan.js" );
		
		dataSet.forEach( function( item ){
			for ( var partial in item.partials ) {
				item.partials[partial] = Hogan.compile( item.partials[partial] );
			}
			var template = Hogan.compile( item.data );

			item.data = template.render( item.variables, item.partials );
		} );
		
		return dataSet;	
	},
	
	/**
	 * Worker for Handlebar templates.
	 */
	handlebars: function( dataSet, options ){
		var HB = require( "handlebars" );
		
		for ( var helper in options.helpers ) {
			HB.registerHelper( helper, options.helpers[helper] );
		}
		
		dataSet.forEach( function( item ){
			for ( var partial in item.partials ) {
				HB.registerPartial( partial, item.partials[partial] );
			}
			
			var template = HB.compile( item.data );
			
			item.data = template( item.variables );
			
		} );
		
		return dataSet;
		
	},
	
	/**
	 * TODO
	 */
	twig: function( dataSet, options ){
		
		
	}
};