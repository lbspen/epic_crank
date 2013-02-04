var Engine = Engine || {};

Engine.Entity = Engine.Evented.extend({

    className: "Entity",

    /**
     *
     * @param component
     * @return {Boolean} true if the component has been added to this object
     */
    has: function( component ) {
        return this[ component ] ? true : false;
    },

    /**
     * Creates components if needed and sends out notification of creation
     * @param {Array | string} components Comma separated list of component names or array of component names
     * @return {Engine.Entity}
     */
    add: function( components ) {

        // Ensure components param is an array
        components = Engine.GetCurrentInstance()._normalizeArg( components );

        // Create activeComponents if needed
        if (!this.activeComponents) {

            /**
             * List of components used by this object
             * @type {Array}
             */
            this.activeComponents = [];
        }

        // for each component in param
        for (var i = 0, len = components.length; i < len; i++) {

            // If this Entity doesn't have the component and the engine doesn't have
            // the component, create it and send out notification
            var name = components[ i ],
                comp = Engine.GetCurrentInstance().components[ name ];
            if (!this.has( name ) && comp) {
                var c = new comp( this );
                this.trigger( 'addComponent', c );
            }
        }

        return this;
    },

    /**
     * Removes components specified in param from this Entity and unhooks event listeners
     * @param components Comma separated list of component names or array of component names
     * @return {Engine.Entity}
     */
    delete: function( components ) {

        // Ensure components param is an array
        components = Engine.GetCurrentInstance()._normalizeArg( components );

        // for each component in param
        for (var i = 0, len = components.length; i < len; i++) {

            // If the component has been added to this entity,
            // send out notification and unhook listeners
            var name = components[ i ];
            if (name && this.has( name )) {
                this.trigger( 'delComponent', this[ name ]);
                this[ name ].destroy();
            }
        }

        return this;
    },

    /**
     * Removes this Entity from its parent (if any), triggers 'removed' event
     */
    destroy: function() {
        if (!this.destroyed) {
            this.debind();
            if (this.parent && this.parent.remove) {
                this.parent.remove( this );
            }
            this.trigger( 'removed' );

            /**
             * True when this Entity has been removed and event listeners unhooked
             * @type {Boolean}
             */
            this.destroyed = true;
        }
    }
});