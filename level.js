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
        this.loc = new Vector2d(space.width/2, space.height-75);
        this.vel = new Vector2d(2,-2);
        this.r = 20;    // radius
        this.space = space;
        this.img = new Image();
        this.img.src = "resources/images/spaceship.png";

    }

    update() {
            // The ship and the canvas move through space together
            // so that the ship maintains the same relative
            // position in the canvas
            this.loc.add(this.vel);
            this.space.update(this.vel);
        }

    // The ship image is rendered at 50%, centered on its location
    render(ctx) {
        if(this.img.complete)
            ctx.drawImage(this.img, this.loc.x-this.img.width/4, this.loc.y-this.img.height/4,
                this.img.width/2,this.img.height/2);
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
            // space is 5 times the width and height of the canvas
            width: 5*this.game.canvas.width,
            height: 5*this.game.canvas.height,
            stars: [],
            // The canvas, like the ship, has a location in space
            // the canvas is initially located centered at the bottom of space
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
            var acc = new Vector2d(0,0);
            switch(evt.key){
                case 'ArrowLeft':
                case 'a':
                case 'A':
                        acc.x = -0.75; break;
                case 'ArrowUp':
                case 's':
                case 'S':
                        acc.y = -0.75; break;
                case 'ArrowRight':
                case 'f':
                case 'F':
                        acc.x = 0.75; break;
                case 'ArrowDown':
                    case 'd':
                    case 'D':
                        acc.y = 0.75; break;
                default: break;
            }
            ship.vel.add(acc);  // accelerate the space ship or not
            if(ship.vel.length() > 5.0){
                ship.vel.normalize().mul(5.0);  // limit to 5.0
            }


        },
        false);
    }

    // fill up space with stars 50 px apart
    createStars(space){
        for(var x = 100; x < space.width; x+= 100 )
            for(var y = 100; y < space.height; y += 100)
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
        // here is some place holder
      var context = this.game.context;
      context.save();
      // draw a black background
      context.fillStyle = "black";
      context.fillRect(0, 0, context.canvas.width, context.canvas.height);
      // move the origin from the top left of the canvas
      // to the top left of the space
      context.translate(-this.space.canvasLoc.x, -this.space.canvasLoc.y);

      this.space.renderStars(context);
      this.space.ship.render(context);
      context.restore();
    }

}
