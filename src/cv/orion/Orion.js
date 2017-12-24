var cv = cv || {};
cv.orion = cv.orion || {};

cv.orion.Orion = function(config) {
	/* const */
	this._mtx = new flash.geom.Matrix();
	/* const */
	this._pt = new flash.geom.Point();
	/* const */
	this._emitter = new flash.geom.Rectangle();
	/* const */
	this._emitQueue = new Array();
	
	this.canvas = null;
	this.debug = false;
	this.edgeFilter = null;
	this.effectFilters = new Array();
	this.settings = new cv.orion.SettingsVO();
	this._numParticles = 0;
	this._particles = null;
	this._dispatchUpdates = false;
	this._paused = false;
	this._willTriggerFlags = 0;
	this._output = this;
	
	// Init Settings
	this.applyPreset(config);
	
	// Init static settings
	//if(!this.intervalID) 
	this.intervalID = null;
};

cv.orion.Orion.DEG2RAD = 0.01745329;// Math.PI / 180
cv.orion.Orion.PI_D2 = 1.57079632;// Math.PI / 2
cv.orion.Orion.PI_M2 = 6.28318531;// Math.PI * 2
cv.orion.Orion.PI = 3.14159265;// Math.PI
cv.orion.Orion.PI_42 = 0.405284735;// -4 / (Math.PI ^ 2)
cv.orion.Orion.PI_4 = 1.27323954;// 4 / Math.PI
//cv.orion.Orion.denormal = 1e-18;
cv.orion.Orion.VERSION = "1.5.0";
cv.orion.Orion.time = null;

cv.orion.Orion.prototype = {
	
	//--------------------------------------
	//  Properties
	//--------------------------------------
	
	getHeight: function() { return this._emitter.height; },
	setHeight: function(value) { this._emitter.height = value; },
	
	getNumParticles: function() { return this._numParticles; },
	
	getOutput: function() { return this._output; },
	setOutput: function(value) { this._output = value || this; },
	
	getParticles: function() { return this._particles; },
	
	getPaused: function() { return this._paused; },
	setPaused: function(value) {
		if (value == this._paused) return;
		this._paused = value;
		if (value) {
			clearInterval(this.intervalID);
			// Render one more time after being paused
			this.render();
		} else {
			//this.intervalID = setInterval(this.tick, 33, this);
			// Still doesn't work in IE9
			var t = this;
			this.intervalID = setInterval(function() { t.tick(t); }, 33);
		}
	},
	
	getWidth: function() { return this._emitter.width; },
	setWidth: function(value) { this._emitter.width = value; },
	
	getX: function() { return this._emitter.x; },
	setX: function(value) { this._emitter.x = value; },
	
	getY: function() { return this._emitter.y; },
	setY: function(value) { this._emitter.y = value; },
	
	//--------------------------------------
	//  Methods
	//--------------------------------------
	
	applyPreset: function(config, reset) {
		if (reset) {
			this.edgeFilter = null;
			this.output = this;
			this.effectFilters = new Array();
			this.settings = new cv.orion.SettingsVO();
		}
		
		if(config) {
			if (config.hasOwnProperty("output")) this.output = config.output;
			if (config.hasOwnProperty("effectFilters") && config.effectFilters instanceof Array) this.effectFilters = config.effectFilters;
			if (config.hasOwnProperty("settings") && config.settings instanceof cv.orion.SettingsVO) this.settings = config.settings;
			if (config.hasOwnProperty("edgeFilter")) this.edgeFilter = config.edgeFilter;
		}
	},
	
	createAllParticles: function() { },
	
	emit: function(coord, numParticles) {
		this._emitQueue.push(new EmitVO(coord, numParticles || 1));
	},
	
	getOutput2: function(emitter) {
		return this.settings.numberOfParticles;
	},
	
	pause: function() { this.setPaused(true); },
	
	play: function() { this.setPaused(false); },
	
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
		
		if (this.getPaused()) return;
		
		this._numParticles = length;
	},
	
	//--------------------------------------
	//  Private
	//--------------------------------------
	
	addParticle: function(p, pt) {
		pt = pt || this.getCoordinate();
		if (pt) {
			this._mtx.tx = pt.x;
			this._mtx.ty = pt.y;
			
			p.active = true;
			p.paused = false;
			p.timeStamp = cv.orion.Orion.time;
			p.mass = this.settings.mass;
			
			if(this.settings.velocityXMin != this.settings.velocityXMax) {
				p.velocityX = this.randomRange(this.settings.velocityXMin, this.settings.velocityXMax);
			} else {
				p.velocityX = this.settings.velocityX;
			}
			
			if(this.settings.velocityYMin != this.settings.velocityYMax) {
				p.velocityY = this.randomRange(this.settings.velocityYMin, this.settings.velocityYMax);
			} else {
				p.velocityY = this.settings.velocityY;
			}
			
			var angle = this.settings.velocityAngle;
			if(this.settings.velocityAngleMin != this.settings.velocityAngleMax) {
				angle = this.randomRange(this.settings.velocityAngleMin, this.settings.velocityAngleMax);
			}
			if (angle != 0) {
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

	removeParticle: function(p) {
		p.active = false;
	},
	
	getCoordinate: function() {
		//this._pt.x = this.randomRange(this._emitter.left, this._emitter.right);
		//this._pt.y = this.randomRange(this._emitter.top, this._emitter.bottom);
		this._pt.x = this.randomRange(this._emitter.x, this._emitter.x);
		this._pt.y = this.randomRange(this._emitter.y, this._emitter.y);
		return this._pt;
	},
	
	tick: function(_this) {
		cv.orion.Orion.time = new Date().getTime();
		_this.render();
	},

	/*static*/ randomRange: function(min, max) {
		if (min == max) return min;
		return Math.random() * (max - min) + min;
	},

	/*static*/ interpolateColor: function(fromColor, toColor, progress) {
		var n = 1 - progress; // Alpha
		var red = Math.round(((fromColor >>> 16) & 255) * progress + ((toColor >>> 16) & 255) * n);
		var green = Math.round(((fromColor >>> 8) & 255) * progress + ((toColor >>> 8) & 255) * n);
		var blue = Math.round(((fromColor) & 255) * progress + ((toColor) & 255) * n);
		var alpha = Math.round(((fromColor >>> 24) & 255) * progress + ((toColor >>> 24) & 255) * n);
		return (alpha << 24) | (red << 16) | (green << 8) | blue;
	}
};