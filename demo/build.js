/**
 * Description of build
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

var Pipeline = require( "../src/pipeline.js" );
var cssWorkers = require( "../src/workers/css.js" );
var tplWorkers = require( "../src/workers/template.js" );
var htmlWorkers = require( "../src/workers/html.js" );
var fs = require( "fs" );

// Crate new pipeline
var cssPipe = new Pipeline();

// Load default configuration
cssPipe.loadConfig( "../src/cfg/css/default.json" );
cssPipe.loadTasks( "../src/cfg/css/default.tasks.json" );

//cssPipe.loadWorkers( libDir + "cfg/css/default.workers.json" );
cssPipe.registerWorkers( {
	compileSass: cssWorkers.compileSass,
	postcss: cssWorkers.postcss,
	sortProperties: cssWorkers.cssComb,
	minify: cssWorkers.minify,
	write: cssPipe.write
} );

cssPipe.configure( {
	write: {
		targetFile: "./dist/css/styles.css",
	},
	postcss: {
		plugins: {
			"postcss-color-rgba-fallback": false
		}
	}
});

cssPipe.run();

var htmlPipe = new Pipeline();

htmlPipe.setTasks( ["read", "handlebars", "minify", "write"] );

htmlPipe.registerWorkers( {
	read: htmlPipe.glob,
	handlebars: tplWorkers.handlebars,
	
	// Normally you would create a dedicated worker for this, but this is justt to
	// show that you can do ad-hoc worker creation if you need to

	// Overly complicated anonymous function for demonstration purposes begins:
	pre_handlebars: function( dataSet, options ){
		// Load variables from external file
		var vars = Pipeline.prototype.readJson( "./src/cfg/tpl.json" );
		var prtDir = "./src/tpl/partials/";
		var globalPartials = {};
		
		for ( var prt in vars.global.partials ) {
			globalPartials[prt] = Pipeline.prototype.readFile( prtDir + vars.global.partials[prt] );
		}
		// Set variables and partials for each file
		dataSet.forEach( function( item ){
			var basename = Pipeline.prototype.getFilename( item.sourceFile, true );
			var localPartials = {};
			if ( vars.scoped.partials && vars.scoped.partials[basename] ) {
				for ( var prt in vars.scoped.partials[basename] ) {
					localPartials[prt] = Pipeline.prototype.readFile( prtDir + vars.scoped.partials[basename][prt] );
				}
			}
			item.partials = Pipeline.prototype.merge( globalPartials, localPartials );
			item.variables = Pipeline.prototype.merge( vars.global.variables, vars.scoped.variables[basename] );
			var fstat = fs.statSync( item.sourceFile );
			item.variables.modified = fstat.mtime.toISOString();
			item.data = Pipeline.prototype.readFile( item.sourceFile );
			//item.targetFile = "./dist/" + Pipeline.prototype.getFilename( item.sourceFile );
		} );

		options.helpers = {
			"is_equal" : function( value1, value2, options ){
				if ( value1 == value2 ) {
					return options.fn();
				}
			}
		};
		return dataSet;
	},
	// Overly complicated anonymous function for demonstration purposes ends

	minify: htmlWorkers.minify,
	write: htmlPipe.write
} );

htmlPipe.configure({
	read: {
		"sourceDir": "./src/tpl/*.hbs"
	},
	handlebars: {},
	write: {
		"targetDir": "./dist",
		"targetFile": "*.html"
	},
	minify: {
		removeComments: true,
		collapseWhitespace: true,
		preserveLineBreaks: false,
		collapseBooleanAttributes: true,
		removeRedundantAttributes: false,
		removeEmptyAttributes: false,
		removeScriptTypeAttributes: true,
		removeStyleLinkTypeAttributes: true,
		removeOptionalTags: false,
		lint: true, // true or options as {}
		keepClosingSlash: false,
		caseSensitive: false,
		minifyJS: true,
		minifyURLs: false,
		ignoreCustomComments: [ { before: /##[^"-->"]+/, after: /##/ } ]
	},
	
});

htmlPipe.run();
