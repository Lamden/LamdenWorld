const UI = {
	tool: 'pan',
	selectedTile: null,
	tooltipMesh: null,
	// returns unix timestamp
	now() {
		return Math.round((new Date()).getTime() / 1000);
	},
	formatAddress(a) {
		return a.substr(a, 0, 10) + '...';
	},
	settings: {
		nameplates: false,
		reflections: false,
	},
}
// Resize
window.addEventListener('resize', () => {
	engine.resize();
});
window.addEventListener('mouseout', () => {
	$('#tooltip').hide();
});

canvas.addEventListener('mousemove', (e) => {
	if (e.target != canvas) {
		$('#tooltip').hide();
		return;
	}
	let pickResult = scene.pick(scene.pointerX, scene.pointerY, function(mesh) {
		return mesh.name == 'water' || (mesh.type == 'unit') || (mesh.parent && mesh.parent.type == 'unit');
	});
	if (!pickResult.hit) {
		return;
	}
	let point = pickResult.pickedPoint;
	let mesh = pickResult.pickedMesh;
	if (mesh.parent) {
		mesh = mesh.parent;
	}

	// remove any highlight
	if (UI.hover) {
		UI.hover.renderOutline = false;
		let children = UI.hover.getChildren();
		for (let c in children) {
			children[c].renderOutline = false;
		}
	}

	// hover over unit
	if (mesh.type  == 'unit') {
		UI.tileHover.position.y = -100;
		UI.hover = mesh;
		let children = mesh.getChildren();
		for (let c in children) {
			children[c].outlineWidth = .1 / children[c].scaling.x;
			children[c].outlineColor = mesh.owner == Lamden.wallet ? color(0,1,0) : color(1,0,0);
			children[c].renderOutline = true;
		}
		let html = '<p style="color: ' + (mesh.owner == Lamden.wallet ? '#fff' : '#f88') + '">Unit</p>';
		html += '<p>Owner: ' + formatName(Lamden.Players[mesh.owner] ? Lamden.Players[mesh.owner].name : mesh.owner) + '</p>';
		html += '<p>Num Troops: ' + mesh.troops + '</p>';
		$('#tooltip').show().html(html).css({left: scene.pointerX + 10, top: scene.pointerY + 10});
		return;
	}

	let tile = pos2tile(v(point.x, point.z));
	let id = (tile.x) + ',' + (tile.y);
	UI.tileHover.position = mapPosition(tile.x, tile.y).add(v(0,.06,0));

	// launch missile
	if (UI.launchMissile) {
		UI.tileTarget.position = mapPosition(tile.x, tile.y).add(v(0,.03,0));
		let a = v(tile.x, tile.y);
		let b = v(Tiles[UI.selectedUnit.tileID].x, Tiles[UI.selectedUnit.tileID].y);
		html += '<p>Distance: ' + World.offset_distance(a, b) + ' tiles</p>';
		html += '<p>Silo Max Range: ' + (3 + Tiles[UI.selectedTile].level) + ' tiles</p>';
		$('#tooltip').show().html(html).css({left: scene.pointerX + 10, top: scene.pointerY + 10});
		return;
	} else {
		UI.tileTarget.position.y = -100;
	}

	// colonize
	// flag cue
	if (UI.mesh && UI.tool == 'colonize') {
		UI.mesh.position = UI.tileHover.position.clone();
	}
	if (UI.tool == 'colonize') {
		let tile = Tiles[id];
		let html = '';
		UI.mesh.material.diffuseColor = color(1,1,1);
		if (tile.owner) {
			html = 'This tile is already owned. ';
			UI.mesh.material.diffuseColor = color(1,0,0);
		} else if (UI.availableTiles.indexOf(tile.x + ',' + tile.y) == -1) {
			html = 'You can only colonize tiles adjacent to tiles you already own';
			UI.mesh.material.diffuseColor = color(1,0,0);
		} else {
			html = 'Click to colonize this tile';
			UI.mesh.material.diffuseColor = color(0,1,0);
		}
		html += '<br>Esc or right-click to cancel';
		$('#tooltip').show().html(html).css({left: scene.pointerX + 10, top: scene.pointerY + 10});
		return;
	}

	// if dragging mesh
	if (UI.mesh) {
		UI.mesh.position = UI.tileHover.position.add(v(0,.3,0));
		let tile = Tiles[id];
		let html = '';
		UI.mesh.material.diffuseColor = color(0,1,0);
		if (UI.building != 12 && tile.type == 'water') {
			UI.mesh.material.diffuseColor = color(1,0,0);
			html += 'Cannot place on water. ';
		} else if (UI.building == 12 && tile.type != 'water') {
			UI.mesh.material.diffuseColor = color(1,0,0);
			html += 'Must be placed on water. ';
		} else if (tile.owner != Lamden.wallet) {
			UI.mesh.material.diffuseColor = color(1,0,0);
			html += 'You must colonize this tile first before you can build there. ';
		} else if (tile.building) {
			UI.mesh.material.diffuseColor = color(1,0,0);
			html += 'Tile occupied already';
		} else {
			html += 'Left-click to place building here. ';
		}
		html += '<br>Esc or right-click to cancel';
		$('#tooltip').show().html(html).css({left: scene.pointerX + 10, top: scene.pointerY + 10});
		return;
	}

	// hover over tile
	let html = '';
	if (Tiles[id]) {
		if (Tiles[id].building && World.buildingData[Tiles[id].building]) {
			html += '<h3>[' + tile.x + ',' + tile.y + '] ' + World.buildingData[Tiles[id].building].name + '</h3>';
		} else {
			html += '<h3>[' + tile.x + ',' + tile.y + '] ' + World.tileTypes[Tiles[id].type].name + '</h3>';
		}
		if (Tiles[id].owner) {
			html += '<p>Owner: ' + formatName(Lamden.Players[Tiles[id].owner] ? Lamden.Players[Tiles[id].owner].name : Tiles[id].owner) + '</p>';
		}
		if (Tiles[id].unit) {
			html += '<p>Troops: ' + Tiles[id].unit.troops + '</p>';
		}
		if (UI.selectedUnit && !UI.selectedUnit.target && UI.selectedUnit.owner == Lamden.wallet) {
			let unitPos = v(Tiles[UI.selectedUnit.tileID].x, Tiles[UI.selectedUnit.tileID].y);
			let tilePos = v(Tiles[id].x, Tiles[id].y);
			if (UI.path.dispose) {
				UI.path.dispose();
				UI.path = {};
			}
			if ((!Tiles[id].owner || Tiles[id].owner == Lamden.wallet) && (!Tiles[id].unit || Tiles[id].unit.owner == Lamden.wallet)) {
				renderPath(pathFinding(unitPos, tilePos));
			}
			//let d = World.offset_distance(unitPos, tilePos);
			//if (d <= custom.moveDistance(UI.selectedUnit.troops)) {
			if (UI.path.tiles && UI.path.tiles.length < custom.moveDistance(UI.selectedUnit.troops)) {
				let d = UI.path.tiles.length - 1;
				html += d + ' tiles away. Costs ' + Math.ceil(d * UI.selectedUnit.troops * (techHasResearched(19) ? .5 : 1)) + ' energy to move here; right-click to move to this tile. ';
			} else if ((Tiles[id].owner && Tiles[id].owner != Lamden.wallet) || (Tiles[id].unit && Tiles[id].unit.owner != Lamden.wallet)) {
				let d = World.offset_distance(Tiles[UI.selectedUnit.tileID], Tiles[id]);
				if (d > custom.attackDistance()) {
					html += 'Too far to attack';
				} else {
					html += 'Attack, costs ' + Math.ceil(d * UI.selectedUnit.troops * (techHasResearched(19) ? .5 : 1)) + ' energy to attack; right-click to attack. ';
				}
			} else {
				html += 'Cannot move here';
			}
		}

	}
	$('#tooltip').show().html(html).css({left: scene.pointerX + 10, top: scene.pointerY + 10});
});
function techHasResearched(id) {
	let tech = World.Technologies[id];
	let now = UI.now();
	if (tech.started && tech.started + tech.duration < now) {
		return true;
	}
	return false;
}
function isResearching(id) {
	for (let r in World.Technologies) {
		let t = World.Technologies[r];
		if (t.researchedAt == id && t.started && t.started + t.duration > UI.now()) {
			return r;
		}
	}
	return false;
}
function updateConstructionProgress() {
	if (!UI.selectedTile || Tiles[UI.selectedTile].owner != Lamden.wallet) {
		return;
	}
	let now = UI.now();

	if (!Tiles[UI.selectedTile].constructionFinished || Tiles[UI.selectedTile].constructionFinished <= now - 5) {
		$('#building-progress').hide();
		return;
	} else if (!Tiles[UI.selectedTile].constructionFinished || (Tiles[UI.selectedTile].constructionFinished < now && Tiles[UI.selectedTile].constructionFinished > now - 5)) {
		tileHtml(UI.selectedTile);
		return;
	}
	$('#building-progress').show();
	$('#building-progress progress').attr('value', 100 - (Tiles[UI.selectedTile].constructionFinished - now));
}
function updateResearchProgress() {
	if (!UI.selectedTile || Tiles[UI.selectedTile].owner != Lamden.wallet) {
		return;
	}
	$('#research-progress').hide();
	$('#techs').show();
	let techID = isResearching(Tiles[UI.selectedTile].building);
	let tech = null;
	if (techID) {
		tech = World.Technologies[techID];
		$('#research-progress').show();
		$('#techs').hide();
	}
	if (!tech) {
		return;
	}
	let now = UI.now();
	// find current tech being researched
	$('#research-progress').show();
	let min = tech.started;
	let current = now - tech.started;
	let progress = current / tech.duration;
	$('#research-progress progress').attr('value', progress * 100);
}
function isRefining(tile) {
	return tile.convertAmount && tile.lastHarvest + custom.refineryDuration(tile.level, tile.convertAmount) >= UI.now() && !tile.collected;
}
function conversionFinished(tile) {
	//tile = Tiles[tile];
	if (!tile || tile.building != 11 || tile.collected) {
		return false;
	}
	let duration = custom.refineryDuration(tile.level, tile.convertAmount);
	if (tile.lastHarvest + duration < UI.now()) {
		return true;
	}
	return false;
}

