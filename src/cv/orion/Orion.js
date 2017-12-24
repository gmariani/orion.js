/*global flash, requestAnimationFrame, document, EmitVO*/
/*
APIs Used
requestAnimationFrame
Chrome v10+
Firefox v4+
IE v10+
Opera 15+
Safari 6+

*/

// Polyfill
// https://gist.github.com/paulirish/1579671
const cancelAnimationFrame =  window.cancelAnimationFrame 			||
	  						  function( id ) { window.clearTimeout( id ); };
const requestAnimationFrame = window.requestAnimationFrame 			||
							  window.webkitRequestAnimationFrame 	|| 
							  window.mozRequestAnimationFrame 		|| 
							  window.oRequestAnimationFrame 		|| 
							  window.msRequestAnimationFrame 		|| 
        					  function( callback ) { return window.setTimeout( callback, 1000 / 30 ); };

var cv = cv || {};
cv.orion = cv.orion || {};

cv.orion.ParticleVO = function(target) {
	this.active = false;
	this.next = null;
	this.mass = null;
	this.paused = null;
	this.timeStamp = null;
	
	this.velocityX = 0;
	this.velocityY = 0;
	this.velocityZ = 0;
	
	// For Pixels Only //
	/////////////////////
	
	this.x = 0;
	this.y = 0;
	this.z = 0;
	this.rotation = 0;
	this.color = 0x000000;
	this.alpha = 1;
	this.scaleX = 1;
	this.scaleY = 1;
	this.target = target;
};

cv.orion.SettingsVO = function() {
	this.lifeSpan = 5000;
	this.mass = 1;
	this.numberOfParticles = 1;
	
	this.alpha = 1;
	this.alphaMin = 1;
	this.alphaMax = 1;
	
	this.velocityX = 0;
	this.velocityXMin = 0;
	this.velocityXMax = 0;
	
	this.velocityY = 0;
	this.velocityYMin = 0;
	this.velocityYMax = 0;
	
	this.velocityZ = 0;
	this.velocityZMin = 0;
	this.velocityZMax = 0;
	
	// 3D -Axis
	this.velocityRotate = 0;
	this.velocityRotateMin = 0;
	this.velocityRotateMax = 0;
	
	// 2D -Axis
	this.velocityAngle = 0;
	this.velocityAngleMin = 0;
	this.velocityAngleMax = 0;
	
	this.rotate = 0;
	this.rotateMin = 0;
	this.rotateMax = 0;
	
	this.scale = 1;
	this.scaleMin = 1;
	this.scaleMax = 1;
	
	this.color = null;
	this.colorMin = 0;
	this.colorMax = 0;
};

cv.orion.Orion = function(config) {
	/* const */
	this._mtx = new flash.geom.Matrix();
	/* const */
	this._pt = new flash.geom.Point();
	/* const */
	this._emitter = new flash.geom.Rectangle();
	/* const */
	this._emitQueue = [];
	
	this.canvas = null;
	this.debug = false;
	this.edgeFilter = null;
	this.effectFilters = [];
	this.preRenderFilters = [];
	this.postRenderFilters = [];
	this.settings = new cv.orion.SettingsVO();
	this._numParticles = 0;
	this._particles = null;
	this._dispatchUpdates = false;
	this._paused = false;
	this._hiddenPaused = false;
	this._willTriggerFlags = 0;
	this._output = this;
	this._
	
	// Init Settings
	this.applyPreset(config);
	
	// Init static settings
	//if(!this.intervalID) 
	this.intervalID = null;
	// setInterval
	//var t = this;
	//this.intervalID = setInterval(function() { t.tick(t); }, 31);
	
	// requestAnimationFrame
	// Cache the bound version of tick()
	this.tickBound = this.tick.bind(this);
	requestAnimationFrame(this.tickBound);
	
	// Page Visibility API
	var hidden, visibilityChange; 
	if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support 
		hidden = "hidden";
		visibilityChange = "visibilitychange";
	} else if (typeof document.msHidden !== "undefined") {
		hidden = "msHidden";
		visibilityChange = "msvisibilitychange";
	} else if (typeof document.webkitHidden !== "undefined") {
		hidden = "webkitHidden";
		visibilityChange = "webkitvisibilitychange";
	}
	document.addEventListener(visibilityChange, onVisibilityChange, false);
	function onVisibilityChange() {
		if (document[hidden]) {
			this._hiddenPaused = this._paused;
			this._paused = true;
		} else {
			this._paused = this._hiddenPaused;
			this._hiddenPaused = null;
		}
	}
};

