/* global document */

var cv = cv || {};

cv.OrionHTML = function(root, element, cssClass, config) {
	//super(config);
	cv.orion.Orion.call(this, config);

	this._element = element;
	this._cssClass = cssClass;
	this._particles = this.createParticle();
	this._root = root;
};

// Extend
cv.OrionHTML.prototype = Object.create(cv.orion.Orion.prototype);
cv.OrionHTML.constructor = cv.OrionHTML;
cv.OrionHTML.constructor.name = 'cv.OrionHTML';

//--------------------------------------
//  Properties
//--------------------------------------

Object.defineProperty(cv.OrionHTML.prototype, 'root', {
	get: function() { return this._root; },
	enumerable: true,
	configurable: false
});

Object.defineProperty(cv.OrionHTML.prototype, 'CSSClass', {
	get: function() { return this._cssClass; },
	set: function(newValue) {
		this._cssClass = newValue;
		this.removeAllParticles();
	},
	enumerable: true,
	configurable: false
});

Object.defineProperty(cv.OrionHTML.prototype, 'element', {
	get: function() { return this._element; },
	set: function(newValue) {
		this._element = newValue;
		this.removeAllParticles();
	},
	enumerable: true,
	configurable: false
});

//--------------------------------------
//  Methods
//--------------------------------------

cv.OrionHTML.prototype.render = function(e) {
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
	
	var lifeSpan = this.settings.lifeSpan,
	particle = this._particles,
	numAdd = this.output.getOutput(this),
	numEmit = this._emitQueue.length - 1,
	length = 0,
	curTime = cv.orion.Orion.time,
	i,
	effectFiltersLength = this.effectFilters.length,
	_effectFilters = this.effectFilters,
	_edgeFilter = this.edgeFilter;
	
	do {
		if (particle.active) {
			// Too old
			if (lifeSpan > 0) {
				if ((curTime - particle.timeStamp) > lifeSpan) {
					this.removeParticle(particle);
					continue;
				}
			}
			
			// Count particles
			++length;
			
			if (!particle.paused) {
				// Apply Filters
				i = effectFiltersLength;
				if (i > 0) {
					while (--i > -1) {
						_effectFilters[i].applyFilter(particle, this);
					}
				}
				
				// Position particle
				if (particle.velocityX !== 0) {
					particle.x += particle.velocityX;
					particle.target.style.left = particle.x + "px";
				}
				if (particle.velocityY !== 0) {
					particle.y += particle.velocityY;
					particle.target.style.top = particle.y + "px";
				}
				//if (particle.velocityZ != 0) particle.target.rotation += particle.velocityZ;
				if (_edgeFilter) _edgeFilter.applyFilter(particle, this);
			}
		} else if (numAdd > 0) {
			// Add new
			if(this.addParticle(particle)) --numAdd;
		} else if (numEmit >= 0) {
			// Emit new
			this.addParticle(particle, this._emitQueue[numEmit].coord);
			
			// Reduce the amount and let the loop create more particles as necessary
			--this._emitQueue[numEmit].amount;
			if (this._emitQueue[numEmit].amount <= 0) {
				this._emitQueue.pop();
				--numEmit;
			}
		}
		
		// If more particles need to be emitted and the list is at the end, add more particles
		if (particle.next === null && (numAdd || numEmit > -1)) {
			particle = particle.next = this.createParticle();
		} else {
			particle = particle.next;
		}
	} while (particle);	
	
	this._numParticles = length;
};
	
//--------------------------------------
//  Private
//--------------------------------------

cv.OrionHTML.prototype.hex2css = function(color) {
	var col = color.toString(16);
	while(col.length < 6) col = "0" + col;
	return "#" + col;
};

cv.OrionHTML.prototype.additionalInit = function(p, pt) {
	/*if (settings.velocityRotateMin != settings.velocityRotateMax) {
		p.velocityZ = randomRange(settings.velocityRotateMin, settings.velocityRotateMax);
	} else {
		p.velocityZ = settings.velocityRotate;
	}*/
	
	if (this.settings.colorMin != this.settings.colorMax) {
		p.color = this.interpolateColor(this.settings.colorMin, this.settings.colorMax, Math.random());
	} else if(!isNaN(this.settings.color)) {
		p.color = this.settings.color;
	}
	
	if (this.settings.alphaMin != this.settings.alphaMax) {
		p.alpha = this.randomRange(this.settings.alphaMin, this.settings.alphaMax);
	} else {
		p.alpha = this.settings.alpha;
	}
	
	/*var scale:Number = settings.scale;
	if (settings.scaleMin != settings.scaleMax) {
		scale = randomRange(settings.scaleMin, settings.scaleMax);
	}*/
	
	var rotate = this.settings.rotate;
	if (this.settings.rotateMin != this.settings.rotateMax) {
		rotate = this.randomRange(this.settings.rotateMin, this.settings.rotateMax);
	}
	
	// Update position/color
	/*_mtx.identity();
	_mtx.createBox(scale, scale, rotate * DEG2RAD, pt.x, pt.y);
	p.target.transform.colorTransform = _clr;
	p.target.transform.matrix = _mtx;*/
	
	p.x = pt.x;
	p.y = pt.y;
	p.target.style['-webkit-transform'] = 'rotate(' + rotate + 'deg)';
	p.target.style['-moz-transform'] = 'rotate(' + rotate + 'deg)';
	p.target.style.opacity = p.alpha;
	p.target.style.backgroundColor = this.hex2css(p.color);
	p.target.style.left = pt.x + "px";
	p.target.style.top = pt.y + "px";
	
	this._root.appendChild(p.target);
};

cv.OrionHTML.prototype.createParticle = function(idx) {
	// Create new particle
	var d = document.createElement(this._element);
	d.className = this._cssClass;
	return new cv.orion.ParticleVO(d);
};

cv.OrionHTML.prototype.removeParticle = function(p) {
	if (p.target.parentNode) this._root.removeChild(p.target);
	cv.orion.Orion.prototype.removeParticle.call(this, p);
	//super.removeParticle(p);
};