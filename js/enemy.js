
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