function updateConversionProgress() {
	if (!UI.selectedTile || Tiles[UI.selectedTile].owner != Lamden.wallet) {
		return;
	}
	let tile = Tiles[UI.selectedTile];
	let current = UI.now() - tile.lastHarvest;
	let progress = current / custom.refineryDuration(tile.level, tile.convertAmount);
	if (tile.collected || !conversionFinished(tile)) {
		$('#collect-button').hide();
	}
	if (!isRefining(tile) && tile.collected) {
		$('#conversion-progress').hide();
		$('#conversion-form').show();
		return;
	}
	if (conversionFinished(tile)) {
		$('#collect-button').show();
	}
	$('#conversion-progress').show();
	$('#conversion-form').hide();
	$('#conversion-progress progress').attr('value', progress * 100);
}
function isTraining(tile) {
	return tile.trainAmount && tile.lastHarvest + custom.trainDuration(tile) > UI.now() && !tile.collected;
}
function trainingFinished(tile) {
	if (!tile || [8,9,12].indexOf(tile.building) == -1) { // check if barracks
		return false;
	}
	if (tile.collected) {
		return false;
	}
	let now = UI.now();
	if (tile.lastHarvest + custom.trainDuration(tile) < now) {
		return true;
	}
	return false;
}
function updateTrainProgress() {
	if (!UI.selectedTile || Tiles[UI.selectedTile].owner != Lamden.wallet) {
		return;
	}
	let tile = Tiles[UI.selectedTile];
	let current = UI.now() - tile.lastHarvest; // time passed in seconds since starting training
	let progress = current / custom.trainDuration(tile);
	$('#collect-troops-button').hide();
	if (trainingFinished(tile) && !tile.collected) {
		$('#collect-troops-button').show();
	}
	if (!isTraining(tile) && tile.collected) {
		$('#train-progress').hide();
		$('#train-troops').show();
		return;
	}
	$('#train-progress').show();
	$('#train-troops').hide();
	$('#train-progress progress').attr('value', progress * 100);
}

