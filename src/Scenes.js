var Engine = Engine || {};


/**
 * @class Engine.Scene
 */
Engine.Scene = Class.extend({

    className: "Scene",

    /**
     * @constructor
     * @param {Function(Engine.Stage)} sceneFunc
     * Executed when a stage is created for this scene
     * @param {Object=} options
     */
    init: function( sceneFunc, options ) {
        this.options = options || {};

        /** Executed when a stage is created for this scene
         * @type {Function(Engine.Stage)}  */
        this.sceneFunc = sceneFunc;
    }
});


/**
 * @class Engine.Stage
 */
Engine.Stage = Engine.Entity.extend({
    className: "Stage",

    defaults: {
        sort: false
    },

    /**
     * @constructor
     * @param {Engine.Scene=} scene
     */
    init: function( scene ) {

        /** @type {Engine.Scene} */
        this.scene = scene;

        /** @type {Array} */
        this.items = [];

        /** Map of item id to item @type {Object} */
        this.index = {};

        /** Temporary storage for items to be deleted  @type {Array} */
        this.removeList = [];

        if (scene) {
            this.options = _(this.defaults).clone();
            _(this.options).extend( this.scene.options );
            this.scene.sceneFunc( this );
        }

        if (this.options.sort && !_.isFunction(this.options.sort)) {
            this.options.sort = function( a, b ) { return a.properties.z - b.properties.z };
        }
    },

    /**
     * Iterates over each item in items and executes the callback
     * @param {Function} callback
     */
    each: function( callback ) {
        for (var i = 0, len = this.items.length; i < len; i++) {
            callback.call( this.items[i], arguments[1], arguments[2] );
        }
    },

    /**
     * Calls the function with the name in the param on each item in items
     * @param {String} funcName
     */
    eachInvoke: function( funcName ) {
        for (var i = 0, len = this.items.length; i < len; i++) {
            this.items[ i ][ funcName ].call(
                this.items[i], arguments[1], arguments[2]);
        }
    },

    /**
     * Returns the first item in items that returns true when it executes the
     * param function
     * @param {Function} func
     * @return {Object|Boolean}
     */
    detect: function( func ) {
        for (var i = 0, len = this.items.length; i < len; i++) {
            if (func.call( this.items[i], arguments[1], arguments[2] )) {
                return this.items[ i ];
            }
        }
        return false;
    },

    /**
     * Adds an item to items and fires 'inserted' events on this Stage and the
     * inserted item
     * @param item
     * @return {*}
     */
    insertItem: function( item ) {
        this.items.push( item );
        item.parent = this;
        if (item.properties) {
            this.index[ item.properties.id ] = item;
        }
        this.trigger( 'inserted', item );
        item.trigger( 'inserted', this );
        return item;
    },

    /**
     * Puts an item on a list of items to be removed
     * @param item
     */
    remove: function( item ) {
        this.removeList.push( item );
    },

    /**
     * Removes an item from items, calls its destroy method and removes its id
     * from the index object
     * @param item
     */
    forceRemove: function( item ) {
        var idx = _(this.items).indexOf( item );
        if (idx != -1) {
            this.items.splice( idx, 1 );
            if (item.destroy) { item.destroy(); }
            if (item.properties.id) {
                delete this.index[ item.properties.id ];
            }
            this.trigger( 'removed', item );
        }
    },

    /**
     * Sets paused flag
     */
    pause: function() {

        /** @type {Boolean} */
        this.paused = true;
    },

    /**
     * Unsets paused flag
     */
    unpause: function() {
        this.paused = false;
    },

    /**
     * Checks for collision between a sprite and the object invoking this function
     * @param {Engine.Sprite} obj
     * @param type
     * @return {Object|Boolean} Object invoking function is returned if there is
     * overlap, else false is returned
     */
    _hitTest: function( obj, type ) {
        if (obj != this) {
            var collided = (!type || this.properties.type & type) &&
                Engine.overlap(obj, this);
            return collided ? this : false;
        }
    },

    /**
     * Returns the first item that overlaps with this object, or false if none
     * overlap
     * @param {Engine.Sprite} obj
     * @param {String=} type
     * @return {Object|Boolean}
     */
    collide: function( obj, type ) {
        return this.detect( this._hitTest, obj, type );
    },

    /**
     * Calls the step function of each item in items, fires 'prestep' and 'step' events
     * and cleans up the items to be removed
     * @param {Number} dt Elapsed time
     */
    step: function( dt ) {
        if (!this.paused) {
            this.trigger( 'prestep', dt );
            this.eachInvoke( 'step', dt );
            this.trigger( 'step', dt );

            if (this.removeList.length > 0) {
                for (var i = 0, len = this.removeList.length; i < len; i++) {
                    this.forceRemove( this.removeList[ i ]);
                }
                this.removeList.length = 0;
            }
        }
    },

    /**
     * Sorts, calls the draw function of each item in items and fires 'predraw' and 'draw'
     * events.
     * @param {CanvasRenderingContext2D} ctx
     */
    draw: function( ctx ) {
        if (this.options.sort) {
            this.items.sort( this.options.sort );
        }
        this.trigger( 'predraw', ctx );
        this.eachInvoke( 'draw', ctx );
        this.trigger( 'draw', ctx );
    }
});

