var cv = cv || {};
cv.orion = cv.orion || {};
cv.orion.filters = cv.orion.filters || {};

cv.orion.filters.FadeFilter = function(value) {
	this._alpha = isNaN(value) ? 0.95 : value;
};

cv.orion.filters.FadeFilter.prototype = {

	//--------------------------------------
	//  Methods
	//--------------------------------------

	applyFilter: function(particle, target) {
		particle.alpha = particle.alpha * 1000 * this._alpha / 1000;
	}
};