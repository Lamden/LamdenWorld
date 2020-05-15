const World = {
	assets: {},
	buffer: null,
	offset: v(0,0),
	lastOffset: v(1,1),
	props: [],
	// some random but predictable values for map rendering
	random: [.59,.89,.38,.82,.41,.20,.58,.65,.68,.94,.46,.67,.19,.88,.34,.62,.15,.68,.97,.3,.50,.77,.74,.23,.25,.78,.68,.38,.71,.83,.72,.29,.65,.4,.16,.66,.88,.13,.11,.7,.53,.27,.32,.74,.98,.18,.50,.35,.78,.98,.10,.95,.89,.89,.9,.77,.25,.8,.45,.67,.63,.8,.95,.63,.61,.86,.42,.23,.61,.7,.11,.62,.5,.12,.25,.11,.33,.64,.86,.63,.97,.27,.32,.10,.62,.89,.91,.62,.27,.68,.30,.10,.45,.5,.78,.99,.25,.15,.91,.51],
	buildingData: {
		//1: {name: 'Capital', requiresTile: null, hp: 10000, cost: {0: 200, 1: 200, 2: 200, 3: 200, 5: 100}, mesh: 'Capital', meshScale: .2225, description: ''},
		//2: {name: 'Wall', requiresTile: 'grass', hp: 2000, cost: {2: 100, 5: 200}, mesh: 'Wall', meshScale: .2225, description: 'To prevent illegal immigrants. '},
		3: {name: 'Rock Mine', requiresTile: 'all', produces: 2, productionSpeed: 1, hp: 550, cost: {0: 300, 1: 450, 3: 300}, icon: 'mine', mesh: 'Mine1', meshScale: .2225, description: 'Produces rocks'},
		4: {name: 'Oil Well', requiresTile: 'all', produces: 3, productionSpeed: 1, hp: 550, cost: {0: 300, 1: 300, 2: 450}, icon: 'pumpjack', mesh: 'Pumpjack', meshScale: .2225, description: 'Produces oil'},
		5: {name: 'Sand Quarry', requiresTile: 'all', produces: 1, productionSpeed: 1, hp: 550, cost: {0: 300, 2: 300, 3: 450}, icon: 'quarry', mesh: 'Quarry', meshScale: .2225, description: 'Produces minerals'},
		//6: {name: 'Pumpjack', requiresTile: 'desert', requiresTech: 2, produces: 6, productionSpeed: 1, hp: 1000, cost: {4: 800}},
		7: {name: 'Power Plant', requiresTile: 'grass', /* requiresTech: 1, */ produces: 0, productionSpeed: 1.5, hp: 550, cost: {1: 300, 2: 300, 3: 300}, icon: 'powerplant', mesh: 'Powerplant2', meshScale: .2225, smoke: v(2.6,2,-.4), description: 'Produces energy'},
		//8: {name: 'Barracks', requiresTile: 'grass', hp: 1000, cost: {4: 100}, icon: 'barracks', mesh: 'Barracks2', meshScale: .2225, description: 'Produces units at a smaller scale'},
		9: {name: 'Ammo Factory', /* requiresTech: 4, */ requiresTile: 'grass', produces: 4, productionSpeed: 1, hp: 550, cost: {0: 450, 1: 300, 2: 150, 3: 450}, icon: 'factory', hp: 1000, mesh: 'Factory', meshScale: .2225, description: 'Produces units at a larger scale'},
		//10: {name: 'Engineer', requiresTile: 'grass', hp: 1000, cost: {0: 1000, 2: 100, 4: 500}, icon: 'engineer', mesh: 'NGon007', meshScale: .2225, description: 'Research advanced technologies'},
		//11: {name: 'Refinery', requiresTile: 'grass', hp: 1000, cost: {0: 1000, 2: 100, 4: 100}, icon: 'refinery', mesh: 'Refinery2', meshScale: .2225, smoke: v(3.5,12,1), description: 'Refines raw resources into refined resources'},
		//12: {name: 'Dock', requiresTile: 'water', hp: 1000, cost: {0: 1000, 2: 100, 4: 100}, icon: 'dock', mesh: 'Dock1', meshScale: .2225, description: 'Produces naval units'},
		//13: {name: 'Marketplace', requiresTile: 'grass', hp: 1000, cost: {0: 1000, 2: 100, 4: 100}, description: ''},
		//14: {name: 'Missile Silo', requiresTile: 'grass', hp: 1000, cost: {0: 100, 1: 100, 2: 100, 3: 200}, icon: 'silo', mesh: 'Silo2', meshScale: .2225, description: ''},
		//15: {name: 'Bunker', requiresTile: 'grass', hp: 5000, cost: {0: 100, 1: 100, 2: 100, 3: 100, 5: 100}, icon: 'bunker', mesh: 'Bunker', meshScale: .2225, description: 'Can house much more additional units compared to other tiles. '},
		//16: {name: 'Missile Defense System', requiresTile: 'grass', hp: 1000, cost: {0: 1000, 2: 100, 4: 100}, mesh: 'Silo2', meshScale: .2225, description: 'Defends your territory in a 5 tile radius from missile attacks. Succes rate 50%. '},
		//17: {name: 'Artillery Tower', requiresTile: 'grass', hp: 500, power: 500, cost: {0: 1000, 2: 100, 4: 100}, description: 'Simple defensive structure to withstand small attacks in a 5 tile radius. '},
		18: {name: 'Brick Factory', /* requiresTech: 4, */ requiresTile: 'grass', produces: 5, productionSpeed: 1, hp: 550, cost: {0: 450, 1: 150, 2: 450, 3: 300}, icon: 'refinery', hp: 1000, mesh: 'Refinery2', meshScale: .2225, description: 'Produces defense units which you can use to level up walls.'},
	},
	/*
	Conversions: {
		1: {name: 'Smelt Ore to Iron', requiresLevel: 1, consumes: 2, produces: 4, speed: 1, capacity: 100},
		2: {name: 'Smelt Ore to Copper', requiresLevel: 1, consumes: 2, produces: 5, speed: 1, capacity: 100},
		3: {name: 'Smelt Ore to Lead', requiresLevel: 1, consumes: 2, produces: 6, speed: 1, capacity: 100},
		4: {name: 'Refine Fossil Fuel to Crude Oil', requiresLevel: 1, consumes: 3, produces: 8, speed: 1, capacity: 100},
		5: {name: 'Refine Fossil Fuel to Coal', requiresLevel: 1, consumes: 3, produces: 7, speed: 1, capacity: 100},
		6: {name: 'Extract Gunpowder from Rock', requiresLevel: 1, consumes: 1, produces: 9, speed: 1, capacity: 100},
		7: {name: 'Extract Silicon from Rock', requiresLevel: 1, consumes: 1, produces: 10, speed: 1, capacity: 100},
		8: {name: 'Smelt Ore to Steel', requiresLevel: 2, consumes: 2, produces: 11, speed: 1, capacity: 100},
		9: {name: 'Refine Fossil Fuel to Petroleum', requiresLevel: 2, consumes: 3, produces: 12, speed: 1, capacity: 100},
		10: {name: 'Extract Rubber from Rock', requiresLevel: 2, consumes: 1, produces: 13, speed: 1, capacity: 100},
		11: {name: 'Refine Ore to Alloy', requiresLevel: 3, consumes: 2, produces: 14, speed: 1, capacity: 100},
		12: {name: 'Refine Fossil Fuel to Kerosene', requiresLevel: 3, consumes: 3, produces: 15, speed: 1, capacity: 100},
		//13: {name: 'Extract Metals from Rock', requiresLevel: 3, consumes: 1, produces: 13, speed: 1, capacity: 100},
		14: {name: 'Smelt Ore to Uranium', requiresLevel: 4, consumes: 2, produces: 17, speed: 1, capacity: 100},
		15: {name: 'Refine Fossil Fuel to Hydrazine', requiresLevel: 4, consumes: 3, produces: 18, speed: 1, capacity: 100},
		16: {name: 'Extract Nitrates from Rock', requiresLevel: 4, consumes: 1, produces: 19, speed: 1, capacity: 100},
		17: {name: 'Refine Fossil Fuel to Plastics', requiresLevel: 1, consumes: 3, produces: 16, speed: 1, capacity: 100},
	},
	*/
	Resources: {
		0: {name: 'Energy', icon: 'energy.png'},
		1: {name: 'Minerals', icon: 'box.png'},
		2: {name: 'Rocks', icon: 'gem.png'},
		3: {name: 'Oil', icon: 'drum.png'},
		4: {name: 'Units', icon: 'crosshair.png'},
		5: {name: 'Defense', icon: 'shield.png'},
		/*
		0: {name: 'Energy', icon: 'energy.png'},
		1: {name: 'Sedementary Rock', icon: 'box.png'},
		2: {name: 'Ore', icon: 'gem.png'},
		3: {name: 'Fossil Fuel', icon: 'drum.png'},
		4: {name: 'Iron'},
		5: {name: 'Copper'},
		6: {name: 'Lead'},
		7: {name: 'Coal'},
		8: {name: 'Crude Oil'},
		9: {name: 'Gunpowder'},
		10: {name: 'Silicon'},
		11: {name: 'Steel'},
		12: {name: 'Petroleum'},
		13: {name: 'Rubber'},
		14: {name: 'Alloy'},
		15: {name: 'Kerosene'},
		16: {name: 'Plastics'},
		17: {name: 'Uranium'},
		18: {name: 'Hydrazine'},
		19: {name: 'Nitrates'},
		*/
	},
	Sounds: {
		tick1: new BABYLON.Sound('Tick 1', 'sounds/tick1.mp3', scene, null, {volume: .3}),
		tick2: new BABYLON.Sound('Tick 2', 'sounds/tick2.mp3', scene, null, {volume: .3}),
		unit1: new BABYLON.Sound('Unit 1', 'sounds/unit1.mp3', scene, null, {volume: .2}),
		unit2: new BABYLON.Sound('Unit 2', 'sounds/unit2.mp3', scene, null, {volume: .2}),
		unit3: new BABYLON.Sound('Unit 3', 'sounds/unit3.mp3', scene, null, {volume: .2}),
		confirm1: new BABYLON.Sound('Confirm 1', 'sounds/confirm1.mp3', scene, null, {volume: .2}),
		confirm2: new BABYLON.Sound('Confirm 2', 'sounds/confirm2.mp3', scene, null, {volume: .2}),
		engine1: new BABYLON.Sound('engine 1', 'sounds/engine2.mp3', scene, null, {volume: .01, loop: true}),
		enemy1: new BABYLON.Sound('enemy 1', 'sounds/enemy1.mp3', scene, null, {volume: .2}),
		enemy2: new BABYLON.Sound('enemy 2', 'sounds/enemy2.mp3', scene, null, {volume: .2}),
		missile1: new BABYLON.Sound('missile 1', 'sounds/missile1.mp3', scene, null, {volume: .5}),
		negative1: new BABYLON.Sound('Negative 1', 'sounds/negative1.mp3', scene, null, {volume: .2}),
		negative2: new BABYLON.Sound('Negative 2', 'sounds/negative2.mp3', scene, null, {volume: .2}),
		gun1: new BABYLON.Sound('gun 1', 'sounds/gun1.mp3', scene, null, {volume: .4}),
		gun2: new BABYLON.Sound('gun 2', 'sounds/gun2.mp3', scene, null, {volume: .4}),
		out1: new BABYLON.Sound('out1', 'sounds/out1.mp3', scene, null, {volume: .1}),
		refinery1: new BABYLON.Sound('refinery1', 'sounds/refinery1.mp3', scene, null, {volume: .02, loop: true}),
		rock1: new BABYLON.Sound('rock1', 'sounds/rock1.mp3', scene, null, {volume: .3}),
		explosion1: new BABYLON.Sound('explosion1', 'sounds/explosion1.mp3', scene, null, {volume: .3}),
		explosion2: new BABYLON.Sound('explosion2', 'sounds/explosion2.mp3', scene, null, {volume: .3}),
		explosion3: new BABYLON.Sound('explosion3', 'sounds/explosion3.mp3', scene, null, {volume: .3}),
		explosion4: new BABYLON.Sound('explosion4', 'sounds/explosion4.mp3', scene, null, {volume: .15}),
		explosion5: new BABYLON.Sound('explosion5', 'sounds/explosion5.mp3', scene, null, {volume: .2}),
		explosion6: new BABYLON.Sound('explosion6', 'sounds/explosion6.mp3', scene, null, {volume: .3}),
		upgrade1: new BABYLON.Sound('upgrade1', 'sounds/upgrade1.mp3', scene, null, {volume: .3}),
		upgrade2: new BABYLON.Sound('upgrade2', 'sounds/upgrade2.mp3', scene, null, {volume: .3}),
	},
	Technologies: {
		//1: {name: 'Coal', researchedAt: 1, duration: 300, cost: {1: 1000, 4: 500}, description: 'Allows building of power plants and unlocks other techs. '},
		//2: {name: 'Oil', researchedAt: 1, requiresTech: 1, duration: 300, cost: {1: 1000, 8: 1500}, description: 'Allows building of oil wells'},
		3: {name: 'Armored Vehicles', researchedAt: 10, duration: 300, cost: {1: 1000, 4: 500}, description: 'Allows construction of armored vehicles. '},
		4: {name: 'Ballistics', researchedAt: 10, requiresTech: 3, duration: 300, cost: {1: 1000, 4: 1000}, description: 'Allows construction of armored vehicles. '},
		5: {name: 'Scopes', researchedAt: 8, duration: 300, cost: {1: 1000, 4: 500}, description: 'Increases your units damage output by 10%'},
		6: {name: 'Tungsten', researchedAt: 8, duration: 300, cost: {1: 1000, 11: 5000}, description: 'Increases your units hp by 10%'},
		7: {name: 'Logistics', researchedAt: 10, duration: 300, cost: {1: 1000, 4: 500}, description: 'Increases the maximum number of units per tile by 2000'},
		8: {name: 'Fuel Efficiency', researchedAt: 10, duration: 300, cost: {1: 1000, 12: 1000}, description: 'Increases the maximum number of tiles units can move at once by 1. '},
		9: {name: 'Miniguns', researchedAt: 10, duration: 300, cost: {1: 1000, 4: 500}, description: 'Increases damage of fortifications by 30%. '},
		10: {name: 'Rebar', researchedAt: 10, duration: 300, cost: {1: 1000, 11: 5000}, description: 'Increases hp of newly built fortifications by 50%. '},
		11: {name: 'Economics', researchedAt: 1, duration: 300, cost: {1: 1000, 4: 500}, description: 'Allows building of marketplace to trade resources. '},
		12: {name: 'Pneumatics', researchedAt: 10, duration: 300, cost: {1: 1000, 4: 500}, description: 'Increases yield rock and ore mining by 10%. '},
		13: {name: 'Improved Blending', researchedAt: 10, duration: 300, cost: {1: 1000, 14: 1000, 16: 1000}, description: 'Increases refining yield by 10%. '},
		14: {name: 'Laser Guiding', researchedAt: 10, duration: 300, cost: {1: 1000, 4: 500}, description: 'Increases damage of missiles by 20%. '},
		15: {name: 'Radar Obfuscation', researchedAt: 10, duration: 300, cost: {1: 1000, 4: 500, 10: 1000}, description: 'Enemy missiles have a 15% chance to miss when targeted at your territory. '},
		16: {name: 'Logistics II', researchedAt: 1, requiresTech: 7, duration: 300, cost: {1: 1000, 4: 500, 12: 5000}, description: 'Increases the maximum number of units per tile by 4000'},
		17: {name: 'Improved Blending II ', researchedAt: 10, requiresTech: 13, duration: 300, cost: {1: 1000, 14: 5000, 16: 5000}, description: 'Increases refining yield by 25%. '},
		18: {name: 'Rebar II', researchedAt: 10, duration: 300, cost: {1: 1000, 11: 5000}, description: 'Increases hp of new buildings by 100%. '},
		19: {name: 'Power Effeciency', researchedAt: 1, duration: 300, cost: {0: 1000, 8: 500}, description: 'Reduces energy cost for unit actions by 50%. '},
		20: {name: 'Improved Storage', researchedAt: 10, duration: 300, cost: {0: 1000, 11: 2000}, description: 'Increases capacity of mines and oilwell by 100%. '},
		21: {name: 'Nuclear Fusion', researchedAt: 1, duration: 300, cost: {10: 5000, 19: 5000}, description: 'Increases Energy production by 100%. '},

	},
	tileTypes: {
		'water': {name: 'Water', yield: [0,0,0,0,0,0]},
		'grass': {name: 'Plains', yield: [1,1,1,1,1,1]},
		'forest': {name: 'Forest', yield: [1,2,2,1,1,1]},
		'rock': {name: 'Ore Deposit', yield: [1,3,3,1,1,1]},
		'desert': {name: 'Desert', yield: [1,2,2,5,1,1]},
	},
	unitData: {
		'Tank Body': {qCorrection: []},
	},
	reflect: [], // [skybox],
	units: [],
	cube_to_offset: function(cube) {
		var col = cube.x;
		var row = cube.z + (cube.x - (cube.x & 1)) / 2;
		return v(col, row);
	},
	offset_to_cube: function(hex) {
		var x = hex.x;
		var z = hex.y - (hex.x - (hex.x & 1)) / 2;
		var y = -x-z;
		return v(x, y, z);
	},
	cube_distance: function(a, b) {
		return (Math.abs(a.x - b.x) + Math.abs(a.y - b.y) + Math.abs(a.z - b.z)) / 2;
	},
	offset_distance: function(a, b) {
		var ac = World.offset_to_cube(a);
		var bc = World.offset_to_cube(b);
		return World.cube_distance(ac, bc);
	},
	getAdjacentTiles: function(x, y) {
		var tile = Tiles[x + ',' + y];
		if (!tile) {
			return null;
		}
		// prepopulate array with possible neighbors to prevent having to loop through whole worldmap
		var possibleNeighbors = [];
		for (var i = x - 2; i <= x + 2; i++) {
			for (var j = y - 2; j <= y + 2; j++) {
				possibleNeighbors.push((i + ',' + j));
			}
		}

		var tiles = [];
		for (var t in possibleNeighbors) {
			if (!Tiles[possibleNeighbors[t]]) {
				continue;
			}
			var d = distance(tile.pos, Tiles[possibleNeighbors[t]].pos);
			if (d > 0 && d < 9.5) {
				tiles.push(Tiles[possibleNeighbors[t]]);
			}
		}
		return tiles;
	},
	ownAdjacentTile: function(x, y) {
		var neighbors = World.getAdjacentTiles(x, y);
		for (var n in neighbors) {
			if (neighbors[n] && neighbors[n].owner == Lamden.wallet) {
				return true;
			}
		}
		return false;
	},
	loadImage: function(url, debug) {
		const canvas = document.createElement('canvas');
		canvas.style.position = 'fixed';
		canvas.style.top = 0;
		canvas.style.left = 0;
		if (debug) {
			document.body.appendChild(canvas);
		}
		const ctx = canvas.getContext('2d');
		canvas.width = 512;
		canvas.height = 512;

		const img = new Image();
		img.onload = function () {
			ctx.drawImage(img, 0, 0);
			World.buffer = ctx.getImageData(0, 0, 512, 512).data;
			World.createWorld();
		};
		img.src = url;
	},
	// samples pixel from loaded image returns array(rgba)
	getBlendColorAtPosition: function(p) {
		let pos = Math.floor(p.x + p.y * 512) * 4;
		let c = [World.buffer[pos + 0],World.buffer[pos + 1],World.buffer[pos + 2],World.buffer[pos + 3]];
		return c;
	},
	createWorld: function(options) {
		dynamicSPS['Trees1'] = 100;
		//dynamicSPS['Wall'] = 100;
		dynamicSPS['Rock1'] = 100;
		dynamicSPS['Rock2'] = 100;
		dynamicSPS['Grass2'] = 2000;
		//this.drawWorld();
		window.setTimeout(function() {
			for (let m in scene.materials) {
				scene.materials[m].freeze();
			}
		}, 3000);

		function updateCanvas() {
			World.offset = pos2tile(v(camera.target.position.x, camera.target.position.z));
			if (BABYLON.Vector2.Distance(World.lastOffset, World.offset) == 0) {
				return;
			}
			World.drawWorld();
		}
		window.setInterval(updateCanvas, 500);
		//window.setTimeout(function() { World.drawWorld(true) }, 500);
		window.setInterval(function() {
			for (var p in scene.particleSystems) {
				if (distance(scene.particleSystems[p].emitter.getAbsolutePosition(), camera.position) < 150) {
					scene.particleSystems[p].start();
				} else {
					scene.particleSystems[p].stop();
				}
			}
		}, 1000);

		Lamden.getPlayers();

		// multiplayer event log
		$.get('./logid.php', function(e) {
			World.logID = parseInt(e) || 0;
			window.setInterval(function() {
				$.get('./getlog.php?id=' + World.logID, function(e) {
					//console.log(e);
					let log = JSON.parse(e);
					for (let i in log) {
						if (log[i].id > World.logID) {
							World.logID = log[i].id;
						}
						let id = log[i].x + ',' + log[i].y;
						let id2 = log[i].x2 + ',' + log[i].y2;
						let type = log[i].type;
						console.log('Event', log[i]);
						if (!Tiles[id]) {
							Tiles[id] = {type: 'water', x: log[i].x, y: log[i].y, pos: mapPosition(log[i].x, log[i].y)};
						}
						if (!Tiles[id2]) {
							Tiles[id2] = {type: 'water', x: log[i].x2, y: log[i].y2, pos: mapPosition(log[i].x2, log[i].y2)};
						}
						if (type == 'colonize') {
							Tiles[id].owner = log[i].var1;
							let model = log[i].var1 == Lamden.wallet ? UI.friendlyTerritory : UI.enemyTerritory;
							addModel(model, Tiles[id].pos.add(v(0,.02,0)), v(0,0,0), .2225);
							if (UI.selectedTile) {
								tileHtml(UI.selectedTile);
							}
							updateSPSMeshes();
							if (Lamden.wallet == log[i].var1 && UI.tool == 'colonize') {
								colonizeMode();
							}
						}
						if (type == 'build') {
							if (Tiles[id].mesh) {
								if (shadowRenderList.indexOf(Tiles[id].mesh) > -1) {
									shadowRenderList.splice(shadowRenderList.indexOf(Tiles[id].mesh), 1);
								}
								Tiles[id].mesh.dispose();
								Tiles[id].mesh = null;
							}
							if (log[i].var2 == 1) {
								Tiles[id].type = 'grass';
							}
							setBuildingData(Tiles[id], log[i].var2, log[i].var1,  log[i].var3);
							if (log[i].var1 == Lamden.wallet) {

								// addCombatText(World.buildingData[log[i].var2].name, getScreenCoords(Tiles[id].pos));
							}
							Tiles[id].lastHarvest = UI.now();
							Tiles[id].fortification = 0;
							World.drawWorld(true);
							if (log[i].var1 == Lamden.wallet && log[i].var2 == 1) {
								Lamden.getCapital();
							}
						}
						if (type == 'fortify') {
							Tiles[id].fortification += log[i].var1;
							console.log(Tiles[id].owner);
							if (!Tiles[id].owner) {
								Tiles[id].owner = Tiles[id].troopOwner;
							}
							console.log(Tiles[id].owner);
							if (log[i].var2) {
								Tiles[id].currentHP += log[i].var2;
							}
							if (Tiles[id].owner == Lamden.wallet) {
								if (log[i].var1) {
									addCombatText('+' + log[i].var1 + ' Defense', getScreenCoords(Tiles[id].pos), '#0f0');
									Player.fort += log[i].var1;
									changePlayerResource(5, 0);
								}
								if (log[i].var2) {
									addCombatText('+' + log[i].var2 + ' Repair', getScreenCoords(Tiles[id].pos).add(v(0,-20)), '#0f0');
									changePlayerResource(5, -log[i].var1);
								}
							}
					/*		if (UI.settings.units == 1) {
								if (Tiles[id].unit) {
									updateNamePlate(Tiles[id].unit, Tiles[id].unit.troops + '/' + Tiles[id].fortification);
								}
								if (Tiles[id].fortMesh) {
									updateNamePlate(Tiles[id].fortMesh, 0 + '/' + Tiles[id].fortification);
								} else {
									addUnitNamePlate(id, 0, Tiles[id].fortification, Tiles[id].owner)
								}
							} else if (UI.settings.units == 2) { // if bar, redraw origin bar
								if (Tiles[id].fortMesh) {
									Tiles[id].fortMesh.dispose();
								}
								Tiles[id].fortMesh = addBar(id, 0, Tiles[id].fortification, Tiles[id].owner);
								if (Tiles[id].unit) {
									//Tiles[id].unit.dispose();
									//addBar(id, Tiles[id].unit.troops, Tiles[id].fortification, Tiles[id].unit.owner);
									updateBar(Tiles[id].unit, id, Tiles[id].unit.troops, Tiles[id].fortification);
								}
							} else { */
								if (Tiles[id].fortMesh) {
									Tiles[id].fortMesh.dispose();
									Tiles[id].fortMesh = null;
								}
								if (Tiles[id].unit) {
									Tiles[id].unit.dispose();
									Tiles[id].unit = null;
								}
								World.drawWorld(true);

							//}
 						}
						if (type == 'delete' && log[i].var1 == 'building') {
							if (Tiles[id].mesh) {
								if (shadowRenderList.indexOf(Tiles[id].mesh) > -1) {
									shadowRenderList.splice(shadowRenderList.indexOf(Tiles[id].mesh), 1);
								}
								Tiles[id].mesh.dispose();
							}
							Tiles[id].building = 0;
							Tiles[id].level = 1;
							Tiles[id].currentHP = 0;
							Tiles[id].maxHP = 0;
						}
						if (type == 'pickup') {
							let troops = parseInt(log[i].var1 || 0);
							let fort = parseInt(log[i].var2 || 0);
							console.log(troops, fort);
							if (!Tiles[id].unit && troops) {
								console.log('Pickup error');
								continue;
							}
							if (!Tiles[id].fortification && fort) {
								console.log('Pickup error');
								continue;
							}
							//troops
							if (troops && Tiles[id].unit.owner == Lamden.wallet) {
								addMessage('Units picked up');
								World.Sounds[randomArray(['confirm1','confirm2'])].play();
								console.log(troops);
								addCombatText('-' + troops, getScreenCoords(Tiles[id].unit.position), '#f00');
								Player.troops -= troops;
								changePlayerResource(4, troops);
							}
							if (troops) {
								Tiles[id].numTroops -= troops;
								$('#' + Tiles[id].unit.id).remove();
								if (Tiles[id].unit.weapon) {
									Tiles[id].unit.weapon.dispose();
								}
								Tiles[id].unit.dispose();
								Tiles[id].unit = null;
								if (Tiles[id].numTroops == 0) {
									Tiles[id].troopOwner = '';
								}
								if (UI.selectedUnit == Tiles[id].unit) {
									UI.cancel();
								}
								World.drawWorld(true);
							}
							// fort
							if (fort && Tiles[id].owner == Lamden.wallet) {
								addMessage(fort + ' defense units picked up');
								World.Sounds[randomArray(['confirm1','confirm2'])].play();
								addCombatText('-' + fort, getScreenCoords(Tiles[id].pos), '#f00');
								Player.fort -= fort;
								changePlayerResource(5, fort);
							}
							if (fort) {
								Tiles[id].fortification -= fort;
								if (Tiles[id].fortMesh) {
									Tiles[id].fortMesh.dispose();
									Tiles[id].fortMesh = null;
								}
								if (!Tiles[id].fortification && !Tiles[id].building) {
									Tiles[id].owner = null;
								}
							}

/*							if (UI.settings.units == 1) {
								updateNamePlate(Tiles[id].unit, Tiles[id].numTroops + '/' + Tiles[id].fortification);
							}
							if (UI.settings.units == 2) { // if bar, redraw origin bar
								updateBar(Tiles[id].unit, id, Tiles[id].numTroops, Tiles[id].fortification);
							}*/
							if (Tiles[id].unit) {
								Tiles[id].unit.dispose();
								Tiles[id].unit = null;
							}
							if (Tiles[id].fortMesh) {
								Tiles[id].fortMesh.dispose();
								Tiles[id].fortMesh = null;
							}
							World.drawWorld(true);


						}
						if (type == 'train') {
							let owner = log[i].var1;
							let amount = parseInt(log[i].var2);
							let type = parseInt(log[i].var3);

							if (type) { // discover
								Tiles[id].fortification = 0;
								let r = type;
								Tiles[id].terrain = type;
								if (r > 240 && r < 250) {
									Tiles[id].type = 'rock';
								} else if (r > 210 || (r > 120 && r < 150)) {
									Tiles[id].type = 'desert';
								} else if (r < 90 || (r > 150 && r < 155)) {
									Tiles[id].type = 'forest';
								} else if (r > 80) {
									Tiles[id].type = 'grass';
								}
								World.drawWorld(true);
								if (r <= 80) {
									console.log('water');
									continue;
								}
							}

							Tiles[id].collected = true;
							Tiles[id].trainAmount = null;
							Tiles[id].numTroops = (Tiles[id].numTroops || 0) + amount;
							Tiles[id].troopOwner = owner;
							if (Tiles[id].unit) { // if existing unit, add
								let unitID = Tiles[id].unit.id;
							//	$('#' + unitID).html(formatName(owner) + '<br>' + Tiles[id].unit.troops);
							//	if (UI.settings.units == 1) {
							//		updateNamePlate(Tiles[id].unit, Tiles[id].unit.troops + '/' + Tiles[id].fortification);
							//	} else if (UI.settings.units == 2) { // if bar, redraw origin bar
							//		updateBar(Tiles[id].unit, id, Tiles[id].unit.troops, Tiles[id].fortification);
							//	} else {
									if (Tiles[id].unit.weapon) {
										Tiles[id].unit.dispose();
									}
									Tiles[id].unit.dispose();
									Tiles[id].unit = null;
									World.drawWorld(true);
							//	}
							} else { // place new unit
								if (UI.settings.units == 1) {
									let unit = addUnitNamePlate(id, amount, Tiles[id].fortification, owner);
								} else if (UI.settings.units == 2) {
									let unit = addBar(id, amount, Tiles[id].fortification, owner);
								} else {
									Tiles[id].numTroops = amount;
									Tiles[id].troopOwner = owner;
								}
							}
							World.drawWorld(true);
							if (owner == Lamden.wallet) {
								World.Sounds[randomArray(['unit1', 'unit2','unit3'])].play();
								addMessage(amount + ' units placed');
								addCombatText('+' + amount, getScreenCoords(Tiles[id].pos));
								Player.troops += amount;
								changePlayerResource(4, -amount);
								deployMode();
							}
						}
						if (type == 'move') {
							if (!Tiles[id].unit && !Tiles[id].fortification) {
								continue;
							}
							if (log[i].var3) { // discover
								let r = log[i].var3;
								Tiles[id2].terrain = r;
								if (r > 240 && r < 250) {
									Tiles[id2].type = 'rock';
								} else if (r > 210 || (r > 120 && r < 150)) {
									Tiles[id2].type = 'desert';
								} else if (r < 90 || (r > 150 && r < 155)) {
									Tiles[id2].type = 'forest';
								} else if (r > 80) {
									Tiles[id2].type = 'grass';
								}
								World.drawWorld(true);
								if (r <= 80) {
									console.log('water');
									continue;
								}
							}
							Tiles[id].numTroops -= log[i].var1;
							Tiles[id].fortification -= log[i].var2;
							Tiles[id2].numTroops = (Tiles[id2].numTroops || 0) + log[i].var1;
							if (Tiles[id].troopOwner) {
								Tiles[id2].troopOwner = Tiles[id].troopOwner;
							}
							Tiles[id2].fortification = (Tiles[id2].fortification || 0) + log[i].var2;
							if (Tiles[id].owner) {
								Tiles[id2].owner = Tiles[id].owner;
							}
							if (!Tiles[id].numTroops) {
								Tiles[id].troopOwner = null;
							}
							if (!Tiles[id].fortification && !Tiles[id].building) {
								Tiles[id].owner = null;
							}
							if (Tiles[id].unit) {
								if (Tiles[id].unit.weapon) {
									Tiles[id].unit.weapon.dispose();
								}
								Tiles[id].unit.dispose();
								Tiles[id].unit = null;
							}
							if (Tiles[id].fortMesh) {
								Tiles[id].fortMesh.dispose();
								Tiles[id].fortMesh = null;
							}
							if (Tiles[id2].unit) {
								if (Tiles[id2].unit.weapon) {
									Tiles[id2].unit.weapon.dispose();
								}
								Tiles[id2].unit.dispose();
								Tiles[id2].unit = null;
							}
							if (Tiles[id2].fortMesh) {
								Tiles[id2].fortMesh.dispose();
								Tiles[id2].fortMesh = null;
							}
							World.drawWorld(true);
							continue;
							if (log[i].var1) { // split off units
								let amount = parseInt(log[i].var1);
								Tiles[id].unit.troops -= amount;
								Tiles[id].numTroops -= amount;
								$('#' + Tiles[id].unit.id).html(formatName(Tiles[id].unit.owner) + '<br>' + Tiles[id].unit.troops);
								if (UI.settings.units == 1) { // if unit display is numbers, update numbers on origin
									updateNamePlate(Tiles[id].unit, Tiles[id].unit.troops + '/' + Tiles[id].fortification || 0);
								}
								if (UI.settings.units == 2) { // if bar, redraw origin bar
									//Tiles[id].unit.dispose();
									//addBar(id, Tiles[id].unit.troops, Tiles[id].fortification, Tiles[id].unit.owner);
									updateBar(Tiles[id].unit, id, Tiles[id].unit.troops, Tiles[id].fortification);
								}
								if (Tiles[id2].unit && Tiles[id2].unit.owner == Tiles[id].unit.owner) { // split and merge with other
									Tiles[id2].unit.troops += amount;
									Tiles[id2].numTroops += amount;
									$('#' + Tiles[id2].unit.id).html(formatName(Tiles[id2].unit.owner) + '<br>' + Tiles[id2].unit.troops);
									if (UI.settings.units == 1) {
										updateNamePlate(Tiles[id2].unit, Tiles[id2].unit.troops + '/' + Tiles[id2].fortification || 0);
									} else if (UI.settings.units == 2) {
										//Tiles[id2].unit.dispose();
										//addBar(id2, Tiles[id2].unit.troops, Tiles[id2].fortification, Tiles[id2].unit.owner);
										updateBar(Tiles[id2].unit, id2, Tiles[id2].unit.troops, Tiles[id2].fortification);
									} else {
										if (Tiles[id2].unit.weapon) {
											Tiles[id2].unit.weapon.dispose();
										}
										Tiles[id2].unit.dispose();
										Tiles[id2].unit = null;
										World.drawWorld(true);
									}
								} else { // just split
									if (UI.settings.units == 1) {
										addUnitNamePlate(id2, amount, Tiles[id2].fortification || 0, Tiles[id].unit.owner);
									} else if (UI.settings.units == 2) {
										addBar(id2, amount, Tiles[id2].fortification || 0, Tiles[id].unit.owner);
									} else {
										Tiles[id2].numTroops = amount;
										Tiles[id2].troopOwner = Tiles[id].unit.owner;
										World.drawWorld(true);
									}
									if (UI.selectedUnit == Tiles[id].unit) {
										selectUnit(Tiles[id2].unit);
									}
								}
								if (Tiles[id].unit.owner == Lamden.wallet) {
									addMessage('Units split. now counting ' + Tiles[id].unit.troops + ' and ' + Tiles[id2].unit.troops);
								}
								continue;
							}
							if (Tiles[id2].unit && Tiles[id2].unit.owner == Tiles[id].unit.owner) { // merge units
								let troops = parseInt(Tiles[id].unit.troops);
								let unitID = Tiles[id].unit.id;
								let unit = Tiles[id].unit;
								$('#' + unitID).remove();
								if (Tiles[id].unit.weapon) {
									Tiles[id].unit.weapon.dispose();
								}
								Tiles[id].unit.dispose();
								Tiles[id].unit = null;
								Tiles[id].numTroops = 0;
								Tiles[id].troopOwner = '';
								Tiles[id2].unit.troops += troops;
								unitID = Tiles[id2].unit.id;
								$('#' + unitID).html(formatName(Tiles[id2].unit.owner) + '<br>' + Tiles[id2].unit.troops);
								if (UI.settings.units == 1) {
									updateNamePlate(Tiles[id2].unit, Tiles[id2].unit.troops + '/' + Tiles[id2].fortification);
								}
								if (UI.settings.units == 2) {
									//Tiles[id2].unit.dispose();
									//addBar(id2, Tiles[id2].unit.troops, Tiles[id2].fortification, Tiles[id2].unit.owner);
									updateBar(Tiles[id2].unit, id2, Tiles[id2].unit.troops, Tiles[id2].fortification);
								}
								if (Tiles[id2].unit.owner == Lamden.wallet) {
									addMessage('Units merged. now counting ' + Tiles[id2].unit.troops);
								}
								if (UI.selectedUnit == unit) {
									//UI.selectedUnit = Tiles[id2].unit; // change selection to
									// UI.selectedUnit.ready = UI.now() + 30;
									selectUnit(Tiles[id2].unit);
								}
								//$('#info-panel').hide();
								continue;
							}
							moveUnit(Tiles[id], Tiles[id2]);
						}
						if (type == 'attack') {
							if (!Tiles[id].unit) {
								continue;
							}
							attackUnit(Tiles[id], Tiles[id2], log[i].var1, log[i].var2);
						}
						if (type == 'siege') {
							if (!Tiles[id].unit) {
								continue;
							}
							attackBuilding(Tiles[id], Tiles[id2], log[i].var1, log[i].var2, log[i].var3);
						}
						if (type == 'missile') {
							fireMissile(Tiles[id], Tiles[id2], log[i].var1, log[i].var2, log[i].var3);
						}
						if (UI.selectedTile) {
							tileHtml(UI.selectedTile);
						}
					}
				}).fail(function() {
					addMessage('Cannot connect to server', '#f88');
				});
			}, 1000);
		});

/*		$.get(Lamden.url + '/tileChanges?key=0', function(e) {
			let t = JSON.parse(e.value).substr(1);
			t = t.split(',');
			let tiles = [];
			for (let i = 0; i < t.length; i += 2) {
				tiles.push(v(t[i], t[i + 1]));
			}
			Lamden.tileChanges = tiles;
			for (let t in tiles) {
				$.get(Lamden.url + '/tiles?key=' + tiles[t].x + ',' + tiles[t].y, function(e) {
					let tileInfo = JSON.parse(e.value);
					let tile = Tiles[tiles[t].x + ',' + tiles[t].y];
					tile.owner = tileInfo[1];
				});
			}
			engine.runRenderLoop(renderLoop);
		}).fail(function() {
			addMessage('Cannot connect to contract, loading world for debugging purposes', '#f88');
			engine.runRenderLoop(renderLoop);
		});
*/


		window.setTimeout(function() {
			$('#loading-screen').fadeOut(1000);
		}, 500);
	},
	getTileData: function() {
		$.get('./gettiles.php', function(e) {
			let tiles = JSON.parse(e);
			for (let t in tiles) {
				let id = tiles[t].x + ',' + tiles[t].y;
				if (!Tiles[id]) {
					Tiles[id] = {type: 'water', pos: mapPosition(tiles[t].x, tiles[t].y), x: tiles[t].x, y: tiles[t].y};
				}
				setBuildingData(Tiles[id], tiles[t].building, tiles[t].owner, tiles[t].lastHarvest);
				Tiles[id].terrain = tiles[t].type;
				Tiles[id].level = tiles[t].level;
				Tiles[id].maxHP = custom.buildingHP(tiles[t]);
				Tiles[id].fortification = tiles[t].fort;
				Tiles[id].owner = tiles[t].owner;
				Tiles[id].lastHarvest = tiles[t].lastHarvest;
				Tiles[id].currentHP = tiles[t].hp;
				Tiles[id].trainAmount = tiles[t].trainAmount;
				Tiles[id].convertAmount = tiles[t].trainAmount;
				Tiles[id].convertID = tiles[t].convertID;
				Tiles[id].collected = tiles[t].collected ? true : false;
				if (tiles[t].numTroops) {
					Tiles[id].numTroops = tiles[t].numTroops;
					Tiles[id].troopOwner = tiles[t].troopOwner;

				}
			}
			Lamden.getCapital();
			initChat();
			engine.runRenderLoop(renderLoop);
		}).fail(function(e) {
			console.log(e);
			engine.runRenderLoop(renderLoop);
		});
	},
	createWater: function(options) {
		options = options || {};

		let size = UI.settings.increaseCameraZoom ? 1536 : 1024;
		World.water = new BABYLON.Mesh.CreateGround('water', size, size, 2, scene);
		World.water.position = options.position || v(0,0,0);
		World.water.receiveShadows = true;

		let w = new watermaterial('water', scene, sun);
		w.reflectionTexture.mirrorPlane = new BABYLON.Plane(0, -1, 0, 0);
		//w.reflectionTexture.renderList = World.reflect;
		w.alpha = 1;
		w.waterColor = color(.6,1,1);
		w.waveHeight = .01;
		w.bumpTexture.uScale = 32;
		w.bumpTexture.vScale = 32;
		World.water.material = w;
	},
	drawWorld: function(override) {
		if (BABYLON.Vector2.Distance(World.lastOffset, World.offset) == 0 && !override) {
			return;
		}
		for (var m in modelSPS) {
			if (shadowRenderList.indexOf(modelSPS[m].mesh) > -1) {
				shadowRenderList.splice(shadowRenderList.indexOf(modelSPS[m].mesh), 1);
			}
		}
		meshTransformationData = {};
		World.lastOffset = World.offset;
		let drawDistance = UI.settings.increaseCameraZoom ? 350 : 280;
		for (let i = World.props.length - 1; i >= 0; i--) {
			if (distance(World.props[i].position, camera.target.position) > drawDistance) {
				if (shadowRenderList.indexOf(World.props[i]) > -1) {
					shadowRenderList.splice(shadowRenderList.indexOf(World.props[i]), 1);
				}
				if (World.reflect.indexOf(World.props[i]) > -1) {
					World.reflect.splice(World.reflect.indexOf(World.props[i]), 1);
				}
				World.props[i].dispose();
				World.props.splice(i ,1);
			}
		}
		for (let i = World.units.length - 1; i >= 0; i--) {
			if (distance(World.units[i].position, camera.target.position) > drawDistance) {
				if (shadowRenderList.indexOf(World.units[i]) > -1) {
					shadowRenderList.splice(shadowRenderList.indexOf(World.units[i]), 1);
				}
				if (World.reflect.indexOf(World.units[i]) > -1) {
					World.reflect.splice(World.reflect.indexOf(World.units[i]), 1);
				}
				if (World.units[i].weapon) {
					World.units[i].weapon.dispose();
				}
				World.units[i].dispose();
				Tiles[World.units[i].tileID].unit = null;
				World.units.splice(i ,1);
			}
		}


		if (!World.blank) {
			let blank = World.assets['NGon001'].clone('Undiscovered');
			blank.material = new BABYLON.StandardMaterial('blank', scene);
			blank.material.specularColor = color(.1,.1,.1);
			blank.material.diffuseColor = color(.5,.5,.5);
			World.blank = blank;
		}
		let grass = World.assets['NGon001'];
		let desert = World.assets['Desert10'];
		let road = World.assets['NGon008'];
		let plainMeshes = ['Plains1','Plains2','Plains3','Plains4'];

		World.water.position.x = Math.round(mapPosition(World.offset.x, World.offset.y).x / 32) * 32;
		World.water.position.z = Math.round(mapPosition(World.offset.x, World.offset.y).z / 32) * 32;
		let tileScale = .23;
		for (let x = clamp(World.offset.x - Math.round(drawDistance * .12), -300, 300); x < clamp(World.offset.x + Math.round(drawDistance * .12), -300, 300); x++) {
			for (let y = clamp(World.offset.y - Math.round(drawDistance * .14), -300, 300); y < clamp(World.offset.y + Math.round(drawDistance * .14), -300, 300); y++) {
				let c = 0; // World.getBlendColorAtPosition({x: x + 256, y: y + 256});
				let id = x + ',' + y;
				let pos = mapPosition(x, y); //v((x - 0) * 9.2 - (y % 2 == 0 ? 4.6 : 0), 0, (y - 0) * 8);
				if (!Tiles[id]) {
					Tiles[id] = {x: x, y: y, type: 'water', pos: pos};
				}
				if (distance(camera.target.position, pos) > drawDistance) {
					continue;
				}
				let r = World.random[Math.abs(x * 256 + y) % 100];
//				if (!Tiles[id].terrain && ((x % 36 == 0 && y % 18 == 0) || (Math.abs(x) % 36 == 18 && (Math.abs(y) % 36 == 9 || Math.abs(y) % 36 == 27)))) { // capital location
//					Tiles[id].type = 'grass';
//					addModel(UI.enemyTerritory, pos, v(0,Math.round(r * 6) / 6 * Math.PI * 2,0), .2225);
				if (!Tiles[id].terrain) { // undiscovered
						addModel(World.blank, pos, v(0,Math.round(r * 6) / 6 * Math.PI * 2,0), .2225, color(r * .2 + .8,r * .2 + .8,r * .2 + .8));
				} else if (Tiles[id].terrain > 80) { // land
					// default tile type is water, so any unit spawned because of multiplayer events outside of viewing range
					// turn up as ship, delete and display correct unit now that its land-type is loaded.
					if (Tiles[id].type == 'water' && Tiles[id].unit) {
						if (Tiles[id].unit.weapon) {
							Tiles[id].unit.weapon.dispose();
						}
						Tiles[id].unit.dispose();
						Tiles[id].unit = null;
						//Tiles[id].numTroops = 0;
						//Tiles[id].troopOwner = '';
					}
					// random value used for giving each tile a distinct color/rotation/model
					if (Tiles[id].terrain > 240 && Tiles[id].terrain < 250) { // rock
						Tiles[id].type = 'rock';
						addModel(World.assets[r < .5 ? 'Rock2' : 'Rock10'], pos, v(0,Math.round(r * 6) / 6 * Math.PI * 2,0), .2225);
					} else if (Tiles[id].terrain > 210 || (Tiles[id].terrain > 120 && Tiles[id].terrain < 150)) { // desert
						addModel(World.assets[r < .2 ? 'Desert10' : 'Desert11'], pos, v(0,0,0), .2225, color(r * .2 + .8,r * .1 + .9,r * .2 + .8));
						Tiles[id].type = 'desert';
					} else if (Tiles[id].terrain < 90 || (Tiles[id].terrain > 150 && Tiles[id].terrain < 155)) { // forest
						if (!Tiles[id].building) {
							addModel(World.assets[r < .5 ? 'Forest10' : 'Forest10'], pos, v(0,Math.round(r * 6) / 6 * Math.PI * 2,0), .2225);
						}
						Tiles[id].type = 'forest';
					} else { // grass
						//addModel(grass, pos, v(0,Math.PI / 2,0), .0088, color(r * .5 + .5,r * .2 + .8,r * .5 + .5));
						// r = (Tiles[id].terrain - 128) / 128;// color grass according to terrain value
						addModel(grass, pos, v(0,0,0), .2225, color(r * .2 + .8,r * .2 + .8,r * .2 + .8));
						Tiles[id].type = 'grass';
					}
				}

				if (Tiles[id].building > 0) {
					addBuilding(Tiles[id]);
				}
				if (Tiles[id].owner == Lamden.wallet || Tiles[id].troopOwner == Lamden.wallet) {
					addModel(UI.friendlyTerritory, Tiles[id].pos.add(v(0,.09,0)), v(0,0,0), .2225);
				}
				if ((Tiles[id].owner && Tiles[id].owner != Lamden.wallet) || (Tiles[id].troopOwner && Tiles[id].troopOwner != Lamden.wallet)) {
					addModel(UI.enemyTerritory, Tiles[id].pos.add(v(0,.09,0)), v(0,0,0), .2225);
				}
				if (Tiles[id].fortification && !Tiles[id].fortMesh) {

					if (UI.settings.units == 1) {
						Tiles[id].fortMesh = addUnitNamePlate(id, 0, Tiles[id].fortification, Tiles[id].owner);
						World.props.push(Tiles[id].fortMesh);
					} else if (UI.settings.units == 2) {
						Tiles[id].fortMesh = addBar(id, 0, Tiles[id].fortification, Tiles[id].owner);
						World.props.push(Tiles[id].fortMesh);
					} else {
						Tiles[id].fortMesh = addFort(x, y, Tiles[id].owner, Tiles[id].fortification);
					}
				}
				if (UI.settings.units == 1 && Tiles[id].numTroops && Tiles[id].fortification) {
					Tiles[id].fortMesh.isVisible = false;
				} else if (UI.settings.units == 1 && !Tiles[id].numTroops && Tiles[id].fortification) {
					Tiles[id].fortMesh.isVisible = true;
				}

				if (UI.settings.units == 1 && Tiles[id].numTroops && !Tiles[id].unit) {
					let unit = addUnitNamePlate(id, Tiles[id].numTroops, Tiles[id].fortification, Tiles[id].troopOwner);
				} else if (UI.settings.units == 2 && Tiles[id].numTroops && !Tiles[id].unit) {
					let unit = addBar(id, Tiles[id].numTroops, Tiles[id].fortification, Tiles[id].troopOwner);
				} else if (Tiles[id].numTroops && Tiles[id].numTroops >= 140 && !Tiles[id].unit && !Tiles[id].building) {
					let tank = addTank(Tiles[id].x, Tiles[id].y, id, Tiles[id].troopOwner, Tiles[id].numTroops);
					$('#' + tank.id).html(formatName(tank.owner) + '<br>' + tank.troops);
				} else if (Tiles[id].numTroops && !Tiles[id].unit) {
					addUnit(Tiles[id].numTroops, mapPosition(Tiles[id].x, Tiles[id].y), id, Tiles[id].troopOwner);
//				} else if (Tiles[id].numTroops && !Tiles[id].unit) {
//					let ship = addShip(Tiles[id].x, Tiles[id].y, id, Tiles[id].troopOwner);
//					ship.troops = Tiles[id].numTroops;
//					$('#' + ship.id).html(formatName(ship.owner) + '<br>' + ship.troops);
				}
			}
		}

		updateSPSMeshes();
		//World.water.material.reflectionTexture.renderList = [modelSPS['Leaves Atlas'].mesh];
	},
	createUnit: function(x, y, type, owner) {

	}
}
Player = {
	Resources: {},
	lastHarvest: {},
	unitCount: 0,
	buildings: {},
}

