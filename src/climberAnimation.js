

$(function() {
    var engine = new Engine()
        .include('Input, Sprites, Scenes, Animation, PackedSprites')
        .usePackedSpriteSheet();

    engine.setup("engine", { maximize: true, maxHeight: 1000, maxWidth: 800 });
    engine.inputSystem.keyboardControls();

    Engine.Player = Engine.Sprite.extend({
        className: "Player",
        init: function( properties ) {
            this._super(_(properties).extend({
                sheet: 'backpackClimber',
                sprite: 'player',
                rate: 1/15,
                speed: 700,
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
            } else {
                this.play( 'stand' );
            }
            this._super( dt );
        }
    });

    engine.addScene('level', new Engine.Scene( function( stage ) {
        var player = stage.insertItem( new Engine.Player({ x: 100, y: 50, z:2 }));
        stage.add('viewport');
        stage.follow( player );
        Engine.GetCurrentInstance().inputSystem.bind( 'action', stage, function() {
            stage.viewport.scale = stage.viewport.scale == 1 ? 0.5 : 1;
        });
    }, { sort: true }));

    engine.load(['backpackClimber.png', 'backpackClimber.json'], function() {
        engine.compileSheets( 'backpackClimber.png', 'backpackClimber.json');
        engine.addAnimations( 'player', {
            run_right: { frames:_.range(13, -1, -1), rate: 1/10 },
            climb: { frames:_.range(0, 14), rate: 1/10 },
            fire: { frames: [8, 9, 10, 8], next: 'stand', rate: 1/30 },
            stand: { frames: [8], rate: 1/5 }
        });
        engine.stageScene( 'level' );
    });
});