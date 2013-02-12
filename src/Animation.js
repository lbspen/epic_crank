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
                            if (anim.next) { this.play(anim.next, anim.nextPriority); }
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

    var ViewportComponent = {
        className : "ViewportComponent",

        added: function() {
            this.entity.bind( 'predraw', 'predraw', this );
            this.entity.bind( 'draw', 'postdraw', this );
            this.x = 0; this.y = 0;
            this.centerX = Engine.GetCurrentInstance().width / 2;
            this.centerY = Engine.GetCurrentInstance().height / 2;
            this.scale = 1;
        },

        extend: {
            follow: function( sprite ) {
                this.unbind( 'step', this.viewport );
                this.viewport.following = sprite;
                this.bind( 'step', 'follow', this.viewport );
                this.viewport.follow();
            },

            unfollow: function() {
                this.unbind( 'step', this.viewport );
            },

            centerOn: function( x, y ) {
                this.viewport.centerOn( x, y );
            }
        },

        follow: function() {
            this.centerOn( this.following.properties.x + this.following.properties.width / 2,
            this.following.properties.y + this.following.properties.height / 2 );
        },

        centerOn: function( x, y ) {
            this.centerX = x;
            this.centerY = y;
            this.x = this.centerX - Engine.GetCurrentInstance().width / 2 / this.scale;
            this.y = this.centerY - Engine.GetCurrentInstance().height / 2 / this.scale;
        },

        predraw: function() {
            var engine = Engine.GetCurrentInstance();
            var ctx = engine.ctx;
            ctx.save();
            ctx.translate( engine.width / 2, engine.height / 2 );
            ctx.scale( this.scale, this.scale );
            ctx.translate( - this.centerX, -this.centerY );
        },

        postdraw: function() {
            Engine.GetCurrentInstance().ctx.restore();
        }
    };

    this.register( 'viewport', ViewportComponent );
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

