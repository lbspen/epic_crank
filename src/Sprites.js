var Engine = Engine || {};

Engine.Sprites = function() {

    /**
     * Single set of like-sized frames of the same sprite.
     * @class
     */
    Engine.SpriteSheet = Class.extend({
        className: "SpriteSheet",

        /**
         * @constructor
         * @param name
         * @param {String} asset Name of the file containing the sprites
         * @param {Object} options
         *  tilew - tile width, tileh - tile height, w - sprite block width,
         *  h - sprite block height, sx - start x, sy - start y, cols - number of cols / row
         */
        init: function( name, asset, options )  {
            _.extend( this, {
                    name: name, asset: asset,
                    w: Engine.GetCurrentInstance().getAsset( asset ).width,
                    h: Engine.GetCurrentInstance().getAsset( asset).height,
                    tilew: 64, tileh: 64,
                    sx: 0, sy: 0
                }, options );

            /**
             * Number of columns in the spritesheet. It will be calculated if not provided.
             * @type {Number}
             */
            this.cols = this.cols || Math.floor( this.w / this.tilew );
        },

        /**
         * Calculates the x value in the spritesheet for the frame param
         * @param {Number} frame
         * @return {Number}
         */
        frameX: function( frame ) {
            return ( frame % this.cols ) * this.tilew + this.sx;
        },

        /**
         * Calculates the y value in the spritesheet for the frame param
         * @param {Number} frame
         * @return {Number}
         */
        frameY: function( frame ) {
            return Math.floor( frame / this.cols ) * this.tileh + this.sy;
        },

        draw: function( ctx, x, y, frame ) {
            if (!ctx) { ctx = Engine.GetCurrentInstance().ctx; }
            ctx.drawImage( Engine.GetCurrentInstance().getAsset( this.asset ),
                this.frameX( frame ), this.frameY( frame ),
                this.tilew, this.tileh,
                Math.floor( x ), Math.floor( y ),
                this.tilew, this.tileh );
        }
    });
};

/**
 * Creates and adds a SpriteSheet to the collection of SpriteSheets known to the Engine
 * @param {String} name Name of the SpriteSheet
 * @param {String=} asset Name of the file containing the sprites
 * @param {Object=} options
 *  tilew - tile width, tileh - tile height, w - sprite block width,
 *  h - sprite block height, sx - start x, sy - start y, cols - number of cols / row
 */
Engine.prototype.createSheet = function( name, asset, options ) {

    if (!this.sheets) {

        /**
         * Collection of SpriteSheets where key/value is name/SpriteSheet object
         * @type {Object}
         */
        this.sheets = {};
    }

    if (asset) {
        this.sheets[ name ] = new Engine.SpriteSheet( name, asset, options );
    }
};

/**
 * Accessor
 * @param {String} name
 * @return {Engine.SpriteSheet}
 */
Engine.prototype.getSheet = function( name ) {

    if (!this.sheets) {
        this.sheets = {};
    }
    return this.sheets[ name ];
};

/**
 * Creates a SpriteSheet object for each spritesheet in the JSON file named
 * by param spriteDataAsset
 * @param {String} imageAsset Name of the file containing the sprites
 * @param {String} spriteDataAsset Name of file containing sprite data object
 */
Engine.prototype.compileSheets = function( imageAsset, spriteDataAsset ) {
    var engine = this;
    var data = engine.getAsset( spriteDataAsset );
    _(data).each( function( spriteData, name ) {
        engine.createSheet( name, imageAsset, spriteData );
    });
};

