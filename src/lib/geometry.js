/* global module */

/**
 * Creates an empty matrix object
 *
 * @requires {Object} A default matrix object
 */
const matrix = function() {
    return {
        a: 1,
        b: 0,
        c: 0,
        d: 1,
        tx: 0,
        ty: 0,
    };
};

/**
 * Creates an empty point object
 *
 * @requires {Object} A default point object
 */
const point = function() {
    return {
        x: 0,
        y: 0,
    };
};

/**
 * Creates an empty rectangle object
 *
 * @requires {Object} A default rectangle object
 */
const rectangle = function() {
    return {
        bottom: 0,
        bottomRight: 0,
        height: 0,
        left: 0,
        right: 0,
        size: 0,
        top: 0,
        topLeft: 0,
        width: 0,
        x: 0,
        y: 0,
    };
};

module.exports = {
    matrix,
    point,
    rectangle,
};
