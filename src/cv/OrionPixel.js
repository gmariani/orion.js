var cv = cv || {};

cv.OrionPixel = function(bitmapData, config) {
	//super(config);
	cv.orion.Orion.call(this, config);

	this._bitmapData = bitmapData;
	this._particles = new cv.orion.ParticleVO();
	
	//this.intervalID = setInterval(this.tick, 31, this);
	var t = this;
	this.intervalID = setInterval(function() { t.tick(t); }, 31);
};

cv.OrionPixel.prototype = new cv.orion.Orion();
cv.OrionPixel.constructor = cv.OrionPixel;
	
//--------------------------------------
//  Methods
//--------------------------------------

cv.OrionPixel.prototype.render = function(e) {
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
	
	// Init Buffer
	var context = this._bitmapData.getContext("2d");
	context.fillRect(0, 0, this._bitmapData.width, this._bitmapData.height);
	
	var image = context.getImageData(0, 0, this._bitmapData.width, this._bitmapData.height),
	buffer = image.data,
	bufferIndex = null,
	bufferWidth = image.width,
	bufferMin = -1,
	bufferMax = image.width * image.height * 4;
	
	// Faster to use fillRect
	//var i = bufferMax;
	//while (--i > -1) buffer[i] = 0;
	
	// Variables used in the loop
	var lifeSpan = this.settings.lifeSpan,
	particle = this._particles,
	numEmit = this._emitQueue.length - 1,
	numAdd = this.getOutput().getOutput2(this),
	length = 0,
	curTime = cv.orion.Orion.time,
	color = 0xFFFFFF,
	effectFiltersLength = this.effectFilters.length,
	_effectFilters = this.effectFilters,
	_edgeFilter = this.edgeFilter,
	x = null,
	y = null,
	j = null,
	c = null;
	
	do {
		if(particle.active) {
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
				if(effectFiltersLength) {
					i = effectFiltersLength;
					while (--i > -1) {
						_effectFilters[i].applyFilter(particle, this);
					}
				}
				
				// Position particle
				if (particle.velocityX != 0) particle.x += particle.velocityX;
				if (particle.velocityY != 0) particle.y += particle.velocityY;
				if (_edgeFilter) _edgeFilter.applyFilter(particle, this);
			}
			
			// Draw
			x = Math.round(particle.x), y = Math.round(particle.y);
			if (bufferMin < (bufferIndex = (y * bufferWidth + x) * 4) && bufferIndex < bufferMax) {
				if (bufferMin < x && x < bufferWidth) {
					buffer[bufferIndex + 0] = color >> 16;; // R
					buffer[bufferIndex + 1] = color >> 8 & 0xFF; // G
					buffer[bufferIndex + 2] = color & 0xFF; // B
					buffer[bufferIndex + 3] = 255;   // A
				} else {
					this.removeParticle(particle);
				}
			}
		} else if (numAdd) {
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
		if (particle.next == null && (numAdd || numEmit > -1)) {
			particle = particle.next = this.createParticle();
		} else {
			particle = particle.next;
		}
	} while (particle);	
	
	this._numParticles = length;
	
	//_bitmapData.lock();
	//_bitmapData.setVector(_bitmapData.rect, buffer);
	context.putImageData(image, 0, 0);
	//_bitmapData.unlock(_bitmapData.rect);
}

//--------------------------------------
//  Private
//--------------------------------------

cv.OrionPixel.prototype.additionalInit = function(p, pt) {
	// Update position
	p.x = this._mtx.tx;
	p.y = this._mtx.ty;
}