'use strict'

// The star class is used just to provide points of reference
// so that motion can be observed.  A star is rendered as its
// space coordinates.
class Star {
    constructor(x, y){
        this.x = x;
        this.y = y;
    }
    render(ctx) {
        ctx.fillText(this.x.toFixed(0), this.x, this.y);
        ctx.fillText(this.y.toFixed(0), this.x, this.y+14);
    }
}

class Ship {
    constructor(space){
        // the ship is initially located 75 px above the bottom center of space
        // with some upward velocity
        this.loc = new Vector2d(space.starFieldWidth/2, space.starFieldHeight-75);
        this.vel = new Vector2d(0,-2);  // initial gentle upward velocity
        this.targetVel = this.vel.copy();   // for lerping
        this.space = space;
        this.img = new Image();
        this.img.src = "resources/images/spaceship.png";

    }

    update() {
            // The ship and the canvas move through space together
            // so that the ship maintains the same relative
            // position in the canvas
            // Change the velocity of the ship gradually
            // to smooth it out.
            var lerp = this.targetVel.copy().sub(this.vel);
            lerp.mul(0.25);
            this.vel.add(lerp);
            this.loc.add(this.vel);
            this.space.update(this.vel);
        }

    render(ctx) {   // draw the ship
        ctx.save();
        // The ship image is rendered at 50%, centered on its location
        ctx.translate(-this.space.canvasLoc.x, -this.space.canvasLoc.y);
        ctx.drawImage(this.img, this.loc.x-this.img.width/4, this.loc.y-this.img.height/4,
            this.img.width/2,this.img.height/2);
        ctx.restore();
    }

    renderSmallCanvas(ctx) {
        ctx.save();
        ctx.translate(this.loc.x,this.loc.y);
        ctx.rotate(this.vel.angle() + (Math.PI/2));
        // draw the ship image at 400%
        ctx.drawImage(this.img, -this.img.width, -this.img.height,
            this.img.width*2,this.img.height*2);
        ctx.restore();

    }
}

// The Level class contains most of the assets.
class Level {
    constructor(game, number) {
        this.game = game;
        this.number = number;
        this.init();
    }

    init() {    // needs to be called each time a level is re-started
                // different level numbers should have different behavior
        this.space = {
            // space is infinite but the star field is
            // five times the width and height of the canvas
            // The star field is located in the lower right
            // quadrant of space.
            starFieldWidth: 5*this.game.canvas.width,
            starFieldHeight: 5*this.game.canvas.height,
            stars: [],
            // The canvas, like the ship, has a location in space
            // the canvas is initially located centered at the bottom of the starfield
            canvasLoc: new Vector2d(2*this.game.canvas.width,4*this.game.canvas.height),
            // update --
            // the canvas moves the same as the ship moves
            update: function(vel) {
                this.canvasLoc.add(vel);
            },
            renderStars(ctx) {
                ctx.save();
                ctx.fillStyle = 'white';
                ctx.font = "12px sans-serif";
                for(var i = 0; i < this.stars.length; i++)
                    this.stars[i].render(ctx);
                ctx.restore();
            }
        }
        this.createStars(this.space);
        this.space.ship = new Ship(this.space);
        var ship = this.space.ship;
        window.addEventListener('keypress',
        function(evt) {
            // console.log(evt.key,evt.charCode, evt.keyCode);
            var velMag = ship.targetVel.length();
            var acc = new Vector2d(0.5,0);  // vector of length .5
            var ang = ship.vel.angle();
            switch(evt.charCode){
                // case 'ArrowLeft':   // turn counterclockwise
                // case 'a':
                // case 'A':
                case 97:
                case 65:
                        acc.setAngle(ang - Math.PI/2);
                        acc.setMagnitude(0.1*velMag);   // turn less when going slower
                        break;
                // case 'ArrowUp': // increase forward velocity
                // case 'w':
                // case 'W':
                case 87:
                case 119:
                        acc.setAngle(ang); break;
                // case 'ArrowRight': // turn clockwise
                // case 'd':
                // case 'D':
                case 68:
                case 100:
                        acc.setAngle(ang + Math.PI/2);
                        acc.setMagnitude(0.1*velMag);  // turn less when going slower
                        break;
                    // case 'ArrowDown':   // decrease forward velocity
                    // case 's':
                    // case 'S':
                    case 83:
                    case 115:
                        acc.setAngle(ang + Math.PI);
                        // do not allow velocity to fall to zero
                        // because that will abruptly change the angle.
                        // the magnitude of the acceleration is known to be 0.5
                        if(velMag < 0.51)
                            acc.setMagnitude(velMag - 0.01);
                        break;
                case 0:
                    // on the Mac at least, the arrow keys have 0 for the charCode
                    // but something significant for the keyCode
                    switch(evt.keyCode) {
                        case 37: // left arrow
                            acc.setAngle(ang - Math.PI/2);
                            acc.setMagnitude(0.1*velMag);   // turn less when going slower
                            break;
                        case 38:    // up arrow
                            acc.setAngle(ang); break;
                        case 39:    // right arrow
                            acc.setAngle(ang + Math.PI/2);
                            acc.setMagnitude(0.1*velMag);  // turn less when going slower
                            break;
                        case 40:    // down arrow
                            acc.setAngle(ang + Math.PI);
                            // do not allow velocity to fall to zero
                            // because that will abruptly change the angle.
                            // the magnitude of the acceleration is known to be 0.5
                            if(velMag < 0.51)
                                acc.setMagnitude(velMag - 0.01);
                            break;
                        default: acc.x = acc.y = 0; break;

                    }
                    break;
                default: acc.x = acc.y = 0; break;
            }
            ship.targetVel.add(acc);  // accelerate the space ship or not
            if(ship.targetVel.length() > 5.0)
                ship.targetVel.normalize().mul(5.0);  // limit to 5.0
        },
        false);
    }

