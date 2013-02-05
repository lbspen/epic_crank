$(function() {
    var engine = new Engine({
        dataPath: '../test/data/',
        imagePath: '../test/images/'
        })
        .include('Sprites')
        .include('Input');

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
                p = this.properties;

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
            } else if (p.y > engine.height - p.height) {
                p.dy = -1;
                p.y = engine.height - p.height;
            }
        }
    });

    engine.load(['blockbreak.png', 'blockbreak.json'], function() {
        engine.compileSheets( 'blockbreak.png', 'blockbreak.json' );

        var paddle = new Engine.Paddle(),
            ball = new Engine.Ball();

        engine.setGameLoop( function( dt ) {
            engine.clear();

            paddle.step( dt );
            paddle.draw();

            ball.step( dt );
            ball.draw();
        })
    })


});