cv.orion.Orion.DEG2RAD = 0.01745329; 	// Math.PI / 180
cv.orion.Orion.RAD2DEG = 57.2957795; 	// 180 / Math.PI
cv.orion.Orion.PI_D2 = 1.57079632; 		// Math.PI / 2
cv.orion.Orion.PI_M2 = 6.28318531; 		// Math.PI * 2
cv.orion.Orion.PI = 3.14159265; 		// Math.PI
cv.orion.Orion.PI_42 = 0.405284735; 	// -4 / (Math.PI ^ 2)
cv.orion.Orion.PI_4 = 1.27323954; 		// 4 / Math.PI
//cv.orion.Orion.denormal = 1e-18;
cv.orion.Orion.VERSION = "1.5.0";
cv.orion.Orion.time = null;

cv.orion.Orion.prototype = {
	
	//--------------------------------------
	//  Methods
	//--------------------------------------
	
	applyPreset: function(config, reset) {
		if (reset) {
			this.edgeFilter = null;
			this.output = this;
			this.effectFilters = [];
			this.preRenderFilters = [];
			this.postRenderFilters = [];
			this.settings = new cv.orion.SettingsVO();
		}
		
		if (config) {
			if (config.hasOwnProperty("output")) this.output = config.output;
			if (config.hasOwnProperty("effectFilters") && config.effectFilters instanceof Array) this.effectFilters = config.effectFilters;
			if (config.hasOwnProperty("preRenderFilters") && config.preRenderFilters instanceof Array) this.preRenderFilters = config.preRenderFilters;
			if (config.hasOwnProperty("postRenderFilters") && config.postRenderFilters instanceof Array) this.postRenderFilters = config.postRenderFilters;
			if (config.hasOwnProperty("settings") && config.settings instanceof cv.orion.SettingsVO) this.settings = config.settings;
			if (config.hasOwnProperty("edgeFilter")) this.edgeFilter = config.edgeFilter;
		}
	},
	
	createAllParticles: function() { },
	
	/**
	 * Used to force a particle to emit and at a specified location
	 * 
	 * @param	coord
	 * @param	numParticles
	 */
	emit: function(coord, numParticles) {
		numParticles = numParticles || 1;
		// EmitVO
		this._emitQueue.push({ coord: coord, amount: numParticles });
	},
	
	/**
	 * This acts as a fake output update function for use by the Update
	 * and Destroy emitters.
	 * 
	 * @param	emitter The emitter to be used.
	 */
	getOutput: function(emitter) {
		return this.settings.numberOfParticles;
	},
	
	/**
	 * Pauses the particle system
	 */
	pause: function() { this.setPaused(true); },
	
	/**
	 * Resumes or plays the particle system
	 */
	play: function() { this.setPaused(false); },
	
	/**
	 * Removes all particles from the emitter.
	 * This also frees up any memory used by the particles.
	 */
	removeAllParticles: function() {
		var particle = this._particles;
		if(particle) {
			do {
				this.removeParticle(particle);
				particle = particle.next;
			} while (particle);
		}
		this._particles = this.createParticle();
	},
	
	/**
	 * Updates all the particles and positions, updates the output class as well.
	 * 
	 * @param	e The event dispatched.
	 * @default null
	 */
	render: function(e) {
		// Draw boxes for emitter and canvas
		/*if (debug) {
			this.graphics.clear();
			this.graphics.lineStyle(1, 0x00FF00, 1, true);
			this.graphics.drawRect(this.x, this.y, this.width, this.height);
			this.graphics.moveTo(this.x, this.y);
			this.graphics.lineTo(this.x, this.y);
			this.graphics.lineTo(this.x + this.width, this.y + this.height);
			this.graphics.moveTo(this.x + this.width, this.y);
			this.graphics.lineTo(this.x + this.width, this.y);
			this.graphics.lineTo(this.x, this.y + this.height);
			if(canvas) {
				this.graphics.lineStyle(1, 0xFF0000, 1, true);
				this.graphics.drawRect(canvas.x, canvas.y, canvas.width, canvas.height);
			}
		}*/
		
		if (this.paused) return;
		
		this._numParticles = length;
	},
	
	//--------------------------------------
	//  Private
	//--------------------------------------
	
	/**
	 * Adds a new particle to the system. Before creating a new particle, it will check the
	 * recycle bin of old particles to see if it can match the particle requested. If so, it
	 * will re-use an old particle rather than create a new one as this is quicker on the 
	 * player.
	 * 
	 * @param	pt The point to position the particle at.
	 * @default null (getCoordinate)
	 * 
	 * @param	c The class to be used for the particle.
	 * @default null (spriteClass)
	 */
	addParticle: function(p, pt) {
		pt = pt || this.getCoordinate(this._pt, this);
		if (pt) {
			this._mtx.tx = pt.x;
			this._mtx.ty = pt.y;
			
			p.active = true;
			p.paused = false;
			p.timeStamp = cv.orion.Orion.time;
			p.mass = this.settings.mass;
			
			if (this.settings.velocityXMin != this.settings.velocityXMax) {
				p.velocityX = this.randomRange(this.settings.velocityXMin, this.settings.velocityXMax);
			} else {
				p.velocityX = this.settings.velocityX;
			}
			
			if (this.settings.velocityYMin != this.settings.velocityYMax) {
				p.velocityY = this.randomRange(this.settings.velocityYMin, this.settings.velocityYMax);
			} else {
				p.velocityY = this.settings.velocityY;
			}
			
			var angle = this.settings.velocityAngle;
			if (this.settings.velocityAngleMin != this.settings.velocityAngleMax) {
				angle = this.randomRange(this.settings.velocityAngleMin, this.settings.velocityAngleMax);
			}
			if (angle !== 0) {
				angle *= cv.orion.Orion.DEG2RAD;
				// http://lab.polygonal.de/2007/07/18/fast-and-accurate-sinecosine-approximation/
				//always wrap input angle to -PI..PI
				if (angle < -cv.orion.Orion.PI) {
					angle += cv.orion.Orion.PI_M2;
				} else if (angle > cv.orion.Orion.PI) {
					angle -= cv.orion.Orion.PI_M2;
				}
				
				//compute sine
				var sin, cos, x;
				if (angle < 0) {
					sin = cv.orion.Orion.PI_4 * angle + cv.orion.Orion.PI_42 * angle * angle;
				} else {
					sin = cv.orion.Orion.PI_4 * angle - cv.orion.Orion.PI_42 * angle * angle;
				}
				
				//compute cosine: sin(x + PI/2) = cos(x)
				angle += cv.orion.Orion.PI_D2;
				if (angle > cv.orion.Orion.PI) angle -= cv.orion.Orion.PI_M2;
				
				if (angle < 0) {
					cos = cv.orion.Orion.PI_4 * angle + cv.orion.Orion.PI_42 * angle * angle;
				} else {
					cos = cv.orion.Orion.PI_4 * angle - cv.orion.Orion.PI_42 * angle * angle;
				}
				
				//var cos:Number = Math.cos(angle);
				//var sin:Number = Math.sin(angle);
				x = p.velocityX;
				p.velocityX = x * cos - p.velocityY * sin;
				p.velocityY = p.velocityY * cos + x * sin;
			}
			
			this.additionalInit(p, pt);
			
			return true;
		}
		return false;
	},

	additionalInit: function(p, pt) { },

	createParticle: function(idx) {
		return new cv.orion.ParticleVO();
	},

	/**
	 * Removes a particle and stores the reference to the particle inside 
	 * of the recyclebin dictionary.
	 */
	removeParticle: function(p) {
		p.active = false;
	},
	
	/**
	 * Returns a coordinate it's designated position.
	 * 
	 * @return Returns a coordinate at the emitters x,y position or within it.
	 */
	getCoordinate: function(particle, emitter) {
		particle.x = this.randomRange(emitter.x, emitter.x + emitter.width);
		particle.y = this.randomRange(emitter.y, emitter.y + emitter.height);
		return particle;
	},
	
	// setInterval
	/*tick: function(_this) {
		cv.orion.Orion.time = new Date().getTime();
		_this.render();
	},*/
	
	/**
	 * This is called each time the reference shape enters a new frame.
	 * 
	 * @param	e
	 */
	// requestAnimationFrame
	tick: function(timestamp) {
		cv.orion.Orion.time = timestamp;
		this.render();
		requestAnimationFrame(this.tickBound);
	},

	/**
	 * Return a random number between a range of numbers
	 * 
	 * @internal Utility function
	 * 
	 * @param	min<Number> The minimum number in the range
	 * @param	max<Number> The maximum number in the range
	 * @return A random number between the two numbers given.
	 */
	/*static*/ randomRange: function(min, max) {
		if (min == max) return min;
		return Math.random() * (max - min) + min;
	},

	/**
	 * Finds a color that's between the two numbers given.
	 * 
	 * @internal Utility function
	 * 
	 * @param	fromColor<uint> The first color
	 * @param	toColor<uint> The second color
	 * @param	progress<Number> The ratio between the two colors you want returned.
	 * @return The color between the two colors.
	 */
	/*static*/ interpolateColor: function(fromColor, toColor, progress) {
		var n = 1 - progress; // Alpha
		var red = Math.round(((fromColor >>> 16) & 255) * progress + ((toColor >>> 16) & 255) * n);
		var green = Math.round(((fromColor >>> 8) & 255) * progress + ((toColor >>> 8) & 255) * n);
		var blue = Math.round(((fromColor) & 255) * progress + ((toColor) & 255) * n);
		var alpha = Math.round(((fromColor >>> 24) & 255) * progress + ((toColor >>> 24) & 255) * n);
		return (alpha << 24) | (red << 16) | (green << 8) | blue;
	}
};

