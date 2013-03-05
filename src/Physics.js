var Engine = Engine || {};

Engine.Physics = function() {
    var b2d = Engine.b2d = {
        World: Box2D.Dynamics.b2World,
        Vec: Box2D.Common.Math.b2Vec2,
        BodyDef: Box2D.Dynamics.b2BodyDef,
        Body: Box2D.Dynamics.b2Body,
        FixtureDef: Box2D.Dynamics.b2FixtureDef,
        Fixture: Box2D.Dynamics.b2Fixture,
        PolygonShape: Box2D.Collision.Shapes.b2PolygonShape,
        CircleShape: Box2D.Collision.Shapes.b2CircleShape,
        Listener: Box2D.Dynamics.b2ContactListener,
        DebugDraw: Box2D.Dynamics.b2DebugDraw
    };

    var defaultOptions = Engine.PhysicsDefaults = {
        gravityX: 0,
        gravityY: 9.8,
        scale: 30,
        velocityIterations: 8,
        positionIterations: 3
    };

    var WorldComponent = {
        className: "WorldComponent",

        /**
         * This method is called when this component is added to an entity
         */
        added: function() {
            this.options = _(defaultOptions).clone();
            this._gravity = new b2d.Vec( this.options.gravityX,
                this.options.gravityY );
            this._world = new b2d.World( this._gravity, true );
            _.bindAll( this, "beginContact", "endContact", "postSolve");

            this._listener = new b2d.Listener();
            this._listener.BeginContact = this.beginContact;
            this._listener.EndContact = this.endContact;
            this._listener.PostSolve = this.postSolve;
            this._world.SetContactListener( this._listener );

            this.collision = {};
            this.scale = this.options.scale;
            this.entity.bind( 'step', 'boxStep', this );
        },

        /**
         * Extracts collision data from contact and impulse params
         * and saves it in this.collision
         * @param {Box2D.Dynamics.Contacts.b2Contact} contact Contains collision info
         * @param {Box2D.Dynamics.b2ContactImpulse} impulse
         */
        setCollisionData: function( contact, impulse ) {
            this.collision[ 'a' ] = contact.GetFixtureA().GetBody().GetUserData();
            this.collision[ 'b' ] = contact.GetFixtureB().GetBody().GetUserData();
            this.collision[ 'impulse' ] = impulse;
            this.collision[ 'sprite' ] = null;
        },

        /**
         * Fires contact events on the two colliding sprites and the stage
         * @param {Box2D.Dynamics.Contacts.b2Contact} contact
         */
        beginContact: function( contact ) {
            this.setCollisionData( contact, null );
            this.collision.a.trigger( 'contact', this.collision.b );
            this.collision.b.trigger( 'contact', this.collision.a );
            this.entity.trigger( 'contact', this.collision );
        },

        /**
         * Fires endContact events on the two colliding sprites and the stage
         * @param {Box2D.Dynamics.Contacts.b2Contact} contact
         */
        endContact: function( contact ) {
            this.setCollisionData( contact, null );
            this.collision.a.trigger( 'endContact', this.collision.b );
            this.collision.b.trigger( 'endContact', this.collision.a );
            this.entity.trigger( 'endContact', this.collision );
        },

        /**
         * Fires impulse events on the two colliding sprites and the stage
         * @param {Box2D.Dynamics.Contacts.b2Contact} contact Contains collision info
         * @param {Box2D.Dynamics.b2ContactImpulse} impulse
         */
        postSolve: function( contact, impulse ) {
            this.setCollisionData( contact, impulse );
            this.collision[ 'sprite' ] = this.collision.b;
            this.collision.a.trigger( 'impulse', this.collision );
            this.collision[ 'sprite' ] = this.collision.a;
            this.collision.b.trigger( 'impulse', this.collision );
            this.entity.trigger( 'impulse', this.collision );
        },

        createBody: function( def ) {
            return this._world.CreateBody( def );
        },

        destroyBody: function( body ) {
            return this._world.DestroyBody( body );
        },

        boxStep: function( dt ) {
            if (dt > 1/20) { dt = 1/20; }
            this._world.Step( dt,
                this.options.velocityIterations,
                this.options.positionIterations );
        },

        toggleDebugDraw: function() {
            this._debugDraw = new b2d.DebugDraw();
            this._debugDraw.SetSprite( Engine.GetCurrentInstance().ctx );
            this._debugDraw.SetDrawScale( this.scale );
            this._debugDraw.SetFillAlpha( 0.5 );
            this._debugDraw.SetLineThickness( 1.0 );
            this._debugDraw.SetFlags( b2d.DebugDraw.e_shapeBit  );
            this._world.SetDebugDraw( this._debugDraw );
        }
    };

    this.register( 'world', WorldComponent );

    var entityDefaults = Engine.PhysicsEntityDefaults = {
        density: 1,
        friction: 1,
        restitution:.1
    };

    var PhysicsComponent = {

        className: 'PhysicsComponent',

        /**
         * This method is called when this component is added to an entity
         */
        added: function() {
            if (this.entity.parent) {
                this.inserted();
            } else {
                this.entity.bind( 'inserted', 'inserted', this );
            }
            this.entity.bind( 'step', 'step', this );
            this.entity.bind( 'removed', 'removed', this );
        },

        /**
         * Wakes up the associated entity and moves it so the specified coords
         * @param {number} x
         * @param {number} y
         */
        setPosition: function( x, y ) {
            var stage = this.entity.parent;
            this._body.SetAwake( true );
            this._body.SetPosition( new b2d.Vec( x / stage.world.scale,
                                            y / stage.world.scale ));
        },

        setVelocity: function( velocity ) {
            var stage = this.entity.parent;
            this._body.SetAwake( true );
            this._body.SetLinearVelocity( new b2d.Vec( velocity.x / stage.world.scale,
                velocity.y / stage.world.scale ));
        },

        climb: function( velocity ) {
            var stage = this.entity.parent,
                g = stage.world._gravity.GetNegative(),
                mass = this._body.GetMass();

            g.Multiply( mass );
            this._body.ApplyForce( g, this._body.GetLocalCenter());
            this.setVelocity( velocity );
        },

        inserted: function() {
            var entity = this.entity,
                stage = entity.parent,
                scale = stage.world.scale,
                p = entity.properties,
                def = this._def = new b2d.BodyDef,
                fixtureDef = this._fixture = new b2d.FixtureDef;

            def.position.x = p.x / scale;
            def.position.y = p.y / scale;
            def.type = p.type == 'static' ?
                b2d.Body.b2_staticBody :
                b2d.Body.b2_dynamicBody;
            def.active = true;

            this._body = stage.world.createBody( def );
            this._body.SetUserData( entity );
            fixtureDef.density = p.density || entityDefaults.density;
            fixtureDef.friction = p.friction || entityDefaults.friction;
            fixtureDef.restitution = p.restitution || entityDefaults.restitution;

            switch (p.shape) {
                case 'block':
                    fixtureDef.shape = new b2d.PolygonShape;
                    fixtureDef.shape.SetAsBox( p.width/2/scale, p.height/2/scale );
                    break;
                case 'circle':
                    fixtureDef.shape = new b2d.CircleShape( p.r/scale );
                    break;
                case 'polygon':
                    fixtureDef.shape = new b2d.PolygonShape;
                    var pointsObj = _.map( p.points, function( pt ) {
                        return { x: pt[ 0 ] / scale, y: pt[ 1 ] / scale };
                    });
                    fixtureDef.shape.SetAsArray( pointsObj, p.points.length );
                    break;
            }

            this._body.CreateFixture( fixtureDef );
            this._body._bbid = p.id;
        },

        removed: function() {
            var entity = this.entity,
                stage = entity.parent;
            stage.world.destroyBody( this._body );
        },

        step: function() {
            var p = this.entity.properties,
                stage = this.entity.parent,
                pos = this._body.GetPosition(),
                angle = this._body.GetAngle();
            p.x = pos.x * stage.world.scale;
            p.y = pos.y * stage.world.scale;
            p.angle = angle / Math.PI * 180;
            stage.world._world.DrawDebugData();
        }

};

    this.register( 'physics', PhysicsComponent );
};