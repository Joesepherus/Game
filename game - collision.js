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

function Background() {
	this.draw = function() {
		this.context.drawImage(imageRepository.background, this.x, this.y);
	};
}
Background.prototype = new Drawable();

function Bullet(object) {
	this.alive = false;
	var self = object;

	this.spawn = function(x, y, speed) {
		this.x = x;
		this.y = y;
		this.speed = speed;
		this.alive = true;
	};

	this.draw = function() {
		this.context.clearRect(this.x, this.y, this.width, this.height);
		this.y -= this.speed;

		if (this.isColliding){
			return true;
		}

		if (self === "bullet" && this.y <= 0 - this.height) {
			return true;
		}
		else if (self === "enemyBullet" && this.y >= this.canvasHeight) {
			return true;
		}
		else {
			if (self === "bullet") {
				this.context.drawImage(imageRepository.bullet, this.x, this.y);
			}
			else if (self === "enemyBullet") {
				this.context.drawImage(imageRepository.enemyBullet, this.x, this.y);
			}
			return false;
		}
	};

	this.clear = function() {
		this.x = 0;
		this.y = 0;
		this.speed = 0;
		this.alive = false;
		this.isColliding = false;
	};
}
Bullet.prototype = new Drawable();

function QuadTree(boundBox, lvl) {
	var maxObjects = 10;
	this.bounds = boundBox || {
		x: 0,
		y: 0,
		width: 0,
		height: 0
	};
	var objects = [];
	this.nodes = [];
	var level = lvl || 0;
	var maxLevels = 5;

	this.clear = function() {
		objects = [];

		for (var i = 0; i < this.nodes.length; i++) {
			this.nodes[i].clear();
		}

		this.nodes = [];
	};

	this.getAllObjects = function(returnedObjects) {
		for (var i = 0; i < this.nodes.length; i++) {
			this.nodes[i].getAllObjects(returnedObjects);
		}

		for (var i = 0, len = objects.length; i < len; i++) {
			returnedObjects.push(objects[i]);
		}

		return returnedObjects;
	};

	this.findObjects = function(returnedObjects, obj) {
		if (typeof obj === "undefined") {
			console.log("UNDEFINED OBJECT");
			return;
		}

		var index = this.getIndex(obj);
		if (index != -1 && this.nodes.length) {
			this.nodes[index].findObjects(returnedObjects, obj);
		}

		for (var i = 0, len = objects.length; i < len; i++) {
			returnedObjects.push(objects[i]);
		}

		return returnedObjects;
	};

	this.insert = function(obj) {
		if (typeof obj === "undefined") {
			return;
		}

		if (obj instanceof Array) {
			for (var i = 0, len = obj.length; i < len; i++) {
				this.insert(obj[i]);
			}

			return;
		}

		if (this.nodes.length) {
			var index = this.getIndex(obj);
			if (index != -1) {
				this.nodes[index].insert(obj);

				return;
			}
		}

		objects.push(obj);

		if (objects.length > maxObjects && level < maxLevels) {
			if (this.nodes[0] == null) {
				this.split();
			}

			var i = 0;
			while (i < objects.length) {

				var index = this.getIndex(objects[i]);
				if (index != -1) {
					this.nodes[index].insert((objects.splice(i,1))[0]);
				}
				else {
					i++;
				}
			}
		}
	};

	this.getIndex = function(obj) {

		var index = -1;
		var verticalMidpoint = this.bounds.x + this.bounds.width / 2;
		var horizontalMidpoint = this.bounds.y + this.bounds.height / 2;
		var topQuadrant = (obj.y < horizontalMidpoint && obj.y + obj.height < horizontalMidpoint);
		var bottomQuadrant = (obj.y > horizontalMidpoint);

		if (obj.x < verticalMidpoint &&
				obj.x + obj.width < verticalMidpoint) {
			if (topQuadrant) {
				index = 1;
			}
			else if (bottomQuadrant) {
				index = 2;
			}
		}
		else if (obj.x > verticalMidpoint) {
			if (topQuadrant) {
				index = 0;
			}
			else if (bottomQuadrant) {
				index = 3;
			}
		}

		return index;
	};

	this.split = function() {
		var subWidth = (this.bounds.width / 2) | 0;
		var subHeight = (this.bounds.height / 2) | 0;

		this.nodes[0] = new QuadTree({
			x: this.bounds.x + subWidth,
			y: this.bounds.y,
			width: subWidth,
			height: subHeight
		}, level+1);
		this.nodes[1] = new QuadTree({
			x: this.bounds.x,
			y: this.bounds.y,
			width: subWidth,
			height: subHeight
		}, level+1);
		this.nodes[2] = new QuadTree({
			x: this.bounds.x,
			y: this.bounds.y + subHeight,
			width: subWidth,
			height: subHeight
		}, level+1);
		this.nodes[3] = new QuadTree({
			x: this.bounds.x + subWidth,
			y: this.bounds.y + subHeight,
			width: subWidth,
			height: subHeight
		}, level+1);
	};
}

