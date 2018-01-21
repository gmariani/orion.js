var cv = cv || {};
cv.orion = cv.orion || {};
cv.orion.output = cv.orion.output || {};

/**
 * Controls the output of the particles of the emitter.
 * 
 * @param	particlesPerSecond<Number> The rate at which to output particles
 * @default 20
 */
cv.orion.output.SteadyOutput = function(particlesPerSecond) {
	var prevTime = NaN, difTime = NaN, dT;
	this._paused = false;
	
	// The current rate assigned to SteadyOutput, in particles per second.
	this.particlesPerSecond = isNaN(particlesPerSecond) ? 20 : particlesPerSecond;
	
	//--------------------------------------
	//  Private
	//--------------------------------------
	
	/**
	 * Updates the previous and difference in times.
	 * This determines when to emit and fix any pause
	 * issues.
	 * 
	 * @param	emitter
	 */
	this._updateTimes = function(emitter) {
		if (isNaN(prevTime)) prevTime = cv.orion.Orion.time;
		
		// Resume normally after being paused for a while
		if (!isNaN(difTime)) prevTime = cv.orion.Orion.time - difTime;
		
		// Add particles at the specificed rate
		dT = cv.orion.Orion.time - prevTime;
		difTime = emitter.paused ? dT : NaN;
	};
	
	/**
	 * Checks if it's time to emit particles and how many.
	 * 
	 * @param	emitter
	 */
	this._checkEmit = function(emitter) {
		if (this.particlesPerSecond === 0) return 0;
		
		var pT = 1000 / this.particlesPerSecond;
		if (dT >= pT) {
			prevTime = cv.orion.Orion.time;
			if (this.paused) return 0;
			//return Math.round(dT / pT);
			return (((dT / pT) + 0.5)|0);
		} else {
			return 0;
		}
	};
};

cv.orion.output.SteadyOutput.prototype = {

	//--------------------------------------
	//  Methods
	//--------------------------------------

	/**
	 * Pauses the output class.
	 */
	pause: function() { this.setPaused(true); },

	/**
	 * Resumes or plays the output class.
	 */
	play: function() { this.setPaused(false); },

	/**
	 * This is called everytime the particles are called to update and be redrawn. Depending
	 * on the output class, this can determine the output of the particles.
	 * 
	 * @param	emitter The emitter to be used.
	 */
	getOutput: function(emitter) {
		this._updateTimes(emitter);
		return this._checkEmit(emitter);
	}
};

//--------------------------------------
//  Properties
//--------------------------------------

/**
 * Gets or sets the paused property
 */
Object.defineProperty(cv.orion.output.SteadyOutput.prototype, 'paused', {
	get: function() { return this._paused; },
	set: function(newValue) {
		if (newValue === this._paused) return;
		this._paused = newValue;
	},
	enumerable: true,
	configurable: true
});