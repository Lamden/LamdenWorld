custom = {
	// how many units can fit on <tile> depending on research and if a fort is present
	// only accurate for active player
	maxOccupancy(tile) {
		let value = 5000;
		if (techHasResearched(7)) {
			value += 2000;
		}
		if (techHasResearched(16)) {
			value += 4000;
		}
		if (tile.owner == Lamden.wallet && tile.building == 15) { // bunker
			value += 10000;
		}
		return value;
	},

	// calculates move distance for #units
	moveDistance(num) {
		let value = clamp(10 - num / 1000, 0, 10);
		value += techHasResearched(8) ? 1 : 0;
		return Math.ceil(value);
	},
	attackDistance() {
		return 3 + (techHasResearched(8) ? 1 : 0);
	},

	// cost to place fortifications on a tile
	fortCost() {
		return {0: 2000};
	},

	// fortification hp
	fortHP() {
		return 2000 * (techHasResearched(10) ? 1.3 : 1);
	},
	// building hp
	buildingHP(tile) {
		if (!tile.building) {
			return 0;
		}
		if (!World.buildingData[tile.building]) {
			return 1;
		}
		let hp = World.buildingData[tile.building].hp;
		hp *= techHasResearched(18) ? 2 : 1;
		return hp;
	},

	// takes the base cost to build a building, returns the cost to level said building up to level <level>
	// level 1 should return base cost
	levelUpCost(baseCost, level) {
		let cost = {};
		for (let c in baseCost) {
			//cost[c] = baseCost[c] * Math.pow(2, level - 1);
			cost[c] = baseCost[c] * level;
		}
		return cost;
	},

	trainMultipliers: {
		8: 1,
		9: 5,
		12: 5
	},
	// how many units can be trained per minute at barracks
	trainRate(tile) {
		return Math.round(Math.sqrt(tile.level) * 100 * Math.ceil(this.trainMultipliers[tile.building] / 3));
	},

	// how many units can be trained at once at barracks
	trainCapacity(tile) {
		return tile.level * 100 * this.trainMultipliers[tile.building];
	},

	// returns duration in seconds to train barracks to capacity
	trainDuration(tile) {
		let secondRate = this.trainRate(tile) / 60; // rate per second
		return Math.round(this.trainCapacity(tile) / secondRate);
	},

	// the cost multiplier for each unit
	trainCostMultiplier(tile) {
		return Math.round(clamp(1 - Math.sqrt(tile.level) / 20, .4, 1) * 100) / 100;
	},

	// returns cost to train barracks to capacity
	trainCost(level) {
		return {0: this.trainCapacity(level) * this.trainCostMultiplier(level)};
	},

	// capacity for a mine/oilwell
	mineCapacity(tile) {
		let base = tile.level * 1000 * (techHasResearched(20) ? 2 : 1);
		if ([1,7].indexOf(tile.building) > -1 && techHasResearched(21)) {
			base *= 2;
		}
		return base;
	},

	// yield speed
	yieldMultiplier(tile) {
		let resource = World.buildingData[tile.building].produces
		let tileMultiplier = World.tileTypes[tile.type].yield[resource];
		let buildingMultiplier = World.buildingData[tile.building].productionSpeed;
		let speed = tile.level * tileMultiplier * buildingMultiplier;
		if (techHasResearched(12)) {
			speed *= 1.1;
		}
		if ([1,7].indexOf(tile.building) > -1 && techHasResearched(21)) {
			speed *= 2;
		}
		return speed;
	},

	// yield for a mine
	calcYield(tile) {
		let now = UI.now();
		//let lastHarvest = tile.lastHarvest || now;
		let resource = World.buildingData[tile.building].produces;
		if (resource === undefined) {
			console.log(tile, resource);
			return 0;
		}
		let lastHarvest = Player.lastHarvest[resource];
		let elapsed = now - lastHarvest;
		let capacity = this.mineCapacity(tile);
		let amount = elapsed * this.yieldMultiplier(tile);
		if (amount > capacity) { // clamp yield to capacity if exceeds
			amount = capacity;
		}
		return amount;
	},

	// returns max number of resources that can be refiend in one batch
	refineryCapacity(level) {
		return level * 5000;
	},

	// returns duration to refine <amount> resources in seconds
	refineryDuration(level, amount) {
		amount = amount || this.refineryCapacity(level);
		return Math.ceil(amount / this.refinerySpeed(level));
	},

	// returns number of resources that can be refined per second
	refinerySpeed(level) {
		return level * 3;
		return Math.round(Math.sqrt(level) * 10) / 10;
	},

	// calculates amoumt of damage <num> troops do when attacking, taking into account <player> data object.
	// mainly adds damage modifiers from techs
	unitDamage(num, player) {
		let damage = num;
		if (hasTechResearched(5)) {
			damage *= 1.1;
		}
		return damage;
	},

	// calculates amount of damage <num> units belonging to <player> object will take,
	// regardless of whether it is fatal or not
	// mainly calculates armor bonus techs that reduce damage taken.
	unitDamageTaken(damage, player) {
		if (techHasResearched(6)) {
			damage *= .9;
		}
		return damage;
	},

	// cost to launch a missile with potential power of <power>
	missileCost(power) {
		return {0:10000, 17: parseInt(power) + 1000};
	},

	// damage of missile with potential power of <power>
	missileDamage(power) {
		return Math.random() * power;
	}
}