function Pool(maxSize) {
	var size = maxSize;
	var pool = [];

	this.getPool = function() {
		var obj = [];
		for (var i = 0; i < size; i++) {
			if (pool[i].alive) {
				obj.push(pool[i]);
			}
		}
		return obj;
	}

	this.init = function(object) {
		if (object == "bullet") {
			for (var i = 0; i < size; i++) {
				var bullet = new Bullet("bullet");
				bullet.init(0,0, imageRepository.bullet.width, imageRepository.bullet.height);
				bullet.collidableWith = "enemy";
				bullet.type = "bullet";
				pool[i] = bullet;
			}
		}
		else if (object == "enemy") {
			for (var i = 0; i < size; i++) {
				var enemy = new Enemy();
				enemy.init(0,0, imageRepository.enemy.width, imageRepository.enemy.height);
				pool[i] = enemy;
			}
		}
		else if (object == "enemyBullet") {
			for (var i = 0; i < size; i++) {
				var bullet = new Bullet("enemyBullet");
				bullet.init(0,0, imageRepository.enemyBullet.width, imageRepository.enemyBullet.height);
				bullet.collidableWith = "marine";
				bullet.type = "enemyBullet";
				pool[i] = bullet;
			}
		}
	};

	this.get = function(x, y, speed) {
		if(!pool[size - 1].alive) {
			pool[size - 1].spawn(x, y, speed);
			pool.unshift(pool.pop());
		}
	};

	this.animate = function() {
		for (var i = 0; i < size; i++) {
			if (pool[i].alive) {
				if (pool[i].draw()) {
					pool[i].clear();
					pool.push((pool.splice(i,1))[0]);
				}
			}
			else
				break;
		}
	};
}

function Marine() {
	this.speed = 3;
	this.bulletPool = new Pool(30);

	var fireRate = 15;
	var counter = 0;
	this.colliableWith = "enemyBullet";
	this.type = "marine";

	this.init = function(x, y, width, height) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.alive = true;
		this.isColliding = false;
		this.bulletPool.init("bullet");
	}

	this.draw = function() {
		this.context.drawImage(imageRepository.character, this.x, this.y);
	};
	this.move = function() {
		counter++;
		if (KEY_STATUS.left || KEY_STATUS.right ||
			KEY_STATUS.down || KEY_STATUS.up) {
			this.context.clearRect(this.x, this.y, this.width, this.height);
			if (KEY_STATUS.left) {
				this.x -= this.speed
				if (this.x <= 0)
					this.x = 0;
			} else if (KEY_STATUS.right) {
				this.x += this.speed
				if (this.x >= this.canvasWidth - this.width)
					this.x = this.canvasWidth - this.width;
			} else if (KEY_STATUS.up) {
				this.y -= this.speed
				if (this.y <= 0)
					this.y = 0;
			} else if (KEY_STATUS.down) {
				this.y += this.speed
				if (this.y >= this.canvasHeight - this.height)
					this.y = this.canvasHeight - this.height;
			}
		}
		if (!this.isColliding) {
			this.draw();
		}
		else {
			this.alive = false;
			game.gameOver();
		}

		if (KEY_STATUS.space && counter >= fireRate) {
			this.fire();
			counter = 0;
		}

		if (KEY_STATUS.stimpack){
			this.speed = 7;
			fireRate = 5;
			game.stimpack.get();
		}
		if (!KEY_STATUS.stimpack){
			this.speed = 3;
			fireRate = 15;
		}
	};

	this.fire = function() {
		this.bulletPool.get(this.x+15, this.y, 5);
		game.shoot.get();
	};
}
Marine.prototype = new Drawable();

