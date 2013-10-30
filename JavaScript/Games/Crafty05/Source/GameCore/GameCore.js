/**
 * @author Charlie Calvert
 */





// A village is a tile on the grid that the PC must visit in order to win the game
Crafty.c('Village', {
	init: function() {
		this.requires('Actor, spr_village');
	},

	// Process a visitation with this village
	visit: function() {
		this.destroy();
		Crafty.audio.play('knock');
		Crafty.trigger('VillageVisited', this);
	}
});

// Draw the initial game state
Crafty.scene('Game', function() {
	
	// A 2D array to keep track of all gameBoard tiles
	this.gameBoard = new Array(Crafty.game.map_grid.width);
	for (var i = 0; i < Crafty.game.map_grid.width; i++) {
		this.gameBoard[i] = new Array(Crafty.game.map_grid.height);
		for (var y = 0; y < Crafty.game.map_grid.height; y++) {
			this.gameBoard[i][y] = false;
		}
	}

	// Player character, placed at 5, 5 on our grid
	this.player = Crafty.e('PlayerCharacter').at(5, 5);
	this.gameBoard[this.player.at().x][this.player.at().y] = true;

	// Place a tree at every edge square on our grid of 16x16 tiles
	for (var x = 0; x < Crafty.game.map_grid.width; x++) {
		for (var y = 0; y < Crafty.game.map_grid.height; y++) {
			var at_edge = x == 0 || x == Crafty.game.map_grid.width - 1 || y == 0 || y == Crafty.game.map_grid.height - 1;

			if (at_edge) {
				// Place a tree entity at the current tile
				Crafty.e('Tree').at(x, y);
				this.gameBoard[x][y] = true;
			} else if (Math.random() < 0.06 && !this.gameBoard[x][y]) {
				// Place a bush entity at the current tile
				Crafty.e('Bush').at(x, y);
				this.gameBoard[x][y] = true;
			}
		}
	}

	// Generate up to five villages on the map in random locations
	var max_villages = 5;
	for (var x = 0; x < Crafty.game.map_grid.width; x++) {
		for (var y = 0; y < Crafty.game.map_grid.height; y++) {
			if (Math.random() < 0.02) {
				if (Crafty('Village').length < max_villages && !this.gameBoard[x][y]) {
					var village = Crafty.e('Village').at(x, y);
					village.setName(village._entityName.replace('Entity', 'Village'));
				}
			}
		}
	}

	// Show the victory screen once all villages are visisted
	this.show_victory = this.bind('VillageVisited', function() {
		Crafty.game.sendDebugMessage("Village Length: " + Crafty('Village').length);
		if (!Crafty('Village').length) {
			Crafty.scene('Victory');
		}
	});
}, function() {
	// Remove our event binding from above so that we don't
	//  end up having multiple redundant event watchers after
	//  multiple restarts of the game
	this.unbind('VillageVisited', this.show_victory);
});


// Victory scene : Announce victory, set up a new game
Crafty.scene('Victory', function() {
	// Display some text in celebration of the victory
	Crafty.e('2D, DOM, Text')
		.attr({ x: 0, y: 0 })
		.text('You are victorious!');

	// restart the game when a key is pressed
	this.restart = function() {
		Crafty.scene('Game');
	};
	
	// Bind keydown event. This was done wrong in the demo 
	this.bind('KeyDown', this.restart); 
}, function() {
	// Remove key binding to prevent multiple restarts 
	if (!this.unbind('KeyDown', this.restart)) {
		alert("Could not unbind");
	}
	
});

// Load binary assets such as images and audio files
Crafty.scene('Loading', function(){
    
    var assets = ['Assets/cscGarden01-32X32.png',         
        'Assets/BoyWalk.png', 
        'Assets/door_knock_3x.mp3', 
        ];
	
	// Load our sprite map image
	Crafty.load(assets, function(){
   		Crafty.sprite(32, assets[0], {
			spr_tree:    [0, 3],
			spr_bush:    [2, 0],
			spr_village: [0, 1]
		});

		//  The main character
		Crafty.sprite(32, assets[1], {
			mainCharacter:  [0, 0],
		}, 0, 2);

		// Define our sounds for later use
		//Crafty.audio.add({
		//	knock: ['http://desolate-caverns-4829.herokuapp.com/assets/door_knock_3x.mp3']
		//});

		// Display text while loading		
		Crafty.e('2D, DOM, Text')
			.attr({ x: 0, y: Crafty.viewport.height / 2 - 24, w: Crafty.viewport.width })
			.text('Loading...');

		// Now that our sprites are ready to draw, start the game
		Crafty.scene('Game');
	});
});

