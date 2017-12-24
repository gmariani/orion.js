var cv = cv || {};
cv.orion = cv.orion || {};
cv.orion.output = cv.orion.output || {};

cv.orion.output.SteadyOutput = function(particlesPerSecond) {
	this._prevTime;
	this._difTime;
	this._dT;
	this._paused = false;
	
	this.particlesPerSecond = isNaN(particlesPerSecond) ? 20 : particlesPerSecond;
	
	//--------------------------------------
	//  Private
	//--------------------------------------
	
	function updateTimes(emitter) {
		if (isNaN(this._prevTime)) this._prevTime = cv.orion.Orion.time;
		
		// Resume normally after being paused for a while
		if (!isNaN(this._difTime)) this._prevTime = cv.orion.Orion.time - this._difTime;
		
		// Add particles at the specificed rate
		this._dT = cv.orion.Orion.time - this._prevTime;
		this._difTime = emitter.paused ? this._dT : NaN;
	}
	
	function checkEmit(emitter) {
		if (this.particlesPerSecond == 0) return 0;
		var pT = 1000 / particlesPerSecond;
		if (this._dT >= pT) {
			this._prevTime = cv.orion.Orion.time;
			if (this._paused) return 0;
			return this._dT / pT;
		} else {
			return 0;
		}
	}
}

cv.orion.output.SteadyOutput.prototype = {

	//--------------------------------------
	//  Properties
	//--------------------------------------

	getPaused: function() { return this._paused; },
	setPaused: function(value) {
		if (value == this._paused) return;
		this._paused = value;
	},

	//--------------------------------------
	//  Methods
	//--------------------------------------

	pause: function() { this.setPaused(true); },

	play: function() { this.setPaused(false); },

	getOutput: function(emitter) {
		this.updateTimes(emitter);
		return this.checkEmit(emitter);
	}
};