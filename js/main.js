var game = new Game();

function init() {
	game.init();
}

var imageRepository = new function() {
	this.background = new Image();
	this.character = new Image();
	this.bullet = new Image();
	this.enemy = new Image();
	this.enemyBullet = new Image();
	var numImages = 5;
	var numLoaded = 0;

	function imageLoaded() {
		numLoaded++;
		if (numLoaded === numImages) {
			window.init();
		}
	}

	this.background.onload = function() {
		imageLoaded();
	}
	this.character.onload = function() {
		imageLoaded();
	}
	this.bullet.onload = function() {
		imageLoaded();
	}
	this.enemy.onload = function(){
		imageLoaded();
	}
	this.enemyBullet.onload = function(){
		imageLoaded();
	}

	this.background.src = "imgs/background.png";
	this.character.src = "imgs/marine.gif";
	this.bullet.src = "imgs/bullet.png";
	this.enemy.src = "imgs/hydralisk.gif";
	this.enemyBullet.src = "imgs/bullet_enemy.png";
}


function Drawable() {
	this.init = function(x, y, width, height) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
	}
	
	this.speed = 0;
	this.canvasWidth = 0;
	this.canvasHeight = 0;
	this.collidableWith = "";
	this.isColliding = false;
	this.type = "";
	
	this.isCollidableWith = function (object) {
		return (this.collidableWith === object.type);
	};
}

function Game() {
	var counter = 0;
	this.init = function() {
		this.bgCanvas = document.getElementById('background');
		this.marineCanvas = document.getElementById('marine');
		this.mainCanvas = document.getElementById('main');
		
		if (this.bgCanvas.getContext) {
			this.bgContext = this.bgCanvas.getContext('2d');
			this.marineContext = this.marineCanvas.getContext('2d');
			this.mainContext = this.mainCanvas.getContext('2d');
		
			Background.prototype.context = this.bgContext;
			Background.prototype.canvasWidth = this.bgCanvas.width;
			Background.prototype.canvasHeight = this.bgCanvas.height;
			
			Marine.prototype.context = this.marineContext;
			Marine.prototype.canvasWidth = this.marineCanvas.width;
			Marine.prototype.canvasHeight = this.marineCanvas.height;
			
			Bullet.prototype.context = this.mainContext;
			Bullet.prototype.canvasWidth = this.mainCanvas.width;
			Bullet.prototype.canvasHeight = this.mainCanvas.height;
			
			Enemy.prototype.context = this.mainContext;
			Enemy.prototype.canvasWidth = this.mainCanvas.width;
			Enemy.prototype.canvasHeight = this.mainCanvas.height;

			this.background = new Background();
			this.background.init(0,0); 

			this.marine = new Marine();

			this.marineStartX = this.marineCanvas.width/2 - imageRepository.character.width;
			this.marineStartY = this.marineCanvas.height/4*3 + imageRepository.character.height*2-15;
			this.marine.init(this.marineStartX, this.marineStartY, imageRepository.character.width, imageRepository.character.height);

			this.enemyPool = new Pool(30);
			this.enemyPool.init("enemy");
			this.spawnWave();

			this.enemyBulletPool = new Pool(150);
			this.enemyBulletPool.init("enemyBullet");
			this.quadTree = new QuadTree({x:0,y:0,width:this.mainCanvas.width,height:this.mainCanvas.height});
			
			this.playerScore = 0;
			this.health = 100;

			this.shoot = new SoundPool(10);
			this.shoot.init("shoot");

			this.hydraDeath = new SoundPool(20);
			this.hydraDeath.init("hydraDeath");

			this.stimpack = new SoundPool(1);
			this.stimpack.init("stimpack");

			this.marineDeath = new SoundPool(1);
			this.marineDeath.init("marineDeath");

			this.backgroundAudio = new Audio("sounds/Terran_theme.mp3");
			this.backgroundAudio.loop = true;
			this.backgroundAudio.volume = .25;
			this.backgroundAudio.load();

			this.checkAudio = window.setInterval(function(){checkReadyState()},1000);
		}
	};
	this.spawnWave = function() {
		var height = imageRepository.enemy.height;
		var width = imageRepository.enemy.width;
		var x = 160;
		var y = -height;
		var spacer = y;
		counter++;
		for (var i = 1; i <= counter; i++) {
			this.enemyPool.get(x, y, 2);
			x += width + 25;
			if (i % 5 == 0) {
				x = 160;
 				y += spacer
			}
		}
	}

	this.start = function() {
		document.getElementById('start-up').style.display = "none";
		this.marine.draw();
		this.backgroundAudio.play();
		animate();
	};

	this.restart = function() {
		document.getElementById('game-over').style.display = "none";
		this.bgContext.clearRect(0, 0, this.bgCanvas.width, this.bgCanvas.height);
		this.marineContext.clearRect(0, 0, this.marineCanvas.width, this.marineCanvas.height);
		this.mainContext.clearRect(0, 0, this.mainCanvas.width, this.mainCanvas.height);

		this.quadTree.clear();

		this.background.init(0,0);
		this.marine.init(this.marineStartX, this.marineStartY,
		               imageRepository.character.width, imageRepository.character.height);

		this.enemyPool.init("enemy");
		this.spawnWave();
		this.enemyBulletPool.init("enemyBullet");

		this.playerScore = 100;
		this.health = 100;

		this.backgroundAudio.currentTime = 0;
		this.backgroundAudio.play();

		this.start();
	};

	this.gameOver = function() {
		this.backgroundAudio.pause();
		counter = 0;
		game.marineDeath.get();
		document.getElementById('game-over').style.display = "block";
	};
}

