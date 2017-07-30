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
			game.health = 0 
			this.alive = false;		
			game.gameOver();			
		}

		if (KEY_STATUS.space && counter >= fireRate) {
			this.fire();
			counter = 0;
		}

		if (KEY_STATUS.stimpack){
			game.health -= 0.25;
			this.speed = 7;
			fireRate = 5;
			game.stimpack.get();
		}
		if (!KEY_STATUS.stimpack){
			this.speed = 3;
			fireRate = 15;
		}
		if (game.health <= 0){
			this.alive = false;		
			game.gameOver();			
		}	
	};

	this.fire = function() {
		this.bulletPool.get(this.x+15, this.y, 5);
		game.shoot.get();
	};
}
Marine.prototype = new Drawable();