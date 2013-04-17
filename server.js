var app = require('http').createServer(handler), 
	io = require('socket.io').listen(app),
	fs = require('fs'),
	Player = require('./Player').Player,
	Projectile = require('./Projectile').Projectile;
  
var url     =   require('url');
var path    =   require('path');
var players = [];
var projectiles = [];

app.listen(80);

// Comment to show that this file is different.

io.configure(function() {
	io.set('transports', ['websocket']);
	io.set('log level', 2);
});

function handler (req, res) {
  	var pathname = url.parse(req.url).pathname;
    var ext      = path.extname(pathname).toLowerCase();

    //console.log(pathname);

    if (ext === ".html") {
        fs.readFile('./public' + pathname, 'utf-8', function(error, content) {
            res.writeHead(200, {'Content-Type' : 'text/html'});
            if (error) {
            	res.write(error);
            }
            res.end(content);
        });
    }
    
    if (ext === ".js") {
        fs.readFile('./public' + pathname, 'utf-8', function(error, content) {
            res.writeHead(200, {'Content-Type' : 'text/javascript'});
            if (error) {
            	res.write(error);
            }
            res.end(content);
        });
    }
    
    if (ext === ".png") {
            res.writeHead(200, {'Content-Type' : 'image/png'});
            fs.createReadStream('./public' + pathname).pipe(res);
    }
    
    if (ext === ".jpg") {
            res.writeHead(200, {'Content-Type' : 'image/jpeg'});
            fs.createReadStream('./public' + pathname).pipe(res);
    }
    
    if (!ext) {
    	fs.readFile('./public/index.html', 'utf-8', function(error, content) {
    		res.writeHead(200, {'Content-Type' : 'text/html'});
    		if (error) {
    			res.write(error);
    		}
    		res.end(content);
    	});
    }
}

var setEventHandlers = function() {
	io.sockets.on('connection', onSocketConnection);
};

setEventHandlers();

function onSocketConnection(client) {
	console.log('new player connected: ' + client.id);
	client.on('disconnect', onClientDisconnect);
	client.on('new player', onNewPlayer);
	client.on('move player', onMovePlayer);
	client.on('new projectile', onNewProjectile);
};

function onClientDisconnect() {
	console.log('player has disconnected: ' + this.id);
	
	var removePlayer = playerById(this.id);
	
	if(!removePlayer) {
		console.log('Player not found: ' + this.id);
		return;
	}
	
	players.splice(players.indexOf(removePlayer), 1);
	// broadcast.emit sends a message to all clients except the one it's being called on
	this.broadcast.emit('remove player', {id: this.id});
};

function onNewPlayer(data) {
	var newPlayer = new Player(data.x, data.y, data.angle);
	newPlayer.id = this.id;
	
	// broadcast.emit sends a message to all clients except the one it's being called on
	this.broadcast.emit('new player', {id: newPlayer.id, x: newPlayer.getX(), y: newPlayer.getY()});
	
	var i, existingPlayer;
	for(i = 0; i < players.length; i++) {
		existingPlayer = players[i];
		// .emit sends a message to all the clients
		this.emit('new player', {id: existingPlayer.id, x: existingPlayer.getX(), y: existingPlayer.getY()});
	}
	
	players.push(newPlayer);
};

function onMovePlayer(data) {
	var movePlayer = playerById(this.id);

	if (!movePlayer) {
		console.log("(onMovePlayer) Player not found: " + this.id);
		return;
	};

	movePlayer.setX(data.x);
	movePlayer.setY(data.y);
	movePlayer.setAngle(data.angle);

	this.broadcast.emit("move player", {id: movePlayer.id, x: movePlayer.getX(), y: movePlayer.getY(), angle: movePlayer.getAngle()});
};

function onNewProjectile(data) {
	var newProjectile = new Projectile(data.x, data.y, data.playerId);
	newProjectile.id = this.id;
	
	this.broadcast.emit('new projectile', {id: newProjectile.id, playerId: newProjectile.getPlayerId(), x: newProjectile.getX(), y: newProjectile.getY()});;
	
	projectiles.push(newProjectile);

};


function playerById(id) {
    var i;
    for (i = 0; i < players.length; i++) {
        if (players[i].id == id)
            return players[i];
    };

    return false;
};