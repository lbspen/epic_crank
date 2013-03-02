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
                    w: assetData.width,
                    h: assetData.height,
                    frameArray: []
                }, options );

            var maxTileWidth = 0, maxTileHeight = 0;

            for (var i = 0; i < this.frameArray.length; i++) {
                var curFrame = this.frameArray[i];
                if (curFrame.tilew > maxTileWidth) {
                    maxTileWidth = curFrame.tilew;
                }
                if (curFrame.tileh > maxTileHeight) {
                    maxTileHeight = curFrame.tileh;
                }
            }

            this.tilew = maxTileWidth;
            this.tileh = maxTileHeight;
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
        },

        /**
         * Accessor
         * @param {number} frame
         * @return {number}
         */
        getTilew: function( frame ) {
            return this.frameArray[ frame ].tilew;
        },

        /**
         * Accessor
         * @param frame
         * @return {number}
         */
        getTileh: function( frame ) {
            return this.frameArray[ frame ].tileh;
        },

        /**
         * Draws a particular frame at the specified canvas coords
         * @param {CanvasRenderingContext2D} ctx
         * @param {number} x Canvas coordinate
         * @param {number} y Canvas coordintate
         * @param {number} frame Animation frame number
         */
        draw: function( ctx, x, y, frame ) {
            if (!ctx) { ctx = Engine.GetCurrentInstance().ctx; }
            ctx.drawImage( Engine.GetCurrentInstance().getAsset( this.asset ),
                this.frameX( frame ), this.frameY( frame ),
                this.getTilew( frame ), this.getTileh( frame ),
                Math.floor( x ), Math.floor( y ),
                this.getTilew( frame ) * this.scale, this.getTileh( frame ) * this.scale);
        }
    });

    //noinspection JSUnusedGlobalSymbols
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
Engine.prototype.compilePackedSheets = function( imageAsset, spriteDataAsset, scale ) {
    var engine = this,
        data = engine.getAsset( spriteDataAsset),
        sheetScale = scale || 1;
    _(data).each( function( spriteData, name ) {
        spriteData.scale = sheetScale;
        engine.createPackedSheet( name, imageAsset, spriteData );
    });
};