function Enemy() {
	var percentFire = .01;
	var chance = 0;
	this.alive = false;
	this.colliableWith = "bullet";
	this.type = "enemy";

	this.spawn = function(x, y, speed) {
		this.x = x;
		this.y = y;
		this.speed = speed;
		this.speedX = 0;
		this.speedY = speed;
		this.alive = true;
		this.leftEdge = this.x - 150;
		this.rightEdge = this.x + 150;
		this.bottomEdge = this.y + 140;
	};

	this.draw = function() {
		this.context.clearRect(this.x, this.y, this.width, this.height);
		this.x += this.speedX;
		this.y += this.speedY;
		if (this.x <= this.leftEdge) {
			this.speedX = this.speed;
		}
		else if (this.x >= this.rightEdge + this.width) {
			this.speedX = -this.speed;
		}
		else if (this.y >= this.bottomEdge) {
			this.speed = 1.5;
			this.speedY = 0;
			this.y -= 1;
			this.speedX = +this.speed;
		}
		if (!this.isColliding){
			this.context.drawImage(imageRepository.enemy, this.x, this.y);
			if (this.y === this.bottomEdge - 1){
				chance = Math.floor(Math.random()*100);
				if (chance/100 < percentFire) {
				this.fire();
				}
			}
			return false;
		}
		else {
			game.playerScore += 10;
			game.hydraDeath.get();
			return true;
		}
	};

	this.fire = function() {
		game.enemyBulletPool.get(this.x+this.width/2-10, this.y+this.height, -2.5);
	}

	this.clear = function() {
		this.x = 0;
		this.y = 0;
		this.speed = 0;
		this.speedX = 0;
		this.speedY = 0;
		this.alive = false;
		this.isColliding = false;
	};
}
Enemy.prototype = new Drawable();

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

			this.playerScore = 	0;

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

		this.playerScore = 0;

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
		document.getElementById('loading').style.display = "none";
		game.start();
	}
}

function SoundPool(maxSize) {
	var size = maxSize;
	var pool = [];
	this.pool = pool;
	var currSound = 0;

	this.init = function(object) {
		if (object == "shoot") {
			for (var i = 0; i < size; i++) {
				shoot = new Audio("sounds/shooting.mp3");
				shoot.volume = .12;
				shoot.load();
				pool[i] = shoot;
			}
		}
		else if (object == "hydraDeath") {
			for (var i = 0; i < size; i++) {
				var hydraDeath = new Audio("sounds/hydralisk.mp3");
				hydraDeath.volume = .25;
				hydraDeath.load();
				pool[i] = hydraDeath;
			}
		}
		else if (object == "stimpack") {
			for (var i = 0; i < size; i++){
			var stimpack = new Audio("sounds/stimpack.mp3");
			stimpack.volume = .25;
			stimpack.load();
			pool[i] = stimpack;
			}
		}
		else if (object == "marineDeath") {
			for (var i = 0; i < size; i++){
			var marineDeath = new Audio("sounds/marinedeath.wav");
			marineDeath.volume = .25;
			marineDeath.load();
			pool[i] = marineDeath;
			}
		}
	};

	this.get = function() {
		if(pool[currSound].currentTime == 0 || pool[currSound].ended) {
			pool[currSound].play();
		}
		currSound = (currSound + 1) % size;
	};
}

function animate() {
	document.getElementById('score').innerHTML = game.playerScore;

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
			function(/* function */ callback, /* DOMElement */ element){
				window.setTimeout(callback, 1000 / 60);
			};
})();