;(function() {
  var Game = function(canvasId) {
    var canvas = document.getElementById(canvasId);
    var screen = canvas.getContext('2d');
    var gameSize = { x: canvas.width, y: canvas.height};
  
    // ARRAY OF all bodies in game, player, invaders, bullets, etc --> what the game is rendering
    // this works bc createInvaders returns an array, which we then add the Player obj to and later the bullet objects --> was originally just declared as an array
    this.bodies = createInvaders(this).concat(new Player(this, gameSize));

    var self = this;
    var tick = function() {
      //update does game logic
      self.update();
      self.draw(screen, gameSize);
      requestAnimationFrame(tick);
    };

    tick();
  };


  Game.prototype = {
    update: function() {
      //here we do the colliding
      var bodies = this.bodies;
      //checks to see if this body(whatever current one being checked) is NOT colliding with anything --> colliding === 0 bc no other object is colling with it
      var notColliding = function(b1) {
        return bodies.filter(function(b2) { return colliding(b1, b2); }).length === 0;
      };

      // so if notCollidng retruns T, it is KEPT inside the array resulting from this code
      this.bodies = this.bodies.filter(notColliding);

      //call this on all entities to update motion etc
      for (var i = 0; i < this.bodies.length; i++) {
        this.bodies[i].update();
      }
    },

    draw: function(screen, gameSize) {
      //draw to screen, x, y, width, height
      // screen.fillRect(30,30,40,40)

      //need to clear screen before we draw so old drawing isn't present
      screen.clearRect(0, 0, gameSize.x, gameSize.y)

      //here we draw the player, normally would delegate to a draw function for this, but all going to be black rectangles here
      for (var i = 0; i < this.bodies.length; i++) {
        drawRect(screen, this.bodies[i]);
      }
    },

    addBody: function(body) {
      this.bodies.push(body);
    },

    invadersBelow: function(invader) {
      return this.bodies.filter(function(b){
        return b instanceof Invader && 
          b.center.y > invader.center.y &&
          b.center.x - invader.center.x < invader.size.x;
      }).length > 0;
    }

  };

  var Player = function(game, gameSize) {
    //where player starts off
    this.game = game;
    this.size = { x: 15, y: 15 };
    this.center = { x: gameSize.x / 2, y: gameSize.y - this.size.x };
    //use keyboarder for player
    this.keyboarder = new Keyboarder();
    this.justShot = false;
  };

  Player.prototype = {
    //player has own update function
    // game's update function delegates to the other entities update function so they can do their own updating

    update: function() {
      //control the motion
      if (this.keyboarder.isDown(this.keyboarder.KEYS.LEFT)) {
        this.center.x -= 2;
      } else if (this.keyboarder.isDown(this.keyboarder.KEYS.RIGHT)) {
        this.center.x += 2;
      }

      if (!this.justShot && this.keyboarder.isDown(this.keyboarder.KEYS.SPACE)) {
      
        this.justShot = true;
        //pass bullet constructor size && velocity
        var bullet = new Bullet (
          { x: this.center.x, y: this.center.y - this.size.x / 2},
          { x: 0, y: -6 } );

        this.game.addBody(bullet);

        var that = this;
        var setJustShot = function() {
          that.justShot = false;
        }

        setTimeout(setJustShot, 800)
      }
    }
  };


  var Bullet = function(center, velocity) {
    this.size = { x: 3, y: 3 };
    this.center = center;
    this.velocity = velocity;
  };

  Bullet.prototype = {
    update: function() {
      this.center.x += this.velocity.x;
      this.center.y += this.velocity.y;
    }
  };


  var Invader = function(game, center) {
    this.game = game;
    this.size = { x: 15, y: 15 };
    this.center = center;
    //relative patrol position --> scroll L & R
    this.patrolX = 0;
    // positive when R, negative whenL
    this.speedX = 0.3;
  };

  Invader.prototype = { 
    update: function() {
      if (this.patrolX < 0 || this.patrolX > 40) {
        this.speedX = -this.speedX;
      }

      this.center.x += this.speedX;
      this.patrolX += this.speedX;

      //make invaders shootthings
      if (Math.random() > 0.998 && !this.game.invadersBelow(this)) {
        var bullet = new Bullet({ x: this.center.x, y:this.center.y + this.size.x / 2}, { x: Math.random() - 0.5, y: 2 });
        this.game.addBody(bullet)
      } 
    }
  };

  var createInvaders = function(game) {
    var invaders = [];
    // make 24 invaders
    for (var i = 0; i < 24; i++) {
      // create a vader here 
      // specify center of vaders
      // 30 from Left + whatever makes 8 rows + 30 apart
      var x = 30 + (i % 8) * 30;
      // 30 from Top + 3rows + 30apart
      var y = 30 + (i % 3) * 30;

      invaders.push(new Invader(game, {x: x, y: y}))
    }
    return invaders;
  }



// render player or whatever on screen
  var drawRect = function(screen, body) {
    screen.fillRect(body.center.x - body.size.x / 2,
                    body.center.y - body.size.y / 2,
                    body.size.x, body.size.y)    
  };

//control the motion!!!
// module that handles key input
var Keyboarder = function() {
  //keystate records whether any key that has ever been pressed is up or down right now
  var keyState = {};
  
  //update that state - bind to on key down
  window.onkeydown = function(e) {
    //keyCode is unique key num - ids which key pressed
    keyState[e.keyCode] = true;
  }

  window.onkeyup = function(e) {
    keyState[e.keyCode] = false;
  }

  this.isDown = function(keyCode) {
    return keyState[keyCode] ===true;
  }

  this.KEYS = { LEFT: 37, RIGHT: 39, SPACE: 32 }
};

//handle object boundary interaction
var colliding = function(b1, b2) {
  // 5 conditions, if any of which are true, means body1 and body2 are NOT colliding

  //sameness, LR && TopBottom boundaries
  //R to L
  //T to B
  //L to R
  //B to T 
  return !( b1 === b2 || 
            b1.center.x + b1.size.x / 2 < b2.center.x - b2.size.x / 2 ||
            b1.center.y + b1.size.y / 2 < b2.center.y - b2.size.y / 2 ||
            b1.center.x - b1.size.x / 2 > b2.center.x + b2.size.x / 2 ||
            b1.center.y - b1.size.y / 2 > b2.center.y + b2.size.y / 2 );
};


  window.onload = function() {
    new Game("screen");
  }

}) ()
