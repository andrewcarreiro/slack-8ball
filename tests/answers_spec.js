var answers = require("../lib/answers"),
	fs = require('fs'),
	path = require('path'),
	_ = require('lodash');

describe("answers crud", function () {
	it("should initialize", function ( done ){
		answers.init()
		.then( function (){ return answers.list(); })
		.then( function (data) {
			var expectedAnswers = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../lib/defaultAnswers.json")));
			data = _.sortBy(data, "answer");
			expectedAnswers = _.sortBy(expectedAnswers, "answer");
			expect(_.isEqual(data, expectedAnswers)).toBe(true);
			done();
		})
		.catch( function (e){
			expect(e).toBe(null);
			done();
		});
	});

	it("should be able to add a new entry", function ( done ){
		answers.add("hell yeah")
		.then(function (){ return answers.list(); })
		.then( function (data) {
			expect(_.some(data, { "answer" : "hell yeah" })).toBe(true);
			done();
		})
		.catch( function (e){
			expect(e).toBe(null);
			done();
		});
	});

	it("should be able to remove an entry", function ( done ){
		answers.remove("hell yeah")
		.then(function (){ return answers.list(); })
		.then( function (data) {
			expect(_.some(data, { "answer" : "hell yeah" })).toBe(false);
			done();
		})
		.catch( function (e){
			expect(e).toBe(null);
			done();
		});
	});
});