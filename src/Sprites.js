var Engine = Engine || {};

Engine.Sprites = function() {

    /**
     * Single set of like-sized frames of the same sprite.
     * @class Engine.SpriteSheet
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

/**
 * @class Engine.Sprite
 */
Engine.Sprite = Engine.Entity.extend({
    className: "Sprite",

    /**
     * @constructor
     * @param {Object} properties x, y: coordinates, z: sort order, sheet: filename,
     * asset: filename, frame: , width: pixels,
     */
    init: function( properties ) {

        // Set defaults and add properties from param
        this.properties = _({
            x: 0, y: 0, z: 0,
            frame: 0,
            type: 0
        }).extend( properties || {} );

        // If height and width are not provided in param, take them from the asset or sheet
        if (( !this.properties.width || !this.properties.height )) {
            if ( this.getAsset() ) {
                this.properties.width = this.properties.width || this.getAsset().width;
                this.properties.height = this.properties.height || this.getAsset().height;
            } else if ( this.getSheet() ) {
                this.properties.width = this.properties.width || this.getSheet().tilew;
                this.properties.height = this.properties.height || this.getSheet().tileh;
            }
        }
        this.properties.id = this.properties.id || _.uniqueId();
    },

    /**
     * Accessor
     * @return {Object} asset object
     */
    getAsset: function() {
        return Engine.GetCurrentInstance().getAsset( this.properties.asset );
    },

    /**
     * Accessor
     * @return {Engine.SpriteSheet}
     */
    getSheet: function() {
        //noinspection JSUnresolvedVariable
        return Engine.GetCurrentInstance().getSheet( this.properties.sheet );
    },

    /**
     * Draws this Entity using the param context, or if null, the Engine's context.
     * Fires the 'draw' event.
     * @param {CanvasRenderingContext2D=} ctx
     */
    draw: function( ctx ) {

        if (!ctx) { ctx = Engine.GetCurrentInstance().ctx; }

        var properties = this.properties;
        if (properties.sheet) {
            this.getSheet().draw( ctx, properties.x, properties.y,
                properties.frame );
        } else if ( properties.asset ) {
            ctx.drawImage( Engine.GetCurrentInstance().getAsset( properties.asset ),
                Math.floor( properties.x ), Math.floor( properties.y ));
        }

        this.trigger( 'draw', ctx );
    },

    /**
     * Fires a 'step' event
     * @param {Number} dt Time elapsed
     */
    step: function( dt ) {
        this.trigger( 'step', dt );
    }
});