function updateUnitCooldown() {
	if (!UI.selectedUnit || UI.selectedUnit.owner != Lamden.wallet) {
		return;
	}
	let now = UI.now();
	if (UI.selectedUnit.ready < now) {
		$('#cooldown').hide();
		return;
	}
	$('#cooldown').show();
	let diff = UI.selectedUnit.ready - now;
	$('#cooldown progress').attr('value', diff);
}
window.setInterval(updateConstructionProgress, 1000);
window.setInterval(updateResearchProgress, 1000);
window.setInterval(updateConversionProgress, 1000);
window.setInterval(updateTrainProgress, 1000);
window.setInterval(updateUnitCooldown, 1000);
canvas.addEventListener('click', () => {
	let pickResult = scene.pick(scene.pointerX, scene.pointerY, function(mesh) {
		return mesh.name == 'water' || (mesh.type == 'unit') || (mesh.parent && mesh.parent.type == 'unit');
	});
	if (!pickResult.hit) {
		return;
	}
	let point = pickResult.pickedPoint;
	let mesh = pickResult.pickedMesh;
	if (mesh.parent) {
		mesh = mesh.parent;
	}
	UI.unitSelect.position.y = -100;
	UI.tileSelect.position.y = -100;

	$('#marketplace').hide();

	// remove path
	if (UI.path.dispose) {
		UI.path.dispose();
		UI.path = {};
	}


	// unit selection
	UI.selectedUnit = null;
	UI.selectedTile = null;
	let tile = pos2tile(v(point.x, point.z));
	if (mesh.type == 'unit') { // unit info panel
		UI.selectedUnit = mesh;
		UI.unitSelect.material.diffuseColor = mesh.owner == Lamden.wallet ? color(0,1,0) : color(1,0,0);
		if (mesh.owner == Lamden.wallet) {
			World.Sounds[randomArray(['unit1', 'unit2','unit3'])].play();
		} else {
			World.Sounds[randomArray(['enemy1','enemy2'])].play();
		}
		html = '<h1>' + mesh.name + '</h1>';
		html += '<p>Owner: ' + (Lamden.Players[mesh.owner] ? Lamden.Players[mesh.owner].name : mesh.owner) + '</p>';
		html += '<p>Troops: <span id="num-troops">' + mesh.troops + '</span></p>';
		if (mesh.owner == Lamden.wallet) {
			html += '<p>Maximum move distance: ' + custom.moveDistance(mesh.troops) + '</p>';
			let now = UI.now();
			if (mesh.ready > now) {
				//let diff = mesh.ready - now;
				//html += '<div id="cooldown"><progress max="30" value="' + (diff) + '"></progress></div>';
				//html += '<p>Unit still cooling down before next action can be performed. </p>';
			} else {
				html += '<p>Right-click on a tile to move there</p>';
			}

			if (techHasResearched(5)) {
				html += '<p style="color: #8f8; ">+10% damage</p>';
			}
			if (techHasResearched(6)) {
				html += '<p style="color: #8f8; ">+10% hp</p>';
			}
			if (techHasResearched(8)) {
				html += '<p style="color: #8f8; ">+1 tile max move</p>';
			}
			if (techHasResearched(19)) {
				html += '<p style="color: #8f8; ">-50% energy cost to move or attack</p>';
			}

			html += '<form>';
			html += 'Select trops if you want to split units:<input type="text" id="split-units" value="' + mesh.troops + '" style="margin: 0; ">';
			html += '<p>If you want to split this group in two, enter the to be split off amount, then right-click on an friendly nearby tile to move them there. This value is ignored if you attack, ie. you always attack with all available troops on the tile. </p>';
			html += '</form>';
		}
		$('#info-panel').html(html).show();
		return;
	}

	UI.tileSelect.position = mapPosition(tile.x, tile.y).add(v(0,.09,0));
	if (!UI.mesh) {
		World.Sounds.tick2.play();
	}
	let id = (tile.x) + ',' + (tile.y);
	UI.selectedTile = id;
	UI.x = tile.x;
	UI.y = tile.y;
	if (UI.tool == 'colonize') {
		colonizeTile();
		return;
	}
	if (UI.building) {
		placeBuilding();
		return;
	}

	if (Tiles[id]) {
		tileHtml(id);
	}

	if (Tiles[id].building == 13) {
		$('#marketplace').show();
	}
});
function tileHtml(id) {
	let html = '';
	let tile = Tiles[id];
	if (tile.building > 0 && World.buildingData[tile.building]) {
		html = '<h1>Level ' + tile.level + ' ' + World.buildingData[tile.building].name;
		html += ' (' + UI.x + ',' + UI.y + ')</h1>';
		if ([3,4,5].indexOf(parseInt(tile.building)) > 1) {
			html += '<p> on ' + World.tileTypes[tile.type] + '</p>';
		}
		html += '<progress id="building-hp" value="' + tile.currentHP + '" max="' + tile.maxHP + '" title="' + tile.currentHP + '/' + tile.maxHP + '"></progress>';
	} else {
		html = '<h1>' + World.tileTypes[tile.type].name + ' (' + UI.x + ',' + UI.y + ')</h1>';
	}
	if (tile.fortification) {
		html += '<progress id="fortification-hp" value="' + tile.fortification + '" max="' + custom.fortHP() + '" ';
		html += 'title="' + tile.fortification + '/' + custom.fortHP() + '" style="height: 5px; margin-top: 5px; "></progress>';
	}
	if (tile.owner) {
		html += '<p>Owner: ' + (Lamden.Players[tile.owner] ? Lamden.Players[tile.owner].name : tile.owner) + '</p>';
	} else {
		html += '<p>Uncolonized</p>';
	}
	html += '<p>Current troops: <span id="num-troops">' + (tile.unit ? tile.unit.troops : 0) + '</span> (Capacity: ' + custom.maxOccupancy(tile) + ')</p>';
	if (!tile.owner) {
		if (!Player.capital && tile.type == 'grass' && Lamden.wallet) {
			html += '<button id="settle-button">Settle here</button>';
		} else if (World.ownAdjacentTile(UI.x, UI.y)) {
			//html += '<button id="colonize-button">Colonize</button> (100 Energy)';
			html += 'This tile can be colonized for 100 energy. ';
		} else {
			html += '<p class="error">You cannot colonize this tile, it is not adjacent to a tile you own. </p>';
		}
	}

	if (!tile.fortification && tile.owner == Lamden.wallet) {
		html += '<button id="fortify-button">Fortify</button><br>' + costHtml({0:1000, 2:1000,4:1000});
	}

	if (!tile.building || [3,4,5].indexOf(tile.building) > -1) {
		html += '<h2>Yield Multipliers</h2><dl>';
		html += '<dt>Sedementary Rock</dt><dd>' + World.tileTypes[tile.type].yield[1] + '</dd>';
		html += '<dt>Raw Ore</dt><dd>' + World.tileTypes[tile.type].yield[2] + '</dd>';
		html += '<dt>Fossil Fuels</dt><dd>' + World.tileTypes[tile.type].yield[3] + '</dd>';
		html += '</dl>';
	}
	if (tile.owner != Lamden.wallet) {
		$('#info-panel').html(html).show();
		return;
	}

	let now = UI.now();
	if (tile.building > 0 && World.buildingData[tile.building]) {
		html += '<div id="building-progress" style="display: ' + (tile.constructionFinished > now ? 'block' : 'none') + '; ">Constructing';
		html += '<progress max="100"></progress>';
		html += '</div>';
		html += '<div id="research-progress" style="display: ' + (isResearching(Tiles[UI.selectedTile].building) ? 'block' : 'none') + '; ">Researching ';
		if (isResearching(Tiles[UI.selectedTile].building)) {
			let name = World.Technologies[isResearching(Tiles[UI.selectedTile].building)].name;
			html += name;
		}
		html += '<progress max="100"></progress>';
		html += '</div>';
		if (Tiles[UI.selectedTile].constructionFinished > now) {
			$('#info-panel').html(html).show();
			return;
		}
		let data = World.buildingData[tile.building];
		if (data.produces != undefined) {
			html += '<p>Last Harvest: ' + (now - tile.lastHarvest) + 's ago</p>';
			let resource = World.buildingData[tile.building].produces;
			html += '<dl>';
			html += '<dt>Mining<dt><dd>' + World.Resources[data.produces].name + '</dd>';
			html += '<dt>Yield Multiplier<dt><dd>' + custom.yieldMultiplier(tile) + '</dd>';
			html += '<dt>Capacity<dt><dd style="color: ' + (techHasResearched(20) ? '#8f8' : '#fff') + '">' + custom.mineCapacity(tile) + '</dd>';
			html += '</dl>';
			html += '<button id="harvest-button">Harvest</button><br>';
			html += 'Current Yield: '
			html += '<img src="icons/ingot.png" style="width: 16px; height: 16px; ">';
			html += custom.calcYield(tile) + ' ' + World.Resources[data.produces].name;
			if ([3,4,5].indexOf(parseInt(tile.building)) > -1) {
				html += '<h2>Switch Resource</h2>';
				html += '<ul id="mine-switch">';
				html += '<li><a data-id="3"><img src="images/lamden.svg"><b>Ore Mine</b>500 Energy</a></li>';
				html += '<li><a data-id="4"><img src="images/lamden.svg"><b>Fossil Fuel Pump</b>500 Energy</a></li>';
				html += '<li><a data-id="5"><img src="images/lamden.svg"><b>Sedimentary Rock Mine</b>500 Energy</a></li>';
				html += '</ul>';
			}
		}
		html += '<h2>Research</h2>';
		html += '<ul id="techs" style="display: ' + (isResearching(tile.building) ? 'none' : 'block') + '">';
		for (let t in World.Technologies) {
			let tech = World.Technologies[t];
			if (tech.researchedAt == tile.building && !tech.started && (!tech.requiresTech || techHasResearched(tech.requiresTech))) {
				html += '<li><a data-id="' + t + '"><img src="images/lamden.svg"><b>'
				html += World.Technologies[t].name + ' (' + World.Technologies[t].duration + 's)</b> '
				html += costHtml(World.Technologies[t].cost) + '</a></li>';
			}
		}
		html += '</ul>';
		if ([1,3,4,5,7,8,9,11,12,14].indexOf(parseInt(tile.building)) > -1) { //if building with levels
			html += '<button id="levelup-button">Level to ' + (tile.level + 1) + '</button><br>';
			let cost = World.buildingData[tile.building].cost;
			html += costHtml(custom.levelUpCost(cost, tile.level + 1));
		}
		if (tile.building == 11) { // conversions
			html += '<h2>Refine Goods</h2>';
			html += '<dl>';
			html += '<dt>Rate</dt><dd>' + custom.refinerySpeed(tile.level) + 'resources/s</dd>';
			let capacity = custom.refineryCapacity(tile.level);
			html += '<dt>Capacity</dt><dd>' + capacity + '</dd>';
			html += '<dt>Time to Capacity</dt><dd>' + custom.refineryDuration(tile.level) + '</dd>';
			if (techHasResearched(13)) {
				if (techHasResearched(17)) {
					html += '<dt>Bonus Yield</dt><dd style="color: #8f8">37.5%</dd>';
				} else {
					html += '<dt>Bonus Yield</dt><dd style="color: #8f8">10%</dd>';
				}
			}
			html += '</dl>';
			html += '<div id="conversion-progress" style="display: ' + (isRefining(tile) || conversionFinished(tile) ? 'block' : 'none') + '; ">Refining';
			if (tile.convertID) {
				let produces = World.Conversions[tile.convertID].produces;
				let amount = tile.convertAmount;
				console.log(produces, amount, World.Resources[produces].name);
				refining = {};
				refining[produces] = amount;
				html += costHtml(refining);
			}

			let current = UI.now() - tile.lastHarvest;
			let progress = current / custom.refineryDuration(tile.level, tile.convertAmount);

			html += '<progress max="100" value="' + (progress * 100) + '"></progress>';
			html += '<button id="collect-button" style="display: ' + (conversionFinished(tile) ? 'block' : 'none') + '">Collect</button>';
			if (tile.convertID) {
				html += '<br>' + costHtml(refining);
			}
			html += '</div>';
			html += '<form id="conversion-form" style="display: ' + (!isRefining(tile) && !conversionFinished(tile) ? 'block' : 'none') + '">';
			html += '<select id="convert-id">';
			for (let c in World.Conversions) {
				if (tile.level >= World.Conversions[c].requiresLevel) {
					html += '<option value="' + c + '">' + World.Conversions[c].name + '</option>';
				}
			}
			html += '</select>';
			html += '<input id="convert-amount" type="text" value="' + custom.refineryCapacity(tile.level) + '">';
			html += '<button id="convert-button">Convert</button>';
			html += '</form>';
		}
		if ([8,9,12].indexOf(tile.building) > -1) {
			html += '<h2>Train Troops</h2><dl>';
			html += '<dt>Rate</dt><dd>' + custom.trainRate(tile) + ' troops/min</dd>';
			html += '<dt>Capacity</dt><dd>' + custom.trainCapacity(tile) + ' troops</dd>';
			html += '<dt>Cost Multiplier</dt><dd>' + custom.trainCostMultiplier(tile) + ' troops</dd>';
			html += '</dl>';

			let current = UI.now() - tile.lastHarvest;
			let progress = current / custom.trainDuration(tile);

			html += '<div id="train-progress" style="display: ' + (isTraining(tile) || trainingFinished(tile) ? 'block' : 'none') + '; ">Train';
			html += '<progress max="100" value="' + (progress * 100) + '"></progress>';
			html += '<button id="collect-troops-button" style="display: ' + (trainingFinished(tile) ? 'block' : 'none') + '">Deploy Troops</button>';
			html += '</div>';
			html += '<button id="train-troops" style="display: ' + (!isTraining(tile) && !trainingFinished(tile) ? 'block' : 'none') + '; ">Train</button><br>' + custom.trainDuration(tile) + ' seconds';
		}
		if (tile.building == 14) {
			html += '<h2>Launch Missile</h2>';
			html += '<p>Silo Range: ' + (tile.level + 3) + ' tiles</p>';
			if (tile.lastHarvest + 3600 > UI.now()) {
				let current = UI.now() - tile.lastHarvest;
				let progress = current / 3600;
				html += 'Cooldown';
				html += '<progress max="100" value="' + (100 - progress * 100) + '"></progress>';
			} else {
				html += '<label>Payload</label> ';
				html += '<input id="missile-power" type="text" value="1000"> tonnes TnT';
				html += '<button id="missile-button">Launch Missile</button><br>';
				html += '10,000 Energy, <span id="missile-cost">2000</span> Uranium';
			}
		}
		if (tile.building) {
			html += '<button id="demolish-button">Demolish</button>';
		}
	}
	$('#info-panel').html(html).show();
}
function tabHtml(tab) {
	let html = '';
	if (tab == 'build') {
		html = '<ul id="buildings">';
		for (let b in World.buildingData) {
			let d = World.buildingData[b];
			if (b > 1 && (!d.requiresTech || techHasResearched(d.requiresTech))) {
				let icon = World.buildingData[b].icon;
				html += '<li><a data-id="' + b + '"><img src="icons/' + (icon ? icon : 'blank') + '.png">';
				//<b>'
				//html += World.buildingData[b].name + '</b>' + costHtml(World.buildingData[b].cost) + '</a>';
				html += '</li>';
			}
		}
		html += '</ul>';
	} else if (tab == 'defense') {
		html = '<ul id=""></ul>';
	}
	$('#actions').html(html);
}
tabHtml('build');
$('#tabs li').click(function(e) {
	let tab = $(e.target).parent().attr('data-tab');
	tabHtml(tab);
});

