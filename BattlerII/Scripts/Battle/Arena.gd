extends Node2D

const COLS = 8
const ROWS = 7
const TILE_SIZE = 80
const OFFSET_X = (1152 - (COLS * TILE_SIZE)) / 2
const OFFSET_Y = (648 - (ROWS * TILE_SIZE)) / 2

@onready var turn_label = $UI/TurnLabel
var background_texture = preload("res://Assets/Art/desert_bg.jpg")

var my_chars = []
var enemy_chars = []
var character_scene = preload("res://Scenes/Battle/BattleCharacter.tscn")

var current_turn = 1        # 1 = host's turn, 2 = guest's turn
var selected_char = null
var actions_left = 3
var acted_chars = []

# ── Sync state ──────────────────────────────────────────────────────────────
var last_seen_action_id = ""   # prevents replaying the same action
var is_animating = false
var action_queue = []
var poll_timer: Timer

# ──────────────────────────────────────────────────────────────────────────────
func _ready():
	_spawn_teams()
	_apply_spells()
	_update_turn_ui()
	_setup_realtime()
	_start_poll_timer()

# ── Spawning ─────────────────────────────────────────────────────────────────
func _spawn_teams():
	var m_chars = Global.my_roster.get("characters", [])
	var e_chars = Global.enemy_roster.get("characters", [])
	
	# Spawn My Team (Always Left: cols 0, 1)
	for i in range(m_chars.size()):
		var c = character_scene.instantiate()
		add_child(c)
		c.setup(m_chars[i], false, 0, i * 2 + 1)
		c.position = grid_to_pixel(c.grid_x, c.grid_y)
		my_chars.append(c)
		
	# Spawn Enemy Team (Always Right: cols 6, 7)
	for i in range(e_chars.size()):
		var c = character_scene.instantiate()
		add_child(c)
		c.setup(e_chars[i], true, COLS - 1, i * 2 + 1)
		c.position = grid_to_pixel(c.grid_x, c.grid_y)
		enemy_chars.append(c)

# ── Spells ───────────────────────────────────────────────────────────────────
func _apply_spells():
	var my_spell = Global.my_roster.get("spell", "")
	var enemy_spell = Global.enemy_roster.get("spell", "")

	if "Fireball" in my_spell:
		for c in enemy_chars.duplicate():
			c.take_damage(int(c.max_hp * 0.10))
			_check_death(c)
	elif "Heal" in my_spell:
		for c in my_chars:
			c.heal(int(c.max_hp * 0.10))

	if "Fireball" in enemy_spell:
		for c in my_chars.duplicate():
			c.take_damage(int(c.max_hp * 0.10))
			_check_death(c)
	elif "Heal" in enemy_spell:
		for c in enemy_chars:
			c.heal(int(c.max_hp * 0.10))

# ── Grid helpers ──────────────────────────────────────────────────────────────
func grid_to_pixel(x: int, y: int) -> Vector2:
	return Vector2(OFFSET_X + (x * TILE_SIZE) + (TILE_SIZE / 2), OFFSET_Y + (y * TILE_SIZE) + (TILE_SIZE / 2))

func pixel_to_grid(px: float, py: float) -> Vector2:
	var gx = floor((px - OFFSET_X) / TILE_SIZE)
	var gy = floor((py - OFFSET_Y) / TILE_SIZE)
	return Vector2(gx, gy)

