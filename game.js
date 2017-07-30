var game = new Game();

function init() {
	if(game.init())
		game.start();
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

	this.background.src = "imgs/theone.png";
	this.character.src = "imgs/marine.gif";
	this.bullet.src = "imgs/bullet.png";
	this.enemy.src = "imgs/enemy.png";
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
	};
}
Bullet.prototype = new Drawable();

function Pool(maxSize) {
	var size = maxSize; 
	var pool = [];
	
	this.init = function(object) {
		if (object == "bullet") {
			for (var i = 0; i < size; i++) {
				var bullet = new Bullet("bullet");
				bullet.init(0,0, imageRepository.bullet.width, imageRepository.bullet.height);
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
	this.bulletPool.init("bullet");

	var fireRate = 15;
	var counter = 0;
	
	this.draw = function() {
		this.context.drawImage(imageRepository.character, this.x, this.y);
	};

	this.move = function() {	
		counter++;
		if (KEY_STATUS.left || KEY_STATUS.right || KEY_STATUS.down || KEY_STATUS.up) {
			this.context.clearRect(this.x, this.y, this.width, this.height);
			if (KEY_STATUS.left) {
				this.x -= this.speed;
				if (this.x <= 0)
					this.x = 0;
			} else if (KEY_STATUS.right) {
				this.x += this.speed;
				if (this.x >= this.canvasWidth - this.width)
					this.x = this.canvasWidth - this.width;
			} else if (KEY_STATUS.up) {
				this.y -= this.speed;
				if (this.y <= 0)
					this.y = 0;
			} else if (KEY_STATUS.down) {
				this.y += this.speed;
				if (this.y >= this.canvasHeight - this.height)
					this.y = this.canvasHeight - this.height;
			}
			this.draw();
		}
		
		if (KEY_STATUS.space && counter >= fireRate) {
			this.fire();
			counter = 0;
		}
		if (KEY_STATUS.stimpack){
			this.speed = 5;
			fireRate = 5;
		}
		if (!KEY_STATUS.stimpack){
			this.speed = 3;
			fireRate = 15;
		}
	};

	this.fire = function() {
		this.bulletPool.get(this.x+15, this.y, 5);
	};
}
Marine.prototype = new Drawable();

function Enemy() {
	var percentFire = .01;
	var chance = 0;
	this.alive = false;
	
	this.spawn = function(x, y, speed) {
		this.x = x;
		this.y = y;
		this.speed = speed;
		this.speedX = 0;
		this.speedY = speed;
		this.alive = true;
		this.leftEdge = this.x - 90;
		this.rightEdge = this.x + 90;
		this.bottomEdge = this.y + 150;
	};

	this.draw = function() {
		this.context.clearRect(this.x-1, this.y, this.width+1, this.height);
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
			this.speedX = -this.speed;
		}
		
		this.context.drawImage(imageRepository.enemy, this.x, this.y);
		if (this.y === this.bottomEdge - 1){
			chance = Math.floor(Math.random()*100);
				if (chance/100 < percentFire) {
				this.fire();
			}
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
	};
}
Enemy.prototype = new Drawable();

function Game() {
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
			var marineStartX = this.marineCanvas.width/2 - imageRepository.character.width;
			var marineStartY = this.marineCanvas.height/4*3 + imageRepository.character.height*2-15;
			this.marine.init(marineStartX, marineStartY, imageRepository.character.width, imageRepository.character.height);

			this.enemyPool = new Pool(30);
			this.enemyPool.init("enemy");
			var height = imageRepository.enemy.height;
			var width = imageRepository.enemy.width;
			var x = 150;
			var y = -height;
			var spacer = y ;
			for (var i = 1; i <= 10; i++) {
				this.enemyPool.get(x, y, 2);
				x += width + 25;
				if (i % 5 == 0) {
					x = 150;
 					y += spacer;
				}
			}
			this.enemyBulletPool = new Pool(50);
			this.enemyBulletPool.init("enemyBullet");
			return true;
		} else {
			return false;
		}
	};

	this.start = function() {
		this.marine.draw();
		animate();
	};
}

function animate() {
	requestAnimationFrame(animate);
	game.background.draw();
	game.marine.move();
	game.marine.bulletPool.animate(); 
	game.enemyPool.animate();
	game.enemyBulletPool.animate();
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
	KEY_STATUS[KEY_CODES[keyCode]] = true;
  }
}

document.onkeyup = function(e) {
  var keyCode = (e.keyCode) ? e.keyCode : e.charCode;
  if (KEY_CODES[keyCode]) {
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