$('#info-panel').on('keyup keypress', '#missile-power', function(e) {
	let val = parseInt($('#missile-power').val());
	if (!val || val <= 0) {
		val = 0;
	}
	$('#missile-cost').html(val + 1000);
});

UI.cancel = function() {
	deleteHighlight();
	UI.tool = 'pan';
	UI.building = null;
	if (UI.mesh) {
		UI.mesh.dispose();
		UI.mesh = null;
	}
	if (UI.path.dispose) {
		UI.path.dispose();
		UI.path = {};
	}
	if (scene.getMaterialByName('Drag')) {
		scene.getMaterialByName('Drag').dispose();
	}
	UI.selectedTile = null;
	UI.selectedUnit = null;
	UI.tileSelect.position.y = -1;
	$('#info-panel').fadeOut();
}
window.addEventListener('keydown', (e) => {
	if (e.target.name == 'body') {
		return true;
	}
	if (e.keyCode == 27) { // esc
		UI.cancel();
	}
	if (e.keyCode == 87) { // W
		camera.inertialPanningY = 2;
	}
	if (e.keyCode == 83) { // S
		camera.inertialPanningY = -2;
	}
	if (e.keyCode == 65) { // A
		camera.inertialPanningX = -2;
	}
	if (e.keyCode == 68) { // D
		camera.inertialPanningX = 2;
	}
	if (e.keyCode == 82) { // X
		UI.settings.reflections = !UI.settings.reflections;
		if (UI.settings.reflections) {
			World.water.material.reflectionTexture.renderList = World.reflect;
		} else {
			World.water.material.reflectionTexture.renderList = [];
		}
	}
	if (e.keyCode == 88) { // X
		UI.settings.namplates = !UI.settings.namplates;
		$('#labels').toggle();
	}
});
canvas.addEventListener('contextmenu', () => {
	let pickResult = scene.pick(scene.pointerX, scene.pointerY, function(mesh) {
		return mesh.name == 'water';
	});
	if (!pickResult.hit) {
		return;
	}
	let point = pickResult.pickedPoint;
	let mesh = pickResult.pickedMesh;

	let tile = pos2tile(v(point.x, point.z));
	tilePos = mapPosition(tile.x, tile.y);
	let id = (tile.x) + ',' + (tile.y);

	// contextmenu
	if (UI.building || UI.tool == 'colonize') {
		UI.cancel();
		return;
	}

	// fire missile from silo
	if (UI.selectedTile && UI.selectedTile != id && UI.launchMissile) {
		let a = v(tile.x, tile.y);
		let b = v(UI.x, UI.y);
		if (World.offset_distance(a, b) > 3 + Tiles[UI.selectedTile].level) {
			addmessage('Too far for this missile silo. ', '#f88');
			return false;
		}

		UI.launchMissile = false;
		UI.tileTarget.position.y = -100;
		let val = parseInt($('#missile-power').val());
		// get power
		if (!val || val <= 0) {
			addMessage('Enter a positive value for power');
			World.Sounds.tick1.play();
			return false;
		}
		if (!deductCost(custom.missileCost(val))) {
			World.Sounds.tick1.play();
			return false;
		}
		let tile = Tiles[UI.selectedTile]
		$.post('./missile.php', {
			x: Tiles[UI.selectedTile].x,
			y: Tiles[UI.selectedTile].y,
			x2: tile.x,
			y2: tile.y,
			power: val,
			cost: custom.missileCost(val)
		}, function(e) {
			console.log(e);
			data = JSON.parse(e);
			tile.lastHarvest = UI.now();
			if (data.error) {
				addMessage(data.error, '#f88');
			}
		});
		return;
		fireMissile(Tiles[UI.selectedTile], Tiles[id], val);
		return;
	}

	if (!UI.selectedUnit) {
		return false;
	}
	let a = v(tile.x, tile.y);
	let b = v(Tiles[UI.selectedUnit.tileID].x, Tiles[UI.selectedUnit.tileID].y);

	if (UI.selectedUnit.owner != Lamden.wallet) {
		addMessage('Not your unit', '#f88');
		return false;
	}
	if (UI.selectedUnit.target) {
		World.Sounds[randomArray(['negative1','negative2'])].play();
		addMessage('Unit still underway, wait until arrival', '#f88');
		return false;
	}
	//let now = UI.now();
	//if (UI.selectedUnit.ready > now) {
		//World.Sounds[randomArray(['negative1','negative2'])].play();
		//addMessage('Unit still cooling down, wait until cooldown complete', '#f88');
		//return false;
	//}
	if (id == UI.selectedUnit.tileID) {
		return;
	}
/*	// now handled in pathfinding
	if (UI.selectedUnit.name == 'Ship' && Tiles[id].type != 'water') {
		World.Sounds[randomArray(['negative1','negative2'])].play();
		addMessage('Cannot move ship on land', '#f88');
		return;
	}
	if (UI.selectedUnit.name != 'Ship' && Tiles[id].type == 'water') {
		World.Sounds[randomArray(['negative1','negative2'])].play();
		addMessage('Cannot move unit on water', '#f88');
		return;
	} */

	if ((Tiles[id].owner && Tiles[id].owner != Lamden.wallet) || (Tiles[id].unit && Tiles[id].unit.owner != Lamden.wallet)) { // attack
		if (World.offset_distance(Tiles[id], Tiles[UI.selectedUnit.tileID]) > custom.attackDistance()) {
			World.Sounds[randomArray(['negative1','negative2'])].play();
			addMessage('Too far to attack', '#f80');
			return;
		}
	} else {
		if (!UI.path.tiles || UI.path.tiles.length > custom.moveDistance(UI.selectedUnit.troops)) {
			World.Sounds[randomArray(['negative1','negative2'])].play();
			addMessage('Inacessible or too far for this amount of units', '#f80');
			return;
		}
	}

	if (custom.maxOccupancy(Tiles[id]) < UI.selectedUnit.troops) {
		World.Sounds[randomArray(['negative1','negative2'])].play();
		addMessage('Too many troops for destination tile. ', '#f80');
		return;
	}

	if (Tiles[id].unit && Tiles[id].unit.owner == Lamden.wallet && custom.maxOccupancy(Tiles[id]) < UI.selectedUnit.troops + Tiles[id].unit.troops) {
		World.Sounds[randomArray(['negative1','negative2'])].play();
		addMessage('Cannot merge, too many troops for destination tile. ', '#f80');
		return;
	}

	if (!deductCost({0:UI.selectedUnit.troops})) {
		return false;
	}
	World.Sounds[randomArray(['confirm1','confirm2'])].play();

	let amount = parseInt($('#split-units').val()) || 0;
	let energy = amount || UI.selectedUnit.troops;
	if (techHasResearched(19)) {
		energy = Math.ceil(energy * .5);
	}

	$.post('./move.php', {
		x: Tiles[UI.selectedUnit.tileID].x,
		y: Tiles[UI.selectedUnit.tileID].y,
		x2: Tiles[id].x,
		y2: Tiles[id].y,
		amount: amount,
		cost: {0:energy},
	}, function(e) {
		console.log(e);
		if (UI.path.dispose) {
			UI.path.dispose();
			UI.path = {};
		}
		let data = JSON.parse(e);
		console.log(data);
/*		if (UI.selectedUnit) {
			if (!deductCost({0:UI.selectedUnit.troops})) {
				return false;
			}
//			Tiles[UI.selectedUnit.tileID].unit = null;
		} */
/*		if (Tiles[id].unit && Tiles[id].unit.owner != Lamden.wallet) { // attack units
			if (distance(UI.selectedUnit.position, Tiles[id].unit.position) > 60) {
				addMessage('Too far to attack', '#f88');
			}
			UI.selectedUnit.lookAt(Tiles[id].unit.position);
			Tiles[id].unit.lookAt(UI.selectedUnit.position);
			UI.selectedUnit.ready = now + 30;
			battle(UI.selectedUnit, Tiles[id].unit, data[0].numTroops, data[1].numTroops);
			return;
		}*/
/*		if (Tiles[id].building && Tiles[id].owner != Lamden.wallet) { // attack buildings/forts
			UI.selectedUnit.lookAt(Tiles[id].pos);
			let unit = UI.selectedUnit;
			let tile = Tiles[id];
			UI.selectedUnit.ready = now + 30;
			window.setTimeout(function() {
				siege(unit, tile, data[0].numTroops, data[1].hp);
			}, 1000);
			return;

		}*/
/*		if (Tiles[id].unit && Tiles[id].unit.owner == Lamden.wallet) { // merge units
			let troops = parseInt(UI.selectedUnit.troops);
			UI.selectedUnit.dispose();
			Tiles[id].unit.troops += troops;
			addMessage('Units merged. now counting ' + Tiles[id].unit.troops);
			UI.selectedUnit = Tiles[id].unit; // change selection to
			UI.selectedUnit.ready = now + 30;
			return;
		}*/

		// move unit
/*		UI.selectedUnit.lookAt(tilePos);
		UI.selectedUnit.target = tilePos;
		UI.selectedUnit.tileID = id;
		UI.selectedUnit.ready = now + 30;
		if (UI.selectedUnit.mesh) {
			scene.beginAnimation(UI.selectedUnit.mesh, 51, 80, true, 1);
		}
		Tiles[id].unit = UI.selectedUnit; */
	});
});