# ── Drawing ───────────────────────────────────────────────────────────────────
func _draw():
	if background_texture:
		draw_texture_rect(background_texture, Rect2(0, 0, 1152, 648), false)
	else:
		draw_rect(Rect2(0, 0, 1152, 648), Color(0.85, 0.77, 0.55))

	for x in range(COLS + 1):
		draw_line(Vector2(OFFSET_X + x * TILE_SIZE, OFFSET_Y), Vector2(OFFSET_X + x * TILE_SIZE, OFFSET_Y + ROWS * TILE_SIZE), Color(1, 1, 1, 0.5), 2.0)
	for y in range(ROWS + 1):
		draw_line(Vector2(OFFSET_X, OFFSET_Y + y * TILE_SIZE), Vector2(OFFSET_X + COLS * TILE_SIZE, OFFSET_Y + y * TILE_SIZE), Color(1, 1, 1, 0.5), 2.0)

	if selected_char:
		for x in range(COLS):
			for y in range(ROWS):
				var dx = abs(x - selected_char.grid_x)
				var dy = abs(y - selected_char.grid_y)
				if dx <= 2 and dy <= 2 and not (dx == 0 and dy == 0):
					var px = grid_to_pixel(x, y)
					draw_rect(Rect2(px.x - TILE_SIZE/2, px.y - TILE_SIZE/2, TILE_SIZE, TILE_SIZE), Color(1, 1, 0, 0.2))

# ── Input ─────────────────────────────────────────────────────────────────────
func _input(event):
	if event is InputEventMouseButton and event.pressed and event.button_index == MOUSE_BUTTON_LEFT:
		var grid_pos = pixel_to_grid(event.position.x, event.position.y)
		var gx = int(grid_pos.x)
		var gy = int(grid_pos.y)

		if gx < 0 or gx >= COLS or gy < 0 or gy >= ROWS:
			return

		var clicked_char = _get_char_at(gx, gy)

		# Turn check: host acts on turn 1, guest acts on turn 2
		var is_my_turn = (Global.is_host and current_turn == 1) or (not Global.is_host and current_turn == 2)
		if not is_my_turn:
			return

		if clicked_char and not clicked_char.is_enemy:
			if selected_char: selected_char.set_highlight(false)
			selected_char = clicked_char
			selected_char.set_highlight(true)
			if selected_char in acted_chars:
				_show_floating_text("Already Acted!", selected_char.position, Color(1, 0, 0))
			queue_redraw()
		elif selected_char:
			if selected_char in acted_chars:
				selected_char.set_highlight(false)
				selected_char = null
				queue_redraw()
				return

			var dx = abs(gx - selected_char.grid_x)
			var dy = abs(gy - selected_char.grid_y)

			if clicked_char and clicked_char.is_enemy:
				if dx <= 1 and dy <= 1:
					_perform_attack(selected_char, clicked_char)
				else:
					_show_floating_text("Out of Range!", event.position, Color(1, 0, 0))
					return
			elif clicked_char == null:
				if dx <= 2 and dy <= 2:
					_perform_move(selected_char, gx, gy)
				else:
					_show_floating_text("Too Far!", event.position, Color(1, 0, 0))
					return

			if selected_char:
				selected_char.set_highlight(false)
				selected_char = null
			queue_redraw()

# ── Floating text ──────────────────────────────────────────────────────────────
func _show_floating_text(txt: String, pos: Vector2, color: Color):
	var lbl = Label.new()
	lbl.text = txt
	lbl.add_theme_color_override("font_color", color)
	lbl.add_theme_font_size_override("font_size", 32)
	lbl.position = pos + Vector2(-50, -50)
	add_child(lbl)
	var tween = get_tree().create_tween()
	tween.tween_property(lbl, "position", lbl.position + Vector2(0, -50), 1.0)
	tween.parallel().tween_property(lbl, "modulate:a", 0.0, 1.0)
	tween.tween_callback(lbl.queue_free)

func _get_char_at(gx: int, gy: int):
	for c in my_chars + enemy_chars:
		if is_instance_valid(c) and c.grid_x == gx and c.grid_y == gy:
			return c
	return null

# ── Actions ───────────────────────────────────────────────────────────────────
func _perform_move(char_node, target_x: int, target_y: int):
	char_node.grid_x = target_x
	char_node.grid_y = target_y
	var tween = get_tree().create_tween()
	tween.tween_property(char_node, "position", grid_to_pixel(target_x, target_y), 0.3)
	_broadcast_action({ "type": "move", "char": char_node.char_data["name"], "x": target_x, "y": target_y }, char_node)

