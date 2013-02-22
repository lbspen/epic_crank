$(function() {
    var engine = new Engine({
        dataPath: '../test/data/',
        imagePath: '../test/images/'
    })
        .include('Input, Sprites, Scenes, Animation, Platformer');

    engine.setup( 'engine', { maximize: true });
    engine.inputSystem.keyboardControls();

    engine.addScene( 'level', new Engine.Scene( function( stage ) {
        engine.compileSheets( 'sprites.png', 'sprites.json' );
        stage.insertItem( new Engine.Repeater({ asset: 'background-wall.png',
                        speedX: 0.5, y: -225, z: 0}));

        var tiles = stage.insertItem( new Engine.TileLayer({
            sheet: 'block',
            x: -100, y: -100,
            tileW: 32, tileH: 32,
            blockTileW: 10, blockTileH: 10,
            dataAsset: 'level.json',
            z: 1 }));
        stage.add( 'viewport' );
        stage.centerOn( 0, 0 );

        engine.inputSystem.bind( 'right', function() {
            stage.viewport.centerOn( stage.viewport.centerX + 64,
                stage.viewport.centerY );
        });
        engine.inputSystem.bind( 'left', function() {
            stage.viewport.centerOn( stage.viewport.centerX - 64,
                stage.viewport.centerY )
        });
    }, { sort: true }));

    engine.load([ 'background-wall.png', 'sprites.png',
        'sprites.json', 'level.json'], function() {
        engine.stageScene( 'level' );
    });
});