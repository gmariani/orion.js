/* global window, requestAnimationFrame, document, require */
/*jshint esversion: 6 */

/*
APIs Used
= requestAnimationFrame =
Chrome 10+
Firefox 4+
IE 10+
Opera 15+
Safari 6+

= Page Visibility =
Chrome 13+
Firefox 18+
IE 10+
Opera 12.10+
Safari 7+

= Array.isArray =
Chrome 5+
Edge Yes
Firefox 4+
IE 9+
Opera 10.5+
Safari 5+

= Array.forEach =
Chrome Yes
Edge Yes
Firefox 1.5+
IE 9+
Opera Yes
Safari Yes

*/

const Draw = require('lib/draw');
const Math = require('lib/math');
const Geom = require('lib/geometry');
const Color = require('lib/color');

//--------------------------------------
//  Utility Functions
//--------------------------------------

// requestAnimationFrame API
// https://gist.github.com/paulirish/1579671
const cancelAnimationFrame =
    window.cancelAnimationFrame ||
    function(id) {
        window.clearTimeout(id);
    };

const requestAnimationFrame =
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function(callback) {
        return window.setTimeout(callback, 1000 / 30);
    };

// Page Visibility API
// Opera 12.10 and Firefox 18 and later support
const visibilityHidden =
    'msHidden' in document
        ? 'msHidden'
        : 'webkitHidden' in document ? 'webkitHidden' : 'hidden';
const visibilityChange =
    'msHidden' in document
        ? 'msvisibilitychange'
        : 'webkitHidden' in document
          ? 'webkitvisibilitychange'
          : 'visibilitychange';

module.exports = {
    counter: counter,
    increment: increment,
    decrement: decrement,
};