func _perform_attack(atk_node, def_node):
	var damage = atk_node.char_data["damage"]
	def_node.take_damage(damage)
	_check_death(def_node)
	_broadcast_action({ "type": "attack", "atk": atk_node.char_data["name"], "def": def_node.char_data["name"], "damage": damage }, atk_node)

# ── Death / battle end ────────────────────────────────────────────────────────
func _check_death(c):
	if not is_instance_valid(c): return
	if c.current_hp <= 0:
		if c.is_enemy: enemy_chars.erase(c)
		else: my_chars.erase(c)
		if c in acted_chars: acted_chars.erase(c)
		var t = get_tree().create_tween()
		t.tween_property(c, "modulate:a", 0.0, 0.2)
		t.tween_callback(c.queue_free)
		_check_battle_end()

func _check_battle_end():
	if my_chars.size() == 0:
		Global.battle_result = "DEFEAT"
		_go_to_end_screen()
	elif enemy_chars.size() == 0:
		Global.battle_result = "VICTORY"
		_go_to_end_screen()

func _go_to_end_screen():
	await get_tree().create_timer(1.0).timeout
	get_tree().change_scene_to_file("res://Scenes/Lobby/EndScreen.tscn")

# ── Broadcast ─────────────────────────────────────────────────────────────────
# Both clients share the same coordinate space. grid_x is canonical for all chars.
# host_chars = host's characters, guest_chars = guest's characters.
func _broadcast_action(payload, char_node):
	acted_chars.append(char_node)
	actions_left -= 1
	char_node.sprite.modulate = Color(0.3, 0.3, 0.3)

	# The x in payload is already canonical (grid_x is shared between both clients)

	payload["turn"] = current_turn
	payload["action_id"] = str(Time.get_ticks_msec()) + "_" + str(randi() % 100000)

	# End of turn?
	var turn_ended = actions_left <= 0 or acted_chars.size() >= my_chars.size()
	payload["turn_ended"] = turn_ended

	if turn_ended:
		current_turn = 2 if current_turn == 1 else 1
		actions_left = 3
		acted_chars.clear()
		_reset_all_char_colors()

	_update_turn_ui()

	var q = SupabaseQuery.new().from("lobbies").update({"last_action": payload}).eq("id", Global.current_lobby_id)
	Supabase.database.query(q)

func _reset_all_char_colors():
	for c in my_chars + enemy_chars:
		if not is_instance_valid(c): continue
		c.sprite.modulate = Color(1, 0.4, 0.4) if c.is_enemy else Color(0.4, 0.6, 1)

# ── Realtime ──────────────────────────────────────────────────────────────────
func _setup_realtime():
	if Global.realtime_channel == null:
		return
	var channel = Global.realtime_channel.channel("public", "lobbies", "id=eq." + Global.current_lobby_id)
	if channel == null:
		return
	# Connect the arena's handler. Disconnect any stale lobby handler first.
	if channel.update.is_connected(_on_lobby_update):
		channel.update.disconnect(_on_lobby_update)
	channel.on("update", _on_lobby_update)
	# Ensure the channel is subscribed (it may already be from Lobby.gd)
	if not channel.subscribed:
		channel.subscribe()

func _on_lobby_update(_old, new_record, _channel):
	var action = new_record.get("last_action", {})
	if typeof(action) != TYPE_DICTIONARY or action.size() == 0:
		return

	var action_id = str(action.get("action_id", ""))
	if action_id == "" or action_id == last_seen_action_id:
		return
	last_seen_action_id = action_id

	var action_turn = int(action.get("turn", 0))
	# Only process the opponent's actions
	var is_opponents_action = (Global.is_host and action_turn == 2) or (not Global.is_host and action_turn == 1)
	if not is_opponents_action:
		return

	action_queue.append(action)