function moveUnit(a, b) {
	let unit = a.unit;
	unit.unfreezeWorldMatrix();
	unit.path = pathFinding(a, b);
	if (!unit.path.length) {
		return;
	}
	unit.path.pop(); // remove last
	a.unit = null;
	a.numTroops = 0;
	b.unit = unit;
	b.numTroops = unit.troops;
	unit.target = Tiles[unit.path.pop()].pos;
	unit.lookAt(unit.target);
	unit.tileID = b.x + ',' + b.y;
	unit.ready = UI.now() + 30;
	if (b.owner && !b.currentHP && b.owner != Lamden.wallet) {
		b.owner = '';
		World.drawWorld(true);
	}
	if (unit.walk) {
		unit.walk();
	}
}
function attackUnit(a, b, aRemain, bRemain) {
	a.unit.lookAt(b.unit.position);
	b.unit.lookAt(a.unit.position);
	a.unit.freezeWorldMatrix();
	b.unit.freezeWorldMatrix();
	a.ready = UI.now() + 30;
	battle(a.unit, b.unit, aRemain, bRemain);
}
function attackBuilding(a, b, aRemain, bRemain, fortRemain) {
	a.unit.lookAt(b.pos);
	a.unit.freezeWorldMatrix();
	a.unit.ready = UI.now() + 30;
	siege(a.unit, b, aRemain, bRemain, fortRemain);
}

// move units that are moving
scene.registerBeforeRender(function() {
	for (let u in World.units) {
		if (World.units[u].target) {
			World.units[u].movePOV(0,0, clamp(4 / engine.fps, 0, .2));
			let pos = getScreenCoords(World.units[u].position.add(v(0,10,0)));
			let id = World.units[u].id;
			if (UI.settings.namplates) {
				$('#' + id).css({left: pos.x - (document.getElementById(id).offsetWidth / 2) + 'px', top: pos.y - 10 + 'px'});
			}
			if (distance(World.units[u].position, World.units[u].target) < .2) {
				if (World.units[u].path.length) {
					World.units[u].target = Tiles[World.units[u].path.pop()].pos;
					World.units[u].lookAt(World.units[u].target);
				} else {
					World.units[u].path = [];
					World.units[u].target = null;
					World.units[u].freezeWorldMatrix();
					if (World.units[u].idle) {
						World.units[u].idle();
					}
				}
			}
		}
	}
});

function setBuildingData(tile, id, owner, constructionFinished) {
	if (!tile) {
		console.log(id);
	}
	if (owner) {
		tile.owner = owner;
	}
	tile.building = parseInt(id);
	if (tile.building == 0) {
		return;
	}
	if (!World.buildingData[id]) {
		return;
	}
	addBuilding(tile);
	updateSPSMeshes();
	tile.lastHarvest = Math.round((new Date()).getTime() / 1000);
	if ([8,9,11,12].indexOf(id) > -1) { // refinery/barracks
		tile.collected = true;
	}
	let buildingData = World.buildingData[id];
	let hp = custom.buildingHP(tile);
	tile.currentHP = hp;
	tile.maxHP = hp;
	tile.power = buildingData.power;
	tile.level = 1;
	if (constructionFinished) {
		tile.constructionFinished = constructionFinished;
	}
}
//$('#info-panel').on('click', '#buildings li', function(e) {
function placeBuilding() {
	//let id = $(e.target.parentNode).attr('data-id') || $(e.target).attr('data-id');
	let id = UI.building;
	if (!id) {
		return false;
	}

	if (Tiles[UI.x + ',' + UI.y].owner != Lamden.wallet) {
		addMessage('Tile not colonized by you', '#f88');
		World.Sounds.tick1.play();
		return false;
	}
	if (Tiles[UI.x + ',' + UI.y].building) {
		addMessage('Tile already occupied', '#f88');
		World.Sounds.tick1.play();
		return false;
	}
	if (!deductCost(World.buildingData[id].cost)) {
		World.Sounds.tick1.play();
		return false;
	}

	if (id == 12 && Tiles[UI.x + ',' + UI.y].type != 'water') {
		addMessage('Must be placed on water', '#f88');
		World.Sounds.tick1.play();
		return false;
	}
	if (id != 12 && Tiles[UI.x + ',' + UI.y].type == 'water') {
		addMessage('Cannot be placed on water', '#f88');
		World.Sounds.tick1.play();
		return false;
	}

	World.Sounds.tick2.play();
	$.post('./build.php', {x: UI.x, y: UI.y, id: id, cost: World.buildingData[id].cost}, function(e) {
		console.log(e);
		let data = JSON.parse(e);
		if (data.error) {
			addMessage(data.error, '#f80');
			return;
		}
		let tile = data.x + ',' + data.y;
//		setBuildingData(Tiles[tile], id, Lamden.wallet,  UI.now() + 2);
		addMessage(World.buildingData[id].name + ' created');
		Tiles[UI.selectedTile].constructionFinished = UI.now() + 30;
		// remove dragger mesh
		UI.building = null;
		World.Sounds['upgrade2'].play();
		if (UI.mesh &&  scene.meshes.indexOf(UI.mesh) > -1) {
			UI.mesh.dispose();
			UI.mesh = null;
		}
	});
	return;
	setBuildingData(Tiles[UI.selectedTile], id, Lamden.wallet,  UI.now() + 30);
	addMessage(World.buildingData[id].name + ' created');
	tileHtml(UI.selectedTile);
}

$('#info-panel').on('click', '#mine-switch a', function(e) {
	let id = $(e.target.parentNode).attr('data-id') || $(e.target).attr('data-id');
	let cost = World.buildingData[id].cost;
	cost = jQuery.extend(true, {}, cost);
	cost[0] = 500;
	if (!deductCost(cost)) {
		addMessage('Not enough resources', '#f88');
		return false;
	}
	$('#mine-switch').hide();
	$.post('./build.php', {x: UI.x, y: UI.y, id: parseInt(id)}, function() {
		// remove old building
		return;
		if (Tiles[UI.selectedTile].mesh) {
			Tiles[UI.selectedTile].mesh.dispose();
		}
		Tiles[UI.selectedTile].building = parseInt(id);
	//	if (Tiles[UI.selectedTile].nameplate)  { // todo: put nameplate creation in its own function
	//		Tiles[UI.selectedTile].nameplate.dispose();
	//	}
	//	Tiles[UI.selectedTile].nameplate = null;
		tileHtml(UI.selectedTile);
	});
});

