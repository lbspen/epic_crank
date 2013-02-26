var Engine = Engine || {};

Engine.Platformer = function() {
    Engine.TileLayer = Engine.Sprite.extend({

        className: 'TileLayer',
        init: function( properties ) {
            this._super(_(properties).defaults({
                tileW: 32,
                tileH: 32,
                blockTileW: 10,
                blockTileH: 10,
                type: 1
            }));

            if (this.properties.dataAsset) {
                this.load( this.properties.dataAsset );
            }

            this.blocks = [];
            this.properties.blockW = this.properties.tileW * this.properties.blockTileW;
            this.properties.blockH = this.properties.tileH * this.properties.blockTileH;
            this.colBounds = {};
            this.directions = [ 'top', 'left', 'right', 'bottom' ];
        },

        load: function( dataAsset ) {
            var data = _.isString( dataAsset )
                ? Engine.GetCurrentInstance().getAsset( dataAsset ) : dataAsset;
            this.properties.tiles = data;
            this.properties.rows = data.length;
            this.properties.cols = data[0].length;
            this.properties.width = this.properties.rows * this.properties.tileH;
            this.properties.height = this.properties.cols * this.properties.tileW;
        },

        setTile: function( x, y, tile ) {
            var p = this.properties,
                blockX = Math.floor( x / p.blockTileW ),
                blockY = Math.floor( y / p.blockTileH );

            if (blockX >= 0 && blockY >= 0 &&
                blockX < this.p.cols &&
                blockY < this.p.cols) {

                this.p.tiles[ y ][ x ] = tile;
                if (this.blocks[ blockY ]) {
                    this.blocks[ blockY ][ blockX ] = null;
                }
            }
        },

        prerenderBlock: function( blockX, blockY ) {
            var p = this.properties,
                tiles = p.tiles,
                sheet = this.sheet(),
                blockOffsetX = blockX * p.blockTileW,
                blockOffsetY = blockY * p.blockTileH;

            if (blockOffsetX < 0 || blockOffsetX >= p.cols ||
                blockOffsetY < 0 || blockOffsetY >= p.rows) {
                return;
            }

            var canvas = document.createElement( 'canvas'),
                ctx = canvas.getContext( '2d' );

            canvas.width = p.blockW;
            canvas.height = p.blockH;
            this.blocks[ blockY ] = this.blocks[ blockY ] || {};
            this.blocks[ blockY ][ blockX ] = canvas;

            for (var y = 0; y < p.blockTileH; y++) {
                if (tiles[ y + blockOffsetY ]) {
                    for (var x = 0; x < p.blockTileW; x++) {
                        if (tiles[ y + blockOffsetY ][ x + blockOffsetX ]) {
                            sheet.draw( ctx,
                                x * p.tileW,
                                y * p.tileH,
                                tiles[ y + blockOffsetY ][ x + blockOffsetX ]);
                        }
                    }
                }
            }
        },

        drawBlock: function( ctx, blockX, blockY ) {
            var p = this.properties,
                startX = Math.floor( blockX * p.blockW + p.x ),
                startY = Math.floor( blockY * p.blockH + p.h );

            if (!this.blocks[ blockY ] || !this.blocks[ blockY ][ blockX ]) {
                this.prerenderBlock( blockX, blockY );
            }

            if (this.blocks[ blockY] && this.blocks[ blockY ][ blockX ]) {
                ctx.drawImage( this.blocks[ blockY ][ blockX ], startX, startY );
            }
        },

        draw: function( ctx ) {
            if (!this.properties) {
                console.log('undefined');
            }

            var p = this.properties,
                engine = Engine.GetCurrentInstance(),
                viewport = this.parent.viewport,
                viewW = engine.width / viewport.scale,
                viewH = engine.height / viewport.scale,
                startBlockX = Math.floor(( viewport.x - p.x ) / p.blockW ),
                startBlockY = Math.floor(( viewport.y - p.y ) / p.blockH ),
                endBlockX = Math.floor(( viewport.x + viewW - p.x ) / p.blockW ),
                endBlockY = Math.floor(( viewport.y + viewH - p.y ) / p.blockH );

            for (var y = startBlockY; y <= endBlockY; y++) {
                for (var x = startBlockX; x <= endBlockX; x++) {
                    this.drawBlock( ctx, x, y );
                }
            }
        }
    });
};