# ── Process / animation queue ─────────────────────────────────────────────────
func _process(_delta):
	if action_queue.size() > 0 and not is_animating:
		_process_next_action()

func _process_next_action():
	is_animating = true
	var action = action_queue.pop_front()
	var type = action.get("type", "")

	if type == "move":
		var character_name = action.get("char", "")
		var target_x = (COLS - 1) - int(action.get("x", 0))
		var target_y = int(action.get("y", 0))
		for c in enemy_chars:
			if not is_instance_valid(c): continue
			if c.char_data["name"] == character_name:
				c.grid_x = target_x
				c.grid_y = target_y
				var tween = get_tree().create_tween()
				tween.tween_property(c, "position", grid_to_pixel(target_x, target_y), 0.3)
				c.sprite.modulate = Color(0.3, 0.3, 0.3)
				break

	elif type == "attack":
		var defender_name = action.get("def", "")
		var attacker_name = action.get("atk", "")
		var damage = int(action.get("damage", 0))
		for c in enemy_chars:
			if not is_instance_valid(c): continue
			if c.char_data["name"] == attacker_name:
				c.sprite.modulate = Color(0.3, 0.3, 0.3)
				break
		for c in my_chars:
			if not is_instance_valid(c): continue
			if c.char_data["name"] == defender_name:
				c.take_damage(damage)
				_check_death(c)
				break

	if action.get("turn_ended", false):
		var act_turn = int(action.get("turn", 1))
		current_turn = 2 if act_turn == 1 else 1
		actions_left = 3
		acted_chars.clear()
		_reset_all_char_colors()

	_update_turn_ui()
	await get_tree().create_timer(0.4).timeout
	is_animating = false

# ── Polling fallback ───────────────────────────────────────────────────────────
func _start_poll_timer():
	poll_timer = Timer.new()
	poll_timer.wait_time = 3.0
	poll_timer.autostart = true
	poll_timer.timeout.connect(_on_poll_timer)
	add_child(poll_timer)

func _on_poll_timer():
	if Global.current_lobby_id == "": return
	if is_animating or action_queue.size() > 0: return

	var q = SupabaseQuery.new().from("lobbies").select(["last_action"]).eq("id", Global.current_lobby_id)
	var task = Supabase.database.query(q)
	await task.completed
	if task.error != null or task.data == null or task.data.size() == 0: return

	var row = task.data[0]

	# Check if there's an unprocessed action for us
	var action = row.get("last_action", {})
	if typeof(action) == TYPE_DICTIONARY and action.size() > 0:
		var action_id = str(action.get("action_id", ""))
		var action_turn = int(action.get("turn", 0))
		var is_opponents_action = (Global.is_host and action_turn == 2) or (not Global.is_host and action_turn == 1)
		if action_id != "" and action_id != last_seen_action_id and is_opponents_action:
			last_seen_action_id = action_id
			action_queue.append(action)
			return  # Let the queue process it naturally



# ── Turn UI ───────────────────────────────────────────────────────────────────
func _update_turn_ui():
	if not is_instance_valid(turn_label): return

	if current_turn == 1:
		var name = Global.my_roster.get("name", "Team Alpha") if Global.is_host else Global.enemy_roster.get("name", "Team Alpha")
		turn_label.text = name + "'s Turn"
		turn_label.add_theme_color_override("font_color", Color(0.4, 0.6, 1) if Global.is_host else Color(1, 0.4, 0.4))
	else:
		var name = Global.enemy_roster.get("name", "Team Beta") if Global.is_host else Global.my_roster.get("name", "Team Beta")
		turn_label.text = name + "'s Turn"
		turn_label.add_theme_color_override("font_color", Color(1, 0.4, 0.4) if Global.is_host else Color(0.4, 0.6, 1))
