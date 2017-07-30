function Background() {
	this.draw = function() {
		this.context.drawImage(imageRepository.background, this.x, this.y);
	};
}
Background.prototype = new Drawable();