function mineFinished(tile) {
	if (!tile || [1,3,4,5,7].indexOf(tile.building) == -1) { // check if mine
		return false;
	}
	if (custom.mineCapacity(tile) > custom.calcYield(tile)) {
		return false;
	}
	return true;
}
$('#info-panel').on('click', '#harvest-button', function() {
	if (UI.now() - Tiles[UI.selectedTile].lastHarvest < 10) {
		addMessage('Harvesting too soon, try again later', '#f88');
		tileHtml(UI.selectedTile);
		return;
	}
	let amount = custom.calcYield(Tiles[UI.selectedTile]);
	Tiles[UI.selectedTile].lastHarvest = UI.now();
	let resource = World.buildingData[Tiles[UI.selectedTile].building].produces;
	let tile = Tiles[UI.selectedTile];
	$.post('./harvest.php', {owner: Lamden.wallet, x: UI.x,y: UI.y, id: resource, amount: amount}, function(e) {
		console.log(e);
		changePlayerResource(resource, amount);
		tile.lastHarvest = UI.now();
		if (tile.readyMesh) {
			tile.readyMesh.dispose();
			tile.readyMesh = null;
		}
		World.Sounds.rock1.play();
		tileHtml(UI.selectedTile);
	});
});
$('#info-panel').on('click', '#convert-button', function(e) {
	e.preventDefault();
	if (Tiles[UI.selectedTile].convertAmount && !Tiles[UI.selectedTile].collected) {
		addMessage('Refiner busy, try again later', '#f80');
		return false;
	}
	let now = UI.now();
	let id = $('#convert-id').val();
	let amount = parseInt($('#convert-amount').val()) || custom.refineryCapacity(Tiles[UI.selectedTile].level);
	if (amount > custom.refineryCapacity(Tiles[UI.selectedTile].level)) {
		addMessage('Requested amount higher than capacity.', '#f88');
		return false;
	}
	let resource = World.Conversions[id].consumes;
	cost = {}
	cost[resource] = amount;
	//if (!deductCost(cost)) {
	//	return false;
	//}
	if (amount == 0) {
		return;
	}
	$('#conversion-form').hide();
	$.post('./refine.php', {
		owner: Lamden.wallet,
		x: UI.x, y: UI.y,
		id: World.Conversions[id].consumes,
		convertID: id, amount: amount
	}, function(e) {
		console.log(e);
		let data = JSON.parse(e);
		if (data.error) {
			addMessage(data.error, '#f80');
			return false;
		}
		addMessage('Started Refining');
		Tiles[UI.selectedTile].lastHarvest = UI.now();
		Tiles[UI.selectedTile].convertID = id;
		Tiles[UI.selectedTile].convertAmount = amount;
		Tiles[UI.selectedTile].collected = false;
		window.setTimeout(function() {
			tileHtml(UI.selectedTile);
		},1000);
	});
	return false;
});
$('#info-panel').on('click', '#collect-button', function(e) {
	e.preventDefault();
	if (!conversionFinished(Tiles[UI.selectedTile]) || Tiles[UI.selectedTile].collected) {
		addMessage('Refining not yet completed, or already collected.');
		return false;
	}
	let id = Tiles[UI.selectedTile].convertID;
	let amount = Tiles[UI.selectedTile].convertAmount;
	$.post('./collect.php', {x: UI.x, y: UI.y, id: World.Conversions[id].produces}, function(e) {
		console.log(e);
		let data = JSON.parse(e);
		if (data.error) {
			addMessage(data.error, '#f80');
			return false;
		}
		Tiles[UI.selectedTile].collected = true;
		if (Tiles[UI.selectedTile].readyMesh) {
			Tiles[UI.selectedTile].readyMesh.dispose();
			Tiles[UI.selectedTile].readyMesh = null;
		}
		World.Sounds.rock1.play();
		changePlayerResource(World.Conversions[id].produces, amount);
	});

});

$('#info-panel').on('click', '#train-troops', function(e) {
	e.preventDefault();
	let now = UI.now();
	let amount = custom.trainCapacity(Tiles[UI.selectedTile]);
	cost = {0:amount};
	if (!deductCost(cost)) {
		World.Sounds.tick1.play();
		return false;
	}
	$.post('./train.php', {x: UI.x, y: UI.y, amount: amount}, function(e) {
		console.log(e);
		Tiles[UI.selectedTile].lastHarvest = now;
		Tiles[UI.selectedTile].trainAmount = parseInt(amount);
		Tiles[UI.selectedTile].collected = false;
		updateTrainProgress();
	});
	return false;
});
$('#info-panel').on('click', '#collect-troops-button', function(e) {
	e.preventDefault();
	if (!trainingFinished(Tiles[UI.selectedTile]) || Tiles[UI.selectedTile].collected) {
		addMessage('Training not yet completed, or already deployed.');
		World.Sounds.tick1.play();
		return false;
	}
	if (custom.maxOccupancy(Tiles[UI.selectedTile]) < (Tiles[UI.selectedTile].unit ? Tiles[UI.selectedTile].unit.troops : 0) + Tiles[UI.selectedTile].trainAmount) {
		World.Sounds.tick1.play();
		addMessage('Too many troops for destination tile. ', '#f88');
	}

	$('#collect-troops-button').hide();
	let tileID = UI.x + ',' + UI.y;
	$.post('./deploytroops.php', {x: UI.x, y: UI.y}, function(e) {
		let data = JSON.parse(e);
		if (data.error) {
			addMessage('No troops being trained', '#f80');
		}
		if (data.numTroops) {
			addMessage('Troops on tile: ' + data.numTroops);
		}
		World.Sounds[randomArray(['unit1', 'unit2','unit3'])].play();
		//tileHtml(UI.selectedTile);
		if (Tiles[tileID].readyMesh) {
			Tiles[tileID].readyMesh.dispose();
			Tiles[tileID].readyMesh = null;
		}
		return;
/*		let amount = Tiles[UI.selectedTile].trainAmount;
		Tiles[UI.selectedTile].collected = true;
		if (Tiles[UI.selectedTile].unit) {
			Tiles[UI.selectedTile].unit.troops += parseInt(amount);
			addMessage('Unit count on tile increased to ' + Tiles[UI.selectedTile].unit.troops);
		} else {
			if (Tiles[UI.selectedTile].building == 8) {
				addUnit(amount, mapPosition(UI.x, UI.y), UI.selectedTile, Lamden.wallet);
			} else if (Tiles[UI.selectedTile].building == 9) {
				addTank(UI.x, UI.y, UI.selectedTile, Lamden.wallet);
			} else if (Tiles[UI.selectedTile].building == 12) {
				addShip(UI.x, UI.y, UI.selectedTile, Lamden.wallet);
			}
			addMessage('Unit count on tile ' + Tiles[UI.selectedTile].unit.troops);
		}
		updateUnitCount(amount);*/
	});
});

$('#info-panel').on('click', '#levelup-button', function(e) {
	let cost = World.buildingData[Tiles[UI.selectedTile].building].cost;
	cost = custom.levelUpCost(cost, Tiles[UI.selectedTile].level + 1);
	if (!deductCost(cost)) {
		World.Sounds.tick1.play();
		return false;
	}
	$.post('./levelup.php', {x: UI.x, y: UI.y, cost: cost}, function(e) {
		console.log(e);
		data = JSON.parse(e);
		if (data.error) {
			addMessage(data.error, '#f88');
			return;
		}
		World.Sounds.upgrade1.play();
		Tiles[UI.selectedTile].level++;
		tileHtml(UI.selectedTile);
	});
});
$('#info-panel').on('click', '#missile-button', function(e) {
	UI.launchMissile = true;
});

$('#info-panel').on('click', '#demolish-button', function(e) {
	if (!Tiles[UI.selectedTile].building) {
		addMessage('No building to demolish', '#f88');
		return false;
	}
	if (!confirm('Are you sure you want to demolish this ' + World.buildingData[Tiles[UI.selectedTile].building].name + '?')) {
		return false;
	}

	$.post('./delete.php', {x: UI.x, y: UI.y}, function() {
		console.log(e);
	});
});


function updateUnitCount(num) {
	Player.unitCount = parseInt(num);
	$('#unit-count').text(Player.unitCount);
}
function checkPlayerResource(id, amount) {
	if (amount <= 0) {
		return true;
	}
	if (!Player.Resources[id]) {
		return false;
	}
	return Player.Resources[id] >= amount;
}

