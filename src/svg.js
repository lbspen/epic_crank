var Engine = Engine || {};

Engine.SVG = function(Q) {
    var SVG_NS ="http://www.w3.org/2000/svg";
    Engine.prototype.setupSVG = function(id,options) {
        options = options || {};
        id = id || "quintus";
        this.svg = $(_.isString(id) ? "#" + id : id)[0];
        if(!this.svg) {
            this.svg = document.createElementNS(SVG_NS,'svg');
            this.svg.setAttribute('width',320);
            this.svg.setAttribute('height',420);
            document.body.appendChild(this.svg);
        }

        if(options.maximize) {
            var w = $(window).width()-1;
            var h = $(window).height()-10;
            this.svg.setAttribute('width',w);
            this.svg.setAttribute('height',h);
        }

        this.width = this.svg.getAttribute('width');
        this.height = this.svg.getAttribute('height');
        this.wrapper = $(this.svg)
            .wrap("<div id='" + id + "_container'/>")
            .parent()
            .css({ width: this.width,
                height: this.height,
                margin: '0 auto' });

        setTimeout(function() { window.scrollTo(0,1); }, 0);
        $(window).bind('orientationchange',function() {
            setTimeout(function() { window.scrollTo(0,1); }, 0);
        });
        return this;
    };

    Engine.SVGSprite = Engine.Sprite.extend({
        className: 'SVGSprite',
        init: function(props) {
            this._super(_(props).defaults({
                shape: 'block',
                color: 'black',
                angle: 0,
                active: true,
                cx: 0,
                cy: 0
            }));
            this.createShape();
            this.svg.sprite = this;
            this.rp = {};
            this.setTransform();
        },

        set: function(attr) {
            _.each(attr,function(value,key) {
                this.svg.setAttribute(key,value);
            },this);
        },

        createShape: function() {
            var p = this.properties;
            switch(p.shape) {
                case 'block':
                    this.svg = document.createElementNS(SVG_NS,'rect');
                    _.extend(p,{ cx: p.w/2, cy: p.h/2 });
                    this.set({ width: p.w, height: p.h });
                    break;
                case 'circle':
                    this.svg = document.createElementNS(SVG_NS,'circle');
                    this.set({ r: p.r, cx: 0, cy: 0 });
                    break;
                case 'polygon':
                    this.svg = document.createElementNS(SVG_NS,'polygon');
                    var pts = _.map(p.points,
                        function(pt) {
                            return pt[0] + "," + pt[1];
                        }).join(" ");
                    this.set({ points: pts });
                    break;

            }
            this.set({ fill: p.color });
            if(p.outline) {
                this.set({
                    stroke: p.outline,
                    "stroke-width": p.outlineWidth || 1
                });
            }
        },

        setTransform: function() {
            var p = this.properties;
            var rp = this.rp;
            if(rp.x !== p.x ||
                rp.y !== p.y ||
                rp.angle !== p.angle ) {
                var transform = "translate(" + (p.x - p.cx) + "," +
                    + (p.y - p.cy) + ") " +
                    "rotate(" + p.angle +
                    "," + p.cx +
                    "," + p.cy +
                    ")";
                this.svg.setAttribute('transform',transform);
                rp.angle = p.angle;
                rp.x = p.x;
                rp.y = p.y;
            }
        },

        draw: function(ctx) {
            this.trigger('draw');
        },

        step: function(dt) {
            this.trigger('step',dt);
            this.setTransform();
        },

        destroy: function() {
            if(this.destroyed) return false;
            this._super();
            this.parent.svg.removeChild(this.svg);
        }
    });


    Engine.SVGStage = Engine.Stage.extend({
        className: 'SVGStage',
        init: function(scene) {
            var engine = Engine.GetCurrentInstance();
            this.svg = document.createElementNS(SVG_NS,'svg');
            this.svg.setAttribute('width',engine.width);
            this.svg.setAttribute('height',engine.height);
            engine.svg.appendChild(this.svg);

            this.viewBox = { x: 0, y: 0, w: engine.width, h: engine.height };
            this._super(scene);
        },

        insertItem: function(itm) {
            if(itm.svg) { this.svg.appendChild(itm.svg); }
            return this._super(itm);
        },

        destroy: function() {
            Q.svg.removeChild(this.svg);
            this._super();
        },

        viewport: function(w,h) {
            this.viewBox.w = w;
            this.viewBox.h = h;
            if(this.viewBox.cx || this.viewBox.cy) {
                this.centerOn(this.viewBox.cx,
                    this.viewBox.cy);
            } else {
                this.setViewBox();
            }
        },

        centerOn: function(x,y) {
            this.viewBox.cx = x;
            this.viewBox.cy = y;
            this.viewBox.x = x - this.viewBox.w/2;
            this.viewBox.y = y - this.viewBox.h/2;
            this.setViewBox();
        },

        setViewBox: function() {
            this.svg.setAttribute('viewBox',
                this.viewBox.x + " " + this.viewBox.y + " " +
                    this.viewBox.w + " " + this.viewBox.h);
        },

        browserToWorld: function(x,y) {
            var m = this.svg.getScreenCTM();
            var p = this.svg.createSVGPoint();
            p.x = x; p.y = y;
            return p.matrixTransform(m.inverse());
        }
    });

    Engine.prototype.svgOnly = function() {
        Engine.Stage = Engine.SVGStage;
        Engine.prototype.setup = Engine.prototype.setupSVG;
        Engine.Sprite = Engine.SVGSprite;
        return this;
    };


};

