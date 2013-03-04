

$(function() {
    var engine = new Engine()
        .include('Input, Sprites, Scenes, Animation, PackedSprites, Platformer, EndlessPlatformer, Physics');

    engine.setup("engine", { maximize: true, maxHeight: 1000, maxWidth: 800 });
    engine.inputSystem.keyboardControls();

    Engine.Player = Engine.Sprite.extend({
        className: "Player",
        init: function( properties ) {
            this._super(_(properties).extend({
                sheet: 'backpackClimber',
                sprite: 'player',
                rate: 1/15,
                speed: 100,
                xOffset: 0,
                yOffset: -150,
                shape: 'block'
            }));
            this.add('animation');
            this.bind( 'animLoop.climb', function() {
                console.log('up');
            }, this);

            this.add( 'physics' );
            this.curHorizVelocity = { x: 0, y: 0 };
            this.HORIZ_VELOCITY = 50;
            this.VERT_VELOCITY = -100;
            this.STRAIGHT_UP_VELOCITY = { x: 0, y: this.VERT_VELOCITY };
            this.RIGHT_UP_VELOCITY = { x: this.HORIZ_VELOCITY, y: this.VERT_VELOCITY };
            this.LEFT_UP_VELOCITY = { x: -this.HORIZ_VELOCITY, y: this.VERT_VELOCITY };
        },

        step: function( dt ) {
            this.play( 'climb' );

            if (engine.currentInputs[ 'right' ]) {
                if (this.curHorizVelocity !== this.RIGHT_UP_VELOCITY) {
                    this.curHorizVelocity = this.RIGHT_UP_VELOCITY;
                    this.physics.setVelocity( this.RIGHT_UP_VELOCITY );
                }
            } else if (engine.currentInputs[ 'left' ]) {
                if (this.curHorizVelocity !== this.LEFT_UP_VELOCITY) {
                    this.curHorizVelocity = this.LEFT_UP_VELOCITY;
                    this.physics.setVelocity( this.LEFT_UP_VELOCITY );
                }
            } else {
                if (this.curHorizVelocity !== this.STRAIGHT_UP_VELOCITY) {
                    this.curHorizVelocity = this.STRAIGHT_UP_VELOCITY;
                    this.physics.setVelocity( this.STRAIGHT_UP_VELOCITY );
                }
            }
            this._super( dt );
        }
    });

    engine.addScene('level', new Engine.Scene( function( stage ) {
        stage.add( 'world' );

        var player = stage.insertItem( new Engine.Player({ x: 0, y: 0, z:2 })),
            engine = Engine.GetCurrentInstance(),
            sheet = engine.getSheet( 'building' );

        stage.insertItem( new Engine.EndlessTileLayer({
                sheet: 'building',
                x: -525, y: -900,
                tileW: sheet.tilew, tileH: sheet.tileh,
                scale: sheet.scale,
                blockTileW: 10, blockTileH: 10,
                dataAsset: 'levelb.json',
                z: 1 }));

        stage.add( 'viewport' );
        stage.follow( player );
        engine.inputSystem.bind( 'action', stage, function() {
            stage.viewport.scale = stage.viewport.scale == 1 ? 0.5 : 1;
        });

        player.physics.climb( 0, this.VERT_VELOCITY );

    }, { sort: true }));

    engine.load(['backpackClimber.png', 'backpackClimber.json', 'levelb.json',
        'building.png', 'building.json'],
        function() {
        engine.compilePackedSheets( 'backpackClimber.png', 'backpackClimber.json', 0.5 );
        engine.compilePackedSheets( 'building.png', 'building.json', 1.5 );
        engine.addAnimations( 'player', {
            climb: { frames:_.range(0, 14), rate: 1/10 },
            climb_down: { frames:_.range(13, -1, -1), rate: 1/10 },
            stand: { frames: [ 8 ], rate: 1/5 }
        });
        engine.stageScene( 'level' );
    });
});