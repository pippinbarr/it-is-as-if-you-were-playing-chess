var MOVE_DELAY_MIN = 5;
var MOVE_DELAY_RANGE = 10;
var EMOTION_DELAY_MIN = 8;
var EMOTION_DELAY_RANGE = 8;
var EMOTION_DISPLAY_TIME = 10;

BasicGame.Game = function (game) {

  //	When a State is added to Phaser it automatically has the following properties set on it, even if they already exist:

  this.game;		//	a reference to the currently running game
  this.add;		//	used to add sprites, text, groups, etc
  this.camera;	//	a reference to the game camera
  this.cache;		//	the game cache
  this.input;		//	the global input manager (you can access this.input.keyboard, this.input.mouse, as well from it)
  this.load;		//	for preloading assets
  this.math;		//	lots of useful common math operations
  this.sound;		//	the sound manager - add a sound, play one, set-up markers, etc
  this.stage;		//	the game stage
  this.time;		//	the clock
  this.tweens;	//	the tween manager
  this.world;		//	the game world
  this.particles;	//	the particle manager
  this.physics;	//	the physics manager
  this.rnd;		//	the repeatable random number generator

  //	You can use any of these from any function within this State.
  //	But do consider them as being 'reserved words', i.e. don't create a property for your own game called "world" or you'll over-write the world reference.

};

var replay = false;
var gameIndex = 0;
var moveIndex = 0;
var games = [
  [["e2","e4"],["d2","d4"],["b1","c3"],["c1","e3"],["d1","d2"],["f2","f3"],["g1","e2"],["e3","h6"],["d2","h6"],["a2","a3"],["ooo1"],["ooo2"],["c1","b1"],["e2","c1"],["c1","b3"],["d1","d4"],["d4","d1"],["g2","g3"],["b3","a5"],["f1","h3"],["h7","f4"],["h1","e1"],["c3","d5"],["e4","d5"],["d1","d4"],["e1","e7"],["f4","d4"],["b2","b4"],["d4","c3"],["e7","a7"],["a7","b7"],["c3","f6"],["f6","a6"],["c2","c3"],["a6","a1"],["a1","b2"],["h3","f1"],["b7","d7"],["f1","c4"],["b2","h8"],["h8","a8"],["a8","a4"],["f3","f4"],["b1","c1"],["a4","a7"]],
  [["e2","e4"],["g1","f3"],["d2","d4"],["d4","e5"],["d1","f3"],["f1","c4"],["f3","b3"],["b1","c3"],["c1","g5"],["c3","b5"],["c4","b5"],["ooo1"],["ooo2"],["d1","d7"],["h1","d1"],["b5","d7"],["b3","b8"],["d1","d8"]],
  [["e2","e4"],["f2","f4"],["g1","f3"],["h2","h4"],["f3","e5"],["e5","f4"],["d2","d3"],["c1","f4"],["d1","e2"],["g4","f6"],["f4","c7"],["f6","d5"],["d5","e7"],["e2","g4"],["g4","f4"],["f4","f7"],["e1","d2"],["b1","a3"],["f7","h5"],["h5","h1"],["h1","h4"],["a1","b1"],["h4","a4"],]
];


