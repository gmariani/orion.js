/* global module */

/**
 * Returns a color between two number at a given progression point.
 *
 * @param {Number} fromColor The color to transition from
 * @param {Number} toColor The color to transition to
 * @param {Number} progress The ratio between the two number from 0-1
 * @returns {Number} The color between the two colors
 */
const interpolate = function(fromColor, toColor, progress) {
    const n = 1 - progress; // Inverse
    return (
        (Math.round(
            ((fromColor >>> 24) & 255) * progress + ((toColor >>> 24) & 255) * n
        ) <<
            24) | // alpha
        (Math.round(
            ((fromColor >>> 16) & 255) * progress + ((toColor >>> 16) & 255) * n
        ) <<
            16) | // red
        (Math.round(
            ((fromColor >>> 8) & 255) * progress + ((toColor >>> 8) & 255) * n
        ) <<
            8) | // green
        Math.round((fromColor & 255) * progress + (toColor & 255) * n)
    ); // blue
};

module.exports = {
    interpolate,
};