// fixed: number of decimals to show
function formatNumber(num, fixed) {
	num = parseInt(num);
	if (!num) {
		return 0;
	}
	fixed = (!fixed || fixed < 0) ? 0 : fixed;
	var b = (num).toPrecision(2).split("e"), // get power
		k = b.length === 1 ? 0 : Math.floor(Math.min(b[1].slice(1), 14) / 3), // floor at decimals, ceiling at trillions
		c = k < 1 ? num.toFixed(0 + fixed) : (num / Math.pow(10, k * 3) ).toFixed(1 + fixed), // divide by power
		d = c < 0 ? c : Math.abs(c), // enforce -0 is 0
		e = d + ['', 'k', 'm', 'b', 't'][k]; // append power
	return e;
}
function changePlayerResource(id, amount) {
	if (amount < 0 && !Player.Resources[id] || Player.Resources[id] < -amount) {
		addMessage('Not enough ' + World.Resources[id].name, '#f88');
		//return;
	}
	if (!Player.Resources[id]) {
		Player.Resources[id] = amount;
	} else {
		Player.Resources[id] += amount;
	}
	if (!$('#r' + id)[0] && Player.Resources[id] > 0) {
		$('#resources').append('<li id="r' + id + '"><img src="icons/ingot.png" title="' + World.Resources[id].name + '"><span>' + formatNumber(Player.Resources[id]) + '</span></li>');
	}
	$('#r' + id + ' span').html(formatNumber(Player.Resources[id]));
	addMessage((amount > 0 ? '+' : '') + amount + ' ' + World.Resources[id].name, '#aaa');
}
function costHtml(cost) {
	let html = '';
	for (let c in cost) {
		html += '<img src="icons/ingot.png" style="width: 16px; height: 16px; ">';
		html += World.Resources[c].name + ': ' + cost[c] + ', ';
	}
	return html;
}
function checkCost(cost) {
	for (let i in cost) {
		if (!checkPlayerResource(i, cost[i])) {
			console.log(i, World.Resources[i]);
			addMessage('Not enough ' + World.Resources[i].name + ', required ' + cost[i], '#f88');
			return false;
		}
	}
	return true;
}
function deductCost(cost) {
	if (!checkCost(cost)) {
		addMessage('Not enough resources', '#f88');
		return false;
	}
	for (let i in cost) {
		changePlayerResource(i, -cost[i]);
	}
	return true;
}

function checkSettleLocation(tile) {
	for (let t in Tiles) {
		if (Tiles[t].building == 1 && World.offset_distance(tile, Tiles[t]) <= 5) {
			return false;
		}
	}
	return true;
}
$('#info-panel').on('click', '#settle-button', function(e) {
	if (!checkSettleLocation(Tiles[UI.selectedTile])) {
		addMessage('Location too close to other settlement; chose farther away. ', '#f88');
		World.Sounds.tick1.play();
		return false;
	}
	$.post('./settle.php', {x: UI.x, y: UI.y, owner: Lamden.wallet}, function(e) {
		console.log(e);
		var data = JSON.parse(e);
		addMessage('Settled at [' + data.x + ',' + data.y + ']');
		Lamden.getCapital();
	});
});
//$('#info-panel').on('click', '#colonize-button', function(e) {
// colonizes selected tile
function deleteHighlight() {
	meshTransformationData['HighlightTile'] = null;
	if (modelSPS['HighlightTile']) {
		modelSPS['HighlightTile'].dispose();
	}
	UI.availableTiles = [];
	UI.tool = null;
	if (UI.mesh) {
		UI.mesh.dispose();
		UI.mesh = null;
	}
	if (scene.getMaterialByName('Drag')) {
		scene.getMaterialByName('Drag').dispose();
	}

}
UI.availableTiles = [];
function colonizeMode() {
	deleteHighlight();
	UI.tool = 'colonize';
	UI.mesh = World.assets['Flag'].clone('Drag');
	for (var t in Tiles) {
		if (Tiles[t].owner == Lamden.wallet) {
			let neighbors = World.getAdjacentTiles(Tiles[t].x, Tiles[t].y);
			for (let n in neighbors) {
				if (!neighbors[n].owner) {
					UI.availableTiles.push(neighbors[n].x + ',' + neighbors[n].y);
					addModel(UI.tileHighlight, neighbors[n].pos.add(v(0,.1,0)), v(Math.PI/2,0,0), 1);
				}
			}
		}
	}
	updateSPSMeshes();
}
$('#colonize-button').click(colonizeMode);
function colonizeTile() {
	if (Tiles[UI.x + ',' + UI.y].owner) {
		addMessage('This tile is already owned', '#f88');
		World.Sounds.tick1.play();
		return false;
	} else if (!World.ownAdjacentTile(UI.x, UI.y)) {
		addMessage('You can only colonize tiles adjacent to tiles you already own', '#f88');
		World.Sounds.tick1.play();
		return false;
	} else if (Tiles[UI.x + ',' + UI.y].numTroops && Tiles[UI.x + ',' + UI.y].unit.owner != Lamden.wallet) {
		addMessage('Cannot colonize tiles with enemy troops', '#f88');
		World.Sounds.tick1.play();
		return false;
	}
	if (!deductCost({0:100})) {
		World.Sounds.tick1.play();
		return false;
	}
	World.Sounds.tick2.play();
	$.post('./buytile.php', {x: UI.x, y: UI.y, owner: Lamden.wallet}, function(e) {
		console.log(e);
		var data = JSON.parse(e);
		addMessage('Colonized [' + UI.x + ',' + UI.y + ']', '#ccc');
		beamEffect(Tiles[UI.selectedTile].pos.clone());
		//UI.tool = 'pan';
		//deleteHighlight();
		World.drawWorld(true);
	});
	return;
	Lamden.sendTx('buyTile', {x: UI.x, y: UI.y});
	return;
	Tiles[UI.selectedTile].owner = Lamden.wallet;
	addModel(UI.friendlyTerritory, Tiles[UI.selectedTile].pos.add(v(0,.09,0)), v(0,0,0), .22);
	tileHtml(UI.selectedTile);
	updateSPSMeshes();
	addMessage('Colonized [' + UI.selectedTile + ']', '#ccc');
}

$('#info-panel').on('click', '#fortify-button', function(e) {
	if (!deductCost({0:1000, 2:1000,4:1000})) {
		World.Sounds.tick1.play();
		return false;
	}
	tileHtml(UI.selectedTile);
	let tile = Tiles[UI.selectedTile];
	$.post('./fort.php', {x: UI.x, y: UI.y}, function() {
		tile.fortMesh = addFort(UI.x, UI.y, Lamden.wallet);
		tile.fortification = custom.fortHP();
		addMessage('Fort added');
		tileHtml(UI.selectedTile);
	});
});

/*$('#minimap').load(function() {
	$('#minimap').click(function(e) {
		let x = e.pageX - $('#minimap').offset().left;
		let y = e.pageY - $('#minimap').offset().top;
		console.log(x, y);
	});
});*/
$('#minimap').load(function(){

        var iframe = $('#minimap').contents();

        iframe.find('canvas').click(function(e) {
			let x = e.pageX - 512; // - $('#minimap').offset().left;
			let y = e.pageY - 512; // - $('#minimap').offset().top;
			console.log(x, y);
			camera.target.position = mapPosition(x, y).clone();
        });
});

