var cv = cv || {};
cv.orion = cv.orion || {};

cv.orion.ParticleVO = function(target) {
	this.active = false;
	this.next;
	this.mass;
	this.paused;
	this.timeStamp;
	
	this.velocityX = 0;
	this.velocityY = 0;
	this.velocityZ = 0;
	
	// For Pixels Only //
	/////////////////////
	
	this.x = 0;
	this.y = 0;
	this.z = 0;
	
	// For Display Objects Only //
	//////////////////////////////
	
	this.color = 0x000000;
	this.alpha = 1;
	this.target = target;
}