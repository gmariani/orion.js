var cv = cv || {};
cv.orion = cv.orion || {};
cv.orion.filters = cv.orion.filters || {};

cv.orion.filters.BlurRenderFilter = function(value) {
	this._blur = isNaN(value) ? 1 : parseInt(value);
	if ( this._blur < 0 ) this._blur = 0;
};

cv.orion.filters.BlurRenderFilter.prototype = {

	//--------------------------------------
	//  Methods
	//--------------------------------------

	applyFilter: function(ctx, canvas) {
		ctx.filter = 'blur(' + this._blur + 'px)';
	}
};