function addBuilding(tile) {
	var data = World.buildingData[tile.building];
	if (!data) {
		console.warn('Building not found: ' + tile.building);
		return;
	}
	if (tile.mesh && tile.mesh.buildingID != tile.building) {
		shadowRenderList.splice(shadowRenderList.indexOf(tile.mesh), 1);
		tile.mesh.dispose();
	}
	if (0 && data.mesh == 'Wall') {
		addModel(World.assets['Wall'], mapPosition(tile.x, tile.y).add(v(0,.05,0)), v(0,0,0), .2225);
	} else if (data.mesh && !scene.getMeshByName(data.name + tile.x + ',' + tile.y) && World.assets[data.mesh]) {
		let building = null;
		building = World.assets[data.mesh].createInstance(data.name + tile.x + ',' + tile.y);
		building.buildingID = tile.building;
		building.position = mapPosition(tile.x, tile.y).add(v(0,.05,0));
		building.rotation.y = Math.round(Math.random() * 6) / 6 * Math.PI * 2;
		building.scaling = v(1,1,1).scaleInPlace(data.meshScale ? data.meshScale : .2225);
		shadowRenderList.push(building);
		building.freezeWorldMatrix();
		//World.reflect.push(building);
		World.props.push(building);
		tile.mesh = building;
		if (data.smoke) {
			//let emitter = new BABYLON.Mesh.CreateBox('test', .1, scene);
			//emitter.parent = building;
			//emitter.scaling = v(1,1,1).scaleInPlace(1/building.scaling.x);
			//emitter.position = data.smoke.scale(1/building.scaling.x);
			let effect = particles(building, 'smoke');
			effect.minEmitBox = data.smoke.scale(1/building.scaling.x);
			effect.maxEmitBox = data.smoke.scale(1/building.scaling.x);
			//effect.start();
			//emitter.freezeWorldMatrix();
		}
		if (tile.building == 4) {
			let arm = World.assets['Pumpjack Arm'].createInstance('Pumpjack Arm' + tile.x + ',' + tile.y);
			arm.position.scaleInPlace(1/arm.scaling.x).addInPlace(v(0,10,0));
			arm.parent = building;
			arm.scaling = v(1,1,1);
			let frame = 0;
			scene.registerBeforeRender(function() {
				frame++;
				arm.rotation.z = Math.sin(frame / 40) * .35;
			});
		}
	} else if (!data.mesh) {
		addModel(building, mapPosition(tile.x, tile.y), v(0,0,0), 1);
	}
	if (!tile.nameplate && tile.building == 1 && Lamden.Players[tile.owner] && Lamden.wallet) {
		tile.nameplate = addNamePlate(mapPosition(tile.x, tile.y), Lamden.Players[tile.owner].name, tile.owner == Lamden.wallet ? color(0,1,0) : color(1,0,0), 14);
	}
	if (tile.owner == Lamden.wallet) {
		Player.territory = Player.territory || [];
		if (Player.territory.indexOf(tile) == -1) {
			Player.territory.push(tile);
		}
	}
}