//--------------------------------------
//  Properties
//--------------------------------------

/**
 * Gets or sets the height of the emitter.
 */
Object.defineProperty(cv.orion.Orion.prototype, 'height', {
	get: function() { return this._emitter.height; },
	set: function(newValue) { this._emitter.height = newValue; },
	enumerable: true,
	configurable: true
});

Object.defineProperty(cv.orion.Orion.prototype, 'numParticles', {
	get: function() { return this._numParticles; },
	enumerable: true,
	configurable: true
});

/**
 * Gets or sets the output class used. The default is the <code>null</code>.
 */
Object.defineProperty(cv.orion.Orion.prototype, 'output', {
	get: function() { return this._output; },
	set: function(newValue) { this._output = newValue || this; },
	enumerable: true,
	configurable: true
});

/**
 * The vector of all the particles in this instance of Orion
 */
Object.defineProperty(cv.orion.Orion.prototype, 'particles', {
	get: function() { return this._particles; },
	enumerable: true,
	configurable: true
});

/**
 * Gets or sets the paused property
 */
Object.defineProperty(cv.orion.Orion.prototype, 'paused', {
	get: function() { return this._paused; },
	set: function(newValue) {
		if (newValue == this._paused) return;
		this._paused = newValue;

		// setInterval
		/*if (newValue) {
			clearInterval(this.intervalID);
			// Render one more time after being paused
			//this.render();
		} else {
			this.intervalID = setInterval(this.tick, 33, this);
			// Still doesn't work in IE9
			//var t = this;
			//this.intervalID = setInterval(function() { t.tick(t); }, 33);
		}*/

		// requestAnimationFrame
		if (newValue) {
			//cancelAnimationFrame(this.intervalID);
		} else {
			requestAnimationFrame(this.tickBound);
		}
	},
	enumerable: true,
	configurable: true
});

/**
 * Gets or sets the width of the emitter.
 */
Object.defineProperty(cv.orion.Orion.prototype, 'width', {
	get: function() { return this._emitter.width; },
	set: function(newValue) { this._emitter.width = newValue; },
	enumerable: true,
	configurable: true
});

Object.defineProperty(cv.orion.Orion.prototype, 'x', {
	get: function() { return this._emitter.x; },
	set: function(newValue) { this._emitter.x = newValue; },
	enumerable: true,
	configurable: true
});

Object.defineProperty(cv.orion.Orion.prototype, 'y', {
	get: function() { return this._emitter.y; },
	set: function(newValue) { this._emitter.y = newValue; },
	enumerable: true,
	configurable: true
});