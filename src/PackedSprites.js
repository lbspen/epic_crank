var Engine = Engine || {};

Engine.PackedSprites = function() {

    /**
     * Single set of like-sized frames of the same sprite.
     * @class Engine.PackedSpriteSheet
     */
    Engine.PackedSpriteSheet = Engine.SpriteSheet.extend({
        className: "PackedSpriteSheet",

        /**
         * @constructor
         * @param name
         * @param {String} asset Name of the file containing the sprites
         * @param {Object} options
         *  tilew - tile width, tileh - tile height, w - sprite block width,
         *  h - sprite block height, sx - start x, sy - start y, cols - number of cols / row
         */
        init: function( name, asset, options )  {
            var assetData = Engine.GetCurrentInstance().getAsset( asset );
            _.extend( this, {
                    name: name, asset: asset,
                    w: Engine.GetCurrentInstance().getAsset( asset ).width,
                    h: Engine.GetCurrentInstance().getAsset( asset ).height,
                    tilew: 64, tileh: 64,
                    frameArray: []
                }, options );
        },

        /**
         * Calculates the x value in the spritesheet for the frame param
         * @param {Number} frame
         * @return {Number}
         */
        frameX: function( frame ) {
            return this.frameArray[ frame ].sx;
        },

        /**
         * Calculates the y value in the spritesheet for the frame param
         * @param {Number} frame
         * @return {Number}
         */
        frameY: function( frame ) {
            return this.frameArray[ frame ].sy;
        }
    });

    /**
     * Replaces SpriteSheet with PackedSpriteSheet
     * @return {Engine}
     */
    Engine.prototype.usePackedSpriteSheet = function() {
        Engine.SpriteSheet = Engine.PackedSpriteSheet;
        Engine.prototype.createSheet = Engine.prototype.createPackedSheet;
        Engine.prototype.compileSheets = Engine.prototype.compilePackedSheets;
        return this;
    };
};

/**
 * Creates and adds a PackedSpriteSheet to the collection of PackedSpriteSheet known to the Engine
 * @param {String} name Name of the PackedSpriteSheet
 * @param {String=} asset Name of the file containing the sprites
 * @param {Object=} options
 *  tilew - tile width, tileh - tile height, w - sprite block width,
 *  h - sprite block height, sx - start x, sy - start y, cols - number of cols / row
 */
Engine.prototype.createPackedSheet = function( name, asset, options ) {

    if (!this.sheets) {

        /**
         * Collection of SpriteSheets where key/value is name/SpriteSheet object
         * @type {Object}
         */
        this.sheets = {};
    }

    if (asset) {
        this.sheets[ name ] = new Engine.PackedSpriteSheet( name, asset, options );
    }
};

/**
 * Creates a PackedSpriteSheet object for each spritesheet in the JSON file named
 * by param spriteDataAsset
 * @param {String} imageAsset Name of the file containing the sprites
 * @param {String} spriteDataAsset Name of file containing sprite data object
 */
Engine.prototype.compilePackedSheets = function( imageAsset, spriteDataAsset ) {
    var engine = this;
    var data = engine.getAsset( spriteDataAsset );
    _(data).each( function( spriteData, name ) {
        engine.createPackedSheet( name, imageAsset, spriteData );
    });
};


