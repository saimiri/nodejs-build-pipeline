/**
 * Css workers.
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
/**
 *  
 */
module.exports = {
	/**
	 * Worker for compiling sass files.
	 */
	compileSass: function( dataSet, settings ) {
		var sass = require( "node-sass" );
		
		dataSet.forEach( function( item ){
			// TODO: Fix this so it actually works with multiple files. Just in case.
			var result = sass.renderSync({
				file: settings.source + settings.file
			});
			item.data = result.css.toString( "utf-8" );
			
		} );
		return dataSet;
	},
	
	/**
	 * Worker for linting CSS.
	 */
	lint: function( dataSet, settings ) {
		var lint = require( "csslint" ).CSSLint;
		
		dataSet.forEach( function( item ){
			var result = lint.verify( item.data );
			if ( result.messages.length === 0 ) {
				console.log( "......success!" );
			} else {
				console.log( "......failure!" );
				// TODO: Log errors to file
				if ( settings.displayErrors ) {
					for ( var i = 0, j = result.messages.length; i < j; i++ ) {
						var message = result.messages[i];
						console.log("%s (line %d, col %d): %s", message.type, message.line, message.col, message.message);
					}
				}
			}
		} );
		return dataSet;
	},
	
	/**
	 * Worker for PostCSS.
	 */
	postcss: function( dataSet, settings ) {
		var postcss = require( "postcss" );
		
		// TODO: Maybe add an option to use shorter plugin names?
		if ( settings.plugins ) {
			var plugins = [];
			for ( plugin in settings.plugins ) {
				if ( settings.plugins[plugin] === false ) {
					console.log( "......skipping", plugin );
				} else {
					console.log( "......using", plugin );
					if ( settings.plugins[plugin] === true ) {
						plugins.push( require( plugin ) );
					} else {
						plugins.push( require( plugin )( settings.plugins[plugin] ) );
					}
			}
			}
			dataSet.forEach( function( item ){
				item.data = postcss( plugins ).process( item.data ).css;
			} );
		}
		return dataSet;
	},
	
	/**
	 *  Worker for minifying CSS.
	 *
	 *  See https://www.npmjs.com/package/clean-css for options
	 */
	minify: function( dataSet, settings ) {
		var CleanCSS = require( "clean-css" );
		
		dataSet.forEach( function( item ) {
			var result = new CleanCSS( settings ).minify( item.data );
			if ( result.errors.length > 0 ) {
				console.log( "There were errors." );
				// TODO: Use Pipeline's loglist() function here
			}
			
			if ( settings.debug === true ) {
				console.log( "......Original size:", result.stats.originalSize );
				console.log( "......Minified size:", result.stats.minifiedSize );
				console.log( "......File reduced to", ( (1 - result.stats.efficiency) * 100 ).toFixed(2), "% of original size" );
			}
			
			if ( settings.sourceMap === true ) {
				item.sourceMap = result.sourceMap;
			}
			
			item.data = result.styles;
		});
		
		return dataSet;
	},
	
	/**
	 * Worker for CSSComb.
	 */
	cssComb: function( dataSet, settings ) {
		var comb = new require( "csscomb" )();
		comb.configure( settings );
		dataSet.forEach( function( item ){
			// The manual says Comb.configure() wants a JSON object,
			// but that is dirty lie. She eats object literals.
			item.data = comb.processString( item.data );
			
		} );

		return dataSet;
	}
};