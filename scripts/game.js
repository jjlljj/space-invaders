function Game(screenId) {
  var canvas = document.getElementById(screenId);
  var screen = canvas.getContext('2d');
  var gameSize = { x: canvas.width, y: canvas.height};
  this.bodies = createInvaders(this).concat(new Player(this, gameSize));
  this.gameOver = false;

  this.animate 
  var self = this;
  var tick = function() {
    self.update();
    self.draw(screen, gameSize);
    if(!self.gameOver) {
      self.animate = requestAnimationFrame(tick);
    }
  };
  tick();
  
};

Game.prototype.update = function() {
  var bodies = this.bodies;
  var notColliding = function(b1) {
    return bodies.filter(function(b2) {
      return colliding(b1, b2);
    }).length === 0;
  };
  
  this.bodies = this.bodies.filter(notColliding);
  
  var playerIsAlive = this.bodies.some(function(body) {
    return body instanceof Player;
  });

  if(!playerIsAlive) {
    this.loseGame()
  }
  
  for (var i = 0; i < this.bodies.length; i++) {
    this.bodies[i].update();
  };
};

Game.prototype.draw = function(screen, gameSize) {
  screen.clearRect(0, 0, gameSize.x, gameSize.y);

  this.bodies.forEach(function(body) {
    if (body instanceof Invader){
      drawInvader(screen, body)
    } else {
      drawRect(screen, body)
    }
  });
};

Game.prototype.addBody = function(body) {
  this.bodies.push(body);
}

Game.prototype.invadersBelow = function(invader) {
  return this.bodies.filter(function(b) {
    return b instanceof Invader && 
    b.center.y > invader.center.y &&
    b.center.x - invader.center.x < invader.size.x;
  }).length > 0;
};

Game.prototype.loseGame = function() {
  console.log('Game over!')
  this.gameOver = true;
  cancelAnimationFrame(this.animate)
}

function Player(game, gameSize) {
  this.game = game;
  this.size = { x: 15, y: 15 };
  this.center = {x: gameSize.x / 2, y: gameSize.y - this.size.x };
  this.keyboarder = new Keyboarder();
  this.justShot = false;
};

Player.prototype.update = function() {
  if (this.keyboarder.isDown(this.keyboarder.KEYS.LEFT) && this.center.x > 10) {
    this.center.x -=2;
  } else if (this.keyboarder.isDown(this.keyboarder.KEYS.RIGHT) && this.center.x < 300) {
    this.center.x += 2;
  }

  if (!this.justShot && this.keyboarder.isDown(this.keyboarder.KEYS.SPACE)) {
    this.justShot = true;
    var bullet = new Bullet (
      { x: this.center.x, y: this.center.y - this.size.x / 2 },
      { x: 0, y: -6 });
    this.game.addBody(bullet);

    var thisPlayer = this;
    function setJustShot() {
      thisPlayer.justShot = false;
    }
    setTimeout(setJustShot, 800);
  };
};

Player.prototype.setJustShot = function() {
  self.justShot = false;
};


function Bullet(center, velocity) {
  this.size = { x: 2, y: 3};
  this.center = center;
  this.velocity = velocity;
};

Bullet.prototype.update = function() {
  this.center.x += this.velocity.x;
  this.center.y += this.velocity.y;
};

function Invader(game, center) {
  this.game = game;
  this.size = {x: 20, y: 20};
  this.center = center;
  this.patrolX = 0;
  this.speedX = 0.3;
};

Invader.prototype.update = function() {
  if (this.patrolX < 0 || this.patrolX > 40) {
    this.speedX = -this.speedX;
  };
  this.center.x += this.speedX;
  this.patrolX += this.speedX;
  if (Math.random() > 0.998 && !this.game.invadersBelow(this)) {
    var bullet = new Bullet({x: this.center.x, y: this.center.y + this.size.x / 2}, {x: Math.random() - 0.5, y: 2});
    this.game.addBody(bullet);
  };
};

function createInvaders(game) {
  var invaders = [];
  for (var i=0; i<24; i++) {
    var x = 30 + (i % 8) * 30;
    var y = 30 + (i % 3) * 30;
    invaders.push(new Invader(game, {x: x, y: y}));
  };
  return invaders;
};

function drawRect(screen, body) {
  screen.fillRect(body.center.x - body.size.x / 2,
                    body.center.y - body.size.y / 2,
                    body.size.x, body.size.y);
};

function drawInvader(screen, body) {
  var img = new Image();
  img.src = "images/vader.png"
  screen.drawImage(img, body.center.x - body.size.x / 2,
                    body.center.y - body.size.y / 2, body.size.x, body.size.y)
}

function Keyboarder() {
  var keyState = {};
  window.onkeydown = function(e) {
    keyState[e.keyCode] = true;
  };
  window.onkeyup = function(e) {
    keyState[e.keyCode] = false;
  };
  this.isDown = function(keyCode) {
    return keyState[keyCode] === true;
  };
  this.KEYS = {LEFT: 37, RIGHT: 39, SPACE: 32};
};

function colliding(b1, b2) {
  return !(b1 === b2 || 
            b1.center.x + b1.size.x / 2 < b2.center.x - b2.size.x / 2 ||
            b1.center.y + b1.size.y / 2 < b2.center.y - b2.size.y / 2 ||
            b1.center.x - b1.size.x / 2 > b2.center.x + b2.size.x / 2 ||
            b1.center.y - b1.size.y / 2 > b2.center.y + b2.size.y / 2 );
};

window.onload = function() {
  new Game('screen');
};