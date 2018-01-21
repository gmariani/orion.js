/* global module, require */
require('lib/constants');

const clamp = function(val, min, max) {
    return Math.min(Math.max(val, min), max);
};

/**
 * Return a random number between a range of numbers
 *
 * @internal Utility function
 *
 * @param	min<Number> The minimum number in the range
 * @param	max<Number> The maximum number in the range
 * @return A random number between the two numbers given.
 */
const randomRange = function(min, max) {
    return min === max ? min : Math.random() * (max - min) + min;
};

const directVelocity = function(particle, angleDegree) {
    const angleRadian = clamp(angleDegree * DEG2RAD, -PI, PI);
    const sinRadian = Math.sin(angleRadian);
    const cosRadian = Math.cos(angleRadian);
    const prevX = particle.velocityX;
    particle.velocityX =
        particle.velocityX * cosRadian - particle.velocityY * sinRadian;
    particle.velocityY = particle.velocityY * cosRadian + prevX * sinRadian;
};

module.exports = {
    clamp,
    randomRange,
};