barMat = new BABYLON.StandardMaterial('Bar', scene);
barMat.diffuseColor = color(.2,1,.2);
barMat.emissiveColor = barMat.diffuseColor.scale(.5);
//barMat.alpha = .8;
barMat2 = new BABYLON.StandardMaterial('Bar Enemy', scene);
barMat2.diffuseColor = color(1,.2,.2);
barMat2.emissiveColor = barMat2.diffuseColor.scale(.5);
//barMat2.alpha = .8;
function addBar(id, troops, defense, owner) {
	if (troops == 0 && defense == 0) {
		return false;
	}
	defense = defense || 0;
	//addModel(bar, Tiles[id].pos, v(0,0,0), v(4, troops, 4));
	//let unit = bar.clone('Unit');
	//unit.scaling = v(4, Math.sqrt(troops), 4);
	let unit = BABYLON.Mesh.ExtrudeShape('Unit',
		[v(-1,-1,0), v(1,-1,0), v(1,1,0), v(-1,1,0), v(-1,-1,0)],
		[v(0,0,0), v(0, Math.sqrt(defense) * .5, 0), v(0, Math.sqrt(defense) * .5, 0), v(0, Math.sqrt(defense) * .5 + Math.sqrt(troops) * .5, 0)],
		1, 0, 3, scene);
	unit.material = owner == Lamden.wallet ? barMat : barMat2;
	unit.setVerticesData('color', new Array(80).fill(.5).concat(new Array(160).fill(1)));
	unit.convertToFlatShadedMesh();
	unit.position = Tiles[id].pos.add(v(0,0,0));
	unit.owner = owner;
	unit.troops = troops;
	unit.tileID = id;
	unit.shoot = function() {}
	if (troops) {
		unit.type = 'unit';
		Tiles[id].unit = unit;
	}
	// shadowRenderList.push(unit); // not showing because of transparency
	World.units.push(unit);
	return unit;
}
function updateBar(old, id, troops, defense) {
	old.dispose();
	if (World.units.indexOf(old) > -1) {
		World.units.splice(World.units.indexOf(old), 1);
	}
	let bar = addBar(id, troops, defense, old.owner);
	if (UI.selectedUnit == old) {
		//UI.selectedUnit = bar;
		//UI.unitSelect.position = bar.position.clone();
		selectUnit(bar);
	}
	return bar;
}
function addUnitNamePlate(id, troops, defense, owner) {
	let text = formatNumber(troops) + '/' + formatNumber(defense);
	let nameplate = addNamePlate(Tiles[id].pos, text, owner == Lamden.wallet ? color(0,1,0) : color(1,0,0), 8);
	nameplate.name = 'Unit';
	nameplate.freezeWorldMatrix = function() {};
	nameplate.position = Tiles[id].pos.add(v(0,Tiles[id].building ? 5 : 1,0));
	nameplate.billboardMode = 7;
	nameplate.troops = troops;
	nameplate.tileID = id;
	nameplate.owner = owner;
	if (troops) {
		nameplate.type = 'unit';
		Tiles[id].unit = nameplate;
	}
	nameplate.shoot = function() {}
	World.units.push(nameplate);
	return nameplate;
}
function updateNamePlate(nameplate, text) {
	var context = nameplate.material.diffuseTexture.getContext();
	context.fillStyle = '#000';
	context.fillRect(0,0,512,512);
	nameplate.material.diffuseTexture.drawText(text, null, 100, '32pt Tahoma', '#fff');
	nameplate.material.diffuseTexture.update();
	nameplate.material.diffuseTexture.getAlphaFromRGB = true;
	nameplate.material.opacityTexture = nameplate.material.diffuseTexture;
	nameplate.material.opacityTexture.update();
	nameplate.material.unfreeze();
	return nameplate, text;
}
function addNamePlate(pos, text, c, size) {
	const nameplate = new BABYLON.Mesh.CreatePlane('nameplate', size, scene);
	nameplate.position = pos.add(v(0, size, 0));
	nameplate.billboardMode = 2;
	nameplate.material = new BABYLON.StandardMaterial('nameplate', scene);
	nameplate.material.diffuseColor = c;
	nameplate.material.diffuseTexture = new BABYLON.DynamicTexture('asd', 256, scene);
	nameplate.material.emissiveColor = c;
	nameplate.material.diffuseTexture.drawText(text, null, 100, '32pt Tahoma', '#fff');
	nameplate.material.opacityTexture = nameplate.material.diffuseTexture;
	nameplate.material.specularColor = color(0,0,0);
	nameplate.material.freeze();
	return nameplate;
}
function addFort(x, y, owner, num) {
	if (num < 80) {
		return;
	}
	addModel(World.assets[num > 200 ? 'Fort' : 'Fort2'], mapPosition(x, y).add(v(0,.01,0)), v(0, Math.round(Math.random() * 6) / 6 * Math.PI * 2,0), v(1, num >= 400 ? 2 : 1,1).scaleInPlace(.22));
	return;
	let fort = World.assets['Fortification'].createInstance('Fortification' + x + ',' + y);
	fort.position = mapPosition(x, y).add(v(0,.01,0));
	fort.rotation.y = Math.round(Math.random() * 6) / 6 * Math.PI * 2;
	fort.scaling = v(1, num >= 400 ? 2 : 1,1).scaleInPlace(.22);
	shadowRenderList.push(fort);
	fort.tileID = x + ',' + y;
	fort.freezeWorldMatrix();
	World.units.push(fort);
	return fort;
}
function formatName(name) {
	return name.length > 12 ? name.substr(0,12) + '...' : name;
}
function addUnit(num, pos, tile, owner) {
	//u = (owner == Lamden.wallet ? unit : enemy).createInstance('Unit');
	let unit = new BABYLON.Mesh('Military', scene); // base mesh
	unit.rotation.y = Math.random() * 6.2;

	unit.position = pos;
	unit.tileID = tile;
	unit.type = 'unit';
	unit.troops = parseInt(num);
	unit.owner = owner;
	unit.ready = Math.round((new Date()).getTime() / 1000) + 30;
	//unit.currentHP = 1;
	//unit.maxHP = 1;
	Tiles[tile].unit = unit;
	unit.id = 'u' + Math.round(Math.random() * 9999);
	World.units.push(unit);
	unit.freezeWorldMatrix();
	if (num < 80 || Tiles[tile].building) {
		return unit;
	}


	let u = World.assets['Base_mesh'].clone('Unit');
	u.skeleton = World.assets['Base_mesh'].skeleton.clone('Skeleton');
	u.position = v(0,0,0);
	u.rotation = v(-Math.PI / 2, 0, 0);
	u.scaling.scaleInPlace(.015);
	u.parent = unit;

	let c = World.assets['Soldier_01_mesh'].clone('Clothes');
	//c.material = World.assets['Soldier_01_mesh'].material.clone('Clothes');
	c.material = World.assets['Soldier_01_mesh'][owner == Lamden.wallet ? 'friendly' : 'enemy'];
	c.skeleton = World.assets['Soldier_01_mesh'].skeleton.clone();
	c.position = v(0,0,0);
	c.rotation = v(-Math.PI / 2, 0, 0);
	c.scaling.scaleInPlace(.015);
	c.parent = unit;

	let w = World.assets[randomArray(['Weapon_RPG','Weapon_AssultRifle02','Weapon_SniperRifle','Weapon_AssultRifle01'])].createInstance('Weapon');
	w.rotation = v(0,Math.PI / 2,-Math.PI / 2); //-Math.PI / 2;
	w.attachToBone(u.skeleton.bones[12], u);
	unit.weapon = w;

	shadowRenderList.push(u);
	unit.idle = function() {
		w.rotation.x = 0;
		scene.beginAnimation(u, 0, 50, true, 1);
		scene.beginAnimation(c, 0, 50, true, 1);
	}
	unit.idle();
	unit.walk = function() {
		w.rotation.x = 0;
		scene.beginAnimation(u, 51, 80, true, 1);
		scene.beginAnimation(c, 51, 80, true, 1);
	}
	unit.death = function() {
		w.rotation.x = 0;
		scene.beginAnimation(u, 493, 545, false, 1);
		scene.beginAnimation(c, 493, 545, false, 1);
	}
	unit.battle = function() {
		w.rotation.x = -1.5;
		scene.beginAnimation(u, 1479, 1508, true, 1);
		scene.beginAnimation(c, 1479, 1508, true, 1);
	}

	unit.mesh = u;
	unit.weapon = w;
	unit.shoot = function() {
		let sound = World.Sounds['gun' + Math.ceil(Math.random() * 2)];
		sound.maxDistance = 200;
		sound.attachToMesh(unit);
		sound.play();
	}
//	u.freezeWorldMatrix();
//	c.freezeWorldMatrix();
//	w.freezeWorldMatrix();
	$('#labels').append('<div id="' + unit.id + '" style="color: ' + (unit.owner == Lamden.wallet ? '#0f0' : '#f88') + '; display: ' + (UI.settings.namplates ? 'block' : 'none') + '">' + formatName(unit.owner) + '<br>' + unit.troops + '</div>');
	return unit;
}
function addTank(x, y, id, owner, num) {
	//let tank = new BABYLON.Mesh('Tank', scene); // base mesh
	let tank = World.assets[num < 200 ? 'APC' : 'Box007'].clone('Tank');
	//base.position = v(0,0,0);
	tank.scaling = v(1,1,1).scaleInPlace(num < 200 ? .4 : .25);
	//base.parent = tank;
	//base.rotation = v(0,0,0);

	tank.position = mapPosition(x, y);
	tank.rotation.y = Math.random() * Math.PI * 2;
	if (owner != Lamden.wallet) {
		// tank.material = enemy.material;
	}
	tank.tileID = id;
	tank.troops = num;
	tank.type = 'unit';
	tank.owner = owner;
	tank.ready = Math.round((new Date()).getTime() / 1000) + 5;
	Tiles[id].unit = tank;
	shadowRenderList.push(tank);
	tank.id = 'u' + Math.round(Math.random() * 9999);
	//World.Sounds['engine1'].autoplay = true;
	//World.Sounds['engine1'].maxDistance = 100;
	//tank.engine = World.Sounds['engine1'].clone();
	//tank.engine.attachToMesh(tank);
	tank.shoot = function() {
		let num = Math.ceil(Math.random() * 6);
		let sound = World.Sounds['explosion' + num];
		console.log(num);
		sound.maxDistance = 500;
		sound.attachToMesh(tank);
		sound.play();
	}
	tank.freezeWorldMatrix();
	World.units.push(tank);
//	$('#labels').append('<div id="' + tank.id + '" style="color: ' + (tank.owner == Lamden.wallet ? '#0f0' : '#f88') + '; display: ' + (UI.settings.namplates ? 'block' : 'none') + '">' + tank.owner + '<br>' + tank.troops + '</div>');
	return tank;
}
function addShip(x, y, id, owner) {
	//let ship = new BABYLON.Mesh('Ship', scene); // base mesh
	let ship = World.assets['Battleship2'].clone('Ship');
	//base.position = v(0,0,0);
	ship.scaling = v(1,1,1).scaleInPlace(.3);
	//base.parent = ship;
	//base.rotation = v(0, Math.PI, 0);

	ship.position = mapPosition(x, y);
	ship.rotation.y = Math.random() * Math.PI * 2;
	if (owner != Lamden.wallet) {
//		ship.material = enemy.material;
	}
	ship.tileID = id;
	ship.troops = 100;
	ship.type = 'unit';
	ship.owner = owner;
	ship.ready = Math.round((new Date()).getTime() / 1000) + 5;
	Tiles[id].unit = ship;
	shadowRenderList.push(ship);
	ship.id = 'u' + Math.round(Math.random() * 9999);
	//World.Sounds['refinery1'].autoplay = true;
	//World.Sounds['refinery1'].maxDistance = 100;
	//ship.engine = World.Sounds['refinery1'].clone();
	//ship.engine.attachToMesh(ship);
	ship.shoot = function() {
		let sound = World.Sounds['explosion' + Math.ceil(Math.random() * 6)];
		sound.maxDistance = 500;
		sound.attachToMesh(ship);
		sound.play();
	}
	ship.freezeWorldMatrix();
	World.units.push(ship);
	$('#labels').append('<div id="' + ship.id + '" style="color: ' + (ship.owner == Lamden.wallet ? '#0f0' : '#f88') + '; display: ' + (UI.settings.namplates ? 'block' : 'none') + '">' + ship.owner + '<br><span style="font-size: 120%; ">' + ship.troops + '</span></div>');
	return ship;
}
scene.registerBeforeRender(function() {
	if (!UI.settings.namplates) {
		return;
	}
	if (camera.inertialAlphaOffset == 0 && camera.inertialBetaOffset == 0 && camera.inertialRadiusOffset == 0 && camera.inertialPanningX == 0 && camera.inertialPanningY == 0) {
		return;
	}

	for (let u in World.units) {
		let id = World.units[u].id;
		let pos = getScreenCoords(World.units[u].position.add(v(0,10,0)));
		if (document.getElementById(id)) {
			$('#' + id).css({left: pos.x - (document.getElementById(id).offsetWidth / 2) + 'px', top: pos.y - 10 + 'px'});
		}
	}
});

