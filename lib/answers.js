var AWS = require('aws-sdk'),
	fs = require('fs'),
	path = require('path'),
	_ = require('lodash'),
	Promise = require('bluebird'),
	tableName = 'slack';

var dynamodb = new AWS.DynamoDB({ "region" : "us-east-1" });

// function to bootstrap the 8ball with some suggested options
function init () {
	var answers = JSON.parse(fs.readFileSync(path.resolve(__dirname,"./defaultAnswers.json")));

	return Promise.all(answers.map( function ( a ) {
		return add( a.answer, a.condition );
	}));
}

// function to handle adding an entry
function add ( answer, rejex ) {
	return new Promise( function ( resolve, reject ) {
		var item = {
			"Item" : {
				"answer" : {
					"S" : answer
				}
			},
			"TableName" : tableName
		};

		if(rejex){
			item.Item.condition = {
				"S" : rejex
			};
		}
		
		dynamodb.putItem(item, function ( err, result ) {
			if(err){ return reject(err); }
			resolve(result);
		});
	});
}

// function to handle 
function remove ( answer ) {
	return new Promise( function ( resolve, reject ) {
		dynamodb.deleteItem({
			"TableName" : tableName,
			"Key" : {
				"answer" : {
					"S" : answer
				}
			}
		}, function ( err, result ){
			if(err){ return reject(err); }
			resolve();
		});
	});
}

// function to handle listing all items
function list () {
	return new Promise( function ( resolve, reject ) {
		dynamodb.scan({
			"TableName" : tableName,
		}, function ( err, result ){
			if(err){ return reject(err); }

			var formattedResult = result.Item ? [result.Item] : result.Items;
			formattedResult = formattedResult.map( function ( r ) {
				var returner = { "answer" : r.answer.S };
				if(r.condition){ returner.condition = r.condition.S; }
				return returner;
			});

			resolve(formattedResult);
		});
	});
}

// choose a random one
function choose ( question ) {
	return list()
	.then( function ( possibleAnswers ){
		return possibleAnswers[Math.floor(Math.random() * possibleAnswers.length)];
	});
}

// utility to describe the table
function describe () {
	return new Promise( function ( resolve, reject ) {
		dynamodb.describeTable({
			"TableName" : tableName,
		}, function ( err, result ){
			if(err){ return reject(err); }
			console.log(result);
			resolve(result);
		});
	});
}


module.exports = {
	add : add,
	choose : choose,
	remove : remove,
	init : init,
	list : list,
	describe : describe
}