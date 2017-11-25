
//GAME

function Game(screenId) {
  var canvas = document.getElementById(screenId);
  var screen = canvas.getContext('2d');
  var gameSize = { x: canvas.width, y: canvas.height};
  this.bodies = createInvaders(this).concat(new Player(this, gameSize));
  this.gameOver = false;
  this.score = 0;

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
  var invadersAlive = this.countInvaders();
  var notColliding = function(b1) {
    return bodies.filter(function(b2) {
      return colliding(b1, b2);
    }).length === 0;
  };
  this.bodies = this.bodies.filter(notColliding);
  
  var invadersKilled = invadersAlive - this.countInvaders();
  this.score += invadersKilled*20;
  updateScore(this.score)

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

Game.prototype.countInvaders = function() {
  var livingInvaders = this.bodies.filter(function(body){
    return body instanceof Invader
  })
  return livingInvaders.length
}

Game.prototype.draw = function(screen, gameSize) {
  screen.clearRect(0, 0, gameSize.x, gameSize.y);

  this.bodies.forEach(function(body) {
    if (body instanceof Invader){
      drawInvader(screen, body)
    } else if(body instanceof Player) {
      drawPlayer(screen, body)
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
  displayGameOver()
  cancelAnimationFrame(this.animate)
}

function Player(game, gameSize) {
  this.game = game;
  this.size = { x: 25, y: 25 };
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
  screen.fillStyle = "#FF0000";
  screen.fillRect(body.center.x - body.size.x / 2,
                    body.center.y - body.size.y / 2,
                    body.size.x, body.size.y);
};

function drawPlayer(screen, body) {
  var img = new Image();
  img.src = "images/falcon.png"
  screen.drawImage(img, body.center.x - body.size.x / 2,
                    body.center.y - body.size.y / 2, body.size.x, body.size.y)
}

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

function updateScore(score) {
  var gameScore = document.querySelector('.game-score');
  gameScore.innerText = score;
}

function displayGameOver() {
  var score = document.querySelector('.score')
  score.innerText = 'Game Over' 
}

function colliding(b1, b2) {
  return !(b1 === b2 || 
            b1.center.x + b1.size.x / 2 < b2.center.x - b2.size.x / 2 ||
            b1.center.y + b1.size.y / 2 < b2.center.y - b2.size.y / 2 ||
            b1.center.x - b1.size.x / 2 > b2.center.x + b2.size.x / 2 ||
            b1.center.y - b1.size.y / 2 > b2.center.y + b2.size.y / 2 );
};

//MUSIC

function SoundTrack(midiTrack) {
  var synth = new Tone.PolySynth(8);
  var freeverb = new Tone.Freeverb();
  var volume = new Tone.Volume(-10);

  freeverb.dampening.value = 1000;
  freeverb.wet.value = .3;

  synth.chain(freeverb, volume, Tone.Master);

  var muteButton = document.querySelector('#mute-button');

  muteButton.addEventListener('click', function(){
    console.log(volume.volume.value)
    if (volume.volume.value < -50) {
      volume.volume.rampTo(-10, 1) 
    } else {
      volume.volume.cancelScheduledValues();
      volume.volume.rampTo(-Infinity, 1.5);
    }
  });

  function play(midiTrack) {
    Tone.Transport.bpm.value = 105;
    var midiPart = new Tone.Part(function(time, note) {
    synth.triggerAttackRelease(note.name, note.duration, time, note.velocity)
    }, midiTrack.tracks[0].notes).start();

    midiPart.set({
      "loop" : true,
      "loopEnd" : "14m"
      });

    Tone.Transport.start()
  }

  play(midiTrack)
}

var midiScore = {
  "header": {
    "PPQ": 480,
    "timeSignature": [
      4,
      4
    ],
    "bpm": 105.000105000105,
    "name": ""
  },
  "startTime": 0,
  "duration": 31.817825324999987,
  "tracks": [
    {
      "startTime": 0,
      "duration": 31.817825324999987,
      "length": 246,
      "notes": [
        {
          "name": "G1",
          "midi": 31,
          "time": 0,
          "velocity": 0.9448818897637795,
          "duration": 0.23809500000000003
        },
        {
          "name": "G1",
          "midi": 31,
          "time": 0.571428,
          "velocity": 0.9448818897637795,
          "duration": 0.19047599999999998
        },
        {
          "name": "G1",
          "midi": 31,
          "time": 0.85952295,
          "velocity": 0.8976377952755905,
          "duration": 0.05476185
        },
        {
          "name": "G1",
          "midi": 31,
          "time": 0.95238,
          "velocity": 0.7874015748031497,
          "duration": 0.0607142249999999
        },
        {
          "name": "G1",
          "midi": 31,
          "time": 1.047618,
          "velocity": 0.9448818897637795,
          "duration": 0.07142850000000012
        },
        {
          "name": "G1",
          "midi": 31,
          "time": 1.136903625,
          "velocity": 0.9448818897637795,
          "duration": 0.142857
        },
        {
          "name": "G1",
          "midi": 31,
          "time": 1.4285700000000001,
          "velocity": 0.8582677165354331,
          "duration": 0.08928562500000004
        },
        {
          "name": "G1",
          "midi": 31,
          "time": 1.5202365750000002,
          "velocity": 0.7874015748031497,
          "duration": 0.08928562500000004
        },
        {
          "name": "G1",
          "midi": 31,
          "time": 1.6154745750000001,
          "velocity": 0.8582677165354331,
          "duration": 0.1095237
        },
        {
          "name": "D#1",
          "midi": 27,
          "time": 1.7083316250000002,
          "velocity": 0.8582677165354331,
          "duration": 0.07499992499999997
        },
        {
          "name": "D#1",
          "midi": 27,
          "time": 1.8035696250000002,
          "velocity": 0.9448818897637795,
          "duration": 0.08571419999999996
        },
        {
          "name": "D#1",
          "midi": 27,
          "time": 1.898807625,
          "velocity": 0.9448818897637795,
          "duration": 0.07857135000000004
        },
        {
          "name": "D#1",
          "midi": 27,
          "time": 1.996426575,
          "velocity": 0.9448818897637795,
          "duration": 0.09523800000000016
        },
        {
          "name": "G1",
          "midi": 31,
          "time": 2.26428345,
          "velocity": 0.9448818897637795,
          "duration": 0.23809499999999995
        },
        {
          "name": "G1",
          "midi": 31,
          "time": 2.8476162,
          "velocity": 0.9448818897637795,
          "duration": 0.19047599999999987
        },
        {
          "name": "G1",
          "midi": 31,
          "time": 3.1333302,
          "velocity": 0.9448818897637795,
          "duration": 0.08095229999999987
        },
        {
          "name": "G1",
          "midi": 31,
          "time": 3.2285681999999998,
          "velocity": 0.7874015748031497,
          "duration": 0.07380945000000017
        },
        {
          "name": "G1",
          "midi": 31,
          "time": 3.3238062,
          "velocity": 0.9448818897637795,
          "duration": 0.08452372499999994
        },
        {
          "name": "G1",
          "midi": 31,
          "time": 3.413091825,
          "velocity": 0.9448818897637795,
          "duration": 0.1428569999999998
        },
        {
          "name": "G1",
          "midi": 31,
          "time": 3.7023772499999996,
          "velocity": 0.9448818897637795,
          "duration": 0.08571419999999996
        },
        {
          "name": "G1",
          "midi": 31,
          "time": 3.7999961999999994,
          "velocity": 0.7874015748031497,
          "duration": 0.06904755000000007
        },
        {
          "name": "G1",
          "midi": 31,
          "time": 3.8928532499999995,
          "velocity": 0.84251968503937,
          "duration": 0.09047610000000006
        },
        {
          "name": "D#1",
          "midi": 27,
          "time": 3.9904721999999997,
          "velocity": 0.8031496062992126,
          "duration": 0.07142850000000012
        },
        {
          "name": "D#1",
          "midi": 27,
          "time": 4.08332925,
          "velocity": 0.8031496062992126,
          "duration": 0.08571419999999996
        },
        {
          "name": "D#1",
          "midi": 27,
          "time": 4.174995825,
          "velocity": 0.9448818897637795,
          "duration": 0.07499992500000019
        },
        {
          "name": "D#1",
          "midi": 27,
          "time": 4.270233825,
          "velocity": 0.9448818897637795,
          "duration": 0.08571419999999996
        },
        {
          "name": "G1",
          "midi": 31,
          "time": 4.555947825,
          "velocity": 0.9448818897637795,
          "duration": 0.2380950000000004
        },
        {
          "name": "G3",
          "midi": 55,
          "time": 4.59761445,
          "velocity": 0.5354330708661418,
          "duration": 0.3214282500000003
        },
        {
          "name": "G1",
          "midi": 31,
          "time": 5.1333282,
          "velocity": 0.9448818897637795,
          "duration": 0.1904760000000003
        },
        {
          "name": "G3",
          "midi": 55,
          "time": 5.154756750000001,
          "velocity": 0.5354330708661418,
          "duration": 0.35119012500000046
        },
        {
          "name": "G1",
          "midi": 31,
          "time": 5.430946950000001,
          "velocity": 0.9448818897637795,
          "duration": 0.0607142249999999
        },
        {
          "name": "G1",
          "midi": 31,
          "time": 5.526184950000001,
          "velocity": 0.7874015748031497,
          "duration": 0.0607142249999999
        },
        {
          "name": "G1",
          "midi": 31,
          "time": 5.619042000000001,
          "velocity": 0.9448818897637795,
          "duration": 0.06428565000000042
        },
        {
          "name": "G1",
          "midi": 31,
          "time": 5.708327625000002,
          "velocity": 0.8031496062992126,
          "duration": 0.14285699999999935
        },
        {
          "name": "G3",
          "midi": 55,
          "time": 5.732137125000001,
          "velocity": 0.5354330708661418,
          "duration": 0.35714249999999925
        },
        {
          "name": "G1",
          "midi": 31,
          "time": 5.990470200000001,
          "velocity": 0.9448818897637795,
          "duration": 0.08333324999999991
        },
        {
          "name": "G1",
          "midi": 31,
          "time": 6.0892796250000005,
          "velocity": 0.7874015748031497,
          "duration": 0.08333324999999991
        },
        {
          "name": "G1",
          "midi": 31,
          "time": 6.17856525,
          "velocity": 0.8582677165354331,
          "duration": 0.09999990000000025
        },
        {
          "name": "D#1",
          "midi": 27,
          "time": 6.2761842,
          "velocity": 0.7874015748031497,
          "duration": 0.049999950000000126
        },
        {
          "name": "D#3",
          "midi": 51,
          "time": 6.2857080000000005,
          "velocity": 0.5354330708661418,
          "duration": 0.2797616250000008
        },
        {
          "name": "D#1",
          "midi": 27,
          "time": 6.365469825000001,
          "velocity": 0.84251968503937,
          "duration": 0.08095229999999987
        },
        {
          "name": "D#1",
          "midi": 27,
          "time": 6.458326875000001,
          "velocity": 0.9448818897637795,
          "duration": 0.05952375000000032
        },
        {
          "name": "D#1",
          "midi": 27,
          "time": 6.559517250000002,
          "velocity": 0.9448818897637795,
          "duration": 0.07619039999999977
        },
        {
          "name": "A#3",
          "midi": 58,
          "time": 6.7083266250000015,
          "velocity": 0.5354330708661418,
          "duration": 0.07738087500000024
        },
        {
          "name": "G3",
          "midi": 55,
          "time": 6.853564575000002,
          "velocity": 0.41732283464566927,
          "duration": 0.4047615000000002
        },
        {
          "name": "G1",
          "midi": 31,
          "time": 6.8595169500000015,
          "velocity": 0.9448818897637795,
          "duration": 0.2380950000000004
        },
        {
          "name": "G1",
          "midi": 31,
          "time": 7.416659250000002,
          "velocity": 0.9448818897637795,
          "duration": 0.1904760000000003
        },
        {
          "name": "D#3",
          "midi": 51,
          "time": 7.419040200000002,
          "velocity": 0.5354330708661418,
          "duration": 0.2797616249999999
        },
        {
          "name": "G1",
          "midi": 31,
          "time": 7.704754200000002,
          "velocity": 0.8818897637795275,
          "duration": 0.06904754999999962
        },
        {
          "name": "G1",
          "midi": 31,
          "time": 7.797611250000001,
          "velocity": 0.7874015748031497,
          "duration": 0.06904754999999962
        },
        {
          "name": "A#3",
          "midi": 58,
          "time": 7.863087375000001,
          "velocity": 0.41732283464566927,
          "duration": 0.08333324999999903
        },
        {
          "name": "G1",
          "midi": 31,
          "time": 7.89284925,
          "velocity": 0.9448818897637795,
          "duration": 0.07619039999999977
        },
        {
          "name": "G1",
          "midi": 31,
          "time": 7.98808725,
          "velocity": 0.8031496062992126,
          "duration": 0.14285700000000023
        },
        {
          "name": "G3",
          "midi": 55,
          "time": 7.996420575,
          "velocity": 0.41732283464566927,
          "duration": 0.7261897499999996
        },
        {
          "name": "G1",
          "midi": 31,
          "time": 8.26427745,
          "velocity": 0.9448818897637795,
          "duration": 0.08928562500000048
        },
        {
          "name": "G1",
          "midi": 31,
          "time": 8.363086875,
          "velocity": 0.7874015748031497,
          "duration": 0.0785713500000007
        },
        {
          "name": "G1",
          "midi": 31,
          "time": 8.460705825000002,
          "velocity": 0.9448818897637795,
          "duration": 0.10357132499999899
        },
        {
          "name": "D#1",
          "midi": 27,
          "time": 8.561896200000001,
          "velocity": 0.8976377952755905,
          "duration": 0.05952374999999854
        },
        {
          "name": "D#1",
          "midi": 27,
          "time": 8.6571342,
          "velocity": 0.9448818897637795,
          "duration": 0.07619039999999977
        },
        {
          "name": "D#1",
          "midi": 27,
          "time": 8.7523722,
          "velocity": 0.9448818897637795,
          "duration": 0.05952375000000032
        },
        {
          "name": "D#1",
          "midi": 27,
          "time": 8.841657825,
          "velocity": 0.9448818897637795,
          "duration": 0.10357132500000077
        },
        {
          "name": "D4",
          "midi": 62,
          "time": 9.1333242,
          "velocity": 0.5354330708661418,
          "duration": 0.36666630000000033
        },
        {
          "name": "G1",
          "midi": 31,
          "time": 9.142848,
          "velocity": 0.9448818897637795,
          "duration": 0.2380949999999995
        },
        {
          "name": "D4",
          "midi": 62,
          "time": 9.710704575000001,
          "velocity": 0.5354330708661418,
          "duration": 0.36071392500000066
        },
        {
          "name": "G1",
          "midi": 31,
          "time": 9.714276000000002,
          "velocity": 0.9448818897637795,
          "duration": 0.1904760000000003
        },
        {
          "name": "G1",
          "midi": 31,
          "time": 10.002370950000001,
          "velocity": 0.8976377952755905,
          "duration": 0.05952375000000032
        },
        {
          "name": "G1",
          "midi": 31,
          "time": 10.095228000000002,
          "velocity": 0.7874015748031497,
          "duration": 0.065476125
        },
        {
          "name": "G1",
          "midi": 31,
          "time": 10.190466000000002,
          "velocity": 0.9448818897637795,
          "duration": 0.07619039999999977
        },
        {
          "name": "D4",
          "midi": 62,
          "time": 10.273799250000001,
          "velocity": 0.41732283464566927,
          "duration": 0.37499962499999917
        },
        {
          "name": "G1",
          "midi": 31,
          "time": 10.279751625000001,
          "velocity": 0.9448818897637795,
          "duration": 0.14285699999999935
        },
        {
          "name": "G1",
          "midi": 31,
          "time": 10.571418000000001,
          "velocity": 0.8582677165354331,
          "duration": 0.0892856249999987
        },
        {
          "name": "G1",
          "midi": 31,
          "time": 10.663084575,
          "velocity": 0.7874015748031497,
          "duration": 0.08928562500000048
        },
        {
          "name": "G1",
          "midi": 31,
          "time": 10.758322575,
          "velocity": 0.8582677165354331,
          "duration": 0.08571419999999996
        },
        {
          "name": "D#2",
          "midi": 39,
          "time": 10.835703449999999,
          "velocity": 0.8661417322834646,
          "duration": 0.07976182500000029
        },
        {
          "name": "D#1",
          "midi": 27,
          "time": 10.851179624999999,
          "velocity": 0.8582677165354331,
          "duration": 0.065476125
        },
        {
          "name": "D#4",
          "midi": 63,
          "time": 10.865465324999999,
          "velocity": 0.5354330708661418,
          "duration": 0.24999975000000063
        },
        {
          "name": "D#2",
          "midi": 39,
          "time": 10.928560499999998,
          "velocity": 0.9133858267716536,
          "duration": 0.08571419999999996
        },
        {
          "name": "D#1",
          "midi": 27,
          "time": 10.946417624999999,
          "velocity": 0.9448818897637795,
          "duration": 0.07619039999999977
        },
        {
          "name": "D#2",
          "midi": 39,
          "time": 11.023798499999998,
          "velocity": 0.9448818897637795,
          "duration": 0.0880951500000009
        },
        {
          "name": "D#1",
          "midi": 27,
          "time": 11.041655624999999,
          "velocity": 0.9448818897637795,
          "duration": 0.0880951500000009
        },
        {
          "name": "D#2",
          "midi": 39,
          "time": 11.12141745,
          "velocity": 0.9448818897637795,
          "duration": 0.10357132500000077
        },
        {
          "name": "D#1",
          "midi": 27,
          "time": 11.139274575,
          "velocity": 0.9448818897637795,
          "duration": 0.10952370000000045
        },
        {
          "name": "A#3",
          "midi": 58,
          "time": 11.2761792,
          "velocity": 0.5354330708661418,
          "duration": 0.09285704999999922
        },
        {
          "name": "D#1",
          "midi": 27,
          "time": 11.40713145,
          "velocity": 0.9448818897637795,
          "duration": 0.2380949999999995
        },
        {
          "name": "D#2",
          "midi": 39,
          "time": 11.40713145,
          "velocity": 0.9448818897637795,
          "duration": 0.2380949999999995
        },
        {
          "name": "F#3",
          "midi": 54,
          "time": 11.436893325,
          "velocity": 0.41732283464566927,
          "duration": 0.40476149999999933
        },
        {
          "name": "C2",
          "midi": 36,
          "time": 11.984511824999998,
          "velocity": 0.9448818897637795,
          "duration": 0.1904760000000003
        },
        {
          "name": "D#3",
          "midi": 51,
          "time": 11.994035624999999,
          "velocity": 0.5354330708661418,
          "duration": 0.24166642500000002
        },
        {
          "name": "C2",
          "midi": 36,
          "time": 12.279749625,
          "velocity": 0.9448818897637795,
          "duration": 0.07619039999999977
        },
        {
          "name": "C2",
          "midi": 36,
          "time": 12.374987625,
          "velocity": 0.8503937007874016,
          "duration": 0.07142849999999967
        },
        {
          "name": "A#3",
          "midi": 58,
          "time": 12.407130449999999,
          "velocity": 0.5354330708661418,
          "duration": 0.0833332500000008
        },
        {
          "name": "C2",
          "midi": 36,
          "time": 12.466654199999999,
          "velocity": 0.9448818897637795,
          "duration": 0.09047610000000006
        },
        {
          "name": "G1",
          "midi": 31,
          "time": 12.555939825,
          "velocity": 0.9448818897637795,
          "duration": 0.14285699999999935
        },
        {
          "name": "G2",
          "midi": 43,
          "time": 12.555939825,
          "velocity": 0.9448818897637795,
          "duration": 0.14285699999999935
        },
        {
          "name": "G3",
          "midi": 55,
          "time": 12.567844574999999,
          "velocity": 0.41732283464566927,
          "duration": 0.4999994999999995
        },
        {
          "name": "G1",
          "midi": 31,
          "time": 12.942844199999998,
          "velocity": 0.7874015748031497,
          "duration": 0.06428565000000042
        },
        {
          "name": "G1",
          "midi": 31,
          "time": 13.035701249999999,
          "velocity": 0.84251968503937,
          "duration": 0.08571419999999996
        },
        {
          "name": "G1",
          "midi": 31,
          "time": 13.133320199999998,
          "velocity": 0.8031496062992126,
          "duration": 0.07142849999999967
        },
        {
          "name": "G1",
          "midi": 31,
          "time": 13.226177249999997,
          "velocity": 0.8031496062992126,
          "duration": 0.08571419999999996
        },
        {
          "name": "G1",
          "midi": 31,
          "time": 13.317843824999997,
          "velocity": 0.9448818897637795,
          "duration": 0.07499992500000019
        },
        {
          "name": "G1",
          "midi": 31,
          "time": 13.413081824999997,
          "velocity": 0.9448818897637795,
          "duration": 0.08571419999999996
        },
        {
          "name": "G1",
          "midi": 31,
          "time": 13.698795824999998,
          "velocity": 0.9448818897637795,
          "duration": 0.2380949999999995
        },
        {
          "name": "G4",
          "midi": 67,
          "time": 13.704748199999997,
          "velocity": 0.3858267716535433,
          "duration": 0.4440471749999997
        },
        {
          "name": "G1",
          "midi": 31,
          "time": 14.276176199999997,
          "velocity": 0.9448818897637795,
          "duration": 0.1904760000000003
        },
        {
          "name": "G3",
          "midi": 55,
          "time": 14.276176199999997,
          "velocity": 0.4251968503937008,
          "duration": 0.289285425000001
        },
        {
          "name": "G1",
          "midi": 31,
          "time": 14.573794949999998,
          "velocity": 0.9448818897637795,
          "duration": 0.07976182500000029
        },
        {
          "name": "G1",
          "midi": 31,
          "time": 14.669032949999998,
          "velocity": 0.7874015748031497,
          "duration": 0.07976182500000029
        },
        {
          "name": "G3",
          "midi": 55,
          "time": 14.722604324999999,
          "velocity": 0.5354330708661418,
          "duration": 0.11309512500000096
        },
        {
          "name": "G1",
          "midi": 31,
          "time": 14.76189,
          "velocity": 0.9448818897637795,
          "duration": 0.05952375000000032
        },
        {
          "name": "G1",
          "midi": 31,
          "time": 14.851175625,
          "velocity": 0.8031496062992126,
          "duration": 0.14285700000000112
        },
        {
          "name": "G4",
          "midi": 67,
          "time": 14.86903275,
          "velocity": 0.3543307086614173,
          "duration": 0.36071392500000066
        },
        {
          "name": "G1",
          "midi": 31,
          "time": 15.133318200000001,
          "velocity": 0.9448818897637795,
          "duration": 0.09285704999999922
        },
        {
          "name": "G1",
          "midi": 31,
          "time": 15.232127625,
          "velocity": 0.7874015748031497,
          "duration": 0.092857050000001
        },
        {
          "name": "G1",
          "midi": 31,
          "time": 15.32141325,
          "velocity": 0.8582677165354331,
          "duration": 0.0035714250000005165
        },
        {
          "name": "F#4",
          "midi": 66,
          "time": 15.389270325000002,
          "velocity": 0.5354330708661418,
          "duration": 0.30952350000000095
        },
        {
          "name": "D#2",
          "midi": 39,
          "time": 15.413079825000002,
          "velocity": 0.7874015748031497,
          "duration": 0.06904755000000051
        },
        {
          "name": "D#2",
          "midi": 39,
          "time": 15.508317825000002,
          "velocity": 0.9448818897637795,
          "duration": 0.07619039999999977
        },
        {
          "name": "D#2",
          "midi": 39,
          "time": 15.597603450000003,
          "velocity": 0.9133858267716536,
          "duration": 0.06904755000000051
        },
        {
          "name": "D#2",
          "midi": 39,
          "time": 15.698793825000003,
          "velocity": 0.9448818897637795,
          "duration": 0.09285704999999922
        },
        {
          "name": "F4",
          "midi": 65,
          "time": 15.847603200000002,
          "velocity": 0.41732283464566927,
          "duration": 0.09523800000000016
        },
        {
          "name": "C#2",
          "midi": 37,
          "time": 15.984507825000001,
          "velocity": 0.9448818897637795,
          "duration": 0.23809499999999773
        },
        {
          "name": "E4",
          "midi": 64,
          "time": 15.990460200000001,
          "velocity": 0.41732283464566927,
          "duration": 0.13690462499999967
        },
        {
          "name": "D#4",
          "midi": 63,
          "time": 16.1333172,
          "velocity": 0.4566929133858268,
          "duration": 0.0988094249999989
        },
        {
          "name": "E4",
          "midi": 64,
          "time": 16.2761742,
          "velocity": 0.41732283464566927,
          "duration": 0.12857130000000083
        },
        {
          "name": "C#2",
          "midi": 37,
          "time": 16.5476025,
          "velocity": 0.9448818897637795,
          "duration": 0.1904760000000003
        },
        {
          "name": "C#2",
          "midi": 37,
          "time": 16.8476022,
          "velocity": 0.8818897637795275,
          "duration": 0.0785713500000007
        },
        {
          "name": "G#3",
          "midi": 56,
          "time": 16.85950695,
          "velocity": 0.3779527559055118,
          "duration": 0.11071417499999825
        },
        {
          "name": "C#2",
          "midi": 37,
          "time": 16.94045925,
          "velocity": 0.7874015748031497,
          "duration": 0.07857134999999715
        },
        {
          "name": "C#2",
          "midi": 37,
          "time": 17.03569725,
          "velocity": 0.9448818897637795,
          "duration": 0.08571420000000174
        },
        {
          "name": "C#2",
          "midi": 37,
          "time": 17.13093525,
          "velocity": 0.8031496062992126,
          "duration": 0.14285699999999935
        },
        {
          "name": "C#4",
          "midi": 61,
          "time": 17.148792375,
          "velocity": 0.3779527559055118,
          "duration": 0.3785710499999979
        },
        {
          "name": "C#2",
          "midi": 37,
          "time": 17.40712545,
          "velocity": 0.9448818897637795,
          "duration": 0.07976182499999851
        },
        {
          "name": "C#2",
          "midi": 37,
          "time": 17.505934874999998,
          "velocity": 0.7874015748031497,
          "duration": 0.06904755000000051
        },
        {
          "name": "C#2",
          "midi": 37,
          "time": 17.603553825,
          "velocity": 0.9448818897637795,
          "duration": 0.07976182499999851
        },
        {
          "name": "C#2",
          "midi": 37,
          "time": 17.698791824999997,
          "velocity": 0.8976377952755905,
          "duration": 0.06904755000000051
        },
        {
          "name": "C4",
          "midi": 60,
          "time": 17.720220374999997,
          "velocity": 0.3779527559055118,
          "duration": 0.313094925000005
        },
        {
          "name": "C#2",
          "midi": 37,
          "time": 17.794029825,
          "velocity": 0.9448818897637795,
          "duration": 0.08571420000000174
        },
        {
          "name": "C#2",
          "midi": 37,
          "time": 17.886886875000002,
          "velocity": 0.9448818897637795,
          "duration": 0.06904755000000051
        },
        {
          "name": "C#2",
          "midi": 37,
          "time": 17.984505825000003,
          "velocity": 0.9448818897637795,
          "duration": 0.10357132499999722
        },
        {
          "name": "B3",
          "midi": 59,
          "time": 18.148791375000002,
          "velocity": 0.30708661417322836,
          "duration": 0.10476179999999857
        },
        {
          "name": "D#2",
          "midi": 39,
          "time": 18.270219825,
          "velocity": 0.9448818897637795,
          "duration": 0.23809499999999773
        },
        {
          "name": "A#3",
          "midi": 58,
          "time": 18.29760075,
          "velocity": 0.3779527559055118,
          "duration": 0.11071417499999825
        },
        {
          "name": "A3",
          "midi": 57,
          "time": 18.428553,
          "velocity": 0.30708661417322836,
          "duration": 0.08690467499999954
        },
        {
          "name": "A#3",
          "midi": 58,
          "time": 18.57379095,
          "velocity": 0.3779527559055118,
          "duration": 0.12499987500000032
        },
        {
          "name": "D#2",
          "midi": 39,
          "time": 18.8333145,
          "velocity": 0.9448818897637795,
          "duration": 0.1904760000000003
        },
        {
          "name": "D#2",
          "midi": 39,
          "time": 19.1333142,
          "velocity": 0.8818897637795275,
          "duration": 0.07380944999999883
        },
        {
          "name": "D#3",
          "midi": 51,
          "time": 19.15474275,
          "velocity": 0.3779527559055118,
          "duration": 0.09523799999999838
        },
        {
          "name": "D#2",
          "midi": 39,
          "time": 19.22617125,
          "velocity": 0.7874015748031497,
          "duration": 0.07380944999999883
        },
        {
          "name": "D#2",
          "midi": 39,
          "time": 19.315456875,
          "velocity": 0.9448818897637795,
          "duration": 0.08095229999999987
        },
        {
          "name": "D2",
          "midi": 38,
          "time": 19.41664725,
          "velocity": 0.8031496062992126,
          "duration": 0.21428550000000257
        },
        {
          "name": "F#3",
          "midi": 54,
          "time": 19.436885325000002,
          "velocity": 0.29133858267716534,
          "duration": 0.34523775000000256
        },
        {
          "name": "C2",
          "midi": 36,
          "time": 19.984503825000004,
          "velocity": 0.8976377952755905,
          "duration": 0.06904755000000051
        },
        {
          "name": "D#3",
          "midi": 51,
          "time": 20.020218075000006,
          "velocity": 0.3779527559055118,
          "duration": 0.32738062500000353
        },
        {
          "name": "C2",
          "midi": 36,
          "time": 20.079741825000006,
          "velocity": 0.9448818897637795,
          "duration": 0.08571420000000174
        },
        {
          "name": "C2",
          "midi": 36,
          "time": 20.17259887500001,
          "velocity": 0.9448818897637795,
          "duration": 0.06904755000000051
        },
        {
          "name": "C2",
          "midi": 36,
          "time": 20.27021782500001,
          "velocity": 0.9448818897637795,
          "duration": 0.07976182499999851
        },
        {
          "name": "F#3",
          "midi": 54,
          "time": 20.448789075000008,
          "velocity": 0.29133858267716534,
          "duration": 0.07142849999999967
        },
        {
          "name": "G1",
          "midi": 31,
          "time": 20.56188420000001,
          "velocity": 0.9448818897637795,
          "duration": 0.23809499999999773
        },
        {
          "name": "A#3",
          "midi": 58,
          "time": 20.607122250000007,
          "velocity": 0.30708661417322836,
          "duration": 0.38452342500000114
        },
        {
          "name": "D#2",
          "midi": 39,
          "time": 21.127359825000006,
          "velocity": 0.8976377952755905,
          "duration": 0.07380944999999883
        },
        {
          "name": "G3",
          "midi": 55,
          "time": 21.151169325000005,
          "velocity": 0.30708661417322836,
          "duration": 0.32142824999999675
        },
        {
          "name": "D#2",
          "midi": 39,
          "time": 21.222597825000005,
          "velocity": 0.9448818897637795,
          "duration": 0.09047610000000006
        },
        {
          "name": "D#2",
          "midi": 39,
          "time": 21.315454875000004,
          "velocity": 0.9448818897637795,
          "duration": 0.07380944999999883
        },
        {
          "name": "D#2",
          "midi": 39,
          "time": 21.413073825,
          "velocity": 0.9448818897637795,
          "duration": 0.14285699999999935
        },
        {
          "name": "A#3",
          "midi": 58,
          "time": 21.579740325,
          "velocity": 0.30708661417322836,
          "duration": 0.07738087499999935
        },
        {
          "name": "G1",
          "midi": 31,
          "time": 21.714264,
          "velocity": 0.8031496062992126,
          "duration": 0.08928562500000226
        },
        {
          "name": "D4",
          "midi": 62,
          "time": 21.734502075,
          "velocity": 0.29133858267716534,
          "duration": 0.723808800000004
        },
        {
          "name": "G1",
          "midi": 31,
          "time": 21.994025625000003,
          "velocity": 0.9448818897637795,
          "duration": 0.06904755000000051
        },
        {
          "name": "G1",
          "midi": 31,
          "time": 22.089263625000005,
          "velocity": 0.7874015748031497,
          "duration": 0.06904755000000051
        },
        {
          "name": "G1",
          "midi": 31,
          "time": 22.180930200000006,
          "velocity": 0.8582677165354331,
          "duration": 0.08571420000000174
        },
        {
          "name": "G1",
          "midi": 31,
          "time": 22.27973962500001,
          "velocity": 0.7874015748031497,
          "duration": 0.054761849999998446
        },
        {
          "name": "G1",
          "midi": 31,
          "time": 22.371406200000006,
          "velocity": 0.84251968503937,
          "duration": 0.07976182499999851
        },
        {
          "name": "G1",
          "midi": 31,
          "time": 22.464263250000005,
          "velocity": 0.9448818897637795,
          "duration": 0.06904755000000051
        },
        {
          "name": "G1",
          "midi": 31,
          "time": 22.565453625000007,
          "velocity": 0.7874015748031497,
          "duration": 0.054761849999998446
        },
        {
          "name": "D#2",
          "midi": 39,
          "time": 22.841643825000006,
          "velocity": 0.9448818897637795,
          "duration": 0.23809500000000128
        },
        {
          "name": "G4",
          "midi": 67,
          "time": 22.847596200000005,
          "velocity": 0.3858267716535433,
          "duration": 0.44404717500000146
        },
        {
          "name": "G3",
          "midi": 55,
          "time": 23.419024200000006,
          "velocity": 0.4251968503937008,
          "duration": 0.2892854249999992
        },
        {
          "name": "D#2",
          "midi": 39,
          "time": 23.716642950000004,
          "velocity": 0.9448818897637795,
          "duration": 0.0892856249999987
        },
        {
          "name": "D#2",
          "midi": 39,
          "time": 23.811880950000003,
          "velocity": 0.7874015748031497,
          "duration": 0.08928562500000226
        },
        {
          "name": "G3",
          "midi": 55,
          "time": 23.865452325000003,
          "velocity": 0.5354330708661418,
          "duration": 0.11309512500000096
        },
        {
          "name": "D#2",
          "midi": 39,
          "time": 23.904738000000005,
          "velocity": 0.9448818897637795,
          "duration": 0.07380944999999883
        },
        {
          "name": "G1",
          "midi": 31,
          "time": 23.994023625000004,
          "velocity": 0.8031496062992126,
          "duration": 0.14285699999999935
        },
        {
          "name": "G4",
          "midi": 67,
          "time": 24.011880750000003,
          "velocity": 0.3543307086614173,
          "duration": 0.3607139249999989
        },
        {
          "name": "G1",
          "midi": 31,
          "time": 24.276166200000002,
          "velocity": 0.9448818897637795,
          "duration": 0.0785713500000007
        },
        {
          "name": "G1",
          "midi": 31,
          "time": 24.374975625,
          "velocity": 0.7874015748031497,
          "duration": 0.0785713500000007
        },
        {
          "name": "G1",
          "midi": 31,
          "time": 24.464261250000003,
          "velocity": 0.8582677165354331,
          "duration": 0.10952369999999689
        },
        {
          "name": "F#4",
          "midi": 66,
          "time": 24.532118325000003,
          "velocity": 0.5354330708661418,
          "duration": 0.30952349999999385
        },
        {
          "name": "D#2",
          "midi": 39,
          "time": 24.555927825,
          "velocity": 0.7874015748031497,
          "duration": 0.06428564999999864
        },
        {
          "name": "D#2",
          "midi": 39,
          "time": 24.651165825,
          "velocity": 0.9448818897637795,
          "duration": 0.07142849999999967
        },
        {
          "name": "D#2",
          "midi": 39,
          "time": 24.74045145,
          "velocity": 0.9133858267716536,
          "duration": 0.06428564999999864
        },
        {
          "name": "D#2",
          "midi": 39,
          "time": 24.841641824999996,
          "velocity": 0.9448818897637795,
          "duration": 0.09285704999999922
        },
        {
          "name": "F4",
          "midi": 65,
          "time": 24.990451199999995,
          "velocity": 0.41732283464566927,
          "duration": 0.09523799999999838
        },
        {
          "name": "C#2",
          "midi": 37,
          "time": 25.127355824999995,
          "velocity": 0.9448818897637795,
          "duration": 0.23809499999999773
        },
        {
          "name": "E4",
          "midi": 64,
          "time": 25.133308199999995,
          "velocity": 0.41732283464566927,
          "duration": 0.13690462499999967
        },
        {
          "name": "D#4",
          "midi": 63,
          "time": 25.276165199999994,
          "velocity": 0.4566929133858268,
          "duration": 0.0988094249999989
        },
        {
          "name": "E4",
          "midi": 64,
          "time": 25.419022199999993,
          "velocity": 0.41732283464566927,
          "duration": 0.12857130000000083
        },
        {
          "name": "C#2",
          "midi": 37,
          "time": 25.690450499999994,
          "velocity": 0.9448818897637795,
          "duration": 0.1904760000000003
        },
        {
          "name": "C#2",
          "midi": 37,
          "time": 25.990450199999994,
          "velocity": 0.8818897637795275,
          "duration": 0.06904755000000051
        },
        {
          "name": "G#3",
          "midi": 56,
          "time": 26.002354949999994,
          "velocity": 0.3779527559055118,
          "duration": 0.11071417499999825
        },
        {
          "name": "C#2",
          "midi": 37,
          "time": 26.083307249999994,
          "velocity": 0.7874015748031497,
          "duration": 0.06904754999999696
        },
        {
          "name": "C#2",
          "midi": 37,
          "time": 26.178545249999992,
          "velocity": 0.9448818897637795,
          "duration": 0.07619040000000155
        },
        {
          "name": "C#2",
          "midi": 37,
          "time": 26.273783249999994,
          "velocity": 0.8031496062992126,
          "duration": 0.14285699999999935
        },
        {
          "name": "C#4",
          "midi": 61,
          "time": 26.291640374999993,
          "velocity": 0.3779527559055118,
          "duration": 0.3785710499999979
        },
        {
          "name": "C#2",
          "midi": 37,
          "time": 26.549973449999992,
          "velocity": 0.9448818897637795,
          "duration": 0.07499992500000019
        },
        {
          "name": "C#2",
          "midi": 37,
          "time": 26.64878287499999,
          "velocity": 0.7874015748031497,
          "duration": 0.06428564999999864
        },
        {
          "name": "C#2",
          "midi": 37,
          "time": 26.74640182499999,
          "velocity": 0.9448818897637795,
          "duration": 0.07499992500000019
        },
        {
          "name": "C#2",
          "midi": 37,
          "time": 26.84163982499999,
          "velocity": 0.8976377952755905,
          "duration": 0.06428564999999864
        },
        {
          "name": "C4",
          "midi": 60,
          "time": 26.86306837499999,
          "velocity": 0.3779527559055118,
          "duration": 0.31309492499999436
        },
        {
          "name": "C#2",
          "midi": 37,
          "time": 26.93687782499999,
          "velocity": 0.9448818897637795,
          "duration": 0.08095229999999987
        },
        {
          "name": "C#2",
          "midi": 37,
          "time": 27.02973487499999,
          "velocity": 0.9448818897637795,
          "duration": 0.06428564999999864
        },
        {
          "name": "C#2",
          "midi": 37,
          "time": 27.127353824999986,
          "velocity": 0.9448818897637795,
          "duration": 0.10357132499999722
        },
        {
          "name": "B3",
          "midi": 59,
          "time": 27.291639374999985,
          "velocity": 0.30708661417322836,
          "duration": 0.08095229999999987
        },
        {
          "name": "D#1",
          "midi": 27,
          "time": 27.424972574999984,
          "velocity": 0.9448818897637795,
          "duration": 0.23809500000000128
        },
        {
          "name": "A#3",
          "midi": 58,
          "time": 27.428543999999984,
          "velocity": 0.3779527559055118,
          "duration": 0.11071417499999825
        },
        {
          "name": "A3",
          "midi": 57,
          "time": 27.565448624999984,
          "velocity": 0.30708661417322836,
          "duration": 0.08690467499999954
        },
        {
          "name": "A#3",
          "midi": 58,
          "time": 27.710686574999986,
          "velocity": 0.3779527559055118,
          "duration": 0.12499987500000032
        },
        {
          "name": "D#1",
          "midi": 27,
          "time": 27.976162499999987,
          "velocity": 0.9448818897637795,
          "duration": 0.1904760000000003
        },
        {
          "name": "D#1",
          "midi": 27,
          "time": 28.276162199999987,
          "velocity": 0.8818897637795275,
          "duration": 0.05952375000000032
        },
        {
          "name": "D#3",
          "midi": 51,
          "time": 28.297590749999987,
          "velocity": 0.3779527559055118,
          "duration": 0.09523799999999838
        },
        {
          "name": "D#1",
          "midi": 27,
          "time": 28.369019249999987,
          "velocity": 0.7874015748031497,
          "duration": 0.05952375000000032
        },
        {
          "name": "D#1",
          "midi": 27,
          "time": 28.46425724999999,
          "velocity": 0.9448818897637795,
          "duration": 0.06666660000000135
        },
        {
          "name": "D#1",
          "midi": 27,
          "time": 28.55949524999999,
          "velocity": 0.8031496062992126,
          "duration": 0.1428570000000029
        },
        {
          "name": "F#3",
          "midi": 54,
          "time": 28.579733324999992,
          "velocity": 0.29133858267716534,
          "duration": 0.34523775000000256
        },
        {
          "name": "C2",
          "midi": 36,
          "time": 29.127351824999995,
          "velocity": 0.8976377952755905,
          "duration": 0.06904755000000051
        },
        {
          "name": "D#3",
          "midi": 51,
          "time": 29.148780374999994,
          "velocity": 0.3779527559055118,
          "duration": 0.3273806250000071
        },
        {
          "name": "C2",
          "midi": 36,
          "time": 29.222589824999996,
          "velocity": 0.9448818897637795,
          "duration": 0.08571420000000174
        },
        {
          "name": "C2",
          "midi": 36,
          "time": 29.315446875,
          "velocity": 0.9448818897637795,
          "duration": 0.06904755000000051
        },
        {
          "name": "C2",
          "midi": 36,
          "time": 29.413065825,
          "velocity": 0.9448818897637795,
          "duration": 0.14285699999999935
        },
        {
          "name": "A#3",
          "midi": 58,
          "time": 29.589256125,
          "velocity": 0.29133858267716534,
          "duration": 0.07142849999999967
        },
        {
          "name": "G1",
          "midi": 31,
          "time": 29.7047322,
          "velocity": 0.9448818897637795,
          "duration": 0.23809500000000128
        },
        {
          "name": "G3",
          "midi": 55,
          "time": 29.720208375,
          "velocity": 0.30708661417322836,
          "duration": 0.3869043750000003
        },
        {
          "name": "D#1",
          "midi": 27,
          "time": 30.270207825,
          "velocity": 0.8976377952755905,
          "duration": 0.06428564999999864
        },
        {
          "name": "D#3",
          "midi": 51,
          "time": 30.279731625,
          "velocity": 0.30708661417322836,
          "duration": 0.3214282499999932
        },
        {
          "name": "D#1",
          "midi": 27,
          "time": 30.365445825,
          "velocity": 0.9448818897637795,
          "duration": 0.08095229999999987
        },
        {
          "name": "D#1",
          "midi": 27,
          "time": 30.458302874999998,
          "velocity": 0.9448818897637795,
          "duration": 0.06428564999999864
        },
        {
          "name": "D#1",
          "midi": 27,
          "time": 30.555921824999995,
          "velocity": 0.9448818897637795,
          "duration": 0.10357132499999722
        },
        {
          "name": "A#3",
          "midi": 58,
          "time": 30.738064499999993,
          "velocity": 0.30708661417322836,
          "duration": 0.07738087499999935
        },
        {
          "name": "G1",
          "midi": 31,
          "time": 30.857111999999994,
          "velocity": 0.8031496062992126,
          "duration": 0.1904760000000003
        },
        {
          "name": "G3",
          "midi": 55,
          "time": 30.863064374999993,
          "velocity": 0.29133858267716534,
          "duration": 0.7202373749999964
        },
        {
          "name": "G1",
          "midi": 31,
          "time": 31.136873624999993,
          "velocity": 0.9448818897637795,
          "duration": 0.054761849999998446
        },
        {
          "name": "G1",
          "midi": 31,
          "time": 31.22854019999999,
          "velocity": 0.7874015748031497,
          "duration": 0.054761849999998446
        },
        {
          "name": "G1",
          "midi": 31,
          "time": 31.32377819999999,
          "velocity": 0.8582677165354331,
          "duration": 0.07142849999999967
        },
        {
          "name": "G1",
          "midi": 31,
          "time": 31.422587624999988,
          "velocity": 0.7874015748031497,
          "duration": 0.04047614999999993
        },
        {
          "name": "G1",
          "midi": 31,
          "time": 31.51425419999999,
          "velocity": 0.84251968503937,
          "duration": 0.065476125
        },
        {
          "name": "G1",
          "midi": 31,
          "time": 31.60711124999999,
          "velocity": 0.9448818897637795,
          "duration": 0.054761849999998446
        },
        {
          "name": "G1",
          "midi": 31,
          "time": 31.708301624999987,
          "velocity": 0.9448818897637795,
          "duration": 0.10952370000000045
        }
      ],
      "controlChanges": {},
      "id": 0,
      "name": "#default",
      "channelNumber": 0,
      "isPercussion": false
    }
  ]
}

window.onload = function() {
  new Game('screen');
  new SoundTrack(midiScore);
};