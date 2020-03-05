

# [generates, generateSpeed]
buildingData = Hash()
buildingCost = Hash()

# [name, x, y]
players = Hash()
# [type, owner, buildingID, lastHarvest, troopOwner, numTroops]
tiles = Hash()
tileChanges = Hash()

playerResources = Hash()

@construct
def constructor():
	tileChanges['0'] = ''
	tiles['asdf'] = 25
	tiles['asd','asd'] = 35

@export
def addPlayer(name, x, y):
	assert players[ctx.caller] is None, "Player already spawned"
	players[ctx.caller] = [name, x, y]
	buyTile(x, y)
	build(x, y, 1)
	changeResource(ctx.caller,0,1000);
	changeResource(ctx.caller,1,500);
	changeResource(ctx.caller,2,500);
	changeResource(ctx.caller,3,500);

@export
def setBuildingData(b_id, generates, generateSpeed, cost):
	buildingData[b_id] = [generates, generateSpeed]
	buildingCost[b_id] = cost

def rID(player, r_id):
	return '' + player + ',' + r_id

@export
def checkResource(player, r_id, amount):
	if playerResources[rID(player, r_id)] is None:
		return False
	return  playerResources[rID(player, r_id)] >= amount

@export // make private later
def changeResource(player, r_id, amount):
	amount = int(amount)
	if amount < 0:
		assert checkResource(player, r_id, -amount), "Not enough of resource id " + str(r_id)
	if playerResources[rID(player, r_id)] is None:
		playerResources[rID(player, r_id)] = amount
	else:
		playerResources[rID(player, r_id)] += amount

def tileID(x, y):
	return '' + x + ',' + y

@export
def buyTile(x, y):
	assert tiles[tileID(x, y)] is None, "Tile already taken"
	tiles[tileID(x, y)] = [1, ctx.caller, 0, now, '', 0]
	tileChanges['0'] = tileChanges['0'] + ',' + tileID(x, y)

# private	
def conquerTile(x, y, player):
	assert tiles[str(x + ',' +  y)], "Tile uncolonized"
	assert tiles[x, y][1] == player, "Tile already owned by caller"
	tiles[x, y][1] = player

@export
def build(x, y, b_id):
	assert tiles[tileID(x, y)], "Tile uncolonized"
	assert tiles[tileID(x, y)][1] == ctx.caller, "Tile not owned by caller"
	# no need to check current building type, replacing an existing building is OK
	tiles[tileID(x, y)][2] = int(b_id)
	tiles[tileID(x, y)][3] = now

@export
def harvest(x, y):
	assert tiles[x, y], "Tile uncolonized"
	assert tiles[x, y][1] == ctx.caller, "Tile not owned by caller"
	#id = tiles[x, y][2]
	#data = buildingData[b_id]
	#resource = data[0]
	elapsed = now - tiles[x, y][3]
	return elapsed.mktime();
