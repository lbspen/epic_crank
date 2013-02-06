var Engine = Engine || {};

Engine = (function() {

    // Statics
    var _currentInstance = null;
    //var _instanceIdentifier = 0;
    GetCurrentInstance = function() {
        return _currentInstance;
    };

    /**
     * Registers components
     * @param {string} name component name
     * @param {object} methods name/function pairs for the component
     */
    register = function ( name, methods ) {
        methods.name = name;
        this.components[ name ] = Engine.Component.extend(methods);
    };

    /**
     * Add methods to this Engine
     * @param {object} obj contains methods to add to this Engine
     * @return {Engine}
     */
    extend = function( obj ) {
        _(this).extend( obj );
        return this;
    };

    /**
     * Adds a module to this Engine
     * @param module Array or comma separated list of module names to add
     * @return {Engine}
     */
    include = function( module ) {
        var engine = this,
            moduleArray = engine._normalizeArg( module );
        _.each( moduleArray, function( m ) {
            m = Engine[ m ] || m;
            m.apply( engine );
        });
        return this;
    };

    /**
     * Initializes DOM element for drawing
     * @param {string|jQuery=} id Either the element id or jQuery element of the drawing object
     * @param {object=} options Specifies numeric values for maxWidth, maxHeight, boolean for maximize
     * @return {Engine}
     */
    setup = function( id, options ) {

        options = options || {};
        id = id || "engine";

        /**
         * DOM element to draw on
         * @type {*}
         */
        this.$el = $(_.isString( id ) ? "#" + id : id);

        // Create canvas if no id was passed in
        if (this.$el.length === 0) {
            this.$el = $("<canvas width='320' height='420'></canvas>")
                .attr( 'id', id ).appendTo("body");
        }

        var maxWidth = options.maxWidth || 5000,
            maxHeight = options.maxHeight || 5000;

        if (options.maximize) {
            $("html, body").css({ padding: 0, margin: 0 });
            var w = Math.min( window.innerWidth, maxWidth );
            var h = Math.min( window.innerHeight - 5, maxHeight );
        }

        this.$el.css({ width: w, height: h })
            .attr({ width: w, height: h });

        //noinspection JSUnusedGlobalSymbols
        /**
         * Div that surrounds the drawing object. Will have id of
         * param id + "_container"
         * @type {jQuery}
         */
        this.$wrapper = this.$el
            .wrap("<div id='" + id + "_container'/>")
            .parent()
            .css({ width: this.$el.width(),
                   margin: '0 auto' });

        this.$el.css('position', 'relative');

        /**
         * 2d context
         * @type {CanvasRenderingContext2D}
         */
        this.ctx = this.$el[ 0 ].getContext &&
            this.$el[ 0 ].getContext( '2d' );

        /**
         * Width of the drawing object
         * @type {Number}
         */
        this.width = parseInt( this.$el.attr( 'width' ), 10 );

        /**
         * Height of the drawing object
         * @type {Number}
         */
        this.height = parseInt( this.$el.attr('height'), 10 );

        return this;
    };

    /**
     * Clears the entire drawing object
     */
    clear = function() {
        this.ctx.clearRect( 0, 0, this.$el[0].width, this.$el[0].height );
    };

    /**
     * Accessor
     * @return {CanvasRenderingContext2D}
     */
    getCanvas = function() {
        return this.ctx;
    };

    /**
     * @constructor
     * @return {*}
     */
    var engineDefinition = function( options ) {

        if( !(this instanceof Engine) ) {
            return new Engine();
        }

        /**
         * Extendable configuration options
         * @type {Object} defaults include imagePath, audioPath, audioSupported and sound
         */
        this.options = {
            imagePath: "images/",
            audioPath: "audio/",
            dataPath: "data/",
            audioSupported: [ 'mp3', 'ogg' ],
            sound: true
        };

        // Extend the default options with any in the options param
        if (options) { _(this.options).extend( options ); }

        /**
         * Name/Object pairs for each registered component
         * @type {Object}
         */
        this.components = {};

        /**
         * String/boolean pairs. The key is the name of an action and the boolean is true
         * if the action is active.
         * @type {Object}
         */
        this.currentInputs = {};

        /**
         * String/Object pairs. The key is the name of the asset and the Object is the asset object
         * @type {Object}
         */
        this.assets = {};

        // Support for multiple inheritence
//        _instanceIdentifier += 1;
//        this._instanceID = _instanceIdentifier;
        _currentInstance = this;
    };

    engineDefinition.prototype = {
        constructor: Engine,
        version: "1.0",

        // public interface
        extend: extend,
        include: include,
        register: register,
        setup: setup,
        clear: clear,
        getCanvas: getCanvas
    };

    // Static method on Engine
    engineDefinition.GetCurrentInstance = GetCurrentInstance;

    return engineDefinition;
}());

/**
*
* @param {function(number)} callback
*/
Engine.prototype.setGameLoop = function( callback ) {

    var that = this;

    /**
     * Closure for game loop callback
     * @param {number} now current time
     */
    that.gameLoopCallbackWrapper = function( now ) {

        /**
         * long integer value that identifies entry in callback list (requestAnimationFrame)
         * @memberOf Engine
         * @type {number}
         */
        Engine.loop = requestAnimationFrame( that.gameLoopCallbackWrapper );

        if (that.lastGameLoopFrame) {
            var dt = now - that.lastGameLoopFrame;
            if (dt > 100) { dt = 100; }
            callback.apply( that, [dt / 1000] );
        }

        /**
         * time of last frame
         * @type {number}
         * @memberOf Engine
         */
        that.lastGameLoopFrame = now;
    };

    requestAnimationFrame( this.gameLoopCallbackWrapper );
};

/**
*
*/
Engine.prototype.pauseGame = function() {
    if (Engine.loop) {
        cancelAnimationFrame( Engine.loop );
    }
    Engine.loop = null;
};

/**
* Ensures that the parameter is an array
* @param arg can be a string containing comma separated tokens or an array
* @return {Array}
*/
Engine.prototype._normalizeArg = function( arg ) {
    if (_.isString( arg )) {
        arg = arg.replace( /\s+/g, '').split(",");
    }
    if (!_.isArray( arg )) {
        arg = [ arg ];
    }
    return arg;
};
