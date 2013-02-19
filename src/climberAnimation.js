

$(function() {
    var engine = new Engine(/* {
        dataPath: '../test/data/',
        imagePath: '../test/images/'
    }*/)
        .include('Input, Sprites, Scenes, Animation, PackedSprites')
        .usePackedSpriteSheet();

    engine.setup("engine", { maximize: true });
    engine.inputSystem.keyboardControls();

    Engine.Player = Engine.Sprite.extend({
        className: "Player",
        init: function( properties ) {
            this._super(_(properties).extend({
                sheet: 'backpackClimber',
                sprite: 'player',
                rate: 1/15,
                speed: 700
            }));
            this.add('animation');
            this.bind( 'animEnd.fire', function() {
                console.log('Fired!');
            }, this);
            this.bind( 'animLoop.run_right', function() {
                console.log('right');
            }, this);
            this.bind('animLoop.run_left', function() {
                console.log('left');
            }, this);

            engine.inputSystem.bind( 'fire', 'fire', this);
        },

        fire: function() {
            this.play( 'fire', 1 );
        },

        step: function( dt ) {
            var p = this.properties;

            if (p.animation != 'fire') {
                if (engine.currentInputs['right']) {
                    this.play('run_right');
                    p.x += p.speed * dt;
                } else if (engine.currentInputs['left']) {
                    this.play('run_left');
                    p.x -= p.speed * dt;
                } else {
                    this.play( 'stand' );
                }
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
            run_left: { frames:_.range(0, 14), rate: 1/10 },
            fire: { frames: [8, 9, 10, 8], next: 'stand', rate: 1/30 },
            stand: { frames: [8], rate: 1/5 }
        });
        engine.stageScene( 'level' );
    });
});