$('#actions').on('mouseover', '#buildings a', function(e) {
	let id = $(e.target.parentNode).attr('data-id') || $(e.target).attr('data-id');
	let html = '<h3>' + World.buildingData[id].name + '</h3>'
	html += '<p>' + World.buildingData[id].description + '</p>'
	html += costHtml(World.buildingData[id].cost);
	$('#tooltip').css({left: e.pageX - 20, top: e.pageY - 100}).html(html).show();
});
$('#actions').on('click', '#buildings a', function(e) {
	let id = $(e.target.parentNode).attr('data-id') || $(e.target).attr('data-id');
	UI.building = id;
	// remove previous drag mesh
	deleteHighlight();

	// add new drag mesh
	UI.mesh = World.assets[World.buildingData[id].mesh].clone('Drag');
	UI.mesh.material = World.assets[World.buildingData[id].mesh].material.clone('Drag');
	UI.mesh.material.alpha = .8;
	if (scene.meshes.indexOf(UI.mesh) == -1) {
		scene.meshes.push(UI.mesh);
	}
});
$('#info-panel').on('mouseover', '#techs a', function(e) {
	let id = $(e.target.parentNode).attr('data-id') || $(e.target).attr('data-id');
	let html = '<h3>' + World.Technologies[id].name + '</h3>' + World.Technologies[id].description;
	$('#tooltip').css({right: e.pageX - 300, top: e.pageY}).html(html).show();
});
$('#info-panel').on('click', '#techs a', function(e) {
	let id = $(e.target.parentNode).attr('data-id') || $(e.target).attr('data-id');
	if (isResearching(Tiles[UI.selectedTile].building)) {
		addMessage('Already researching, wait until finished', '#f88');
		World.Sounds.tick1.play();
		return false;
	}
	let tech = World.Technologies[id];
	if (!deductCost(tech.cost)) {
		World.Sounds.tick1.play();
		return false;
	}
	tech.started = UI.now();
	tileHtml(UI.selectedTile);
	World.Sounds.tick2.play();
	$.post('./research.php', {owner: Lamden.wallet, id: id, cost: tech.cost}, function(e) {
		console.log(e);
		let data = JSON.parse(e);
		if (data.error) {
			addMessage(data.error, '#f88');
			return false;
		}
		tech.started = UI.now();
		addMessage('Started Research ' + tech.name, '#ccc');
		tileHtml(UI.selectedTile);
	});
});
// deprecated
$('#info-panel').on('click', '#create-units button', function(e) {
	let num = $(e.target).attr('data-num');
	if (Tiles[UI.selectedTile].unit && Tiles[UI.selectedTile].unit.troops > num) {
		addMessage('Too many to fit on tile', '#f88');
		return false;
	}
	if (!deductCost({0:num,1:num})) {
		return false;
	}
	if (Tiles[UI.selectedTile].unit) {
		Tiles[UI.selectedTile].unit.troops += parseInt(num);
	} else {
		addUnit(num, mapPosition(UI.x, UI.y), UI.selectedTile, Lamden.wallet);
	}
	updateUnitCount(num);
});
// deprecated
/*
$('#info-panel').on('click', '#create-tank button', function() {
	if (Tiles[UI.selectedTile].unit && Tiles[UI.selectedTile].unit.troops + 1000 > (techHasResearched(7) ? 2000 : 1000)) {
		addMessage('Tile full', '#f80');
		World.Sounds.tick1.play();
		return false;
	}
	if (!deductCost({0:10, 4:10})) {
		World.Sounds.tick1.play();
		return false;
	}
	if (Tiles[UI.selectedTile].unit) {
		Tiles[UI.selectedTile].unit.troops += 1000;
	} else {
		addTank(UI.x, UI.y, UI.selectedTile, Lamden.wallet);
	}
	updateUnitCount(1000);
});
$('#info-panel').on('click', '#create-ship button', function() {
	if (Tiles[UI.selectedTile].unit) {
		addMessage('Tile full', '#f80');
		return false;
	}
	if (!deductCost({0:10, 4:10})) {
		return false;
	}
	addShip(UI.x, UI.y, UI.selectedTile, Lamden.wallet);
	updateUnitCount(1000);
});
*/
function addMessage(message, c) {
	c = c || '#fff';
	$('#chat-panel ul').append('<li style="color: ' + c + '">' + message + '</li>');
	$('#loading-screen p').html(message);
	$("#chat-panel ul").scrollTop($("#chat-panel ul")[0].scrollHeight);
}
$('#chat-panel form').submit(function(e) {
	e.preventDefault();
	if (!$('#chat-panel input[name=body]').val()) {
		return;
	}
	$.post('./chat.php', {player: Lamden.wallet, body: $('#chat-panel input[name=body]').val()}, function(e) {
		$('#chat-panel input[name=body]').val('');
	});
	return false;
});
$.get('./chat.php?lastid', function(e) {
	console.log(e);
	UI.lastChatID = parseInt(e) || 0;
	window.setInterval(function() {
		$.get('chat.php?id=' + UI.lastChatID, function(e) {
//			console.log(e);
			let data = JSON.parse(e);
			for (let i in data) {
				var d = new Date(data[i].stamp * 1000);
				var h = d.getHours();
				var m = d.getMinutes();
				if (m < 10) {
					m = '0' + m;
				}
				if (h > 12) {
					var date = (h - 12) + ':' + m + ' PM';
				} else if (h == 0) {
					var date = 12 + ':' + m + ' AM';
				} else {
					var date = h + ':' + m + ' AM';
				}
				addMessage('[' + date + '] ' + data[i].name + ': ' + data[i].body);
				if (data[i].id > UI.lastChatID) {
					UI.lastChatID = data[i].id;
				}
			}
		});
	}, 1000);
});

function checkTerritory() {
	for (let t in Player.territory) {
		let tile = Player.territory[t];
		let ready = false;
		if (conversionFinished(tile)) {
			ready = 'true';
		} else if (trainingFinished(tile)) {
			ready = 'true';
		} else if (mineFinished(tile)) {
			ready = 'true';
		}
		if (ready && !tile.readyMesh) {
			tile.readyMesh = World.assets['Lamden Logo'].clone('Logo');
			tile.readyMesh.position = tile.pos.add(v(0,10,0));
			tile.readyMesh.rotation.y = Math.random() * 3.14;
			tile.readyMesh.registerBeforeRender(function() {
				tile.readyMesh.rotation.y += 3 / engine.fps;
				tile.readyMesh.position.y = 10 + Math.sin(tile.readyMesh.rotation.y);
			});
		} else if (!ready && tile.readyMesh) {
			tile.readyMesh.dispose();
			tile.readyMesh = null;
		}
	}
}
window.setInterval(checkTerritory, 5000);

// a and b are vector2s  with x and y properties
// not usable on hex grid
function findPath(a, b) {
	let delta = a.subtract(b);
	let direction = v(a.x < b.x ? 1 : -1, a.y < b.y ? 1 : -1);
	if (!delta.length()) {
		return [];
	}
	let path = [];
	let failsafe = 0;
	if (Math.abs(delta.x) > Math.abs(delta.y)) {
		for (let i = a.x; i != b.x; i += direction.x) {
			path.push(v(i, a.y));
		}
		for (let i = a.y; i != b.y; i += direction.y) {
			path.push(v(b.x, i));
		}
	} else {
		for (let i = a.y; i != b.y; i += direction.y) {
			path.push(v(a.x, i));
		}
		for (let i = a.x; i != b.x; i += direction.x) {
			path.push(v(i, b.y));
		}
	}
	path.push(b.clone());
	return path;
}
UI.path = {};
function renderPath(path) {
	if (!path.length) {
		return;
	}

	path2 = [];
	for (let i in path) {
		path2[i] = Tiles[path[i]].pos.add(v(0,1,0));
	}

	let curve = BABYLON.Curve3.CreateCatmullRomSpline(path2, 3);
	UI.path = BABYLON.Mesh.ExtrudeShape('Path', [v(.3,0,0), v(-.3,0,0)], curve._points, 1, 0, 0, scene);
	UI.path.tiles = path;
}


// a and b are tiles, a must have a unit on it.
function pathFinding(a, b) {
	let current = a.x + ',' + a.y; // ;
	let naval = Tiles[current].type == 'water';
	let owner = Tiles[current].unit.owner;
	let open = {};
	open[current] = {x: a.x, y: b.y, travelled: 0, distance: World.offset_distance(a, b), last: 'start'};
	let done = {};
	let lowest = [null, 99999];

	var i = 0;
	while (current != b.x + ',' + b.y) {
		i++;
		// get adjacent nodes
		let x = Tiles[current].x;
		let y = Tiles[current].y;
		let neighbors = World.getAdjacentTiles(x, y);
		for (let n in neighbors) {
			let id = neighbors[n].x + ',' + neighbors[n].y;
			let isEnemy = Tiles[id].owner && Tiles[id].owner != owner;
			let isPassable = (naval && Tiles[id].type == 'water') || (!naval && Tiles[id].type != 'water');
			let isDestination = id == (b.x + ',' + b.y);
			// avoid enemy territory, only destination tile on enemy territory allowed (ie. you can only attack the edge of enemy territory)
			if (!open[id] && !done[id] && isPassable && (!isEnemy || isDestination)) {
				open[id] = {x: neighbors[n].x, y: neighbors[n].y, travelled: open[current].travelled + 1, distance: open[current].travelled + World.offset_distance(neighbors[n], b), last: current};
			}
		}
		// move current to done
		done[current] = open[current];
		delete open[current];

		// get nearest adjacent node
		for (let o in open) {
			if (open[o].distance < lowest[1]) {
				lowest = [o, open[o].distance];
			}
		}

		// if dead end, find next nearestnode
		if (lowest[0] == current) {
			if (!done[current]) {
				delete open[current];
				done[current] = null;
			}
			lowest = [null, 99999];
			for (let o in open) {
				if (open[o].distance < lowest[1]) {
					lowest = [o, open[o].distance];
				}
			}
		}

		// travel
		current = lowest[0];

		// no path
		if (current == null && Object.keys(open).length == 0) {
			return false;
		}
		if (i > 400) { // if cannot find
			break;
		}
	}

	// build path
	path = [(b.x + ',' + b.y)];
	current = lowest[0];
	if (current != path[0]) {
		return [];
	}
	var i = 0;
	while (current != a.x + ',' + a.y && current != 'start') {
		i++;
		active = current;
		if (done[current]) {
			current = done[current].last;
		} else {
			current = open[current].last;
		}
		path.push(current);
		if (i > 50) {
			break;
		}
	}
	return path;
}