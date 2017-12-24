var cv = cv || {};
cv.orion = cv.orion || {};

cv.orion.SettingsVO = function() {
	this.lifeSpan = 5000;
	this.mass = 1;
	this.alpha = 1;
	this.alphaMin = 1;
	this.alphaMax = 1;
	this.velocityX = 0;
	this.velocityXMin = 0;
	this.velocityXMax = 0;
	this.velocityY = 0;
	this.velocityYMin = 0;
	this.velocityYMax = 0;
	this.velocityRotate = 0;
	this.velocityRotateMin = 0;
	this.velocityRotateMax = 0;
	this.velocityAngle = 0;
	this.velocityAngleMin = 0;
	this.velocityAngleMax = 0;
	this.rotate = 0;
	this.rotateMin = 0;
	this.rotateMax = 0;
	this.scale = 1;
	this.scaleMin = 1;
	this.scaleMax = 1;
	this.color;
	this.colorMin = 0;
	this.colorMax = 0;
	this.selectRandomFrame = false;
	this.numberOfParticles = 1;
}