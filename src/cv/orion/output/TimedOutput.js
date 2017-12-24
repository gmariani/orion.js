var cv = cv || {};
cv.orion = cv.orion || {};
cv.orion.output = cv.orion.output || {};

cv.orion.output.TimedOutput = function(duration, particlesPerSecond) {
	this.duration;
	this._t;
	
	this.particlesPerSecond = isNaN(particlesPerSecond) ? 20 : particlesPerSecond;
	this.duration = isNaN(duration) ? 5000 : duration;
}
cv.orion.output.TimedOutput.prototype = Object.create(cv.orion.output.SteadyOutput.prototype); // TimedOutput extends SteadyOutput
cv.orion.output.TimedOutput.prototype.constructor = cv.orion.output.TimedOutput;

cv.orion.output.TimedOutput.prototype = {
	
	//--------------------------------------
	//  Methods
	//--------------------------------------
	
	reset: function() {
		this._t = NaN;
		this.prevTime = NaN;
	},

	update: function(emitter) {
		if (isNaN(this._t)) this._t = cv.orion.Orion.time;
		if ((cv.orion.Orion.time - this._t) <= this.duration) {
			//super.update(emitter);
			cv.orion.output.SteadyOutput.prototype.update.call(this, emitter);
		}
	}
}