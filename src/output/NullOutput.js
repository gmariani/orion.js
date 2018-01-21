var cv = cv || {};
cv.orion = cv.orion || {};
cv.orion.output = cv.orion.output || {};

cv.orion.output.NullOutput = function() { }

cv.orion.output.NullOutput.prototype = {
	
	//--------------------------------------
	//  Properties
	//--------------------------------------

	getPaused: function() { return true; },
	setPaused: function(value) { },
	
	//--------------------------------------
	//  Methods
	//--------------------------------------

	pause: function() { },

	play: function() {},

	getOutput: function(emitter) { return 0; }
}