function battle(a, b, aRemain, bRemain) {
	console.log(aRemain, bRemain);
	let delta = b.troops - bRemain;
	addCombatText(-delta, getScreenCoords(b.position), '#f88');
	b.troops = bRemain;
	Tiles[b.tileID].numTroops = bRemain;
	if (b.battle) {
		b.battle();
	}
	if (b.shoot) {
		b.shoot();
	}
	delta = a.troops - aRemain;
	addCombatText(-delta, getScreenCoords(a.position), '#f88');
	a.troops = aRemain;
	Tiles[a.tileID].numTroops = aRemain;
	if (a.shoot) {
		a.shoot();
	}
	if (a.battle) {
		a.battle();
	}

	$('#' + a.id).html(formatName(a.owner) + '<br>' + a.troops);
	$('#' + b.id).html(formatName(b.owner) + '<br>' + b.troops);
	if (UI.settings.units == 1) { // if numbers, update
		updateNamePlate(a, a.troops + '/' + (Tiles[a.tileID].fortification || 0));
		updateNamePlate(b, b.troops + '/' + (Tiles[b.tileID].fortification || 0));
	}
	if (UI.settings.units == 2) { // if bar, redraw origin bar
		a.dispose();
		Tiles[a.tileID].unit = addBar(a.tileID, a.troops, Tiles[a.tileID].fortification, a.owner);
		b.dispose();
		if (Tiles[b.tileID].fortMesh) {
			Tiles[b.tileID].fortMesh.dispose();
			Tiles[b.tileID].fortMesh = null;
		}
		console.log(b.tileID);
//		Tiles[b.tileID].unit = addBar(b.tileID, b.troops, Tiles[b.tileID].fortification, b.owner);
	}

	let explosion1 = particles(b, 'explosion');
	explosion1.start();
	let explosion2 = particles(a, 'explosion');
	explosion2.start();
	let debris1 = particles(b, 'debris');
	debris1.start();
	let debris2 = particles(a, 'debris');
	debris2.start();
	if (b.troops > 0) {
		//a.troops -= power1 * (techHasResearched(6) ? .9 : 1); // increased hp
	}
	if (a.owner == Lamden.wallet) {
		//updateUnitCount(-power1);
	}
	if (b.owner == Lamden.wallet) {
		//updateUnitCount(-power2);
	}
	if (UI.selectedUnit == a) {
		$('#info-panel #num-troops').html(a.troops);
	}
	if (UI.selectedUnit == b) {
		$('#info-panel #num-troops').html(b.troops);
	}
	if (a.troops <= 0) {
		if (a.death) {
			a.death();
		}
		window.setTimeout(function() {
			World.units.splice(World.units.indexOf(a), 1);
			if (UI.selectedUnit == a) {
				UI.selectedUnit = null;
				$('#info-panel').hide();
				UI.unitSelect.position = v(0,-10,0);
			}
			let id = a.id;
			$('#' + id).remove();
			Tiles[a.tileID].unit = null;
			Tiles[a.tileID].troopOwner = null;
			if (a.mesh) {
				a.type = null;
			} else {
				a.dispose();
			}
			World.drawWorld(true);
		},2000);
	} else if (a.battle) {
		window.setTimeout(a.idle, 3000);

	}
	if (b.troops <= 0) {
		if (b.death) {
			b.death();
		}
		window.setTimeout(function() {
			World.units.splice(World.units.indexOf(b), 1);
			if (UI.selectedUnit == b) {
				UI.selectedUnit = null;
				$('#info-panel').hide();
				UI.unitSelect.position = v(0,-10,0);
			}
			let id = b.id;
			$('#' + id).remove();
			if (Tiles[b.tileID].fortMesh) {
				Tiles[b.tileID].fortMesh.dispose();
				Tiles[b.tileID].fortMesh = null;
			}
			if (b.mesh) {
				b.type = null;
			} else {
				if (Tiles[b.tileID].unit) {
					Tiles[b.tileID].unit.dispose();
					Tiles[b.tileID].unit = null;
				}
			}
			Tiles[b.tileID].troopOwner = null;
			World.drawWorld(true);
		}, 2000);
	} else if (b.battle) {
		window.setTimeout(b.idle, 3000);
	}
	addMessage('Battle at [' + b.tileID + '], Attacker left: ' + a.troops + ', defender left: ' + b.troops , '#fff');
	World.drawWorld(true);
}


