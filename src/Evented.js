var Engine = Engine || {};

Engine.Evented = Class.extend({
    className: "Evented",

    /**
     * Adds a listener to a specific event that triggers a callback
     * @param {string} event name of the event that triggers callback
     * @param {function} callback function to be called when event occurs
     * @param {object=} target optional context for callback
     * @methodOf Engine.Evented
     */
    bind: function( event, callback, target ) {

        // If the callback arg is function name, get the function from the target
        if (_.isString( callback )) {
            callback = target[ callback ];
        }

        /**
         * Callbacks to events triggered by this object
         * key: event name, value: array of [context, callback] pairs
         * @type {object}
         */
        this.listeners = this.listeners || {};

        // Add listener for event to list of listeners
        this.listeners[ event ] = this.listeners[ event ] || [];
        this.listeners[ event ].push([ target || this, callback ]);

        // If there is a target, add a reference to this object,
        // along with the event name and callback, to the target
        if (target) {
            if (!target.binds) {
                target.binds = [];
            }
            target.binds.push([ this, event, callback ]);
        }
    },

    /**
     * Invokes callbacks to the specified event
     * @param {string} event name of the event to trigger
     * @param {*} data arguments to the callback
     */
    trigger: function( event, data ) {

        // If there are listeners to the specified event
        if (this.listeners && this.listeners[ event ]) {

            // Invoke each callback with the specified context
            for (var i = 0, len = this.listeners[event ].length; i < len; i++) {
                var listener = this.listeners[ event ][ i ];
                listener[ 1 ].call( listener[ 0 ], data );
            }
        }
    },

    /**
     * Removes listeners to this object's events as specified by parameters
     * @param {string} event name of event
     * @param {object=} target context for callback. If not specified, all listeners to event are removed
     * @param {function=} callback function triggered when event is fired
     */
    unbind: function( event, target, callback ) {

        // If target is not specified, delete all listeners to the specified event
        if (!target) {
            if (this.listeners[ event ]) {
                delete this.listeners[ event ];
            }

        // Otherwise remove listeners to the event with the specified target and callback if specified
        } else {
            var l = this.listeners && this.listeners[ event ];
            if ( l ) {
                for (var i = l.length - 1; i >= 0; i--) {
                    if (l[ i ][ 0 ] === target) {
                        if (!callback || callback === l[ i ][ 1 ]) {
                            this.listeners[ event ].splice( i, 1 );
                        }
                    }
                }
            }
        }
    },

    /**
     * Use when deleting an object to remove its listeners from other objects
     */
    debind: function() {
        if (this.binds) {
            for (var i = 0, len = this.binds.length; i < len; i++) {
                var boundEvent = this.binds[ i ],
                    source = boundEvent[ 0 ],
                    event = boundEvent[ 1 ];
                source.unbind( event, this );
            }
        }
    }
});