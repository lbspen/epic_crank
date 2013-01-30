var Engine = Engine || {};

Engine.Component = Engine.Evented.extend({

    name: "Component",
    /**
     * Connects this Component to an Entity
     * @param {Engine.Entity} entity Component will be used by this Entity
     */
    init: function( entity ) {

        /**
         * Entity using this component
         * @type {Engine.Entity}
         */
        this.entity = entity;

        // Add any properties to the entity
        if (this.extend) _.extend( entity, this.extend );

        // Component name is a key on the Entity and added to its active components
        entity[ this.name ] = this;
        entity.activeComponents.push( this.name );

        // Call this Components added method if there is one
        if (this.added) this.added();
    },

    /**
     * Disassociates this Component from its Entity
     */
    destroy: function() {

        // Remove any component methods from the Entity
        if (this.extend) {
            var extensions = _.keys( this.extend );
            for (var i = 0, len = extensions.length; i < len; i++) {
                delete this.entity[ extensions[ i ]];
            }
        }

        // Remove this as a key on the Entity and remove from active components
        delete this.entity[ this.name ];
        var idx = this.entity.activeComponents.indexOf( this.name );
        if (idx != -1) {
            this.entity.activeComponents.splice(idx, 1);
        }

        // Unhook listeners
        this.debind();

        // Call this Component's destroyed method if there is one
        if (this.destroyed) this.destroyed();
    }
});