function siege(a, b, aRemain, bRemain, bFort) { // a should be attacking unit, b should be the besieged tile

	//let power1 = Math.round(Math.random() * (b.fortification > 0 ? 1000 * (techHasResearched(9) ? 1.1 : 1) : 100));
	//let power2 = Math.round(Math.random() * a.troops * 2);
	//a.troops -= power1;
	let delta = a.troops - aRemain;
	addCombatText(-delta, getScreenCoords(a.position), '#f88');
	a.troops = aRemain;
	Tiles[a.tileID].numTroops = aRemain;
	if (a.shoot) {
		a.shoot();
	}
	if (a.battle) {
		a.battle();
	}
	$('#' + a.id).html(formatName(a.owner) + '<br>' + a.troops);
	b.fortification = bFort;
/*	if (UI.settings.units == 1) { // if numbers, update
		updateNamePlate(a, a.troops + '/' + (Tiles[a.tileID].fortification || 0));
		if (b.fortification) {
			updateNamePlate(b.fortMesh, 0 + '/' + b.fortification);
		}
	}
	if (UI.settings.units == 2) { // if bar, redraw origin bar
		a.dispose();
		addBar(a.tileID, a.troops, Tiles[a.tileID].fortification, a.owner);
		if (b.fortMesh) {
			b.fortMesh.dispose();
			b.fortMesh = addBar(b.x + ',' + b.y, 0, b.fortification, b.owner);
		}
	}*/
	a.dispose();
	Tiles[a.tileID].unit = null;
	if (b.unit) {
		b.unit.dispose();
		b.unit = null;
	}
	if (b.fortMesh) {
		b.fortMesh.dispose();
		b.fortMesh = null;
	}

	if (b.mesh) {
		let explosion1 = particles(b.mesh, 'explosion');
		explosion1.start();
		let debris1 = particles(b.mesh, 'debris');
		debris1.start();
	}
	let explosion2 = particles(a, 'explosion');
	explosion2.start();
	let debris2 = particles(a, 'debris');
	debris2.start();

	delta = (b.currentHP || 0) + (b.fortification || 0) - (bRemain + bFort);
	addCombatText(-delta, getScreenCoords(b.pos), '#f88');
	b.currentHP = bRemain;
	if (!b.mesh && !b.fortification) {
		b.owner = null;
		addMessage('Ownership released [' + b.x + ',' + b.y + ']');
		meshTransformationData = {};
	}

	if (UI.selectedUnit == a) {
		$('#info-panel #num-troops').html(a.troops);
	}
	if (UI.selectedTile && Tiles[UI.selectedTile] == b) {
		$('#info-panel #building-hp').attr('value', b.currentHP);
		if (b.fortification > 0) {
			$('#info-panel #fortification-hp').attr('value', b.fortification);
		}
	}
	if (a.troops <= 0) {
		if (a.death) {
			a.death();
		} else {
			a.dispose();
		}
		console.log(a.isDisposed());
		window.setTimeout(function() {
			World.units.splice(World.units.indexOf(a), 1);
			if (UI.selectedUnit == a) {
				UI.selectedUnit = null;
				$('#info-panel').hide();
				UI.unitSelect.position = v(0,-10,0);
			}
			let id = a.id;
			$('#' + id).remove();
			Tiles[a.tileID].unit = null;
			Tiles[a.tileID].troopOwner = null;
			if (a.mesh) {
				a.type = null;
			} else {
				a.dispose();
			}
			World.drawWorld(true);
		}, 2000);
	} else if (a.battle) {
		window.setTimeout(a.idle, 3000);
	}
	// remove fort mesh if destroyed
	console.log(b.fortification, b.fortMesh);
	if (b.fortification <= 0 && b.fortMesh) {
		addMessage('Fortification destroyed [' + b.x + ',' + b.y + ']');
		window.setTimeout(function() {
			if (shadowRenderList.indexOf(b.fortMesh)  > -1) {
				shadowRenderList.splice(shadowRenderList.indexOf(b.fortMesh), 1);
			}
			if (b.unit) {
				b.unit.dispose();
				b.unit = null;
			}
			if (b.fortMesh) {
				b.fortMesh.dispose();
				b.fortMesh = null;
			}
			World.drawWorld(true);
		}, 2000);
	}
	// remove building if destroyed
	if (b.currentHP <= 0 && b.mesh) {
		addMessage('Building destroyed [' + b.x + ',' + b.y + ']');
		b.building = 0;
		if (shadowRenderList.indexOf(b.mesh)  > -1) {
			shadowRenderList.splice(shadowRenderList.indexOf(b.mesh), 1);
		}
		window.setTimeout(function() {
			b.mesh.dispose();
			b.mesh = null;
			World.drawWorld(true);
		}, 2000);
	}
	if (b.currentHP <= 0 && b.fortification <= 0) {
		b.owner = null;
		addMessage('Ownership released [' + b.x + ',' + b.y + ']');
		meshTransformationData = {};
	}
	if (b.fortification > 0) {
		addMessage('Siege at [' + b.x + ',' + b.y + '], attacker left: ' + a.troops + ', enemy fortification HP left: ' + b.fortification, '#fff');
	} else if (b.currentHP) {
		addMessage('Siege at [' + b.x + ',' + b.y + '], attacker left: ' + a.troops + ', enemy building HP left: ' + b.currentHP, '#fff');
	} else {
		addMessage('Siege at [' + b.x + ',' + b.y + '], attacker left: ' + a.troops, '#fff');
	}
	World.drawWorld(true);
}
function fireMissile(source, target, troopRemain, hpRemain, fortRemain) {
    const missile = BABYLON.Mesh.CreateCylinder('Missile', 2, .3, .3, 6, 0, scene);
    missile.position = source.pos.add(v(0,4,0));
	let exhaust = particles(missile, 'exhaust-s');
	exhaust.start();
	let sound = World.Sounds['missile1'];
	sound.maxDistance = 300;
	sound.attachToMesh(missile);
	console.log(sound);
	sound.play();

	//target = target.pos;

	const u = target.pos.subtract(missile.position) //displacement of sphere from missile.
	let d = u.length(); //distance of sphere from missile
	u.normalize(); //unit vector from missile to sphere

	/* Set angle of projection calculate initial speed needed to hit sphere */
	const angle = Math.PI / 3;
	const speed = Math.sqrt(d / Math.sin(2 * angle));

	/* Time T requied to hit sphere */
	const T = 2 * speed * Math.sin(angle);
	const n = v(0,1,0);

	let t = 0;

	let ndisp, udisp; //displacements in n and u directions
	let dndisp, dudisp; //delta displacements in n and u directions
	let pndisp = v(0,0,0);
	let pudisp = v(0, 0, 0); //previous displacements in n and u directions
	let disp; //resultant displacement
	let impact = false
    scene.registerBeforeRender(function () {
		// calculate position
		if (t <= T) { // in air
			ndisp = n.scale(speed * Math.sin(angle) * t - 0.5 * t * t);
			udisp = u.scale(speed * Math.cos(angle) * t);
			dndisp = ndisp.subtract(pndisp);
			dudisp = udisp.subtract(pudisp);
			disp = dudisp.add(dndisp);
			pndisp = v(ndisp.x, ndisp.y, ndisp.z);
			pudisp = v(udisp.x, udisp.y, udisp.z);
			missile.position.addInPlace(disp);
			missile.lookAt(target.pos, 0, (Math.PI / 2) * -(t / T), 0);
			t += 3 / engine.fps;
		} else if (!impact) { // on impact
			impact = true;
			exhaust.dispose();
			missile.isVisible = false;
			const explosion = particles(missile, 'explosion-m');
			explosion.start();
			let debris1 = particles(missile, 'debris');
			debris1.start();
			sound.stop();
			World.Sounds['explosion6'].play();
			let delta = (target.numTroops || 0) + (target.fortification || 0) + (target.currentHP || 0) - (troopRemain + fortRemain + hpRemain);
			addCombatText(-delta, getScreenCoords(target.pos), '#f00');
			if (troopRemain > 0) {
				addMessage('Troops left: ' + troopRemain, '#fff');
			} else if (fortRemain > 0) {
				addMessage('Fortification HP left: ' + fortRemain, '#fff');
			} else {
				addMessage('Building HP left: ' + hpRemain, '#fff');
			}
//			let damage = Math.random() * power;
//			console.log(damage);
			if (target.unit && troopRemain) {
				target.unit.troops = troopRemain;
				$('#' + target.unit.id).html(formatName(target.unit.owner) + '<br>' + target.unit.troops);
			}
			if (target.unit && !troopRemain) {
				if (target.unit.weapon) {
					target.unit.weapon.dispose();
				}
				target.unit.dispose();
				$('#' + target.unit.id).remove();
				target.unit = null;
			}
			if (target.fortification && fortRemain) {
				target.fortification = fortRemain;
			}
			if (target.fortification && !fortRemain) {
				target.fortification = 0;
				target.fortMesh.dispose();
				target.fortMesh = null;
			}
			if (target.currentHP && hpRemain) {
				target.currentHP = hpRemain;
			}
			if (!hpRemain) {
				target.currentHP = 0;
				target.maxHP = 0;
				target.building = 0;
				if (target.mesh) {
					shadowRenderList.splice(shadowRenderList.indexOf(target.mesh), 1);
					target.mesh.dispose();
					target.mesh = null;
				}
				target.owner = null;
				addMessage('Ownership released [' + target.x + ',' + target.y + ']');
				World.drawWorld(true);
			}
//			updateSPSMeshes();
			/*
			if (target.unit && damage >= target.unit.troops) {
				target.unit.troops = 0;
				target.unit.dispose();
				target.unit = null;
				damage -= target.fortification;
			}
			console.log(damage);
			if (target.fortification && damage >= target.fortification) {
				target.fortification = 0;
				damage -= target.fortification;
			}
			console.log(damage);
			if (target.currentHP && damage >= target.currentHP) {
				target.currentHP = 0;
				damage -= target.currentHP;
			}
			*/
			window.setTimeout(function() {
				missile.dispose();
			}, 3500);
		}
	});
}

