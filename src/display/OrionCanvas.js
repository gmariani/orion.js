/* global Orion */
/*jshint esversion: 6 */

const OrionCanvas = (function () {
	if (!Orion) throw Error('OrionCanvas requires the Orion library');
	
	const getDebugFunc = function(orion) {
		return function() {
			orion.canvasContext.lineWidth = 1;

			// Emitter
			orion.canvasContext.beginPath();
			orion.canvasContext.strokeStyle = '#00FF00';
			orion.canvasContext.strokeRect(orion.x, orion.y, orion.width, orion.height);
			orion.canvasContext.moveTo(orion.x, orion.y);
			orion.canvasContext.lineTo(orion.x, orion.y);
			orion.canvasContext.lineTo(orion.x + orion.width, orion.y + orion.height);
			orion.canvasContext.moveTo(orion.x + orion.width, orion.y);
			orion.canvasContext.lineTo(orion.x + orion.width, orion.y);
			orion.canvasContext.lineTo(orion.x, orion.y + orion.height);

			// Render Target (canvas)
			orion.canvasContext.strokeStyle = '#FF0000';
			orion.canvasContext.strokeRect(0, 0, orion.renderTarget.width, orion.renderTarget.height);
		};
	};
	
	const createInstance = function(canvas, particleFunc, config) {
		const orion = Orion.createOrion(config);
		orion.renderTarget = canvas;
		orion.canvasContext = canvas.getContext("2d");
		orion.renderParticle = particleFunc || Orion.drawPixel;
		orion.particles = Orion.createParticle();
		orion.renderDebug = getDebugFunc(orion);
		return orion;
	};

	return { createInstance:createInstance };
})();