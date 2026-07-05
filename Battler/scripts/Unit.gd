extends CharacterBody2D

enum State { IDLE, CHASE, ATTACK, DEAD }
var current_state = State.IDLE

@export var max_health: float = 100.0
@export var damage: float = 20.0
@export var attack_range: float = 50.0
@export var move_speed: float = 100.0
@export var attack_speed: float = 1.0

var current_health: float
var target: CharacterBody2D = null
var attack_timer: float = 0.0
var can_attack: bool = true
var team: int = 0 # 0 for player, 1 for enemy
var frame_coords_base = Vector2i(0, 0)
var dragging = false
var last_valid_pos = Vector2()
var char_id: int = 0
var frozen: bool = false
@onready var health_bar = ProgressBar.new()

func _ready():
	add_to_group("team_0" if team == 0 else "team_1")
	
	health_bar.custom_minimum_size = Vector2(50, 10)
	health_bar.position = Vector2(-25, -45)
	health_bar.show_percentage = false
	var bg_style = StyleBoxFlat.new()
	bg_style.bg_color = Color(0.2, 0.2, 0.2, 1)
	var fg_style = StyleBoxFlat.new()
	fg_style.bg_color = Color(0.2, 0.8, 0.2, 1)
	health_bar.add_theme_stylebox_override("background", bg_style)
	health_bar.add_theme_stylebox_override("fill", fg_style)
	add_child(health_bar)

func set_character(char_index: int):
	char_id = char_index
	# Set stats dynamically!
	var data = Globals.chars[char_index]
	max_health = data["hp"]
	current_health = max_health
	damage = data["dmg"]
	move_speed = data["spd"]
	attack_range = data["range"]
	
	# The sprite sheet is 4x2 characters. Each character is 3x4 frames.
	# Total grid is 12 columns x 8 rows.
	var chars_per_row = 4
	var grid_x = (char_index % chars_per_row) * 3
	var grid_y = (char_index / chars_per_row) * 4
	frame_coords_base = Vector2i(grid_x, grid_y)
	
	# Set the initial frame to the character's facing-down idle frame
	$Sprite2D.hframes = 12
	$Sprite2D.vframes = 8
	$Sprite2D.frame_coords = frame_coords_base
	
	health_bar.max_value = max_health
	health_bar.value = current_health

func _physics_process(delta):
	if current_state == State.DEAD or frozen:
		return
		
	match current_state:
		State.IDLE:
			velocity = Vector2.ZERO
			if get_tree().root.get_node("Main/GameManager").current_phase == 2: # BATTLE phase
				find_target()
		State.CHASE:
			if not is_instance_valid(target) or target.current_state == State.DEAD:
				current_state = State.IDLE
				if has_node("Sprite2D"): $Sprite2D.frame_coords = frame_coords_base + Vector2i(1, 0)
				return
				
			var dist = global_position.distance_to(target.global_position)
			if dist <= attack_range:
				current_state = State.ATTACK
				if has_node("Sprite2D"): $Sprite2D.frame_coords = frame_coords_base + Vector2i(1, 0)
			else:
				var dir = global_position.direction_to(target.global_position)
				velocity = dir * move_speed
				move_and_slide()
				
				if has_node("Sprite2D"):
					var time = Time.get_ticks_msec() / 1000.0
					var frame_offset = int(time * 6.0) % 3
					$Sprite2D.frame_coords = frame_coords_base + Vector2i(frame_offset, 0)
		State.ATTACK:
			if not is_instance_valid(target) or target.current_state == State.DEAD:
				current_state = State.IDLE
				return
				
			var dist = global_position.distance_to(target.global_position)
			if dist > attack_range + 10:
				current_state = State.CHASE
				return
				
			if can_attack:
				attack_target()

func find_target():
	var enemies = get_tree().get_nodes_in_group("team_1" if team == 0 else "team_0")
	var closest = null
	var min_dist = INF
	for e in enemies:
		if e.current_state != State.DEAD:
			var d = global_position.distance_squared_to(e.global_position)
			if d < min_dist:
				min_dist = d
				closest = e
	
	target = closest
	if target:
		current_state = State.CHASE

