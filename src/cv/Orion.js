/* global window, requestAnimationFrame, document */
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

const Orion = (function() {
    const orionGlobal = {
            instances: [],
            VERSION: '2.1.0',
            time: 0,
        },
        DEG2RAD = 0.01745329, // Math.PI / 180
        RAD2DEG = 57.2957795, // 180 / Math.PI
        PI_D2 = 1.57079632, // Math.PI / 2
        PI_M2 = 6.28318531, // Math.PI * 2
        PI = 3.14159265, // Math.PI
        PI_42 = 0.405284735, // -4 / (Math.PI ^ 2)
        PI_4 = 1.27323954, // 4 / Math.PI
        //denormal = 1e-18,

        // requestAnimationFrame API
        // https://gist.github.com/paulirish/1579671
        cancelAnimationFrame =
            window.cancelAnimationFrame ||
            function(id) {
                window.clearTimeout(id);
            },
        requestAnimationFrame =
            window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function(callback) {
                return window.setTimeout(callback, 1000 / 30);
            },
        // Page Visibility API
        // Opera 12.10 and Firefox 18 and later support
        visibilityHidden =
            'msHidden' in document
                ? 'msHidden'
                : 'webkitHidden' in document ? 'webkitHidden' : 'hidden',
        visibilityChange =
            'msHidden' in document
                ? 'msvisibilitychange'
                : 'webkitHidden' in document
                  ? 'webkitvisibilitychange'
                  : 'visibilitychange';

    //--------------------------------------
    // Event Handlers
    //--------------------------------------

    // Native event handler
    // cannot pass Orion as argument
    const animateOrion = function(timestamp) {
        orionGlobal.time = timestamp;
        orionGlobal.instances.map(orion => {
            orion.render();
        });
        requestAnimationFrame(animateOrion);
    };

    // Native event handler
    // cannot pass Orion as argument
    const onVisibilityChange = function(event) {
        orionGlobal.instances.map(onHiddenPauseOrion);
    };

    const onHiddenPauseOrion = function(orion, index, arrOrion) {
        orion.hiddenPaused = document[visibilityHidden] ? orion.paused : null;
        orion.paused = document[visibilityHidden] ? true : orion.hiddenPaused;
    };

    document.addEventListener(visibilityChange, onVisibilityChange, false);

    //--------------------------------------
    //  Utility Functions
    //--------------------------------------

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

    /**
     * Finds a color that's between the two numbers given.
     *
     * @internal Utility function
     *
     * @param	fromColor<Number> The first color
     * @param	toColor<Number> The second color
     * @param	progress<Number> The ratio between the two colors you want returned.
     * @return The color between the two colors.
     */
    const interpolateColor = function(fromColor, toColor, progress) {
        const n = 1 - progress; // Inverse
        return (
            (Math.round(
                ((fromColor >>> 24) & 255) * progress +
                    ((toColor >>> 24) & 255) * n
            ) <<
                24) | // alpha
            (Math.round(
                ((fromColor >>> 16) & 255) * progress +
                    ((toColor >>> 16) & 255) * n
            ) <<
                16) | // red
            (Math.round(
                ((fromColor >>> 8) & 255) * progress +
                    ((toColor >>> 8) & 255) * n
            ) <<
                8) | // green
            Math.round((fromColor & 255) * progress + (toColor & 255) * n)
        ); // blue
    };

    const drawPixel = function(ctx, particle) {
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

    const drawLine = function(ctx, particle) {
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

    const drawSquare = function(ctx, particle) {
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

    //--------------------------------------
    //  Global Functions
    //--------------------------------------

    const createParticle = function(target) {
        return {
            active: false,
            next: null,
            mass: null,
            paused: null,
            timeStamp: null,

            velocityX: 0,
            velocityY: 0,
            velocityZ: 0,
            velocityAngle: 0, // velocity in direction it's moving
            velocityRotation: 0, // rotation velocity

            x: 0,
            y: 0,
            z: 0,

            rotation: 0,
            color: 0x000000,
            alpha: 1,
            scaleX: 1,
            scaleY: 1,
            target: target,
        };
    };

    const createSettings = function() {
        return {
            lifeTime: 5000,
            mass: 1,
            numberOfParticles: 1,

            alpha: 1,
            alphaMin: 1,
            alphaMax: 1,

            velocityX: 0,
            velocityXMin: 0,
            velocityXMax: 0,

            velocityY: 0,
            velocityYMin: 0,
            velocityYMax: 0,

            velocityZ: 0,
            velocityZMin: 0,
            velocityZMax: 0,

            // 3D -Axis
            velocityRotate: 0,
            velocityRotateMin: 0,
            velocityRotateMax: 0,

            // 2D -Axis
            velocityAngle: 0,
            velocityAngleMin: 0,
            velocityAngleMax: 0,

            rotate: 0,
            rotateMin: 0,
            rotateMax: 0,

            scale: 1,
            scaleMin: 1,
            scaleMax: 1,

            color: null,
            colorMin: 0,
            colorMax: 0,
        };
    };

    const createOrion = function(config = {}) {
        orionGlobal.instances.push({
            // Model
            width: 0,
            height: 0,
            x: 0,
            y: 0,
            emitQueue: [],
            renderTarget: null,
            particles: null,
            hiddenPaused: false,
            willTriggerFlags: 0, // this used anywhere?
            emit: getEmitParticlesFunc(this), // function
            render: getRenderFunc(this), // function
            play: getPlayFunc(this), // function
            pause: getPauseFunc(this), // function
            renderDebug: getDebugFunc(this), // function
            renderParticle: function() {}, // function
            getCoordinate: getCoordinateFunc(this), // function

            // Settings
            debug: 'debug' in config ? config.debug : false,
            edgeFilter: 'edgeFilter' in config ? config.edgeFilter : null,
            effectFilters:
                'effectFilters' in config ? config.effectFilters : [],
            preRenderFilters:
                'preRenderFilters' in config ? config.preRenderFilters : [],
            postRenderFilters:
                'postRenderFilters' in config ? config.postRenderFilters : [],
            settings: 'settings' in config ? config.settings : createSettings(),
            particleCount: 'particleCount' in config ? config.particleCount : 0,
            paused: 'paused' in config ? config.paused : false,
            output: 'output' in config ? config.output : getOutputFunc(this), // function
        });
        return orionGlobal.instances[orionGlobal.instances.length];
    };

    // Adjust velocity to point at specified angle
    const directVelocity = function(particle, angleDegree) {
        const angleRadian = clamp(angleDegree * DEG2RAD, -PI, PI);
        const sinRadian = Math.sin(angleRadian);
        const cosRadian = Math.cos(angleRadian);
        const prevX = particle.velocityX;
        particle.velocityX =
            particle.velocityX * cosRadian - particle.velocityY * sinRadian;
        particle.velocityY = particle.velocityY * cosRadian + prevX * sinRadian;
    };

    const getPropertyValue = function(val) {
        return Array.isArray(val) ? randomRange(val[0], val[1]) : val;
    };

    const getColorValue = function(val) {
        return Array.isArray(val)
            ? interpolateColor(val[0], val[1], Math.random())
            : val;
    };

    /**
     * Adds a new particle to the system. Before creating a new particle, it will check the
     * recycle bin of old particles to see if it can match the particle requested. If so, it
     * will re-use an old particle rather than create a new one as this is quicker on the
     * player.
     *
     * @param	pt The point to position the particle at.
     * @default null (getCoordinate)
     *
     * @param	c The class to be used for the particle.
     * @default null (spriteClass)
     */
    const addParticle = function(orion, particle, point) {
        point = point || orion.getCoordinate();

        if (point) {
            particle.x = point.x;
            particle.y = point.y;
            particle.z = point.z;

            particle.active = true;
            // particle.next
            particle.mass = orion.settings.mass;
            particle.paused = false;
            particle.timeStamp = orionGlobal.time;

            particle.velocityX = getPropertyValue(orion.settings.velocityX);
            particle.velocityY = getPropertyValue(orion.settings.velocityY);
            //particle.velocityZ 		= getPropertyValue(orion.settings.velocityZ);
            particle.velocityAngle = getPropertyValue(
                orion.settings.velocityAngle
            );
            directVelocity(particle, particle.velocityAngle);

            particle.velocityRotation = getPropertyValue(
                orion.settings.velocityRotation
            );
            particle.rotation = getPropertyValue(orion.settings.rotation);
            particle.color = getColorValue(orion.settings.color);
            particle.alpha = getPropertyValue(orion.settings.alpha);
            particle.scaleX = getPropertyValue(orion.settings.scaleX);
            particle.scaleY = getPropertyValue(orion.settings.scaleY);

            // Any custom changes to particle after initialization
            orion.initParticle(particle);

            return true;
        }

        return false;
    };

    const removeParticle = function(particle) {
        particle.active = false;
    };

    const isParticleExpired = function(particle, timeStamp, lifeTime) {
        return lifeTime > 0 && timeStamp - particle.timeStamp > lifeTime
            ? true
            : false;
    };

    // https://jsperf.com/round-vs-bitshift/2
    // bitwise is faster only on Edge 14
    // Firefox and chrome the difference is neglible
    const isParticleInBounds = function(bounds, particle) {
        const x = Math.round(particle.x); // ((particle.x + 0.5) | 0);
        const y = Math.round(particle.y); // ((particle.y + 0.5) | 0);
        return 0 <= y && y <= bounds.height && (0 <= x && x <= bounds.width);
    };

    const applyFilters = function(orion, target, filters) {
        filters.map(filter => filter.applyFilter(orion, target));
    };

    //--------------------------------------
    //  Instance Functions
    //--------------------------------------

    /**
     * Returns a coordinate it's designated position.
     *
     * @return Returns a coordinate at the emitters x,y position or within it.
     */
    const getCoordinateFunc = function(orion) {
        return function() {
            return {
                x: randomRange(orion.x, orion.x + orion.width),
                y: randomRange(orion.y, orion.y + orion.height),
                z: 0,
            };
        };
    };

    // Override this based on the rendering layer (canvas, html, svg)
    const getDebugFunc = function(orion) {
        return function() {};
    };

    /**
     * Used to force a particle to emit at a specified location
     *
     * @param	coord
     * @param	numParticles
     */
    const getEmitParticlesFunc = function(orion) {
        return function(coord, numParticles) {
            numParticles = numParticles === null ? 1 : parseInt(numParticles);
            orion.emitQueue.push({ coord: coord, amount: numParticles });
        };
    };

    /**
     * This acts as a fake output update function for use by the Update
     * and Destroy emitters.
     *
     * @param	emitter The emitter to be used.
     */
    const getOutputFunc = function(orion) {
        return function() {
            return orion.settings.numberOfParticles;
        };
    };

    /**
     * Pauses the particle system
     */
    const getPauseFunc = function(orion) {
        return function() {
            orion.paused = true;
        };
    };

    /**
     * Resumes or plays the particle system
     */
    const getPlayFunc = function(orion) {
        return function() {
            orion.paused = false;
        };
    };

    const getRemoveParticlesFunc = function(orion) {
        return function(particle) {
            particle = particle || orion.particles;

            // Stop any particles already being displayed
            removeParticle(particle);

            // Reset orion.particles to createParticle() to free up memory?
            return particle.next ? arguments.callee(particle.next) : true;
        };
    };

    const getRenderFunc = function(orion) {
        return function() {
            if (orion.paused) return;

            const lifeTime = orion.settings.lifeTime;
            const curTime = orionGlobal.time;
            const particle = orion.particles;
            let addParticleCount = orion.output(),
                emitParticleCount = orion.emitQueue.length - 1,
                length = 0;

            // Apply pre filters
            applyFilters(orion, orion, orion.preRenderFilters);
            /*if ((i = orion.preRenderFilters.length)) {
				while (--i > -1) {
					orion.preRenderFilters[i].applyFilter(ctx, orion.canvas);
				}
			} else {
				ctx.clearRect(0, 0, orion.canvas.width, orion.canvas.height);
			}*/

            do {
                if (particle.active) {
                    if (isParticleExpired(particle, curTime, lifeTime)) {
                        removeParticle(particle);
                        continue;
                    }

                    // Count particles
                    ++length;

                    if (!particle.paused) {
                        applyFilters(orion, particle, orion.effectFilters);

                        // Position particle
                        if (particle.velocityX !== 0) {
                            particle.x += particle.velocityX;
                            particle.target.style.left = particle.x + 'px';
                        }
                        if (particle.velocityY !== 0) {
                            particle.y += particle.velocityY;
                            particle.target.style.top = particle.y + 'px';
                        }
                        //if (particle.velocityZ != 0) particle.target.rotation += particle.velocityZ;
                        applyFilters(orion, particle, [orion.edgeFilter]);
                    }

                    // Draw only within renderbox
                    if (isParticleInBounds(particle)) {
                        orion.renderParticle(particle);
                    }
                } else if (addParticleCount > 0) {
                    // Add new
                    if (addParticle(particle)) --addParticleCount;
                } else if (emitParticleCount >= 0) {
                    // Emit new
                    addParticle(
                        particle,
                        orion.emitQueue[emitParticleCount].coord
                    );

                    // Reduce the amount and let the loop create more particles as necessary
                    --orion.emitQueue[emitParticleCount].amount;
                    if (orion.emitQueue[emitParticleCount].amount <= 0) {
                        orion.emitQueue.pop();
                        --emitParticleCount;
                    }
                }

                // If more particles need to be emitted and the list is at the end, add more particles
                if (
                    particle.next === null &&
                    (addParticleCount || emitParticleCount > -1)
                ) {
                    particle = particle.next = createParticle();
                } else {
                    particle = particle.next;
                }
            } while (particle);

            // Apply post filters
            applyFilters(orion, orion, orion.postRenderFilters);

            // Draw debug boxes for emitter and renderbox
            if (orion.debug) orion.renderDebug();

            orion.particleCount = length;
        };
    };

    //--------------------------------------
    //  Init
    //--------------------------------------

    orionGlobal.createOrion = createOrion;
    orionGlobal.createParticle = createParticle;
    orionGlobal.interpolateColor = interpolateColor;
    orionGlobal.clamp = clamp;
    orionGlobal.randomRange = randomRange;
    orionGlobal.drawPixel = drawPixel;
    orionGlobal.drawLine = drawLine;
    orionGlobal.drawSquare = drawSquare;

    requestAnimationFrame(animateOrion);

    return orionGlobal;
})();
