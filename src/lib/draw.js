/* global module */
const DEG2RAD = 0.01745329;

/**
 * Draws a single pixel based on the given particle
 *
 * @param {Object} ctx Canvas RenderingContext
 * @param {Object} particle An Orion particle
 */
const pixel = function(ctx, particle) {
    ctx.fillStyle =
        'rgba(' +
        (particle.color >> 16) +
        ',' +
        ((particle.color >> 8) & 0xff) +
        ',' +
        (particle.color & 0xff) +
        ',' +
        particle.alpha +
        ')'; // alpha / 255
    ctx.fillRect(particle.x, particle.y, 1, 1);
};

/**
 * Draws a line from origin to the particle 200px long based on the given particle
 *
 * @param {Object} ctx Canvas RenderingContext
 * @param {Object} particle An Orion particle
 */
const line = function(ctx, particle) {
    ctx.save();
    ctx.translate(particle.x, particle.y);
    ctx.rotate(particle.rotation * DEG2RAD); // rotate around the start point of your line
    ctx.moveTo(0, 0);
    ctx.lineWidth = 1;
    ctx.strokeStyle =
        'rgba(' +
        (particle.color >> 16) +
        ',' +
        ((particle.color >> 8) & 0xff) +
        ',' +
        (particle.color & 0xff) +
        ',' +
        particle.alpha +
        ')';
    ctx.lineTo(200, 0);
    ctx.stroke();
    ctx.restore();
};

/**
 * Draws a 50px * 50px square based on the given particle
 *
 * @param {Object} ctx Canvas RenderingContext
 * @param {Object} particle An Orion particle
 */
const square = function(ctx, particle) {
    ctx.save();
    ctx.translate(particle.x, particle.y);
    ctx.rotate(particle.rotation * DEG2RAD);
    ctx.strokeStyle =
        'rgba(' +
        (particle.color >> 16) +
        ',' +
        ((particle.color >> 8) & 0xff) +
        ',' +
        (particle.color & 0xff) +
        ',' +
        particle.alpha +
        ')';
    ctx.strokeRect(0, 0, 50, 50);
    ctx.restore();
};

module.exports = {
    pixel,
    line,
    square,
};
