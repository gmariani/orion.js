/* global Orion, document */
/*jshint esversion: 6 */

const OrionHTML = (function () {
	if (!Orion) throw Error('OrionHTML requires the Orion library');
	
	const getDebugFunc = function(orion) {
		return function() {
			// Emitter
			// TODO maybe create an element to show the bounds of the emitter
			orion.canvasContext.lineWidth = 1;
			
			// Render Target
			orion.renderTarget.style.border = '1px solid #FF0000';
		};
	};
	
	/* Converts a hex number to a CSS hex value 0xff0000 => #ff0000 */
	const hex2css = function(color) {
		return "#" + ( '00000' + (color | 0).toString(16) ).substr(-6);
	};
	
	const initParticle = function(particle) {
		particle.target.style['-webkit-transform'] = 'rotate(' + particle.rotation + 'deg)';
		particle.target.style['-moz-transform'] = 'rotate(' + particle.rotation + 'deg)';
		particle.target.style.opacity = particle.alpha;
		particle.target.style.backgroundColor = hex2css(particle.color);
		particle.target.style.left = particle.x + "px";
		particle.target.style.top = particle.y + "px";

		this._root.appendChild(particle.target);
	};
	
	const createInstance = function(root, element, cssClass, config) {
		const orion = Orion.createOrion(config);
		orion.renderTarget = element;
		orion.root = root;
		orion.cssClass = cssClass;
		orion.particles = Orion.createParticle();
		orion.renderDebug = getDebugFunc(orion);
		return orion;
	};

	return { createInstance:createInstance };
})();

var cv = cv || {};

//--------------------------------------
//  Properties
//--------------------------------------

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