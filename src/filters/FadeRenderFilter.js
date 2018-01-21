var cv = cv || {};
cv.orion = cv.orion || {};
cv.orion.filters = cv.orion.filters || {};

cv.orion.filters.FadeRenderFilter = function(value) {
	this._alpha = isNaN(value) ? 0.05 : value;
};

cv.orion.filters.FadeRenderFilter.prototype = {

	//--------------------------------------
	//  Methods
	//--------------------------------------

	applyFilter: function(orion) {
		orion.canvasContext.globalAlpha = this._alpha;
		orion.canvasContext.globalCompositeOperation = "destination-out";  // fade out destination pixels
		orion.canvasContext.fillRect(0, 0, orion.renderTarget.width, orion.renderTarget.height);
		orion.canvasContext.globalCompositeOperation = "source-over";
		orion.canvasContext.globalAlpha = 1;
	}
};