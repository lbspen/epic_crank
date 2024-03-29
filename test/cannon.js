$(function() {
    var engine = window.engine = new Engine();
    engine.include('Input,Sprites,Scenes,SVG,Physics');
    engine.svgOnly();
    engine.setup('engine', { maximize: true });

    engine.addScene('level', new Engine.Scene( function( stage ) {
        stage.insertItem( new Engine.Sprite({
            x: 100, y: 250, w: 500, h: 50, type: 'static'
        }));
        stage.insertItem( new Engine.Sprite({
            w: 30, h: 20, x: 0, y: 100
        }));
        stage.insertItem( new Engine.Sprite({
            r: 30, x: 50, y: 100, shape: 'circle'
        }));
        stage.insertItem( new Engine.Sprite({
            x: 120, y: 100, shape: 'polygon', color: 'red',
            points: [[ 0, 0 ], [ 100, 0 ], [ 120, 25 ], [50, 50 ]]
        }));

        stage.add( 'world' );
        stage.each( function() { this.add( 'physics' ); });

        stage.viewport( 400, 400 );
        stage.centerOn( 100, 200 );

        $(engine.wrapper).on('touchstart mouseup', function( e ) {
            var touch = e.originalEvent;
            if (touch.target.sprite) {
                touch.target.sprite.destroy();
            } else {
                var point = stage.browserToWorld( touch.pageX, touch.pageY );
                var box = stage.insertItem( new Engine.Sprite({
                    x: point.x, y: point.y, w: 20, h: 20
                }));
                box.add( 'physics' );
                box.bind( 'contact', function( sprite ) {
                    sprite.set({ fill: 'blue' });
                });
            }
            e.preventDefault();
        });
    }));

    engine.stageScene( 'level' );
});