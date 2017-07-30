
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