Engine.Scenes = function() {

    /**
     * Accessor
     * @param {String} name
     * @return {Engine.Scene}
     */
    Engine.prototype.getScene = function( name ) {
        if (!this.scenes) {

            /**
             * Contains key/value pairs where key is scene name and value is a Scene object
             * @type {Object}
             */
            this.scenes = {};
        }

        if (this.scenes[ name ]) {
            return this.scenes[ name ];
        }
    };

    /**
     * Accessor
     * @param {String} name
     * @param {Engine.Scene} sceneObj
     */
    Engine.prototype.addScene = function( name, sceneObj ) {
        if (!this.scenes) {
            this.scenes = {};
        }

        this.scenes[ name ] = sceneObj;
    };

    /**
     * Static method used for collision detection
     * @param {Engine.Sprite} o1
     * @param {Engine.Sprite} o2
     * @return {Boolean} True if Sprites are touching
     */
    Engine.overlap = function( o1, o2 ) {
        return !((o1.properties.y + o1.properties.height - 1 < o2.properties.y) ||
            (o1.properties.y > o2.properties.y + o2.properties.height - 1) ||
            (o1.properties.x + o1.properties.width - 1 < o2.properties.x ) ||
            (o1.properties.x > o2.properties.x + o2.properties.width - 1 ));
    };

    /**
     * Accessor
     * @param {Number=} num If no number provided, active stage is returned
     * @return {Engine.Stage}
     */
    Engine.prototype.getStage = function( num ) {
        if (!this.activeStage) {
            /** Number of the stage currently being drawn and stepped @type {Number} */
            this.activeStage = 0;
        }

        if (!this.stages) {
            this.stages = [];
        }
        if (num === void 0) {
            num = this.activeStage;
        }

        return this.stages[ num ];
    };

    /**
     * Creates a new Engine.Stage object for the scene param with the number provided,
     * or if no number is provided, sets it as the active stage.
     * @param {String|Engine.Scene} scene
     * @param {Number=} num Stage number
     * @param {Object=} stageClass Stage object constructor
     */
    Engine.prototype.stageScene = function( scene, num, stageClass ) {
        stageClass = stageClass || Engine.Stage;

        if (_(scene).isString()) {
            scene = this.getScene( scene );
        }

        num = num || 0;

        if (this.getStage( num )) {
            this.getStage( num ).destroy();
        }

        if (!this.stages) {
            this.stages = [];
        }

        this.stages[ num ] = new stageClass( scene );

        if (!this.loop) {
            this.setGameLoop( this.stageGameLoop );
        }
    };

    /**
     * Sets each stage active in turn, then steps and draws it
     * @param {Number} dt Elapsed time
     */
    Engine.prototype.stageGameLoop = function( dt ) {
        if (this.ctx) { this.clear(); }

        for (var i = 0, len = this.stages.length; i < len; i++) {
            this.activeStage = i;
            var stage = this.getStage();
            if (stage) {
                stage.step( dt );
                stage.draw( this.ctx );
            }
        }

        this.activeStage = 0;
    };

    /**
     * Destroys the stage with the param number
     * @param num
     */
    Engine.prototype.clearStage = function( num ) {
        if (this.stages[ num ]) {
            this.stages[ num ].destroy();
            this.stages[ num ] = null;
        }
    };

    /**
     * Destroys all stages
     */
    Engine.prototype.clearStages = function() {
        for (var i = 0, len = this.stages.length; i < len; i++) {
            if (this.getStage[ i ]) { this.stages[ i ].destroy(); }
        }
        this.stages.length = 0;
    };
};