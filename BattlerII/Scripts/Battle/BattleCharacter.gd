extends Node2D

@onready var sprite = $Sprite2D
@onready var name_lbl = $VBoxContainer/NameLbl
@onready var hp_bar = $VBoxContainer/HpBar
@onready var hp_lbl = $VBoxContainer/HpBar/HpLbl
@onready var dmg_lbl = $VBoxContainer/DmgLbl
@onready var highlight = $Highlight

var char_data = {}
var is_enemy = false
var max_hp = 100
var current_hp = 100
var grid_x = 0
var grid_y = 0
var anim_timer = 0.0
var current_frame = 0

func _process(delta):
	anim_timer += delta
	if anim_timer > 0.1: # 10 FPS
		anim_timer = 0.0
		current_frame = (current_frame + 1) % 10
		if sprite.hframes == 10:
			sprite.frame = current_frame

func setup(data, enemy: bool, start_x: int, start_y: int):
	char_data = data
	is_enemy = enemy
	grid_x = start_x
	grid_y = start_y
	
	name_lbl.text = data["name"]
	max_hp = data.get("health", 100)
	current_hp = max_hp
	dmg_lbl.text = "DMG: " + str(data.get("damage", 10))
	_update_hp_ui()
	
	if is_enemy:
		sprite.modulate = Color(1, 0.4, 0.4) # Red
		sprite.flip_h = true
	else:
		sprite.modulate = Color(0.4, 0.6, 1) # Blue
		sprite.flip_h = false

func set_highlight(active: bool):
	highlight.visible = active

func take_damage(amount: int):
	current_hp -= amount
	if current_hp < 0:
		current_hp = 0
	_update_hp_ui()
	
	if current_hp <= 0: return
	
	var tween = get_tree().create_tween()
	sprite.modulate = Color(1, 1, 1)
	tween.tween_property(sprite, "modulate", Color(1, 0, 0), 0.1)
	tween.tween_property(sprite, "modulate", Color(1, 0.4, 0.4) if is_enemy else Color(0.4, 0.6, 1), 0.1)

func heal(amount: int):
	max_hp += amount
	current_hp += amount
	_update_hp_ui()

func _update_hp_ui():
	hp_lbl.text = str(current_hp) + "/" + str(max_hp)
	hp_bar.max_value = max_hp
	hp_bar.value = current_hp
