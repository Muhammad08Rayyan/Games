extends Node

enum GamePhase { DRAFT, PLACEMENT, BATTLE, GAME_OVER }
var current_phase = GamePhase.DRAFT

var player_roster = [] 
var enemy_roster = []

var player_units = [] 
var enemy_units = []

var active_spell = 0
var fire_ticks = 0
var fire_timer = 0.0

@onready var units_container = $"../Units"
var unit_scene = preload("res://scenes/Unit.tscn")

func _ready():
	randomize()
	start_draft_phase()

func start_draft_phase():
	current_phase = GamePhase.DRAFT
	var draft = load("res://scenes/DraftUI.tscn").instantiate()
	add_child(draft)

func transition_to_placement(selected_ids: Array, spell_id: int = 0):
	player_roster = selected_ids
	active_spell = spell_id
	
	var available = [0, 1, 2, 3, 4, 5, 6, 7]
	available.shuffle()
	enemy_roster = available.slice(0, 5)
	
	current_phase = GamePhase.PLACEMENT
	
	spawn_units()
	
	var fight_btn = $"../BattleUI/Control/MarginContainer/FightButton"
	fight_btn.show()
	if not fight_btn.pressed.is_connected(start_battle_phase):
		fight_btn.pressed.connect(start_battle_phase)
		
	var exit_btn = $"../BattleUI/Control/MarginContainer/ExitButton"
	if not exit_btn.pressed.is_connected(restart_game):
		exit_btn.pressed.connect(restart_game)

func restart_game():
	get_tree().reload_current_scene()

func spawn_units():
	for i in range(player_roster.size()):
		var u = unit_scene.instantiate()
		u.team = 0
		u.position = Vector2(300, 100 + i * 100)
		units_container.add_child(u)
		u.set_character(player_roster[i])
		player_units.append(u)
		
	for i in range(enemy_roster.size()):
		var u = unit_scene.instantiate()
		u.team = 1
		u.position = Vector2(850, 100 + i * 100)
		units_container.add_child(u)
		u.set_character(enemy_roster[i])
		enemy_units.append(u)

func start_battle_phase():
	current_phase = GamePhase.BATTLE
	$"../BattleUI/Control/MarginContainer/FightButton".hide()
	
	if active_spell == 1 or active_spell == 2:
		var effect = ColorRect.new()
		effect.position = Vector2(576, 0)
		effect.size = Vector2(576, 648)
		effect.mouse_filter = Control.MOUSE_FILTER_IGNORE
		get_parent().add_child(effect)
		get_parent().move_child(effect, 1) # Put it right above background
		
		if active_spell == 1:
			effect.color = Color(1.0, 0.2, 0.0, 0.4)
			for u in enemy_units:
				if is_instance_valid(u):
					u.take_damage(40)
			var t = get_tree().create_timer(1.0)
			t.timeout.connect(effect.queue_free)
		elif active_spell == 2:
			effect.color = Color(0.2, 0.5, 1.0, 0.4)
			for u in enemy_units:
				if is_instance_valid(u):
					u.frozen = true
					u.modulate = Color(0.5, 0.5, 1.0)
			var t = get_tree().create_timer(2.0)
			t.timeout.connect(func():
				if is_instance_valid(effect): effect.queue_free()
				unfreeze_enemies()
			)

func unfreeze_enemies():
	for u in enemy_units:
		if is_instance_valid(u):
			u.frozen = false
			u.modulate = Color(1.0, 1.0, 1.0)

func _input(event):
	if current_phase == GamePhase.PLACEMENT:
		if event is InputEventKey and event.pressed and event.keycode == KEY_SPACE:
			start_battle_phase()

func _process(_delta):
	if current_phase == GamePhase.BATTLE:
		check_win_condition()

func check_win_condition():
	var player_alive = false
	for u in player_units:
		if is_instance_valid(u) and u.current_state != u.State.DEAD:
			player_alive = true
			break
			
	var enemy_alive = false
	for u in enemy_units:
		if is_instance_valid(u) and u.current_state != u.State.DEAD:
			enemy_alive = true
			break
			
	if not player_alive or not enemy_alive:
		current_phase = GamePhase.GAME_OVER
		$"../BattleUI/Control/MarginContainer/ExitButton".show()
