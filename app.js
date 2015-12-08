var answers = require("./lib/answers"),
	Promise = require("bluebird");

// the entry point for lambda
// e is the event that triggered the Lambda run, with any data.
function handler ( e, context ){
	var startTime = (new Date()).getTime();

	var command = e.text.toLowerCase();
	var cmd;
	// Listing
	if( command == "list" ){
		cmd = answers.list()
		.then( function ( ans ) {
			var response = "The possible options are:\n";
			var answerText = ans.map( function ( a ){
				return a.answer + "\n";
			});
			return response + answerText.join('');
		});
	// Removal
	}else if( command.match(/^(?:remove )/gm) ){
		var requestedAnswer = e.text.substring(7,e.text.length);
		cmd = answers.remove(requestedAnswer)
			.then( function (){
				return "'"+requestedAnswer+"' has been removed.";
			});
	// Addition
	}else if( command.match(/^(?:add )/gm) ){
		var requestedAnswer = e.text.substring(4,e.text.length);
		cmd = answers.add(requestedAnswer)
			.then( function (){
				return "'"+requestedAnswer+"' has been added.";
			});
	// help
	}else if( command == "help" ){
		cmd = Promise.resolve()
			.then( function (){
				return "Possible commands are list, remove, add, and help. Anything else will be treated as a question";
			});
	}else{
		cmd = answers.choose(e.text)
		.then(function (response) {
			var timeSpent = (new Date()).getTime() - startTime;
			return "You shake the magic 8 ball, asking '"+e.text+"'\nThe ball responds: "+response.answer + " ("+timeSpent+"ms)";
		});
	}
	
	cmd.then(function (stringResponse) {
		context.succeed({
			"text" : stringResponse
		});
	})
	.catch(function (err) { context.fail(err); });
}


module.exports = {
	handler : handler
}