function pGrow(particles) {
	for (var index = 0; index < particles.length; index++) {
		var particle = particles[index];
		particle.age += this._scaledUpdateSpeed;
		if (particle.age >= particle.lifeTime) {
			this.recycleParticle(particle);
			index--;
			continue;
		} else {
			particle.colorStep.scaleToRef(this._scaledUpdateSpeed, this._scaledColorStep);
			particle.size += .05;
			particle.color.addInPlace(this._scaledColorStep);
			if (particle.color.a < 0)
				particle.color.a = 0;
			particle.angle += particle.angularSpeed * this._scaledUpdateSpeed;
			particle.direction.scaleToRef(this._scaledUpdateSpeed, this._scaledDirection);
			particle.position.addInPlace(this._scaledDirection);
			this.gravity.scaleToRef(this._scaledUpdateSpeed, this._scaledGravity);
			particle.direction.addInPlace(this._scaledGravity);
		}
	}
}

Effects = {
	'debris': {
		blendMode: 1,
		particleTexture: new BABYLON.Texture("textures/debris1.png", scene),
		manualEmitCount: 50,
		gravity: v(0,-.02,0),
		direction1: v(-1, 0, -1),
		direction2: v(1, 1, 1),
		disposeOnStop: true,
		minEmitBox: v(0,0,0),
		maxEmitBox: v(0,0,0),
		minAngularSpeed: -Math.PI * .1,
		maxAngularSpeed: Math.PI * .1,
		color1: new BABYLON.Color4(.8,.8,.8,1),
		color2: new BABYLON.Color4(.5,.5,.5,1),
		colorDead: new BABYLON.Color4(.01,.01,.01,.1),
		minEmitPower: .1,
		maxEmitPower: 1,
		minLifeTime: 10,
		maxLifeTime: 80,
		minSize: .1,
		maxSize: 1,
		updateSpeed: 0.5,
	},
	'explosion': {
		particleTexture: new BABYLON.Texture("textures/smoke.jpg", scene),
		manualEmitCount: 100,
		direction1: v(-1, 0, -1),
		direction2: v(1, 1, 1),
		disposeOnStop: true,
		minEmitBox: v(-1,0,-1),
		maxEmitBox: v(1,0,1),
		minAngularSpeed: -Math.PI * .04,
		maxAngularSpeed: Math.PI * .04,
		color1: new BABYLON.Color4(.2,.2,.16,1),
		color2: new BABYLON.Color4(.2,.04,.04,.5),
		colorDead: new BABYLON.Color4(.01,.01,.01,.1),
		minEmitPower: .04,
		maxEmitPower: .1,
		minLifeTime: 120,
		maxLifeTime: 200,
		minSize: 4,
		maxSize: 8,
		updateSpeed: 0.5,
	},
	'explosion-m': {
		particleTexture: new BABYLON.Texture("textures/smoke.jpg", scene),
		manualEmitCount: 150,
		direction1: v(-1, 0, -1),
		direction2: v(1, 1, 1),
		disposeOnStop: true,
		minEmitBox: v(0,0,0),
		maxEmitBox: v(0,0,0),
		minAngularSpeed: -Math.PI * .04,
		maxAngularSpeed: Math.PI * .04,
		color1: new BABYLON.Color4(.2,.2,.16,1),
		color2: new BABYLON.Color4(.2,.04,.04,.5),
		colorDead: new BABYLON.Color4(.01,.01,.01,.1),
		minEmitPower: .1,
		maxEmitPower: .2,
		minLifeTime: 120,
		maxLifeTime: 180,
		minSize: 4,
		maxSize: 8,
		updateSpeed: 0.5,
		updateFunction: pGrow
	},
	'exhaust-s': {
		maxParticles: 300,
		emitRate: 50,
		particleTexture: new BABYLON.Texture("textures/fireparticle.jpg", scene),
		minEmitBox: v(-.1, 0, -.1),
		maxEmitBox: v(.1, 0, .1),
		direction1: v(-.1, -1, -.1),
		direction2: v(.1, -1, .1),
		minAngularSpeed: -Math.PI * .5,
		maxAngularSpeed: Math.PI * .5,
		color1: new BABYLON.Color4(1, 1, .5, 1.0),
		color2: new BABYLON.Color4(1, 0, 0, 1.0),
		colorDead: new BABYLON.Color4(1, .2, 0, 0),
		minEmitPower: .4,
		maxEmitPower: .8,
		minLifeTime: 7,
		maxLifeTime: 14,
		minSize: .1,
		maxSize: .5,
		updateSpeed: 0.5,
	},
	'fire-m': {
		emitRate: 20,
		particleTexture: new BABYLON.Texture("textures/fireparticle.jpg", scene),
		minEmitBox: v(-1, 0, -1),
		maxEmitBox: v(1, 0, 1),
		direction1: v(0, .1, 0),
		direction2: v(0, .1, 0),
		minAngularSpeed: -Math.PI * 1,
		maxAngularSpeed: Math.PI * 1,
		color1: new BABYLON.Color4(1, 1, .5, 1.0),
		color2: new BABYLON.Color4(1, 0, 0, 1.0),
		colorDead: new BABYLON.Color4(1, .2, 0, 0),
		minEmitPower: .8,
		maxEmitPower: 1.5,
		minLifeTime: 10,
		maxLifeTime: 20,
		minSize: .05,
		maxSize: .3,
		updateSpeed: 0.5,
	},
	'smoke': {
		particleTexture: new BABYLON.Texture("textures/smoke.jpg", scene),
		emitRate: .2,
		direction1: v(-.1, 1, -.1),
		direction2: v(.1, 1, .1),
		minEmitBox: v(-.02, 4, -.02),
		minEmitBox: v(.02, 5, .02),
		minAngularSpeed: -Math.PI * .04,
		maxAngularSpeed: Math.PI * .04,
		color1: new BABYLON.Color4(.2,.2,.2,1),
		color2: new BABYLON.Color4(.04,.04,.04,.5),
		colorDead: new BABYLON.Color4(.01,.01,.01,.1),
		minEmitPower: .1,
		maxEmitPower: .2,
		minLifeTime: 100,
		maxLifeTime: 300,
		minSize: .8,
		maxSize: 1.6,
		updateSpeed: 0.5,
		updateFunction: pGrow
	},
	'spark': {
		emitRate: 10,
		manualEmitCount: 200,
		direction1: v(0,1,0),
		direction2: v(0,1,0),
		particleTexture: new BABYLON.Texture("textures/spark1.jpg", scene),
		minEmitBox: v(-5, 0, -5),
		maxEmitBox: v(5, 30, 5),
		color1: new BABYLON.Color4(0, .5, 1, .7),
		color2: new BABYLON.Color4(.4, .7, 1, .5),
		colorDead: new BABYLON.Color4(.2,.4,.6, 0),
		minEmitPower: .1,
		maxEmitPower: 1,
		minLifeTime: 30,
		maxLifeTime: 80,
		minSize: .2,
		maxSize: .8,
		updateSpeed: 0.5
	}
};

