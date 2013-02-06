Engine = Engine || {};

/**
 * @class Engine.Animation
 */
Engine.Animation = function() {

    var AnimationComponent = {

        className: "AnimationComponent",

        added: function() {
            var p = this.entity.properties;
            p.animation = null;
            p.animationPriority = -1;
            p.animationFrame = 0;
            p.animationTime = 0;
            this.entity.bind( 'step', 'step', this );
        },

        extend: {
            play: function( name, priority ) {
                this.animation.play( name, priority );
            }
        },

        step: function( dt ) {
            var entity = this.entity,
                p = entity.properties;

            if (p.animation) {
                var anim = Engine.GetCurrentInstance().getAnimation( p.sprite, p.animation ),
                    rate = anim.rate || p.rate,
                    stepped = 0;
                p.animationTime += dt;
                if (p.animationChanged) {
                    p.animationChanged = false;
                } else {
                    p.animationTime += dt;
                    if (p.animationTime > rate) {
                        stepped = Math.floor( p.animationTime / rate );
                        p.animationTime -= stepped * rate;
                        p.animationFrame += stepped;
                    }
                }

                if (stepped > 0) {
                    if (p.animationFrame >= anim.frames.length) {
                        if (anim.loop === false || anim.next) {
                            p.animationFrame = anim.frames.length - 1;
                            entity.trigger( 'animEnd' );
                            entity.trigger( 'animEnd.' + p.animation );
                            p.animation = null;
                            p.animationPriority = -1;
                            if (anim.trigger) {
                                entity.trigger( anim.trigger, anim.triggerData );
                            }
                            if (anim.next) { this.p.ay(anim.next, anim.nextPriority); }
                            return;
                        } else {
                            entity.trigger( 'animLoop' );
                            entity.trigger( 'animLoop.' + p.animation );
                            p.animationFrame = p.animationFrame % anim.frames.length;
                        }
                    }
                    entity.trigger( 'animFrame' );
                }
                p.sheet = anim.sheet || p.sheet;
                p.frame = anim.frames[ p.animationFrame ];
            }
        },

        play: function( name, priority ) {
            var entity = this.entity,
                p = entity.properties;
            priority = priority || 0;
            if (name != p.animation && priority >= p.animationPriority) {
                p.animation = name;
                p.animationchanged = true;
                p.animationTime = 0;
                p.animationFrame = 0;
                p.animationPriority = priority;
                entity.trigger( 'anim' );
                entity.trigger( 'anim.' + p.animation);
            }
        }
    };

    this.register( 'animation', AnimationComponent );
};

/**
 * Makes a set of animations available to the sprite with the name in the sprite param
 * @param {String} sprite Name of a sprite
 * @param {Object} animations Key/value pairs where key is animation name and value is an
 * object with frames and rate properties
 */
Engine.prototype.addAnimations = function( sprite, animations ) {

    if (!this._animations) {
        this._animations = {};
    }
    if (!this._animations[ sprite ]) {
        this._animations[ sprite ] = {};
    }
    _.extend( this._animations[ sprite ], animations );
};

/**
 * Accessor
 * @param {String} sprite Name of a sprite
 * @param {String} name Name of an animation
 * @return {*}
 */
Engine.prototype.getAnimation = function( sprite, name ) {
    return this._animations[ sprite ] && this._animations[ sprite ][ name ];
};