function checkReadyState() {
	if (game.backgroundAudio.readyState === 4) {
		window.clearInterval(game.checkAudio);
		document.getElementById('start-up').style.display = "block";		
	}
}

function animate() {
	document.getElementById('score').innerHTML = game.playerScore;
	document.getElementById('health').innerHTML = game.health;

	game.quadTree.clear();
	game.quadTree.insert(game.marine);
	game.quadTree.insert(game.marine.bulletPool.getPool());
	game.quadTree.insert(game.enemyPool.getPool());
	game.quadTree.insert(game.enemyBulletPool.getPool());

	detectCollision();

	if (game.enemyPool.getPool().length === 0) {
		game.spawnWave();
	}

	if (game.marine.alive){
		requestAnimFrame(animate);
		game.background.draw();
		game.marine.move();
		game.marine.bulletPool.animate(); 
		game.enemyPool.animate();
		game.enemyBulletPool.animate();
	}
}

function detectCollision() {
	var objects = [];
	game.quadTree.getAllObjects(objects);
	for (var x = 0, len = objects.length; x < len; x++) {
		game.quadTree.findObjects(obj = [], objects[x]);
		for (y = 0, length = obj.length; y < length; y++) {
			if (objects[x].collidableWith === obj[y].type &&
				(objects[x].x < obj[y].x + obj[y].width &&
			     objects[x].x + objects[x].width > obj[y].x &&
				 objects[x].y < obj[y].y + obj[y].height &&
				 objects[x].y + objects[x].height > obj[y].y)) {
				objects[x].isColliding = true;
				obj[y].isColliding = true;
			}
		}
	}
};

KEY_CODES = {
  32: 'space',
  37: 'left',
  38: 'up',
  39: 'right',
  40: 'down',
  83: 'stimpack',
}

KEY_CODES = {
  32: 'space',
  37: 'left',
  38: 'up',
  39: 'right',
  40: 'down',
  83: 'stimpack',
}


KEY_STATUS = {};
for (code in KEY_CODES) {
  KEY_STATUS[KEY_CODES[code]] = false;
}

document.onkeydown = function(e) {
  var keyCode = (e.keyCode) ? e.keyCode : e.charCode;
  if (KEY_CODES[keyCode]) {
	e.preventDefault();
	KEY_STATUS[KEY_CODES[keyCode]] = true;
  }
}

document.onkeyup = function(e) {
  var keyCode = (e.keyCode) ? e.keyCode : e.charCode;
  if (KEY_CODES[keyCode]) {
    e.preventDefault();
    KEY_STATUS[KEY_CODES[keyCode]] = false;
  }
}

window.requestAnimFrame = (function(){
	return  window.requestAnimationFrame       || 
			window.webkitRequestAnimationFrame || 
			window.mozRequestAnimationFrame    || 
			window.oRequestAnimationFrame      || 
			window.msRequestAnimationFrame     || 
			function(callback, element){
				window.setTimeout(callback, 1000 / 60);
			};
})();