    // fill up space with stars 150 px apart
    createStars(space){
        for(var x = 100; x < space.starFieldWidth; x+= 150 )
            for(var y = 100; y < space.starFieldHeight; y += 150)
            space.stars.push(new Star(x, y));
    }

    run() {
        this.space.ship.update();
        this.render();
        // this.player.run();
        // this.predator.run();
        // this.safeArea.run();
        // this.runBoids();
    }


    render() {
        // draw whatever
      var context = this.game.context;
      context.save();
      // draw a black background
      context.fillStyle = "black";
      context.fillRect(0, 0, context.canvas.width, context.canvas.height);
      // move the origin from the top left of the canvas
      // to the top left of the space
      // I also want to rotate space around the space ship.
      // According to Foley & Van Dam figure 7.29 on pg 253,
      // the matrix to rotate around an arbitrary point is
      // |           cos theta                    sin theta            0  |
      // |          -sin theta                    cos theta            0  |
      // | x(1-cos theta) + y sin theta  y(1-cos theta) - x sin theta  1  |
      // where x and y is the arbitrary point.

      var t = this.space.ship.vel.angle() + Math.PI/2;  // theta
      var cos_t = Math.cos(-t); // use -t because we want space
      var sin_t = Math.sin(-t); // to rotate opposite to the ship
      var x = this.space.ship.loc.x;    // point around which to rotate
      var y = this.space.ship.loc.y;
      // The api for transform() is
      // context.transform(a,b,c,d,e,f) where
      // |  a  b  |
      // |  c  d  |
      // |  e  f  |
      // The transformation would be:
      // x' = ax + cy + e
      // y' = bx + dy + f

      var e = x * (1-cos_t) + y * sin_t;
      var f = y * (1-cos_t) - x * sin_t;

      // First translate to get into space coordinates
      context.translate(-this.space.canvasLoc.x, -this.space.canvasLoc.y);
      // Then transform to rotate around the center of the space ship
      context.transform(cos_t, sin_t, -sin_t, cos_t, e, f);
      // Now the stars (or whatever else occupies space) can be rendered
      this.space.renderStars(context);
      context.restore();
      var ship = this.space.ship;
      ship.render(context);

      // The small canvas is scaled down to show the entire starfield,
      // half the width and height of the canvas,
      // initially centered in the small canvas.
      var ctx2 = this.game.ctx2;
      var scaleFactor = ctx2.canvas.width/(this.space.starFieldWidth*1.5);
      ctx2.save();
      ctx2.fillStyle = "black";
      ctx2.fillRect(0, 0, ctx2.canvas.width, ctx2.canvas.height);
      ctx2.scale(scaleFactor,scaleFactor);

      // Center the starfield in the small canvas unless the Ship
      // is approaching the edge of the canvas.
      var translate_x = this.space.starFieldWidth/4;
      var translate_y = this.space.starFieldHeight/4;

      // If the space ship moves too close to the edges of the small canvas,
      // adjust the translation to keep the ship in view.
      var x_adjust = ship.loc.x - 1.15*this.space.starFieldWidth;
      // If the ship is too far to the right of the starField
      // reduce the x translation
      if(x_adjust > 0)
          translate_x -= x_adjust;  // shift the starfield left
      // to far to the left of the starfield?
      x_adjust = -.15*this.space.starFieldWidth - ship.loc.x;
      if(x_adjust > 0)
          translate_x += x_adjust;  // shift the starfield right
      // too far to the top of the starfield?
      var y_adjust = -.15*this.space.starFieldHeight - ship.loc.y;
      if(y_adjust > 0)
          translate_y += y_adjust;    // shift the starfield down
      // too far to the bottom of the starfield?
      y_adjust = ship.loc.y - 1.15*this.space.starFieldHeight;
      if(y_adjust > 0)
          translate_y -= y_adjust;   // shift the starfield up


      ctx2.translate(translate_x,translate_y);
      this.space.renderStars(ctx2);
      this.space.ship.renderSmallCanvas(ctx2);
      ctx2.restore();

    }

}
