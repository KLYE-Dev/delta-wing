var db = require('./db');
var gameMath = require('./Math');
var fs = require('fs');
var planet = require('./planet');

exports.generate = function(x, y, cb) {

	// Hard coded chunk variables.. I know it's wrong I just can't help myself!
	var chunkHeight = 1000;
	var chunkWidth = 1000;
	var tileHeight = 10;
	var tileWidth = 10;
	var orientation = 'orthogonal';
	var newObject;
	var newObjects = [];

	// Open json file with spawnable objects
	fs.readFile('../spawnable_objects.json', 'utf8', function (err, data) {
		if (err) throw err;
		var spawnable = JSON.parse(data);
		var numObjects = Math.ceil(Math.random()*3);
		//console.log('number of objects: ' + numObjects);
		for (var o = 0; o < numObjects; o++) {
			var planetTexture;
			newObject = {"id": o};
			objectRef = spawnable.objects[Math.ceil((Math.random() * spawnable.objects.length) - 1)];
			if (objectRef.type == 'planet') {
				//planetTexture = new planet.Generate(x, y, o);
				//console.log('planet generated');
				//console.log(planetTexture);
			}
			for (var prop in objectRef) {
				if(objectRef.hasOwnProperty(prop)){
			    	newObject[prop] = objectRef[prop];
			    }
			}
			//newObject.texture = planetTexture;
			newObject.scale = Math.random() * (1 - 0.25) + 1;
			newObject.width = Math.ceil(newObject.width * newObject.scale);
			newObject.height = Math.ceil(newObject.height * newObject.scale);

			var touching = true;

			while (touching === true) {
				newObject.x = Math.ceil(Math.random() * (chunkWidth * tileWidth));
				newObject.y = Math.ceil(Math.random() * (chunkHeight * tileHeight));
				//console.log(newObject.x + ', ' + newObject.y);
				if (newObjects.length < 1) { touching = false; }
				for (var i = 0; i < newObjects.length; i++) {
					if (gameMath.distance(newObject.x, newObjects[i].x, newObject.y, newObjects[i].y) > (newObjects[i].width/2)) {
						touching = false;
					}
				}
			}

			newObjects.push(newObject);
			newObject = null;
		}

		var newLayers = [
			{
				name: 'collision',
				height: chunkHeight,
				width: chunkWidth,
				opacity: 1,
				visible: true,
				type: "objectgroup",
				objects: newObjects
			}
		];

		var newChunk = new db.Chunk({
			x: x,
			y: y,
			height: chunkHeight,
			width: chunkWidth,
			tileheight: tileHeight,
			tilewidth: tileWidth,
			orientation: orientation,
			layers: newLayers
		});

		newChunk.save(function(err, newChunk) {
			if (err) return console.error(err);
			else {
				console.log('chunk created: ' + newChunk.id);
				cb(newChunk);
			}
		});

	});
};
