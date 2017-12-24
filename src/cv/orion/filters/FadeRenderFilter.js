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

	applyFilter: function(ctx, canvas) {
		ctx.globalAlpha = this._alpha;
		ctx.globalCompositeOperation = "destination-out";  // fade out destination pixels
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		ctx.globalCompositeOperation = "source-over";
		ctx.globalAlpha = 1;
	}
};