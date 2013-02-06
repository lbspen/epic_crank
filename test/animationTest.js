

$(function() {
    var engine = new Engine({
        dataPath: '../test/data/',
        imagePath: '../test/images/'
    }).include('Input, Sprites, Scenes, Animation');

    engine.setup("engine", { maximize: true });
    engine.inputSystem.keyboardControls();

    Engine.Player = Engine.Sprite.extend({
        className: "Player",
        init: function( properties ) {
            this._super(_(properties).extend({
                sheet: 'man',
                sprite: 'player',
                rate: 1/15,
                speed: 700
            }));
            this.add('animation');
            this.bind( 'animend.fire', this, function() {
                console.log('Fired!');
            });
            this.bind( 'animLoop.run_right', this, function() {
                console.log('right');
            });
            this.bind('animLoop.run_left', this, function() {
                console.log('left');
            });

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

    Engine.Block = Engine.Sprite.extend({
        className: "Block",
        init: function( properties ) {
            this._super(_(properties).extend({ sheet: 'woodbox' }));
        }
    });

    engine.addScene('level', new Engine.Scene( function( stage ) {
        stage.insertItem( new Engine.Block({ x: 800, y: 160, z:1 }));
        stage.insertItem( new Engine.Block({ x: 550, y: 160, z:1 }));
        stage.insertItem( new Engine.Player({ x: 100, y: 50, z:2 }));
    }, { sort: true }));

    engine.load(['animSprites.png', 'animSprites.json','background-floor.png',
    'background-wall.png'], function() {
        engine.compileSheets( 'animSprites.png', 'animSprites.json');
        engine.addAnimations( 'player', {
            run_right: { frames:_.range(7, -1, -1), rate: 1/10 },
            run_left: { frames:_.range(0, 8), rate: 1/10 },
            fire: { frames: [8, 9, 10, 8], next: 'stand', rate: 1/30 },
            stand: { frames: [8], rate: 1/5 }
        });
        engine.stageScene( 'level' );
    });
});