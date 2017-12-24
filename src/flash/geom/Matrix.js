var flash = flash || {};
flash.geom = flash.geom || {};

flash.geom.Matrix = function() {
	this.a = 1;
	this.b = 0;
	this.c = 0;
	this.d = 1;
	this.tx = 0;
	this.ty = 0;
}