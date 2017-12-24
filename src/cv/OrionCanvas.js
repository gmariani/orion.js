var cv = cv || {};

cv.OrionCanvas = function(canvas, shapeFunction, config) {
	// super(config);
	cv.orion.Orion.call(this, config);
	
	function defaultShapeFunction(ctx, particle) {
		// Line
		/*ctx.save();
		ctx.translate(particle.x,particle.y);
		ctx.rotate(particle.rotation * cv.orion.Orion.DEG2RAD); // rotate around the start point of your line
		ctx.moveTo(0, 0);
		ctx.lineWidth = 1;
		ctx.strokeStyle = 'rgba(' + (particle.color >> 16) + ',' + (particle.color >> 8 & 0xFF) + ',' + (particle.color & 0xFF) + ',' + particle.alpha + ')';
		ctx.lineTo(200, 0);
		ctx.stroke();
		ctx.restore();*/
		
		// Square
		/*ctx.save();
		ctx.translate(particle.x,particle.y);
		ctx.rotate(particle.rotation * cv.orion.Orion.DEG2RAD);
		ctx.strokeStyle = 'rgba(' + (particle.color >> 16) + ',' + (particle.color >> 8 & 0xFF) + ',' + (particle.color & 0xFF) + ',' + particle.alpha + ')';
		ctx.strokeRect(0, 0, 50, 50);
		ctx.restore();*/
		
		// Pixel
		ctx.fillStyle = 'rgba(' + (particle.color >> 16) + ',' + (particle.color >> 8 & 0xFF) + ',' + (particle.color & 0xFF) + ',' + particle.alpha + ')'; // alpha / 255
		ctx.fillRect(particle.x, particle.y, 1, 1);
	}
	
	this._canvas = canvas;
	this._shapeFunction = shapeFunction || defaultShapeFunction;
	this._particles = this.createParticle();
};

// Extend
cv.OrionCanvas.prototype = Object.create(cv.orion.Orion.prototype);
cv.OrionCanvas.constructor = cv.OrionCanvas;
cv.OrionCanvas.constructor.name = 'cv.OrionCanvas';

//--------------------------------------
//  Methods
//--------------------------------------

cv.OrionCanvas.prototype.render = function(e) {
	
	if (this.paused) return;
	
	var ctx = this._canvas.getContext("2d"),
		lifeSpan = this.settings.lifeSpan,
		particle = this._particles,
		numEmit = this._emitQueue.length - 1,
		numAdd = this.output.getOutput(this),
		length = 0,
		curTime = cv.orion.Orion.time,
		i = null,
		x = null,
		y = null;
	
	// Apply pre filters
	if ((i = this.preRenderFilters.length)) {
		while (--i > -1) {
			this.preRenderFilters[i].applyFilter(ctx, this._canvas);
		}
	} else {
		ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
	}
	
	// Process particles
	do {
		if (particle.active) {
			// Too old
			if (lifeSpan) {
				if ((curTime - particle.timeStamp) > lifeSpan) {
					this.removeParticle(particle);
					continue;
				}
			}
			
			// Count particles
			++length;
			
			if (!particle.paused) {
				// Apply Filters
				if ((i = this.effectFilters.length)) {
					while (--i > -1) {
						this.effectFilters[i].applyFilter(particle, this);
					}
				}
				
				// Position particle
				if (particle.velocityX !== 0) particle.x += particle.velocityX;
				if (particle.velocityY !== 0) particle.y += particle.velocityY;
				
				if (this.edgeFilter) this.edgeFilter.applyFilter(particle, this);
			}
			
			// Draw only within canvas
			//x = Math.round(particle.x), y = Math.round(particle.y);
			x = ((particle.x + 0.5) | 0);
			y = ((particle.y + 0.5) | 0); // bitshift Math.round()
			if (0 <= y && y <= this._canvas.height) {
				if (0 <= x && x <= this._canvas.width) {
					this._shapeFunction(ctx, particle);
				} else {
					//this.removeParticle(particle);
				}
			} else {
				//this.removeParticle(particle);
			}
			
		} else if (numAdd) {
			// Add new
			if (this.addParticle(particle)) --numAdd;
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
	
	// Apply post filters
	if ((i = this.postRenderFilters.length)) {
		while (--i > -1) {
			this.postRenderFilters[i].applyFilter(ctx, this._canvas);
		}
	}
	
	// Draw debug boxes for emitter and canvas
	if (this.debug) {
		ctx.lineWidth = 1;
		
		// Emitter
		ctx.beginPath();
		ctx.strokeStyle = '#00FF00';
		ctx.strokeRect(this.x, this.y, this.width, this.height);
		ctx.moveTo(this.x, this.y);
		ctx.lineTo(this.x, this.y);
		ctx.lineTo(this.x + this.width, this.y + this.height);
		ctx.moveTo(this.x + this.width, this.y);
		ctx.lineTo(this.x + this.width, this.y);
		ctx.lineTo(this.x, this.y + this.height);
		
		// Canvas
		ctx.strokeStyle = '#FF0000';
		ctx.strokeRect(0, 0, this._canvas.width, this._canvas.height);
	}
	
	this._numParticles = length;
};

//--------------------------------------
//  Private
//--------------------------------------

cv.OrionCanvas.prototype.additionalInit = function(p, pt) {
	// Update position
	p.x = this._mtx.tx;
	p.y = this._mtx.ty;
	p.color = 0xFFFFFF;
};