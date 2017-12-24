var cv = cv || {};
cv.orion = cv.orion || {};
cv.orion.filters = cv.orion.filters || {};

cv.orion.filters.GravityFilter = function(value) {
	this._gravity = isNaN(value) ? 0.3 : value;
};

cv.orion.filters.GravityFilter.prototype = {

	//--------------------------------------
	//  Methods
	//--------------------------------------

	applyFilter: function(particle, target) {
		if (particle.mass === 0) return;
		particle.velocityY += this._gravity / particle.mass;
	}
};