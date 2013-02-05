$(function() {
    var engine = new Engine({
        dataPath: '../test/data/',
        imagePath: '../test/images/'
        })
        .include('Sprites')
        .include('Input')
        .include('Scenes');

    engine.setup();

    engine.inputSystem.keyboardControls();

    /**
     * @class Engine.Paddle
     */
    Engine.Paddle = Engine.Sprite.extend({
        className: "Paddle",
        init: function() {
            this._super({
                sheet: 'paddle',
                speed: 200,
                x: 0
            });
            this.properties.x = engine.width/2 - this.properties.width/2;
            this.properties.y = engine.height - this.properties.height;
        },

        step: function( dt ) {
            var engine = Engine.GetCurrentInstance();
            if ( engine.currentInputs[ 'left' ]) {
                this.properties.x -= dt * this.properties.speed;
            } else if ( engine.currentInputs[ 'right' ]) {
                this.properties.x += dt * this.properties.speed;
            }

            if ( this.properties.x <0 ) {
                this.properties.x = 0;
            } else if (this.properties.x > engine.width - this.properties.width) {
                this.properties.x = engine.width - this.properties.width;
            }
            this._super( dt );
        }
    });

    /**
     * @class Engine.Ball
     */
    Engine.Ball = Engine.Sprite.extend({
        className: "Ball",
        init: function() {
            var engine = Engine.GetCurrentInstance();
            this._super({
                sheet: 'ball',
                speed: 200,
                dx: 1, dy: -1
            });
            this.properties.y = engine.height / 2 - this.properties.height;
            this.properties.x = engine.width / 2 + this.properties.width / 2;
        },

        step: function( dt ) {
            var engine = Engine.GetCurrentInstance(),
                p = this.properties,
                hit = engine.getStage().collide( this );

            if (hit) {
                if (hit instanceof Engine.Paddle) {
                    p.dy = -1;
                } else {
                    hit.trigger('collision', this);
                }
            }

            p.x += p.dx * p.speed * dt;
            p.y += p.dy * p.speed * dt;

            if (p.x < 0) {
                p.x = 0;
                p.dx = 1;
            } else if (p.x > engine.width - p.width) {
                p.dx = -1;
                p.x = engine.width - p.width;
            }

            if (p.y < 0) {
                p.y = 0;
                p.dy = 1;
            } else if (p.y > engine.height) {
                engine.stageScene( 'game' );
            }
        }
    });

    /**
     * @class Engine.Block
     */
    Engine.Block = Engine.Sprite.extend({
        className: "Block",

        init: function( properties ) {
            this._super(_(properties).extend({ sheet: 'block' }));
            var block = this;
            this.bind('collision', function( ball ) {
                block.destroy();
                ball.properties.dy *= -1;
                Engine.GetCurrentInstance().getStage().trigger( 'removeBlock' );
            });
        }
    });

    engine.load(['blockbreak.png', 'blockbreak.json'], function() {
        engine.compileSheets( 'blockbreak.png', 'blockbreak.json' );
        engine.addScene( 'game', new Engine.Scene( function( stage ) {
            stage.insertItem( new Engine.Paddle() );
            stage.insertItem( new Engine.Ball() );

            var blockCount = 0;
            for (var x = 0; x < 6; x++) {
                for (var y = 0; y < 5; y++) {
                    stage.insertItem( new Engine.Block({
                        x: x * 50 + 10,
                        y: y * 30 + 10
                    }));
                    blockCount++;
                }
            }

            stage.bind( 'removeBlock', function() {
                blockCount--;
                if (blockCount === 0) {
                    engine.stageScene( 'game' );
                }
            })
        }));

        engine.stageScene( 'game' );
    })


});