function particles(emitter, name) {
	var maxParticles = 500;
	if (Effects[name].maxParticles) {
		maxParticles = Effects[name].maxParticles;
	}
	var effect = new BABYLON.ParticleSystem(name, maxParticles, scene);
	effect.emitter = emitter;
	for (var p in Effects[name]) {
		effect[p] = Effects[name][p];
		if (effect[p].x) {
			effect[p] = effect[p].scale(1 / emitter.scaling.x);
		}
	}
	return effect;
}

(function(World) {
	//console.log(UI);
	let beam = new BABYLON.MeshBuilder.CreatePlane('beams', {width: 1, height: 200}, scene);
	beam.isVisible = false;
	var beams = new BABYLON.SolidParticleSystem('Beams', scene);
	beams.addShape(beam, 100);
	beams.buildMesh();
	beamsMat = new BABYLON.StandardMaterial('Beams', scene);
	beamsMat.opacityTexture = new BABYLON.Texture('textures/beam1.jpg', scene);
	beamsMat.opacityTexture.getAlphaFromRGB = true;
	beamsMat.opacityTexture.level = 0;
	beamsMat.emissiveColor = color(.4,.7,1);
	beamsMat.diffuseColor = color(0,0,0);
	beamsMat.specularColor = color(0,0,0);
	beamsMat.alphaMode = 1
	beams.mesh.material = beamsMat;
	for (var p in beams.particles) {
		beams.particles[p].position = v(Math.random() * 10 - 5, 100, Math.random() * 10 - 5);
		beams.particles[p].scale.x = .5;
	}
	beams.mesh.position = camera.target.position;
	window.setInterval(function() {
		for (var p in beams.particles) {
			beams.particles[p].rotation.y = -camera.alpha - Math.PI / 2;
		}
		beams.setParticles();
	}, 500);
	var animation = new BABYLON.Animation('Beams', 'material.opacityTexture.level', 30, 0, 1);
	animation.setKeys([
		{frame: 0, value: 0},
		{frame: 20, value: .3},
		{frame: 30, value: .3},
		{frame: 60, value: 0},
	]);
	beams.mesh.animations.push(animation);
	World.beams = beams;
	World.beamParticles = particles(World.beams.mesh, 'spark');
})(World);
function beamEffect(position) {
	World.beams.mesh.position = position;
	scene.beginAnimation(World.beams.mesh, 0, 60);
	World.beamParticles.manualEmitCount = 200;
	World.beamParticles.start();
}
