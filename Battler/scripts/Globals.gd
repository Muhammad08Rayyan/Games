extends Node

var chars = {
	0: {"name": "Knight", "hp": 200, "dmg": 10, "spd": 80, "range": 50, "cost": 3, "desc": "High HP Tank. Absorbs damage for the team."},
	1: {"name": "Paladin", "hp": 150, "dmg": 15, "spd": 90, "range": 50, "cost": 3, "desc": "Balanced melee fighter with solid defense."},
	2: {"name": "Thief", "hp": 80, "dmg": 35, "spd": 160, "range": 50, "cost": 3, "desc": "Glass cannon. Extremely fast and deadly."},
	3: {"name": "Brawler", "hp": 120, "dmg": 20, "spd": 110, "range": 50, "cost": 2, "desc": "Cheap aggressive melee unit."},
	4: {"name": "Ranger", "hp": 100, "dmg": 22, "spd": 100, "range": 200, "cost": 3, "desc": "Consistent ranged attacker."},
	5: {"name": "Mage", "hp": 80, "dmg": 45, "spd": 90, "range": 180, "cost": 4, "desc": "Expensive, high-damage ranged nuker."},
	6: {"name": "Priest", "hp": 90, "dmg": 12, "spd": 95, "range": 150, "cost": 2, "desc": "Cheap ranged support unit."},
	7: {"name": "Dark Knight", "hp": 250, "dmg": 30, "spd": 60, "range": 60, "cost": 5, "desc": "Unstoppable boss-tier melee combatant."}
}

var spells = {
	0: {"name": "None", "cost": 0, "desc": "No spell selected."},
	1: {"name": "Fire", "cost": 4, "desc": "Engulfs enemy turf in flames, dealing 40 instant damage."},
	2: {"name": "Freeze", "cost": 3, "desc": "Freezes all enemies solid for 2 seconds at battle start."}
}
