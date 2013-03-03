var Engine = Engine || {};

Engine.EndlessPlatformer = function() {
    Engine.EndlessTileLayer = Engine.TileLayer.extend({

        className: 'EndlessTileLayer',
        init: function( properties ) {
            this._super(_(properties));
            Engine.lcRandom.reseed();
        },

        prerenderBlock: function( blockX, blockY ) {
            var p = this.properties,
                tiles = p.tiles,
                sheet = this.getSheet(),
                canvas = document.createElement( 'canvas'),
                ctx = canvas.getContext( '2d' );

            canvas.width = p.blockW;
            canvas.height = p.blockH;
            this.blocks[ blockY ] = this.blocks[ blockY ] || {};
            this.blocks[ blockY ][ blockX ] = canvas;

            for (var y = 0; y < p.blockTileH; y++) {
                if (tiles[ y ]) {
                    for (var x = 0; x < p.blockTileW; x++) {
                        if (tiles[ y ][ x ]) {
                            // Tile 0 - obstacle [0, .1), Tile 1 - normal - [.1, .5)
                            // Tile 2 - enemy [.5, .7), Tile 3 - normal - [.7, 1)
                            var rand = Engine.lcRandom.real(),
                                tileFrame = 3;
                            if ((0 <= rand) && (rand < .1)) { tileFrame = 0; }
                            else if ((.1 <= rand) && (rand < .5)) { tileFrame = 1; }
                            else if ((.5 <= rand) && (rand < .7)) { tileFrame = 2; }
                            sheet.draw( ctx,
                                x * p.tileW * sheet.scale,
                                y * p.tileH * sheet.scale,
                                tileFrame );
                        }
                    }
                }
            }
        }
    });
};