func attack_target():
	if not is_instance_valid(target): return
	
	target.take_damage(damage)
	
	# === COMBAT VFX ===
	var vfx = Sprite2D.new()
	var char_name = Globals.chars[char_id]["name"]
	if char_name in ["Mage", "Priest"]:
		vfx.texture = load("res://assets/fire.png")
		vfx.position = global_position
		get_parent().add_child(vfx)
		var t = create_tween()
		t.tween_property(vfx, "position", target.global_position, 0.2)
		t.tween_callback(vfx.queue_free)
	elif char_name == "Ranger":
		vfx.texture = load("res://assets/arrow.png")
		vfx.position = global_position
		vfx.rotation = global_position.direction_to(target.global_position).angle()
		get_parent().add_child(vfx)
		var t = create_tween()
		t.tween_property(vfx, "position", target.global_position, 0.15)
		t.tween_callback(vfx.queue_free)
	else:
		vfx.texture = load("res://assets/slash.png")
		var offset = (target.global_position - global_position) / 2
		vfx.position = offset
		vfx.rotation = global_position.direction_to(target.global_position).angle() - PI/4
		add_child(vfx)
		var t = create_tween()
		t.tween_property(vfx, "scale", Vector2(1.5, 1.5), 0.1)
		t.parallel().tween_property(vfx, "modulate:a", 0.0, 0.1)
		t.tween_callback(vfx.queue_free)
	
	# Reset attack timer
	can_attack = false
	var timer = get_tree().create_timer(1.0 / attack_speed)
	timer.connect("timeout", _on_attack_ready)

func _on_attack_ready():
	can_attack = true

func take_damage(amount: float):
	current_health -= amount
	health_bar.value = current_health
	
	# Hit flash
	if has_node("Sprite2D"):
		var spr = $Sprite2D
		spr.modulate = Color(5, 5, 5, 1) # Bright white flash
		var t1 = create_tween()
		t1.tween_property(spr, "modulate", Color(1, 1, 1, 1), 0.15)
		
	# Floating damage number
	var dmg_lbl = Label.new()
	dmg_lbl.text = str(amount)
	dmg_lbl.add_theme_font_size_override("font_size", 24)
	dmg_lbl.modulate = Color(1, 0, 0, 1)
	dmg_lbl.position = Vector2(-10, -40)
	add_child(dmg_lbl)
	
	var t2 = create_tween()
	t2.tween_property(dmg_lbl, "position", dmg_lbl.position + Vector2(0, -30), 0.5)
	t2.parallel().tween_property(dmg_lbl, "modulate:a", 0.0, 0.5)
	t2.tween_callback(dmg_lbl.queue_free)
	
	if current_health <= 0:
		die()

func die():
	current_state = State.DEAD
	velocity = Vector2.ZERO
	
	var tween = create_tween()
	tween.tween_property(self, "modulate:a", 0.0, 0.5)
	
	# Disable collision safely
	$CollisionShape2D.set_deferred("disabled", true)

func _input(event):
	if get_tree().root.get_node_or_null("Main/GameManager") == null: return
	if get_tree().root.get_node("Main/GameManager").current_phase != 1: return

	if event is InputEventMouseButton and event.button_index == MOUSE_BUTTON_LEFT:
		if event.pressed:
			var mouse_pos = get_global_mouse_position()
			if global_position.distance_to(mouse_pos) < 60.0:
				dragging = true
				last_valid_pos = global_position
				var btn = get_tree().root.get_node_or_null("Main/BattleUI/Control/MarginContainer/FightButton")
				if btn: btn.hide()
		else:
			if dragging:
				dragging = false
				
				# Check for overlapping units on the same grid tile
				var is_overlapping = false
				var siblings = get_parent().get_children()
				for u in siblings:
					if u != self and u.has_method("set_character"): # Ensure it's a Unit
						if u.global_position.distance_to(global_position) < 10.0:
							is_overlapping = true
							break
				
				if is_overlapping:
					global_position = last_valid_pos
				
				var btn = get_tree().root.get_node_or_null("Main/BattleUI/Control/MarginContainer/FightButton")
				if btn: btn.show()
			
	if dragging and event is InputEventMouseMotion:
		var raw_pos = get_global_mouse_position()
		var grid_size = 80
		var new_x = round(raw_pos.x / grid_size) * grid_size
		var new_y = round(raw_pos.y / grid_size) * grid_size
		
		# Restrict to correct half and screen bounds
		# Screen is roughly 1152x648.
		if team == 0:
			new_x = clamp(new_x, 40, 480)
		else:
			new_x = clamp(new_x, 600, 1100)
			
		new_y = clamp(new_y, 40, 600)
			
		global_position.x = new_x
		global_position.y = new_y
