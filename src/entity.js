(function() {
    
    game.component.entity = {
        distanceTo: function(x, y) {
            return Math.sqrt(Math.pow(x - this.x, 2) +
                             Math.pow(y - this.y, 2));
        },

        distanceToRectCenter: function(x, y) {
        	return Math.sqrt(Math.pow(x - (this.x + this.width/2), 2) + Math.pow(y - (this.y + this.height/2), 2));
        }
    }

}());
