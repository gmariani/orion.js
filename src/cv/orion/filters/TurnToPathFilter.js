var cv = cv || {};
cv.orion = cv.orion || {};
cv.orion.filters = cv.orion.filters || {};

cv.orion.filters.TurnToPathFilter = function() { };

cv.orion.filters.TurnToPathFilter.prototype = {
	
	//--------------------------------------
	//  Methods
	//--------------------------------------
	
	// Value returned is Degrees
	applyFilter: function(particle, target) {
		particle.rotation = Math.atan2((0 - particle.velocityY), (0 - particle.velocityX)) * cv.orion.Orion.RAD2DEG;
	}
};