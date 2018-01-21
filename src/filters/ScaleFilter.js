var cv = cv || {};
cv.orion = cv.orion || {};
cv.orion.filters = cv.orion.filters || {};

cv.orion.filters.ScaleFilter = function(value) {
	this._scale = isNaN(value) ? 0.99 : value;
};

cv.orion.filters.ScaleFilter.prototype = {

	//--------------------------------------
	//  Methods
	//--------------------------------------

	applyFilter: function(particle, target) {
		particle.scaleX *= this._scale;
		particle.scaleY *= this._scale;
	}
};