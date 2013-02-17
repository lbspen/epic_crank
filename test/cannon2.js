$(function() {
    var engine = window.engine = new Engine()
       .include('Input, Sprites,Scenes,SVG,Physics')
       .svgOnly();
    engine.setup('engine', { maximize: true });

    Engine.CannonBall = Engine.Sprite.extend({
       init: function( properties ) {
           this._super({
               shape: 'circle',
               color: 'red',
               r: 8,
               restitution: 0.5,
               density: 4,
               x: properties.dx * 50 + 10,
               y: properties.dy * 50 + 210,
               seconds: 5
           });
           this.add('physics');
           this.bind('step', 'countdown', this);
       },

       countdown: function( dt ) {
           this.properties.seconds -= dt;
           if (this.properties.seconds < 0) {
               this.destroy();
           } else if (this.properties.seconds < 1) {
               this.set({ 'fill-opacity': this.properties.seconds });
           }
       }
    });

    $(Engine.wrapper).on('mousemove', function( e ) {
        var stage = Engine.getStage( 0),
            cannon = stage.cannon,
            point = stage.browserToWorld( e.pageX, e.pageY),
            angle = Math.atan2( point.y - cannon.properties.y,
                point.x - cannon.properties.x );
        cannon.properties.angle = angle * 180 / Math.PI;
        e.preventDefault();
    });

    $(Engine.wrapper).on('mouseup', function( e ) {
        Engine.getStage( 0).cannon.fire();
        e.preventDefault();
    });

    engine.addScene( 'level', new Engine.Scene( function( stage ) {
        targetCount = 0;
        stage.add('world');
        stage.insertItem( new Engine.Sprite({
            x: 250, y: 250, w: 700, h: 50, type: 'static'
        }));
    }));

    engine.stageScene( 'level' );
});

