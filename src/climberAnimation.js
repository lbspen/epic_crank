

$(function() {
    var engine = new Engine()
        .include('Input, Sprites, Scenes, Animation, PackedSprites, Platformer, EndlessPlatformer');

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
                yOffset: -150
            }));
            this.add('animation');
            this.bind( 'animLoop.climb', function() {
                console.log('up');
            }, this);
        },

        step: function( dt ) {
            var p = this.properties;

            if (engine.currentInputs['up']) {
                this.play('climb');
                p.y -= p.speed * dt;
            } else if (engine.currentInputs['down']) {
                this.play('climb_down');
                p.y += p.speed * dt;
            } else {
                this.play( 'stand' );
            }
            this._super( dt );
        }
    });

    engine.addScene('level', new Engine.Scene( function( stage ) {
        var player = stage.insertItem( new Engine.Player({ x: 0, y: 0, z:2 })),
            engine = Engine.GetCurrentInstance(),
            sheet = engine.getSheet( 'building' ),
            tiles = stage.insertItem( new Engine.EndlessTileLayer({
                sheet: 'building',
                x: -525, y: -900,
                tileW: sheet.tilew, tileH: sheet.tileh,
                scale: sheet.scale,
                blockTileW: 10, blockTileH: 10,
                dataAsset: 'levelb.json',
                z: 1 }));
        stage.add('viewport');
        stage.follow( player );
        engine.inputSystem.bind( 'action', stage, function() {
            stage.viewport.scale = stage.viewport.scale == 1 ? 0.5 : 1;
        });
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