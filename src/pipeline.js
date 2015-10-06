/**
 * The Pipeline class.
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
var fs = require( "fs" );
var wrench = require( "wrench" );

function Pipeline(){
	this.config = {};
	this.workers = {};
	this.taskList = {};
}

Pipeline.prototype.clearConfig = function(){
	this.config = {};
}

Pipeline.prototype.clearTasks = function(){
	this.taskList = {};
}

Pipeline.prototype.clearWorkers = function(){
	this.workers = {};
}

Pipeline.prototype.configure = function( config, overwrite ){
	if ( overwrite === true ) {
		this.config = config;
	} else {
		this.config = this.merge( this.config, config );
	}
}

Pipeline.prototype.loadConfig = function( jsonFile ){
	// TODO: Add error handling
	this.configure( this.readJson( jsonFile ), true );
}

Pipeline.prototype.loadTasks = function( jsonFile ){
	// TODO: Add error handling
	this.setTasks( this.readJson( jsonFile ) );
}

Pipeline.prototype.setTasks = function( tasks ){
	this.taskList = tasks;
}

Pipeline.prototype.addTask = function( task ){
	this.taskList.push( task );
}

/**
 *
 * TODO: Consider modifying this to add undefined tasks automatically to
 * taskList too.
 */
Pipeline.prototype.register = function( task, callback ) {
	if ( this.workers[task] === undefined ) {
		this.workers[task] = [];
	}
	// Should we bind() this to callback?
	this.workers[task].push( callback );
}

Pipeline.prototype.registerWorkers = function( workers ){
	for ( task in workers ) {
		if ( Array.isArray( workers[task] ) ) {
			for ( var i = 0, j = workers[task].length; i < j; i++ ) {
				this.register( task, workers[task][i] );
			}
		} else {
			this.register( task, workers[task] );
		}
	}
}

Pipeline.prototype.loadWorkers = function( jsonFile ){
	this.registerWorkers( this.readJson( jsonFile ) );
}

Pipeline.prototype.run = function( dataSet, options ) {

	var dataSet = dataSet || [{ data: "" }];
	var options = options || this.config;
	for( var i = 0, j = this.taskList.length; i < j; i++ ) {

		var task = this.taskList[i];

		// Do we have workers assigned for this task?
		if ( this.workers[task] === undefined || this.workers[task].length === 0 ) {
			console.log( "No workers assigned for", task );
		}
		// Have we specified that the task should not be run?
		else if ( this.config[task] === false ) {
			console.log( "Skipping task", task, "(set to FALSE in config)" );
		// Hit it
		} else {
			console.log( "Running task", task );
			// Pre_ and post_ tasks are specific to the task/worker they wrap around,
			// so we pass them the config of that task
			if ( this.workers["pre_" + task] ) {
				console.log( "...running pre_" + task );
				dataSet = this.runWorkers( this.workers["pre_" + task], this.config[task], dataSet );
			}

			dataSet = this.runWorkers( this.workers[task], this.config[task], dataSet );

			if ( this.workers["post_" + task] ) {
				console.log( "...running post_" + task );
				dataSet = this.runWorkers( this.workers["post_" + task], this.config[task], dataSet );
			}
		}
		console.log( "------------------------------------------------");

	}
	return dataSet;
}

Pipeline.prototype.runWorkers = function( workerList, options, dataSet ){
	for ( var i = 0, j = workerList.length; i < j; i++ ) {
		dataSet = workerList[i].call( this, dataSet, options );
	}
	return dataSet;
}

Pipeline.prototype.readJson = function( jsonFile ) {
	// TODO: Add error handling
	return JSON.parse( fs.readFileSync( jsonFile, { encoding: "utf-8" } ) );
}

/**
 *  Merges two objects recursively together, object2 overwriting the
 *  properties of object1. Should not change original objects.
 *
 */
