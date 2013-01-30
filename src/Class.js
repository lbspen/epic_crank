/* Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * MIT Licensed.
    */
// Inspired by base2 and Prototype

(function() {

    //noinspection JSValidateTypes
    var initializing = false,
        fnTest = /xyz/.test( function() { xyz; })
        ? /\b_super\b/
        : /.*/;

    /**
     * Class has no properties to start with
     * @class
     */
    this.Class = function BaseClass(){};

    /**
     * Creates a subclass with the specified properties
     * @param {Object} properties list of name/function, name/object pairs
     * @return
     */
    Class.extend = function( properties ) {

        var _super = this.prototype;

        // Create class but don't initialize
        initializing = true;
        var prototype = new this();
        initializing = false;

        // Copy the properties
        for (var name in properties) {

            // Don't overwrite existing functions
            if (typeof properties[ name ] === "function" &&
                typeof _super[ name ] === "function" &&
                fnTest.test( properties[ name ] )) {

                prototype[ name ] =

                    (function( name, fn ) {
                        return function() {
                            var tmp = this._super;

                            this._super = _super[ name ];
                            var ret = fn.apply( this, arguments );
                            this._super = tmp;

                            return ret;
                        };
                    }) ( name, properties[ name ]);

            // Don't overwrite existing objects
            } else if (typeof properties[ name ] == "object" &&
                typeof _super[ name ] == "object" ) {

                prototype[ name ] = _(_super[ name ]).clone();
                _(prototype[ name ]).extend( properties[ name ] );

            } else {
                prototype[ name ] = properties[ name ];
            }
        }

        // Modify the name of the class and the constructor so that all objects
        // are not named "Class" in the debugger
        properties.name = properties.name || "ChildOf" + this.name;

        /**
         * Wrapper for init
         * @constructor
         */
        function customAction() {

            // All construction is actually done in the init method
            if ( !initializing && this.init )
                this.init.apply(this, arguments);
        }

        var func = new Function("action", "return function " +
            properties.name + "(){ action.apply(this, arguments) };")( customAction );

        // Populate our constructed prototype object
        func.prototype = prototype;
        func.prototype.constructor = func;

        // And make this class extendable
        func.extend = arguments.callee;

        return func;
    };
})();