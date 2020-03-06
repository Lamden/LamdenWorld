
const World = {
	assets: {},
	buffer: null,
	offset: v(0,0),
	lastOffset: v(1,1),
	props: [],
	random: [.59,.89,.38,.82,.41,.20,.58,.65,.68,.94,.46,.67,.19,.88,.34,.62,.15,.68,.97,.3,.50,.77,.74,.23,.25,.78,.68,.38,.71,.83,.72,.29,.65,.4,.16,.66,.88,.13,.11,.7,.53,.27,.32,.74,.98,.18,.50,.35,.78,.98,.10,.95,.89,.89,.9,.77,.25,.8,.45,.67,.63,.8,.95,.63,.61,.86,.42,.23,.61,.7,.11,.62,.5,.12,.25,.11,.33,.64,.86,.63,.97,.27,.32,.10,.62,.89,.91,.62,.27,.68,.30,.10,.45,.5,.78,.99,.25,.15,.91,.51],
	buildingData: {
		1: {name: 'Capital', requiresTile: null, produces: 0, productionSpeed: 1, hp: 1000, mesh: 'Capital', meshScale: .22, description: ''},
//		1: {name: 'Farm', requiresTile: 'grass', produces: 1, productionSpeed: 1, hp: 1000, cost: {0: 1000, 2: 100}, mesh: 'Farm1'},
//		2: {name: 'Lumber Camp', requiresTile: 'forest', produces: 2, productionSpeed: 1, hp: 1000, cost: {0: 1000, 2: 100}},
		3: {name: 'Ore Mine', requiresTile: 'all', produces: 2, productionSpeed: 1, hp: 1000, cost: {0: 1000, 2: 200}, icon: 'mine', mesh: 'Mine1', meshScale: .22, description: 'Produces ore'},
		4: {name: 'Oil Well', requiresTile: 'all', produces: 3, productionSpeed: 1, hp: 1000, cost: {0: 1000, 2: 200}, icon: 'pumpjack', mesh: 'Pumpjack', meshScale: .22, description: 'Produces crude'},
		5: {name: 'Rock Mine', requiresTile: 'all', produces: 1, productionSpeed: 1, hp: 1000, cost: {0: 1000, 2: 200}, icon: 'mine', mesh: 'Mine1', meshScale: .22, description: 'Produces rock'},
		//6: {name: 'Pumpjack', requiresTile: 'desert', requiresTech: 2, produces: 6, productionSpeed: 1, hp: 1000, cost: {4: 800}},
		7: {name: 'Power Plant', requiresTile: 'grass', requiresTech: 1, produces: 0, productionSpeed: .2, hp: 1000, cost: {3: 1000, 4: 1000, 5: 1000}, icon: 'powerplant', mesh: 'Powerplant2', meshScale: .22, smoke: v(2.6,2,-.4), description: 'Produces energy'},
		8: {name: 'Barracks', requiresTile: 'grass', hp: 1000, cost: {4: 100}, icon: 'barracks', mesh: 'Barracks2', meshScale: .22, description: 'Produces units at a smaller scale'},
		9: {name: 'Tank Factory', /* requiresTech: 4, */ requiresTile: 'grass', hp: 1000, cost: {4: 1000}, icon: 'factory', hp: 1000, mesh: 'Factory', meshScale: .22, description: 'Produces units at a larger scale'},
		10: {name: 'Engineer', requiresTile: 'grass', hp: 1000, cost: {0: 1000, 2: 100, 4: 500}, icon: 'engineer', mesh: 'NGon007', meshScale: .22, description: 'Research advanced technologies'},
		11: {name: 'Refinery', requiresTile: 'grass', hp: 1000, cost: {0: 1000, 2: 100, 4: 100}, icon: 'refinery', mesh: 'Refinery2', meshScale: .22, smoke: v(3.5,12,1), description: 'Refines raw resources into refined resources'},
		12: {name: 'Dock', requiresTile: 'water', hp: 1000, cost: {0: 1000, 2: 100, 4: 100}, icon: 'dock', mesh: 'Dock1', meshScale: .22, description: 'Produces naval units'},
		13: {name: 'Marketplace', requiresTile: 'grass', hp: 1000, cost: {0: 1000, 2: 100, 4: 100}, description: ''},
		14: {name: 'Missile Silo', requiresTile: 'grass', hp: 1000, cost: {0: 1000, 2: 100, 4: 100}, icon: 'silo', mesh: 'Silo2', meshScale: .22, description: ''},
		15: {name: 'Bunker', requiresTile: 'grass', hp: 5000, cost: {0: 1000, 2: 100, 4: 100}, icon: 'bunker', mesh: 'Bunker', meshScale: .22, description: 'Can house 5000 additional units compared to other tiles. '},
		16: {name: 'Missile Defense System', requiresTile: 'grass', hp: 1000, cost: {0: 1000, 2: 100, 4: 100}, mesh: 'Missile Silo', meshScale: .0066, description: 'Defends your territory in a 5 tile radius from missile attacks. Succes rate 50%. '},
		17: {name: 'Artillery Tower', requiresTile: 'grass', hp: 500, power: 500, cost: {0: 1000, 2: 100, 4: 100}, description: 'Simple defensive structure to withstand small attacks in a 5 tile radius. '},
	},
	Conversions: {
		1: {name: 'Smelt Ore to Iron', requiresLevel: 1, consumes: 2, produces: 4, speed: 1, capacity: 100},
		2: {name: 'Smelt Ore to Copper', requiresLevel: 1, consumes: 2, produces: 5, speed: 1, capacity: 100},
		3: {name: 'Smelt Ore to Lead', requiresLevel: 1, consumes: 2, produces: 6, speed: 1, capacity: 100},
		4: {name: 'Refine Fossil Fuel to Crude Oil', requiresLevel: 1, consumes: 3, produces: 8, speed: 1, capacity: 100},
		5: {name: 'Refine Fossil Fuel to Coal', requiresLevel: 1, consumes: 3, produces: 7, speed: 1, capacity: 100},
		6: {name: 'Extract Gunpowder from Rock', requiresLevel: 1, consumes: 1, produces: 9, speed: 1, capacity: 100},
		7: {name: 'Extract Silicon from Rock', requiresLevel: 1, consumes: 1, produces: 10, speed: 1, capacity: 100},
		8: {name: 'Smelt Raw Ore to Steel', requiresLevel: 2, consumes: 2, produces: 11, speed: 1, capacity: 100},
	},
	Resources: {
		0: {name: 'Energy'},
		1: {name: 'Sedementary Rock'},
		2: {name: 'Ore'},
		3: {name: 'Fossil Fuel'},
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
	},
	Technologies: {
		1: {name: 'Coal', researchedAt: 1, duration: 300, cost: {1: 100, 4: 500}, description: 'Allows building of power plants and unlocks other techs. '},
		2: {name: 'Oil', researchedAt: 1, requiresTech: 1, duration: 300, cost: {1: 100, 4: 500}, description: 'Allows building of oil wells'},
		3: {name: 'Armored Vehicles', researchedAt: 10, duration: 300, cost: {1: 100, 4: 500}, description: 'Allows construction of armored vehicles. '},
		4: {name: 'Ballistics', researchedAt: 10, requiresTech: 3, duration: 300, cost: {1: 100, 4: 500}, description: 'Allows construction of armored vehicles. '},
		5: {name: 'Scopes', researchedAt: 8, duration: 300, cost: {1: 100, 4: 500}, description: 'Increases your units damage output by 10%'},
		6: {name: 'Camouflage', researchedAt: 8, duration: 300, cost: {1: 100, 4: 500}, description: 'Increases your units hp by 10%'},
		7: {name: 'Logistics', researchedAt: 1, duration: 300, cost: {1: 100, 4: 500}, description: 'Increases the maximum number of units per tile by 2000'},
		8: {name: 'Fuel Efficiency', researchedAt: 1, duration: 300, cost: {1: 100, 4: 500}, description: 'Increases the maximum number of tiles units can move at once by 1. '},
		9: {name: 'Miniguns', researchedAt: 1, duration: 300, cost: {1: 100, 4: 500}, description: 'Increases damage of fortifications by 10%. '},
		10: {name: 'Bunkers', researchedAt: 1, duration: 300, cost: {1: 100, 4: 500}, description: 'Increases hp of fortifications by 10%. '},
		11: {name: 'Economics', researchedAt: 1, duration: 300, cost: {1: 100, 4: 500}, description: 'Allows building of marketplace to trade resources. '},
		12: {name: 'Pneumatics', researchedAt: 1, duration: 300, cost: {1: 100, 4: 500}, description: 'Increases mining speed of rock mining by 10%. '}
	},
	tileTypes: {
		'water': {name: 'Water', yield: [0,0,0,0]},
		'grass': {name: 'Plains', yield: [1,1,1,1]},
		'forest': {name: 'Forest', yield: [1,2,2,1]},
		'rock': {name: 'Ore Deposit', yield: [1,3,3,1]},
		'desert': {name: 'Desert', yield: [1,2,2,5]},
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
		var tiles = []
		for (var t in Tiles) {
			var d = distance(tile.pos, Tiles[t].pos);
			if (d > 0 && d < 9.5) {
				tiles.push(Tiles[t]);
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
	getBlendColorAtPosition: function(p) {
		let pos = Math.floor(p.x + p.y * 512) * 4;
		let c = [World.buffer[pos + 0],World.buffer[pos + 1],World.buffer[pos + 2],World.buffer[pos + 3]];
		return c;
	},
	createWorld: function(options) {
		dynamicSPS['Trees1'] = 300;
		dynamicSPS['Rock1'] = 150;
		dynamicSPS['Rock2'] = 150;
		this.drawWorld();
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
		window.setTimeout(function() { World.drawWorld(true) }, 500);
/*
		Tiles['3,-5'].name = 'Enemy';
		setBuildingData(Tiles['3,-5'], 0, 'enemy');
		setBuildingData(Tiles['4,-4'], 7, 'enemy');
		setBuildingData(Tiles['2,-6'], 7, 'enemy');
		setBuildingData(Tiles['2,-5'], 9, 'enemy');
		setBuildingData(Tiles['3,-3'], 11, 'enemy');
		Tiles['3,-3'].fortification = 2000;
		setBuildingData(Tiles['2,-7'], 12, 'enemy');
		setBuildingData(Tiles['3,-6'], 3, 'enemy');
		setBuildingData(Tiles['4,-6'], 4, 'enemy');
		setBuildingData(Tiles['4,-5'], 5, 'enemy');
		setBuildingData(Tiles['5,-4'], 7, 'enemy');
		setBuildingData(Tiles['1,-5'], 11, 'enemy');
		setBuildingData(Tiles['4,-3'], 15, 'enemy');
		setBuildingData(Tiles['4,-7'], 10, 'enemy');
*/
//		setBuildingData(Tiles['3,4'], 4, 'enemy');
//		setBuildingData(Tiles['4,4'], 4, 'enemy');
//		setBuildingData(Tiles['3,5'], 4, 'enemy');


//		addTank(4, -2, '4,-2', 'enemy');
//		addTank(3, -2, '3,-2', 'enemy');
//		addTank(2, -3, '2,-3', 'enemy');

		Lamden.getCapital();

		$.get('./gettiles.php', function(e) {
			let tiles = JSON.parse(e);
			for (let t in tiles) {
				let id = tiles[t].x + ',' + tiles[t].y;
				if (!Tiles[id]) {
					Tiles[id] = {type: 'water', pos: mapPosition(tiles[t].x, tiles[t].y)};
				}
				setBuildingData(Tiles[id], tiles[t].building, tiles[t].owner, tiles[t].lastHarvest);
				Tiles[id].level = tiles[t].level;
				Tiles[id].fortification = tiles[t].fort;
				Tiles[id].lastHarvest = tiles[t].lastHarvest;
				Tiles[id].currentHP = tiles[t].hp;
				Tiles[id].trainAmount = tiles[t].trainAmount;
				Tiles[id].convertAmount = tiles[t].trainAmount;
				Tiles[id].convertID = tiles[t].convertID;
				Tiles[id].collected = tiles[t].collected ? true : false;
				if (tiles[t].numTroops) {
					if (tiles[t].numTroops < 1000 && Tiles[id].type != 'water') {
						addUnit(tiles[t].numTroops, mapPosition(tiles[t].x, tiles[t].y), id, tiles[t].troopOwner);
					} else if (Tiles[id].type != 'water') {
						let tank = addTank(tiles[t].x, tiles[t].y, id, tiles[t].troopOwner);
						tank.troops = tiles[t].numTroops;
						$('#' + tank.id).html(formatName(tank.owner) + '<br>' + tank.troops);
					} else {
						let ship = addShip(tiles[t].x, tiles[t].y, id, tiles[t].troopOwner);
						ship.troops = tiles[t].numTroops;
						$('#' + ship.id).html(formatName(ship.owner) + '<br>' + ship.troops);
					}
				}
			}
			engine.runRenderLoop(renderLoop);
		}).fail(function(e) {
			console.log(e);
			engine.runRenderLoop(renderLoop);
		});

		// multiplayer event log
		$.get('./logid.php', function(e) {
			World.logID = parseInt(e) || 0;
			window.setInterval(function() {
				$.get('./getlog.php?id=' + World.logID, function(e) {
					console.log(e);
					let log = JSON.parse(e);
					for (let i in log) {
						if (log[i].id > World.logID) {
							World.logID = log[i].id;
						}
						let id = log[i].x + ',' + log[i].y;
						let id2 = log[i].x2 + ',' + log[i].y2;
						let type = log[i].type;
						console.log(id, id2, Tiles[id].unit);
						if (type == 'colonize') {
							Tiles[id].owner = log[i].var1;
							let model = log[i].var1 == Lamden.wallet ? UI.friendlyTerritory : UI.enemyTerritory;
							addModel(model, Tiles[id].pos.add(v(0,.02,0)), v(0,Math.PI / 2,0), .22);
							if (UI.selectedTile) {
								tileHtml(UI.selectedTile);
							}
							updateSPSMeshes();
							if (Lamden.wallet == log[i].var1 && UI.tool == 'colonize') {
								colonizeMode();
							}
						}
						if (type == 'build') {
							setBuildingData(Tiles[id], log[i].var1, Tiles[id].owner,  log[i].var2);
						}
						if (type == 'train') {
							let amount = log[i].var1;
							Tiles[id].collected = true;
							if (Tiles[id].unit) {
								Tiles[id].unit.troops += parseInt(amount);
								let unitID = Tiles[id].unit.id;
								$('#' + unitID).html(formatName(Tiles[id].unit.owner) + '<br>' + Tiles[id].unit.troops);
							} else {
								if (Tiles[id].building == 8) {
									addUnit(amount, mapPosition(log[i].x, log[i].y), id, Tiles[id].owner);
								} else if (Tiles[id].building == 9) {
									addTank(log[i].x, log[i].y, id, Tiles[id].owner);
								} else if (Tiles[id].building == 12) {
									addShip(log[i].x, log[i].y, id, Tiles[id].owner);
								}
							}
						}
						if (type == 'move') {
							if (!Tiles[id].unit) {
								continue;
							}

							if (Tiles[id2].unit && Tiles[id2].unit.owner == Lamden.wallet) { // merge units
								let troops = parseInt(Tiles[id].unit.troops);
								let unitID = Tiles[id].unit.id;
								$('#' + unitID).remove();
								Tiles[id].unit.dispose();
								Tiles[id2].unit.troops += troops;
								unitID = Tiles[id2].unit.id;
								$('#' + unitID).html(formatName(Tiles[id2].unit.owner) + '<br>' + Tiles[id2].unit.troops);
								addMessage('Units merged. now counting ' + Tiles[id].unit.troops);
								UI.selectedUnit = Tiles[id].unit; // change selection to
								UI.selectedUnit.ready = UI.now() + 30;
								$('#info-panel').hide();
								return;
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
	createWater: function(options) {
		options = options || {};

		let size = UI.settings.increaseCameraZoom ? 1536 : 1024;
		World.water = new BABYLON.Mesh.CreateGround('water', size, size, 2, scene);
		World.water.position = options.position || v(0,0,0);
		World.water.receiveShadows = true;

		let w = new watermaterial('water', scene, sun);
		w.reflectionTexture.mirrorPlane = new BABYLON.Plane(0, -1, 0, 0);
		w.reflectionTexture.renderList = World.reflect;
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

		let grass = World.assets['NGon001'];
		let desert = World.assets['Desert10'];
		let road = World.assets['NGon008'];
		let plainMeshes = ['Plains1','Plains2','Plains3','Plains4'];

		World.water.position.x = Math.round(mapPosition(World.offset.x, World.offset.y).x / 16) * 16;
		World.water.position.z = Math.round(mapPosition(World.offset.x, World.offset.y).z / 16) * 16;

		for (let x = World.offset.x - Math.round(drawDistance * .12); x < World.offset.x + Math.round(drawDistance * .12); x++) {
			for (let y = World.offset.y - Math.round(drawDistance * .14); y < World.offset.y + Math.round(drawDistance * .14); y++) {
				let c = World.getBlendColorAtPosition({x: x + 256, y: y + 256});
				let id = x + ',' + y;
				let pos = v((x - 0) * 9.2 - (y % 2 == 0 ? 4.6 : 0), 0, (y - 0) * 8);
				if (!Tiles[id]) {
					Tiles[id] = {x: x, y: y, type: 'water', pos: pos};
				}
				if (distance(camera.target.position, pos) > drawDistance) {
					continue;
				}
				if (c[1] > 64) {
					// random value used for giving each tile a distinct color/rotation/model
					let r = World.random[Math.abs(x * 256 + y) % 100];
					if (c[1] > 192) { // desert
						addModel(World.assets[r < .2 ? 'Desert10' : 'Desert11'], pos, v(0,Math.PI / 2,0), .22, color(r * .2 + .8,r * .1 + .9,r * .2 + .8));
						if (0 && r < .2) {
							let index = Math.floor(r * 10);
							addModel(World.assets[plainMeshes[index]], pos, v(0,Math.round(r * 6) / 6 * Math.PI * 2 + Math.PI / 2,0), .0088);
						}
						Tiles[id].type = 'desert';
					} else if (c[2] > 128) { // rock
						Tiles[id].type = 'rock';
						//addModel(World.assets['NGon006'], pos, v(0,Math.PI / 2,0), .0088);
						//addModel(World.assets[r < .5 ? 'Rocks2' : 'Rocks1'], pos, v(0,Math.PI / 2,0), .0088);
						addModel(World.assets[r < .5 ? 'Rock2' : 'Rock10'], pos, v(0,Math.round(r * 6) / 6 * Math.PI * 2 + Math.PI / 2,0), .22);
						if (0 && !scene.getMeshByName('Rock' + x + ',' + y)) {
							let rock = World.assets[Math.random() < .5 ? 'Rocks1' : 'Rocks2'].createInstance('Rock' + x + ',' + y);
							rock.position = mapPosition(x, y);
							rock.rotation.y = Math.round(Math.random() * 6) / 6 * Math.PI * 2 + Math.PI / 2;
							rock.scaling.scaleInPlace(.0088);
							shadowRenderList.push(rock);
							rock.freezeWorldMatrix();
							World.props.push(rock);
						}
					} else if (c[0] > 192) { // forest
						//addModel(World.assets[Math.random() < .5 ? 'NGon002' : 'NGon003'], pos, v(0,Math.PI / 2,0), .0088);
						addModel(World.assets[r < .5 ? 'Forest10' : 'Forest10'], pos, v(0,Math.round(r * 6) / 6 * Math.PI * 2 + Math.PI / 2,0), .22);
						if (0 && !scene.getMeshByName('Forest' + x + ',' + y)) {
							let forest = World.assets[Math.random() < .5 ? 'Forest3' : 'Forest3'].createInstance('Forest' + x + ',' + y);
							forest.position = mapPosition(x, y);
							forest.rotation.y = Math.round(Math.random() * 6) / 6 * Math.PI * 2 + Math.PI / 2;
							forest.scaling.scaleInPlace(.0088);
							World.reflect.push(forest);
							shadowRenderList.push(forest);
							forest.freezeWorldMatrix();
							World.props.push(forest);
						}
						Tiles[id].type = 'forest';
					} else { // grass
						//addModel(grass, pos, v(0,Math.PI / 2,0), .0088, color(r * .5 + .5,r * .2 + .8,r * .5 + .5));
						addModel(grass, pos, v(0,Math.PI / 2,0), .22, color(r * .2 + .8,r * .2 + .8,r * .2 + .8));
						r = World.random[Math.abs(x + y * 256) % 100];
						if (0 && r < .4) {
							let index = Math.floor(r * 10);
							if (index >= 2 && !scene.getMeshByName('Plains' + x + ',' + y)) {
								let plains = World.assets[plainMeshes[index]].createInstance('Plains' + x + ',' + y);
								plains.position = mapPosition(x, y);
								plains.rotation.y = Math.round(Math.random() * 6) / 6 * Math.PI * 2 + Math.PI / 2;
								plains.scaling.scaleInPlace(.0088);
								shadowRenderList.push(plains);
								plains.freezeWorldMatrix();
								World.props.push(plains);
							} else if (index < 2) {
								addModel(World.assets[plainMeshes[index]], pos, v(0,Math.round(r * 6) / 6 * Math.PI * 2 + Math.PI / 2,0), .0088);
							}
						}
						Tiles[id].type = 'grass';
					}
					if (Tiles[id].owner == Lamden.wallet) {
						addModel(UI.friendlyTerritory, Tiles[id].pos.add(v(0,.09,0)), v(0,Math.PI / 2,0), .22);
					}
					if (Tiles[id].owner && Tiles[id].owner != Lamden.wallet) {
						addModel(UI.enemyTerritory, Tiles[id].pos.add(v(0,.09,0)), v(0,Math.PI / 2,0), .22);
					}
					if (Tiles[id].fortification && !scene.getMeshByName('Fortification' + x + ',' + y)) {
						Tiles[id].fortMesh = addFort(x, y, Tiles[id].owner);
					}
					if (0 && c[1] == 64) { // unit
						if (Math.random() < .4) {
							//addTank(x, y, id, 'enemy');
						} else {
							//addUnit(Math.round(Math.random() * 20), mapPosition(x, y), id, 'enemy');
						}
					}
				}
				if (Tiles[id].building > 0) {
					addBuilding(Tiles[id]);
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
	unitCount: 0,
}

function addBuilding(tile) {
	var data = World.buildingData[tile.building];
	if (tile.mesh && tile.mesh.buildingID != tile.building) {
		shadowRenderList.splice(shadowRenderList.indexOf(tile.mesh), 1);
		tile.mesh.dispose();
	}
	if (data.mesh && !scene.getMeshByName(data.name + tile.x + ',' + tile.y)) {
		let building = null;
		if (tile.building == 4) {
			building = World.assets[data.mesh].createInstance(data.name + tile.x + ',' + tile.y);
		} else {
			building = World.assets[data.mesh].createInstance(data.name + tile.x + ',' + tile.y);
		}
		building.buildingID = tile.building;
		building.position = mapPosition(tile.x, tile.y).add(v(0,.05,0));
		building.rotation.y = Math.round(Math.random() * 6) / 6 * Math.PI * 2 + Math.PI / 2;
		building.scaling = v(1,1,1).scaleInPlace(data.meshScale ? data.meshScale : .22);
		shadowRenderList.push(building);
		building.freezeWorldMatrix();
		World.reflect.push(building);
		World.props.push(building);
		tile.mesh = building;
		if (data.smoke) {
			let emitter = new BABYLON.Mesh.CreateBox('test', .1, scene);
			emitter.parent = building;
			emitter.scaling = v(1,1,1).scaleInPlace(1/building.scaling.x);
			emitter.position = data.smoke.scale(1/building.scaling.x);
			let effect = particles(emitter, 'smoke');
			effect.start();
			emitter.freezeWorldMatrix();
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

	if (!tile.nameplate && tile.building == 0) {
		tile.nameplate = addNamePlate(mapPosition(tile.x, tile.y), tile.name, color(1,0,0), 8);
	}

}
function addNamePlate(pos, text, c, size) {
	const nameplate = new BABYLON.Mesh.CreatePlane('nameplate', size, scene);
	nameplate.position = pos.add(v(0, size, 0));
	nameplate.billboardMode = 2;
	nameplate.material = new BABYLON.StandardMaterial('nameplate', scene);
	nameplate.material.diffuseColor = c;
	nameplate.material.diffuseTexture = new BABYLON.DynamicTexture('asd', 256, scene);
	nameplate.material.emissiveColor = color(1,1,1);
	nameplate.material.diffuseTexture.drawText(text, null, 100, '32pt Tahoma', '#fff');
	nameplate.material.opacityTexture = nameplate.material.diffuseTexture;
	nameplate.material.freeze();
	return nameplate;
}
function addFort(x, y, owner) {
	let fort = World.assets['Fortification'].createInstance('Fortification' + x + ',' + y);
	fort.position = mapPosition(x, y).add(v(0,.01,0));
	fort.rotation.y = Math.round(Math.random() * 6) / 6 * Math.PI * 2 + Math.PI / 2;
	fort.scaling = v(1,1,1).scaleInPlace(.22);
	shadowRenderList.push(fort);
	fort.freezeWorldMatrix();
	return fort;
}
function formatName(name) {
	return name.length > 12 ? name.substr(0,12) + '...' : name;
}
function addUnit(num, pos, tile, owner) {
	//u = (owner == Lamden.wallet ? unit : enemy).createInstance('Unit');
	let unit = new BABYLON.Mesh('Military', scene); // base mesh
	let u = scene.getMeshByName('Base_mesh').clone('Unit');
	u.skeleton = scene.getMeshByName('Base_mesh').skeleton.clone('Skeleton');
	u.position = v(0,0,0);
	u.rotation = v(-Math.PI / 2, 0, 0);
	u.scaling.scaleInPlace(.02);
	u.parent = unit;

	let c = scene.getMeshByName('Soldier_01_mesh').clone('Hat');
	c.material = scene.getMeshByName('Soldier_01_mesh').material.clone('Hat');
	c.skeleton = u.skeleton.clone();
	c.position = v(0,0,0);
	c.rotation = v(-Math.PI / 2, 0, 0);
	c.scaling.scaleInPlace(.02);
	c.parent = unit;

	let w = scene.getMeshByName(randomArray(['Weapon_RPG','Weapon_AssultRifle02','Weapon_SniperRifle','Weapon_AssultRifle01'])).createInstance('Weapon');
	w.rotation = v(0,Math.PI / 2,-Math.PI / 2); //-Math.PI / 2;
	w.attachToBone(u.skeleton.bones[12], u);
	unit.weapon = w;

	shadowRenderList.push(u);
	scene.beginAnimation(u, 0, 50, true, 1);
	scene.beginAnimation(c, 0, 50, true, 1);
	u.death = function() {
		scene.beginAnimation(u, 0, 50, false, 1);
	}

	unit.mesh = u;
	unit.position = pos;
	unit.tileID = tile;
	unit.type = 'unit';
	unit.troops = parseInt(num);
	unit.ready = Math.round((new Date()).getTime() / 1000) + 30;
	unit.owner = owner;
	//unit.currentHP = 1;
	//unit.maxHP = 1;
	Tiles[tile].unit = unit;
	unit.id = 'u' + Math.round(Math.random() * 9999);
	World.units.push(unit);
	$('#labels').append('<div id="' + unit.id + '" style="color: ' + (unit.owner == Lamden.wallet ? '#0f0' : '#f88') + '">' + formatName(unit.owner) + '<br>' + unit.troops + '</div>');
	return unit;
}
function addTank(x, y, id, owner) {
	let tank = new BABYLON.Mesh('Tank', scene); // base mesh
	let base = World.assets['Box007'].clone('Tank Body');
	base.position = v(0,0,0);
	base.scaling = v(1,1,1).scaleInPlace(.3);
	base.parent = tank;
	base.rotation = v(0,0,0);

	tank.position = mapPosition(x, y);
	tank.rotation.y = Math.random() * Math.PI * 2;
	if (owner != Lamden.wallet) {
		// tank.material = enemy.material;
	}
	tank.tileID = id;
	tank.troops = 1000;
	tank.type = 'unit';
	tank.owner = owner;
	tank.ready = Math.round((new Date()).getTime() / 1000) + 5;
	Tiles[id].unit = tank;
	shadowRenderList.push(base);
	tank.id = 'u' + Math.round(Math.random() * 9999);
	World.units.push(tank);
	$('#labels').append('<div id="' + tank.id + '" style="color: ' + (tank.owner == Lamden.wallet ? '#0f0' : '#f88') + '">' + tank.owner + '<br>' + tank.troops + '</div>');
	return tank;
}
function addShip(x, y, id, owner) {
	let ship = new BABYLON.Mesh('Ship', scene); // base mesh
	let base = World.assets['Battleship'].clone('Ship');
	base.position = v(0,0,0);
	base.scaling = v(1,1,1).scaleInPlace(.3);
	base.parent = ship;
	base.rotation = v(0, Math.PI, 0);

	ship.position = mapPosition(x, y);
	ship.rotation.y = Math.random() * Math.PI * 2;
	if (owner != Lamden.wallet) {
//		ship.material = enemy.material;
	}
	ship.tileID = id;
	ship.troops = 1000;
	ship.type = 'unit';
	ship.owner = owner;
	ship.ready = Math.round((new Date()).getTime() / 1000) + 5;
	Tiles[id].unit = ship;
	shadowRenderList.push(ship);
	ship.id = 'u' + Math.round(Math.random() * 9999);
	World.units.push(ship);
	$('#labels').append('<div id="' + ship.id + '" style="color: ' + (ship.owner == Lamden.wallet ? '#0f0' : '#f88') + '">' + ship.owner + '<br><span style="font-size: 120%; ">' + ship.troops + '</span></div>');
	return ship;
}
scene.registerBeforeRender(function() {
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
	//var power1 = Math.round(Math.random() * b.troops);
	//var power2 = Math.round(Math.random() * a.troops * (techHasResearched(5) ? 1.1 : 1));
	//b.troops -= power2;
	b.troops = bRemain;
	$('#' + a.id).html(formatName(a.owner) + '<br>' + a.troops);
	a.troops = aRemain;
	$('#' + b.id).html(formatName(b.owner) + '<br>' + b.troops);

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
		window.setTimeout(function() {
			World.units.splice(World.units.indexOf(a), 1);
			if (UI.selectedUnit == a) {
				UI.selectedUnit = null;
				$('#info-panel').hide();
				UI.unitSelect.position = v(0,-10,0);
			}
			a.dispose();
		},1000);
	}
	if (b.troops <= 0) {
		window.setTimeout(function() {
			World.units.splice(World.units.indexOf(b), 1);
			if (UI.selectedUnit == b) {
				UI.selectedUnit = null;
				$('#info-panel').hide();
				UI.unitSelect.position = v(0,-10,0);
			}
			b.dispose();
		}, 1000);
	}
	addMessage('Attacker left: ' + a.troops + ', defender left: ' + b.troops , '#fff');
}


function siege(a, b, aRemain, bRemain, bFort) { // a should be attacking unit, b should be the besieged tile
	//let power1 = Math.round(Math.random() * (b.fortification > 0 ? 1000 * (techHasResearched(9) ? 1.1 : 1) : 100));
	//let power2 = Math.round(Math.random() * a.troops * 2);
	//a.troops -= power1;
	a.troops = aRemain;
	console.log(a.id, a.troops);
	$('#' + a.id).html(formatName(a.owner) + '<br>' + a.troops);
	b.fortification = bFort;
	b.currentHP = bRemain;
	let explosion1 = particles(b.mesh, 'explosion');
	explosion1.start();
	let explosion2 = particles(a, 'explosion');
	explosion2.start();
	let debris1 = particles(b.mesh, 'debris');
	debris1.start();
	let debris2 = particles(a, 'debris');
	debris2.start();
	if (a.owner == Lamden.wallet) {
		//updateUnitCount(-power1);
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
		World.units.splice(World.units.indexOf(a), 1);
		if (UI.selectedUnit == a) {
			UI.selectedUnit = null;
			$('#info-panel').hide();
			UI.unitSelect.position = v(0,-10,0);
		}
		a.dispose();
	}
	if (b.fortification <= 0 && b.fortMesh) {
		addMessage('Fortification destroyed [' + b.x + ',' + b.y + ']');
		window.setTimeout(function() {
			b.fortMesh.dispose();
			b.fortMesh = null;
		}, 2000);
	}
	if (b.currentHP <= 0 && b.mesh) {
		addMessage('Building destroyed [' + b.x + ',' + b.y + ']');
		b.building = 0;
		shadowRenderList.splice(shadowRenderList.indexOf(b.mesh), 1);
		window.setTimeout(function() {
			b.mesh.dispose();
			b.mesh = null;
		}, 2000);
	}
	if (b.currentHP <= 0 && b.fortification <= 0) {
		b.owner = null;
		addMessage('Ownership released [' + b.x + ',' + b.y + ']');
//		if (b.owner == Lamden.wallet) {
//			addMessage('You acquired [' + b.x + ',' + b.y + ']!', '#8f8');
//		}
		meshTransformationData = {};
		World.drawWorld(true);
		return;
	}
	if (b.fortification > 0) {
		addMessage('attacker left: ' + a.troops + ', enemy fortification HP left: ' + b.fortification, '#fff');
	} else {
		addMessage('attacker left: ' + a.troops + ', enemy building HP left: ' + b.currentHP, '#fff');
	}
}
function fireMissile(source, target, troopRemain, hpRemain, fortRemain) {
    const missile = BABYLON.Mesh.CreateCylinder('Missile', 2, .3, .3, 6, 0, scene);
    missile.position = source.pos.add(v(0,4,0));
	let exhaust = particles(missile, 'exhaust-s');
	exhaust.start();

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

//			let damage = Math.random() * power;
//			console.log(damage);
			if (target.unit && troopRemain) {
				target.unit.troopRemain = troopRemain;
			}
			if (target.unit && !troopRemain) {
				target.unit.dispose();
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
			if (target.currentHP && !hpRemain) {
				target.currentHP = 0;
				target.maxHP = 0;
				target.building = 0;
				target.mesh.dispose();
				target.mesh = null;
				target.owner = null;
			}
			updateSPSMeshes();
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
			particle.size += .005;
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
		emitRate: 1,
		direction1: v(-.1, 1, -.1),
		direction2: v(.1, 1, .1),
		minEmitBox: v(-.02, 4, -.02),
		minEmitBox: v(.02, 5, .02),
		minAngularSpeed: -Math.PI * .04,
		maxAngularSpeed: Math.PI * .04,
		color1: new BABYLON.Color4(.2,.2,.2,1),
		color2: new BABYLON.Color4(.04,.04,.04,.5),
		colorDead: new BABYLON.Color4(.01,.01,.01,.1),
		minEmitPower: .4,
		maxEmitPower: .6,
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
	scene.registerBeforeRender(function() {
		for (var p in beams.particles) {
			beams.particles[p].rotation.y = -camera.alpha - Math.PI / 2;
		}
		beams.setParticles();
	});
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