Pipeline.prototype.merge = function( object1, object2 ) {
	var temp = {};

	for ( var prop in object1 ) {
		if ( typeof object1[prop] === "object" ) {
			temp[prop] = this.merge( temp[prop], object1[prop] );
		} else {
			temp[prop] = object1[prop];
		}
	}

	for ( var prop in object2 ) {
		if ( typeof object2[prop] === "object" ) {
			temp[prop] = this.merge( temp[prop], object2[prop] );
		} else {
			temp[prop] = object2[prop];
		}
	}

	return temp;
}

/**
 *
 */
Pipeline.prototype.log = function( message, msgType ){
	console.log( message );
}

/**
 *
 */
Pipeline.prototype.logList = function( messages, msgType ) {
	console.log( msgType, "count: ", messages.length );
	for ( var i = 0, j = messages.length; i < j; i++ ) {
		console.log( messages[i] );
	}
}

Pipeline.prototype.glob = function( dataSet, options ){
	// We make an assumption here that dataSet contains only single empty element
	// at this point, so we can safely reset it.
	dataSet = [];
	var glob = require( "glob" );
	var output = [];

	if ( options.sourceDir ) {
		if ( Array.isArray( options.sourceDir ) ) {
			for ( var i = 0, j = options.sourceDir.length; i < j; i++ ) {
				// This is OK as long as the total number of files stays under 150 000.
				// After that we should use a loop.
				// See: http://stackoverflow.com/questions/1374126/how-to-extend-an-existing-javascript-array-with-another-array
				output.push( output, glob.sync( options.sourceDir[i], options ) );
			}
		} else {
			output = glob.sync( options.sourceDir, options );
		}
	}
	for ( var i = 0, j = output.length; i < j; i++ ) {
		// sourceFile is based on an agreement between workers
		dataSet.push( { sourceFile: output[i] } );
	}

	return dataSet;
}

Pipeline.prototype.readFile = function( file ){
	return fs.readFileSync( file, { encoding: "utf-8" } );
}

/**
 *
 */
Pipeline.prototype.write = function ( dataSet, options ) {

	dataSet.forEach( function( item ){
		// These need some real world testing to see how they should really be
		// resolved.
		var targetFile = item.targetFile || options.targetFile || item.filename;
		var targetDir = item.targetDir || options.targetDir;

		// File name needs to be generated from the original
		if ( targetFile.indexOf( "*" ) !== -1 ) {
			var ext = targetFile.split( "*" ).pop();
			// This needs to be done in a complicated fashion, because the targetFile
			// may in fact some cases contain a directory, too.
			if ( ext ) {
				// The filename contains something like "*.css"
				targetFile = targetFile.replace( "*" + ext, this.switchExtension( this.targetFile, ext ) );
			} else {
				// The filename is just an asterisk
				targetFile = targetFile.replace( "*", item.targetFile );
			}
		}
		var targetPath;
		if ( !targetDir ) {
			targetPath = targetFile;
		} else {
			targetPath = targetDir + "/" + targetFile;
		}

		var dirToCreate = this.getDirectory( targetPath );

		console.log( "......creating dir", dirToCreate, "(or not)" );
		wrench.mkdirSyncRecursive( dirToCreate );
		console.log( "......writing file to", targetPath );
		this.writeToFile( targetPath, item.data );
	}, this );

	return dataSet;
}

Pipeline.prototype.writeToFile = function( file, content ){
	fs.writeFileSync( file, content );
}


/**
 *
 */
Pipeline.prototype.getDirectory = function( filePath ){
	if ( filePath.indexOf( "/" ) === -1 ) {
		return filePath.substring( 0, filePath.lastIndexOf( "\\" ) );
	} else {
		return filePath.substring( 0, filePath.lastIndexOf( "/" ) );
	}
}

/**
 *
 */
Pipeline.prototype.getFilename = function( filePath, removeExtension ){
	var filename = filePath.split( /[\\/]/ ).pop();
	if ( removeExtension ) {
		filename = this.switchExtension( filename, "" );
	}
	return filename;
}

/**
 *
 */
Pipeline.prototype.switchExtension = function( filename, toExtension ){
	return filename.replace( /\.[^/.]+$/, toExtension );
}

module.exports = Pipeline;
