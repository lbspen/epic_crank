var Engine = Engine || {};

Engine.Repeater = Engine.Sprite.extend({
    init: function( properties ) {
        this._super(_(properties).defaults({
            speedX: 1,
            speedY: 1,
            repeatY: true,
            repeatX: true
        }));
        this.properties.repeatW = this.properties.repeatW || this.properties.width;
        this.properties.repeatH = this.properties.repeatH || this.properties.height;
    },

    draw: function( ctx ) {
        var p = this.properties,
            asset = this.getAsset(),
            sheet = this.getSheet(),
            scale = this.parent.viewport.scale,
            viewX = this.parent.viewport.x,
            viewY = this.parent.viewport.y,
            offsetX = p.x + viewX * p.speedX,
            offsetY = p.y + viewY * p.speedY,
            curX, curY, startX;

        if (p.repeatX) {
            curX = Math.floor( -offsetX % p.repeatW );
            if (curX > 0) { curX -= p.repeatW; }
        } else {
            curX = p.x - viewX;
        }

        if (p.repeatY) {
            curY = Math.floor( -offsetY % p.repeatH );
            if (curY > 0) { curY -= p.repeatH; }
        } else {
            curY = p.y - viewY;
        }
        startX = curX;

        while(curY < engine.height / scale) {
            curX = startX;
            while(curX < engine.width / scale) {
                if (sheet) {
                    sheet.draw( ctx, curX + viewX, curY + viewY, p.frame );
                } else {
                    ctx.drawImage( asset, curX + viewX, curY + viewY );
                }
                curX += p.repeatW;
                if (!p.repeatX) { break; }
            }
            curY += p.repeatH;
            if (!p.repeatY) { break; }
        }
    }
});