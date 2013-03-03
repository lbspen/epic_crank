var Engine = Engine || {};

Engine.EndlessPlatformer = function() {
    Engine.EndlessTileLayer = Engine.TileLayer.extend({

        className: 'EndlessTileLayer',

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
                            sheet.draw( ctx,
                                x * p.tileW * sheet.scale,
                                y * p.tileH * sheet.scale,
                                tiles[ y ][ x ]);
                        }
                    }
                }
            }
        }
    });
};