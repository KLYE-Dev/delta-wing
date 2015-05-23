(function() {

	game.assetsLoaded = function() {
		// Connect to server
		game.socket = game.network.connect();
		game.network.setSocketEventHandlers();

		game.backgroundTexture = new PIXI.Texture.fromImage('background.png');
		game.background = new PIXI.extras.TilingSprite(game.backgroundTexture, game.width, game.height);
		game.background.position.x = 0;
		game.background.position.y = 0;
		game.background.tilePosition.x = 0;
		game.background.tilePosition.y = 0;
		game.stage.addChild(game.background);

		game.midgroundTexture = new PIXI.Texture.fromImage('midground.png');
		game.midground = new PIXI.extras.TilingSprite(game.midgroundTexture, game.width, game.height);
		game.midground.position.x = 0;
		game.midground.position.y = 0;
		game.midground.tilePosition.x = 0;
		game.midground.tilePosition.y = 0;
		game.stage.addChild(game.midground);

		game.stage.addChild(game.level);
		game.level.addChild(game.layers.particles);

		game.ship = new Ship(0, 0, 'fighter.png', true);

		game.level.addChild(game.ship);

		game.run();
		document.getElementsByTagName('canvas')[0].style.opacity = "1";
	};

	game.loadSurroundingChunks = function(x, y) {
		game.chunkBuffer = 1;

		for (var xx = -game.chunkBuffer; xx <= game.chunkBuffer; xx++) {
			for (var yy = -game.chunkBuffer; yy <= game.chunkBuffer; yy++) {
				var chunkX = xx + x;
				var chunkY = yy + y;

				var coords = chunkX + ',' + chunkY;
				var chunk = game.getChunk( chunkX, chunkY );
				if ( chunk === false ) {
					//game.socket.emit( 'get chunk', { x: chunkX, y: chunkY } );
					console.log('requesting chunk: %d, %d', chunkX, chunkY);

					// create the chunk so that it doesn't request it again
					// until a certain amount of time has passed.
					// assign a time it was requested and then check it on
					// an else statement of this IF statement, and if enough
					// time has passed since it was requested, we request it
					// again.

					var chunkData = {
						height: 0,
						width: 0,
						x: chunkX,
						y: chunkY,
						reqTime: Date.now()
					};
					var tempChunk = new Chunk(chunkData);
					//console.log(tempChunk);
					game.chunks.push(tempChunk);
				}
				else {
					//console.log('chunk %d, %d has been requested', chunkX, chunkY);
					if ( chunk.loaded === false ) {
						var timeSinceRequest = Date.now();
						//console.log('time since request: %d', timeSinceRequest);
					}
				}
			}
		}
	};

	game.getChunk = function(x, y) {
		var foundChunk = false;
		for ( i = 0; i < game.chunks.length; i++ ) {
			var chunk = game.chunks[i];
			if (chunk.coords.x == x && chunk.coords.y == y) {
				//console.log('getChunk chunk found for coords: ' + x + ', ' + y);
				foundChunk = chunk;
				break;
			}
		}
		if ( foundChunk !== false ) {
			return foundChunk;
		}
		else {
			return false;
		}
	};

	game.run = function() {
		requestAnimationFrame(game.run);
		game.update();
		game.renderer.render(game.stage);
	};

	game.update = function() {

		game.ship.update();

		game.particles.forEach(function(particle, index, object){
			if (particle.alpha <= 0) {
				game.layers.particles.removeChild( object[index] );
				object.splice(index, 1);
			}
			particle.update();
		});
		
		if ( game.particles.length > 0 ) {
			//console.log(game.particles[0].x);
		}

		game.background.tilePosition.x -= (game.level.scale.x * 0.2) * game.ship.vector.x;
		game.midground.tilePosition.x -= (game.level.scale.x * 0.4) * game.ship.vector.x;
		game.background.tilePosition.y -= (game.level.scale.x * 0.2) * game.ship.vector.y;
		game.midground.tilePosition.y -= (game.level.scale.x * 0.4) * game.ship.vector.y;

		game.level.x = ( window.innerWidth/2 ) - ( game.ship.x * game.level.scale.x );
		game.level.y = ( window.innerHeight/2 ) - ( game.ship.y * game.level.scale.y );
		// game.layers.particles.x = ( window.innerWidth/2 ) - game.ship.x;
		// game.layers.particles.y = ( window.innerHeight/2 ) - game.ship.y;
	};

})();