BasicGame.Game.prototype = {

  create: function () {

    gameIndex = 0;
    moveIndex = 0;

    this.game.stage.backgroundColor = '#333333';

    this.arrowTween = null;
    this.destTween = null;

    this.gameOver = false;

    var titleStyle = {
      font: '36pt sans-serif',
      fill: '#FFFFFF',
      align: 'left',
      wordWrapWidth: 400,
      wordWrap: true
    }
    this.titleText = this.add.text(40, 40, "It is as if you were playing chess.", titleStyle);
    this.titleText.alpha = 0;

    this.gameOverText = this.add.text(40,40, "Game over.", titleStyle);
    this.gameOverText.alpha = 0;

    this.nextMoveDelay = this.getMoveDelay();

    var bmd = this.game.add.bitmapData(50,50);
    bmd.ctx.fillStyle = 'white';
    bmd.ctx.beginPath();
    bmd.ctx.arc(25, 25, 20, 0, Math.PI*2, true);
    bmd.ctx.closePath();
    bmd.ctx.fill();
    this.piece = this.game.add.sprite(180,530,bmd);
    this.piece.anchor.x = 0.5;
    this.piece.anchor.y = 0.5;

    this.piece.x = this.notationToLocation(games[gameIndex][moveIndex][0]).x;
    this.piece.y = this.notationToLocation(games[gameIndex][moveIndex][0]).y;

    this.piece.inputEnabled = true;
    this.piece.input.enableDrag(false);
    this.piece.start = {x: this.piece.x, y: this.piece.y};

    var bmd = this.game.add.bitmapData(50,50);
    bmd.ctx.strokeStyle = 'white';
    bmd.ctx.setLineDash([8, 4]);
    bmd.ctx.lineWidth = 2;
    bmd.ctx.beginPath();
    bmd.ctx.arc(25, 25, 20, 0, Math.PI*2, true);
    bmd.ctx.closePath();
    bmd.ctx.stroke();
    this.dest = this.game.add.sprite(180,470,bmd);
    this.dest.anchor.x = 0.5;
    this.dest.anchor.y = 0.5;

    this.dest.x = this.notationToLocation(games[gameIndex][moveIndex][1]).x;
    this.dest.y = this.notationToLocation(games[gameIndex][moveIndex][1]).y;

    this.arrowBmd = this.game.add.bitmapData(this.game.width,this.game.height);
    this.arrowCtx = this.arrowBmd.ctx;
    drawLineArrow(this.arrowCtx,this.piece.x,this.piece.y,this.dest.x,this.dest.y);
    this.arrow = this.game.add.sprite(0,0,this.arrowBmd);

    this.lookHereXBmd = this.game.add.bitmapData(this.game.width/16,this.game.width/16);
    this.lookHereXCtx = this.lookHereXBmd.ctx;
    drawX(this.lookHereXCtx,this.game.width/16,this.game.width/16);
    this.lookHereX = this.game.add.sprite(100,100,this.lookHereXBmd);
    this.lookHereX.anchor.x = this.lookHereX.anchor.y = 0.5;

    var lookHereInstructionStyle = {
      font: '14pt sans-serif',
      fill: '#FFFFFF',
      align: 'center',
      wordWrapWidth: 100,
      wordWrap: true,
    }

    this.lookHereInstructionText = this.add.text(0, 0, "look\nhere", lookHereInstructionStyle);
    this.lookHereInstructionText.lineSpacing = -10;
    this.lookHereInstructionText.anchor.x = 0.5;
    this.lookHereInstructionText.x = this.lookHereX.x;
    this.lookHereInstructionText.y = this.lookHereX.y + this.lookHereX.height/2;

    this.lookHereX.alpha = 0;
    this.lookHereInstructionText.alpha = 0;
    this.lookHereX.show = false;

    this.showLookHere();


    this.setupDragUI();

    var bmd = this.game.add.bitmapData(this.game.width,1);
    bmd.ctx.strokeStyle = 'white';
    bmd.ctx.setLineDash([8, 8]);
    bmd.ctx.lineWidth = 1;
    bmd.ctx.beginPath();
    bmd.ctx.moveTo(0,0);
    bmd.ctx.lineTo(this.game.width,0);
    bmd.ctx.closePath();
    bmd.ctx.stroke();
    this.divider = this.game.add.sprite(0,540,bmd);
    this.divider.alpha = 0;

    var emotionInstructionStyle = {
      font: '14pt sans-serif',
      fill: '#FFFFFF',
      align: 'left',
      wordWrapWidth: 400,
      wordWrap: true
    }
    this.emotionInstructionText = this.add.text(40, this.divider.y + 12, "Look thoughtful.", emotionInstructionStyle);
    this.emotionInstructionText.alpha = 0;
    this.emotionDisplayEvent = null;
    this.emotionFadeOutEvent = null;

    this.setupEmotion();

    var playAgainInstructionStyle = {
      font: '14pt sans-serif',
      fill: '#FFFFFF',
      align: 'left',
      wordWrapWidth: 100,
      wordWrap: true
    }

    this.playAgainInstructionText = this.add.text(0, 0, "play again", playAgainInstructionStyle);

    // Get setup for opening
    this.titleText.alpha = 0;
    this.dragInstructionText.alpha = 0;
    this.toHereInstructionText.alpha = 0;
    this.emotionInstructionText.alpha = 0;
    this.playAgainInstructionText.alpha = 0;
    this.divider.alpha = 0;
    this.piece.alpha = 0;
    this.dest.alpha = 0;
    this.arrow.alpha = 0;
    this.piece.input.draggable = false;

    this.game.add.tween(this.titleText).to({alpha: 1},1000).start().onComplete.add(function () {
      this.game.add.tween(this.divider).to({alpha: 1},1000).start().onComplete.add(function () {
        this.game.time.events.add(3000, function () {
          this.showEmotion();
        }, this);
        this.piece.input.draggable = true;
        this.game.add.tween(this.piece).to({alpha: 1},1000).start();
        this.destTween = this.game.add.tween(this.dest);
        this.destTween.to({alpha: 1},1000).start();
        if (this.arrowTween != null) this.arrowTween.pause();
        this.arrowTween = this.game.add.tween(this.arrow)
        this.arrowTween.to({alpha: 1},1000).start().onComplete.add(function () {
          this.game.add.tween(this.dragInstructionText).to({alpha: 1},750).start().onComplete.add(function () {
            this.game.add.tween(this.toHereInstructionText).to({alpha: 1},750).start().onComplete.add(function () {
              this.game.time.events.add(1000, function () {
              }, this);
            }, this);
          }, this);
        }, this);
      },this);
    },this);

    if (replay) {
      this.dragInstructionText.visible = false;
      this.toHereInstructionText.visible = false;
      this.titleText.visible = false;
    }

  },

  showLookHere: function () {
    this.lookHereX.visible = this.lookHereX.show;
    this.lookHereInstructionText.visible = this.lookHereX.show;

    var pos = this.getRandomBoardPosition();
    this.lookHereX.x = pos.x;
    this.lookHereX.y = pos.y;
    this.lookHereInstructionText.x = this.lookHereX.x;
    this.lookHereInstructionText.y = this.lookHereX.y + this.lookHereX.height/2;
    this.game.add.tween(this.lookHereInstructionText).to({alpha: 1},250).start();
    this.game.add.tween(this.lookHereX).to({alpha: 1},250).start().onComplete.add(function () {
      this.game.time.events.add(500,function () {
        this.game.add.tween(this.lookHereInstructionText).to({alpha: 0},250).start();
        this.game.add.tween(this.lookHereX).to({alpha: 0},250).start().onComplete.add(function () {
          this.showLookHere();
        },this);
      },this);
    },this);
  },

  setupDragUI: function () {

    var dragInstructionStyle = {
      font: '14pt sans-serif',
      fill: '#FFFFFF',
      align: 'left',
      wordWrapWidth: 100,
      wordWrap: true
    }

    this.dragInstructionText = this.add.text(this.piece.x + this.piece.width/1.5, this.piece.y, "drag this", dragInstructionStyle);
    this.toHereInstructionText = this.add.text(this.dest.x + this.dest.width/1.5, this.dest.y, "to here", dragInstructionStyle);

    this.dragInstructionText.anchor.y = 0.5;
    this.toHereInstructionText.anchor.y = 0.5;

    this.piece.events.onDragStart.add(function () {

      // FADE OUT THE ARROW
      if (this.arrowTween != null) this.arrowTween.pause();
      this.arrowTween = this.game.add.tween(this.arrow);
      this.arrowTween.to({alpha: 0},500).start();

      // IF INSTRUCTIONS ARE VISIBLE, FADE THEM OUT
      if (this.dragInstructionText.visible) {
        this.game.add.tween(this.dragInstructionText).to({alpha: 0},500).start();
        this.game.add.tween(this.toHereInstructionText).to({alpha: 0},500).start();
      }
      if (this.gameOver) {
        this.game.add.tween(this.playAgainInstructionText).to({alpha: 0},500).start();
      }

      // WAIT AND THEN FADE OUT THE TITLE IF APPLICABLE
      if (this.titleText.visible) {
        this.game.time.events.add(Phaser.Timer.SECOND * 1, function () {
          this.game.add.tween(this.titleText).to({alpha: 0},500).start().onComplete.add(function () {
            this.titleText.visible = false;
          },this);
        },this);
      }
    },this); // END ON DRAG START


    // ON DRAG STOP //

    this.piece.events.onDragStop.add(function () {

      // IF THE PIECE IS CLOSE ENOUGH TO THE DESTINATION
      if (this.piece.position.distance(this.dest.position) < this.piece.width/2) {
        // if (this.game.physics.arcade.distanceBetween(this.piece,this.dest) < this.piece.width/2) {

        // SNAP TO DESTINATION
        this.pieceTween = this.game.add.tween(this.piece).to({x: this.dest.x, y: this.dest.y},100).start();

        // HIDE INSTRUCTIONS
        this.toHereInstructionText.visible = false;
        this.dragInstructionText.visible = false;

        // FADE OUT THE DESTINATION INDICATOR
        if (this.destTween != null) this.destTween.pause();
        this.destTween = this.game.add.tween(this.dest)
        this.destTween.to({alpha: 0},500).start();

        // MAKE THE PIECE NOT DRAGGABLE
        this.piece.input.draggable = false;

        // PAUSE FOR A SECOND AND THEN FADE OUT THE PIECE
        this.game.time.events.add(Phaser.Timer.SECOND * 1, function () {
          // HANDLE THE SPECIAL CASE WHERE THIS WAS THE PLAY AGAIN UI
          if (this.gameOver) {
            this.game.add.tween(this.playAgainInstructionText).to({alpha: 0},500).start();
            this.game.add.tween(this.piece).to({alpha: 0},500).start().onComplete.add(function () {
              this.game.add.tween(this.gameOverText).to({alpha: 0},1000).start();
              this.game.add.tween(this.divider).to({alpha: 0},1000).start();
              this.game.add.tween(this.emotionInstructionText).to({alpha: 0},1000).start().onComplete.add(function () {
                this.game.time.events.add(1000,function () {
                  replay = true;
                  this.game.state.start("Game");
                },this);
              },this);
            },this);
          }
          else {
            // OTHERWISE THIS IS A STANDARD MOVING OF A PIECE, SO TWEEN OUT THE PIECE
            this.game.add.tween(this.piece).to({alpha: 0},500).start();


            // IF THIS MOVE WAS THE FINAL MOVE
            // THEN WE MOVE ON AFTER IT AT A DIFFERENT DELAY
            if (moveIndex == games[gameIndex].length - 1) {
              this.nextMoveDelay = this.getGameOverDelay();
            }

            if (!this.gameOver) {
              this.game.time.events.add(750, function () {
                this.lookHereX.show = true;
              },this);
              this.game.time.events.add(Phaser.Timer.SECOND * (this.nextMoveDelay/2), function () {
                this.lookHereX.show = false;
              },this);
            }

            // THEN DELAY BEFORE THE NEXT MOVE
            this.game.time.events.add(Phaser.Timer.SECOND * this.nextMoveDelay, function () {
              moveIndex++;
              // CHECK IF THE MOVE WAS THE FINAL MOVE
              if (moveIndex < games[gameIndex].length) {
                // NOT THE FINAL MOVE
                var move = games[gameIndex][moveIndex];
                // MAKE THE NEXT MOVE AVAILABLE
                if (move[0].indexOf("o") != -1) {
                  this.handleCastling(move);
                }
                else {
                  this.setupMove(move[0],move[1]);
                }
              }
              else {
                // GAME OVER
                this.gameOver = true;
                this.showFinalEmotion();
              }
            },this);
          }
        },this);
      }
      // ELSE IF THE PIECE IS TOO FAR FROM THE DESTINATION
      else {
        this.handleBadMove();
      }
    },this);
  },



  getRandomBoardPosition: function () {
    var files = "abcdefgh";
    var ranks = "12345678";
    var randomSquare = files[Math.floor(Math.random() * files.length)] + "" + ranks[Math.floor(Math.random() * ranks.length)];
    return this.notationToLocation(randomSquare);
  },

  handleBadMove: function () {
    // TWEEN IT BACK TO ITS START POSITION
    this.pieceTween = this.game.add.tween(this.piece);
    this.pieceTween.to({x: this.piece.start.x, y: this.piece.start.y},100);
    this.pieceTween.start();

    // FADE THE ARROW BACK IN
    if (this.arrowTween != undefined) this.arrowTween.pause();
    this.arrowTween = this.game.add.tween(this.arrow);
    this.arrowTween.to({alpha: 1},500).start();


    // FADE THE DRAG INSTRUCTION BACK IN IF RELEVANT
    if (this.dragInstructionText.visible) {
      this.game.add.tween(this.dragInstructionText).to({alpha: 1},500).start();
      this.game.add.tween(this.toHereInstructionText).to({alpha: 1},500).start();
    }
    if (this.gameOver) {
      this.game.add.tween(this.playAgainInstructionText).to({alpha: 1},500).start();
    }
  },

  handleCastling: function (move) {
    // CASTLING
    if (move[0].indexOf("ooo") != -1) {
      // QUEEN'S SIDE
      if (move[0].indexOf("1") != -1) {
        // FIRST MOVE (KING)
        this.setupMove("e1","c1",true);
        this.nextMoveDelay = 0.5;
      }
      else {
        // SECOND MOVE (ROOK)
        this.setupMove("a1","d1");
        this.nextMoveDelay = this.getMoveDelay();
      }
    }
    else {
      // KING'S SIDE
      if (move.indexOf("1") != -1) {
        // FIRST MOVE (KING)
        this.setupMove("e1","g1",true);
        this.nextMoveDelay = 0.5;
      }
      else {
        // SECOND MOVE (ROOK)
        this.setupMove("h1","f1");
        this.nextMoveDelay = this.getMoveDelay();
      }
    }
  },

  showEmotion: function () {
    console.log("showEmotion() ...");
    this.emotionInstructionText.text = this.getEmotion();
    this.game.add.tween(this.emotionInstructionText).to({alpha: 1},2000).start();
    var emotionDisplayTime = 1000*EMOTION_DISPLAY_TIME;
    console.log("showEmotion(): setting emotionFadeOutEvent");
    this.emotionFadeOutEvent = this.game.time.events.add(emotionDisplayTime, function () {
      console.log("showEmotion(): nulling emotionFadeOutEvent");
      this.emotionFadeOutEvent = null;
      this.game.add.tween(this.emotionInstructionText).to({alpha: 0},2000).start();
      var emotionDelayTime = 1000 * (EMOTION_DELAY_MIN + Math.random() * EMOTION_DELAY_RANGE);
      console.log("showEmotion(): setting emotionDisplayEvent");
      this.emotionDisplayEvent = this.game.time.events.add(emotionDelayTime, function () {
        this.emotionDisplayEvent = null;
        console.log("showEmotion(): nulling emotionDisplayEvent")
        this.showEmotion();
      },this);
    },this);
  },

  // Called when gameOver = true,
  // that is, the final move has been made and the piece has faded out and we have had a delay
  // Need to work out how to show a final emotion and then show the game is over after fading it out.
  showFinalEmotion: function () {
    console.log("showFinalEmotion() ...");
    console.log("... emotionDisplayEvent = " + this.emotionDisplayEvent);
    console.log("... emotionFadeOutEvent = " + this.emotionFadeOutEvent);

    // If there is an emotion already scheduled, kill it
    if (this.emotionDisplayEvent != null) {
      this.game.time.events.remove(this.emotionDisplayEvent);
      // Now schedule a new one to come up IN two seconds FOR three seconds
      this.emotionInstructionText.text = this.getEmotion();
      this.game.add.tween(this.emotionInstructionText).to({alpha: 1},2000).start();
      var emotionDisplayTime = 3000;
      this.lookHereX.show = false;
      this.game.time.events.add(emotionDisplayTime, function () {
        this.game.add.tween(this.emotionInstructionText).to({alpha: 0},2000).start().onComplete.add(function () {
          this.showGameOver();
        },this);
      },this);
    }
    // If there is an emotion already displayed or fading in, keep it
    else if (this.emotionFadeOutEvent != null) {
      this.game.time.events.remove(this.emotionFadeOutEvent);
      // Hold for three seconds, then fade out and transition to game over
      var emotionDisplayTime = 3000;
      this.game.time.events.add(emotionDisplayTime, function () {
        this.emotionInstructionText.text = this.getEmotion();
        this.game.add.tween(this.emotionInstructionText).to({alpha: 0},2000).start().onComplete.add(function () {
          this.showGameOver();
        },this);
      },this);
    }
    else {
      this.emotionInstructionText.text = this.getEmotion();
      this.game.add.tween(this.emotionInstructionText).to({alpha: 1},2000).start();
      var emotionDisplayTime = 3000;
      this.game.time.events.add(emotionDisplayTime, function () {
        this.game.add.tween(this.emotionInstructionText).to({alpha: 0},2000).start().onComplete.add(function () {
          this.showGameOver();
        },this);
      },this);
    }

  },

  showGameOver: function () {
    this.game.add.tween(this.gameOverText).to({alpha: 1},1000).start().onComplete.add(function () {
      var pieceLoc = this.notationToLocation("d4");
      var destLoc = this.notationToLocation("e4");
      this.piece.x = pieceLoc.x;
      this.piece.y = pieceLoc.y;
      this.piece.start.x = this.piece.x;
      this.piece.start.y = this.piece.y;
      this.dest.x = destLoc.x;
      this.dest.y = destLoc.y;
      this.playAgainInstructionText.anchor.x = 0.5;
      this.playAgainInstructionText.x = this.game.width/2;
      this.playAgainInstructionText.y = this.piece.y + this.piece.height*0.5;
      this.arrow.destroy(true,true);
      this.arrowBmd = this.game.add.bitmapData(this.game.width,this.game.height);
      this.arrowCtx = this.arrowBmd.ctx;
      this.arrowCtx.clearRect(0, 0, this.game.width, this.game.height);
      drawLineArrow(this.arrowBmd.ctx,this.piece.x,this.piece.y,this.dest.x,this.dest.y);
      this.arrow = this.game.add.sprite(0,0,this.arrowBmd);

      this.piece.input.draggable = true;
      this.game.add.tween(this.piece).to({alpha: 1},500).start();
      this.destTween = this.game.add.tween(this.dest);
      this.destTween.to({alpha: 1},500).start();
      if (this.arrowTween != null) this.arrowTween.pause();
      this.arrowTween = this.game.add.tween(this.arrow);
      this.arrowTween.to({alpha: 1},500).start().onComplete.add(function () {
        this.game.add.tween(this.playAgainInstructionText).to({alpha: 1},500).start();
      },this);
    },this);
  },

  getMoveDelay: function () {
    return MOVE_DELAY_MIN + Math.random() * MOVE_DELAY_RANGE;
  },

  getGameOverDelay: function () {
    return 0.5 + Math.random() * MOVE_DELAY_RANGE;
  },

  setupMove: function (moveFrom, moveTo) {
    this.piece.x = this.notationToLocation(moveFrom).x;
    this.piece.y = this.notationToLocation(moveFrom).y;

    this.piece.start.x = this.piece.x;
    this.piece.start.y = this.piece.y;

    this.dest.x = this.notationToLocation(moveTo).x;
    this.dest.y = this.notationToLocation(moveTo).y;

    this.pieceTween = this.game.add.tween(this.piece);
    this.pieceTween.to({alpha: 1},500);
    this.pieceTween.start();

    this.destTween = this.game.add.tween(this.dest);
    this.destTween.to({alpha: 1},500);
    this.destTween.start();

    this.arrow.destroy(true,true);
    this.arrowBmd = this.game.add.bitmapData(this.game.width,this.game.height);
    this.arrowCtx = this.arrowBmd.ctx;
    this.arrowCtx.clearRect(0, 0, this.game.width, this.game.height);
    drawLineArrow(this.arrowBmd.ctx,this.piece.x,this.piece.y,this.dest.x,this.dest.y);
    this.arrow = this.game.add.sprite(0,0,this.arrowBmd);

    if (this.arrowTween != null) this.arrowTween.pause();
    this.arrowTween = this.game.add.tween(this.arrow);
    this.arrowTween.to({alpha: 1},500).start();

    this.piece.input.draggable = true;
  },

  update: function () {

    //	Honestly, just about anything could go here. It's YOUR game after all. Eat your heart out!
  },

  quitGame: function (pointer) {

    //	Here you should destroy anything you no longer need.
    //	Stop music, delete sprites, purge caches, free resources, all that good stuff.

    //	Then let's go back to the main menu.
    this.state.start('MainMenu');

  },

  letterToNumber: {
    a: 1,
    b: 2,
    c: 3,
    d: 4,
    e: 5,
    f: 6,
    g: 7,
    h: 8
  },

  notationToLocation: function (square) {

    var file = square[0];
    var rank = square[1];
    var fileNum = this.letterToNumber[file];

    var squareSize = this.game.width/8;

    var xLoc = (fileNum-1) * squareSize + squareSize/2;
    var yLoc = (8-rank) * squareSize + squareSize/2;

    return {
      x: xLoc,
      y: yLoc
    }
  },

  setupEmotion: function () {
    this.emotionGrammar = tracery.createGrammar(
      {
        "origin": "#emotionPhrase.capitalize#.",

        "emotionPhrase": ["#physicalaction#, then #emotionalexpression#","#emotionalexpression#, then #physicalaction#","#physicalaction# and #emotionalexpression#","#emotionalexpression# and #physicalaction#"],

        "physicalaction": ["#physicalqualifier# #physicalsubaction# your #bodypart#","#breathingaction# #breathingqualifier#","#headaction# your head","stretch your #stretchablebodypart#"],
        "physicalqualifier": ["lightly","briefly","slowly","dreamily","absently","wearily"],
        "physicalsubaction": ["scratch","rub","itch","touch","press","tap","stroke"],
        "bodypart": ["chin","eyebrow","neck","shoulder","ear","collarbone","nose","jaw","face","forehead"],
        "breathingaction": ["breathe in","breathe out","sigh"],
        "breathingqualifier": ["slowly","sharply","loudly","calmly","quickly","suddenly","peacefully","serenely"],
        "headaction": ["shake","nod","tilt","lower","raise"],
        "stretchablebodypart": ["neck","fingers","wrists","arms","shoulders","back","legs"],

        "emotionalexpression": ["look #facialexpression#","raise your #side# eyebrow","furrow your brow","#eyeaction# your eyes","grit your teeth","bite your lip","purse your lips","wince","cringe","swallow","smirk","yawn","flare your nostrils","#laughaction# #laughqualifier#","mutter under your breath","cover your mouth"],
        "facialexpression": ["pensive","thoughtful","proud","concerned","optimistic","ambiguous","abstracted","impassive","sullen","disgusted","upset","elated","depressed","superior","defeated","worried","concerned","amused","happy","satisfied","engaged","intense","focused","lost","irritated"],
        "side": ["right","left"],
        "eyeaction": ["squint","narrow","widen","close","blink"],
        "laughaction": ["laugh","chuckle","grimace","groan","mutter","exhale","wince"],
        "laughqualifier": ["softly","quietly","gently","sadly","a little"]
      }
    );
  },

  getEmotion: function () {
    return this.emotionGrammar.flatten("#origin#");
  },

};
