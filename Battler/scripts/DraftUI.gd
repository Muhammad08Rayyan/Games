extends CanvasLayer

var selected = []
var coins = 15
var selected_spell = 0
var max_selections = 5

@onready var grid = find_child("GridContainer", true, false)
@onready var title = find_child("TitleLabel", true, false)
@onready var stat_panel = find_child("StatPanel", true, false)
@onready var stat_name = find_child("StatName", true, false)
@onready var stat_hp = find_child("StatHP", true, false)
@onready var stat_dmg = find_child("StatDMG", true, false)
@onready var stat_spd = find_child("StatSPD", true, false)
@onready var stat_desc = find_child("StatDesc", true, false)

var coin_label: Label
var finish_btn: Button
var spell_btns = []
var stat_tween: Tween

func _ready():
	stat_panel.modulate.a = 0.0
	title.text = "DRAFT YOUR ARMY"
	title.add_theme_color_override("font_color", Color(1.0, 0.85, 0.3))
	title.add_theme_font_size_override("font_size", 80)
	title.add_theme_constant_override("outline_size", 8)
	
	var dim = find_child("DimOverlay", true, false)
	if dim: dim.color = Color(0.05, 0.05, 0.1, 0.85) # darker, bluer blur
	
	# Premium Button Styles
	var btn_normal = StyleBoxFlat.new()
	btn_normal.bg_color = Color(0.15, 0.15, 0.2, 0.8)
	btn_normal.corner_radius_top_left = 12
	btn_normal.corner_radius_top_right = 12
	btn_normal.corner_radius_bottom_right = 12
	btn_normal.corner_radius_bottom_left = 12
	btn_normal.border_width_left = 3
	btn_normal.border_width_top = 3
	btn_normal.border_width_right = 3
	btn_normal.border_width_bottom = 3
	btn_normal.border_color = Color(0.1, 0.1, 0.15, 0.8)

	var btn_hover = btn_normal.duplicate()
	btn_hover.bg_color = Color(0.2, 0.2, 0.3, 0.9)
	btn_hover.border_color = Color(0.4, 0.7, 1.0, 1.0)

	var btn_pressed = btn_normal.duplicate()
	btn_pressed.bg_color = Color(0.1, 0.1, 0.15, 0.9)
	btn_pressed.border_color = Color(1.0, 0.8, 0.2, 1.0)
	
	# Stat Panel Style
	var panel_style = StyleBoxFlat.new()
	panel_style.bg_color = Color(0.05, 0.05, 0.08, 0.85)
	panel_style.border_width_left = 3
	panel_style.border_width_top = 3
	panel_style.border_width_right = 3
	panel_style.border_width_bottom = 3
	panel_style.border_color = Color(0.3, 0.6, 0.9, 0.5)
	panel_style.corner_radius_top_left = 20
	panel_style.corner_radius_top_right = 20
	panel_style.corner_radius_bottom_right = 20
	panel_style.corner_radius_bottom_left = 20
	panel_style.content_margin_left = 25
	panel_style.content_margin_top = 25
	panel_style.content_margin_right = 25
	panel_style.content_margin_bottom = 25
	stat_panel.add_theme_stylebox_override("panel", panel_style)
	stat_panel.size_flags_vertical = Control.SIZE_SHRINK_BEGIN
	
	stat_panel.mouse_filter = Control.MOUSE_FILTER_IGNORE
	for child in stat_panel.get_children():
		child.mouse_filter = Control.MOUSE_FILTER_IGNORE
	stat_desc.mouse_filter = Control.MOUSE_FILTER_IGNORE
	
	stat_name.add_theme_color_override("font_color", Color(1.0, 0.8, 0.2))
	stat_hp.add_theme_color_override("font_color", Color(0.3, 1.0, 0.4))
	stat_dmg.add_theme_color_override("font_color", Color(1.0, 0.4, 0.4))
	stat_spd.add_theme_color_override("font_color", Color(0.4, 0.8, 1.0))
	
	var coin_box = HBoxContainer.new()
	coin_box.add_theme_constant_override("separation", 15)
	coin_box.set_anchors_preset(Control.PRESET_TOP_LEFT)
	coin_box.offset_left = 50
	coin_box.offset_top = 40
	
	var coin_icon = TextureRect.new()
	coin_icon.texture = preload("res://assets/coin.svg")
	coin_icon.custom_minimum_size = Vector2(60, 60)
	coin_icon.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	coin_box.add_child(coin_icon)
	
	coin_label = Label.new()
	coin_label.add_theme_font_size_override("font_size", 56)
	coin_label.add_theme_color_override("font_color", Color(1.0, 0.9, 0.2))
	coin_label.add_theme_constant_override("outline_size", 8)
	coin_label.text = str(coins)
	coin_box.add_child(coin_label)
	add_child(coin_box)
	
	finish_btn = Button.new()
	finish_btn.text = "ENTER ARENA"
	finish_btn.add_theme_font_size_override("font_size", 42)
	finish_btn.add_theme_stylebox_override("normal", btn_normal)
	finish_btn.add_theme_stylebox_override("hover", btn_hover)
	finish_btn.add_theme_stylebox_override("pressed", btn_pressed)
	finish_btn.set_anchors_preset(Control.PRESET_BOTTOM_RIGHT)
	finish_btn.offset_left = -380
	finish_btn.offset_top = -120
	finish_btn.offset_right = -30
	finish_btn.offset_bottom = -30
	finish_btn.pressed.connect(_on_finish_pressed)
	add_child(finish_btn)
	
	var spell_margin = MarginContainer.new()
	spell_margin.mouse_filter = Control.MOUSE_FILTER_IGNORE
	spell_margin.add_theme_constant_override("margin_top", 10)
	
	var spell_vbox = VBoxContainer.new()
	spell_vbox.mouse_filter = Control.MOUSE_FILTER_IGNORE
	spell_margin.add_child(spell_vbox)
	
	var spell_title = Label.new()
	spell_title.text = "— SPELLS —"
	spell_title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	spell_title.add_theme_font_size_override("font_size", 32)
	spell_title.add_theme_color_override("font_color", Color(0.7, 0.7, 0.8))
	spell_title.mouse_filter = Control.MOUSE_FILTER_IGNORE
	spell_vbox.add_child(spell_title)
	
	var spell_container = Control.new()
	spell_container.custom_minimum_size = Vector2(220, 100)
	spell_container.mouse_filter = Control.MOUSE_FILTER_IGNORE
	spell_vbox.add_child(spell_container)
	
	var main_split = find_child("MainSplit", true, false)
	if main_split: main_split.mouse_filter = Control.MOUSE_FILTER_IGNORE
	
	var left_side_vbox = VBoxContainer.new()
	left_side_vbox.mouse_filter = Control.MOUSE_FILTER_IGNORE
	left_side_vbox.add_theme_constant_override("separation", 20)
	main_split.add_child(left_side_vbox)
	main_split.move_child(left_side_vbox, 0)
	
	grid.mouse_filter = Control.MOUSE_FILTER_IGNORE
	grid.reparent(left_side_vbox)
	left_side_vbox.add_child(spell_margin)
	
	# Force all upper containers to ignore mouse
	var root_ctrl = find_child("Control", true, false)
	if root_ctrl: root_ctrl.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var root_vbox = find_child("VBoxContainer", true, false)
	if root_vbox: root_vbox.mouse_filter = Control.MOUSE_FILTER_IGNORE
	
	for i in range(1, 3):
		var sb = Button.new()
		sb.custom_minimum_size = Vector2(100, 100)
		sb.size = Vector2(100, 100)
		sb.position = Vector2(0 if i == 1 else 120, 0)
		sb.mouse_filter = Control.MOUSE_FILTER_STOP
		sb.add_theme_stylebox_override("normal", btn_normal)
		sb.add_theme_stylebox_override("hover", btn_hover)
		sb.add_theme_stylebox_override("pressed", btn_pressed)
		if i == 1:
			sb.icon = preload("res://assets/fire.svg")
		elif i == 2:
			sb.icon = preload("res://assets/freeze.svg")
		sb.expand_icon = true
		sb.icon_alignment = HORIZONTAL_ALIGNMENT_CENTER
		sb.pressed.connect(_on_spell_selected.bind(sb, i))
		sb.mouse_entered.connect(_on_spell_hover.bind(i))
		sb.mouse_exited.connect(_on_hero_unhover)
		spell_container.add_child(sb)
		spell_btns.append(sb)
	
	for i in range(8):
		var btn = grid.get_child(i)
		btn.add_theme_stylebox_override("normal", btn_normal)
		btn.add_theme_stylebox_override("hover", btn_hover)
		btn.add_theme_stylebox_override("pressed", btn_pressed)
		btn.pressed.connect(_on_hero_selected.bind(btn, i))
		btn.mouse_entered.connect(_on_hero_hover.bind(i))
		btn.mouse_exited.connect(_on_hero_unhover)
		
		var atlas = AtlasTexture.new()
		atlas.atlas = preload("res://assets/characters.png")
		var tex = atlas.atlas
		var fw = tex.get_width() / 12
		var fh = tex.get_height() / 8
		
		var grid_x = (i % 4) * 3
		var grid_y = (i / 4) * 4
		
		atlas.region = Rect2((grid_x + 1) * fw, grid_y * fh, fw, fh)
		btn.icon = atlas
		btn.custom_minimum_size = Vector2(100, 100)
		btn.expand_icon = true
		btn.icon_alignment = HORIZONTAL_ALIGNMENT_CENTER

func _on_hero_hover(id):
	if stat_tween: stat_tween.kill()
	stat_tween = create_tween()
	stat_tween.tween_property(stat_panel, "modulate:a", 1.0, 0.15)
	var data = Globals.chars[id]
	stat_name.text = data["name"]
	stat_hp.text = "HP: " + str(data["hp"]) + "  |  COST: " + str(data["cost"]) + " COINS"
	stat_dmg.text = "DMG: " + str(data["dmg"])
	stat_spd.text = "SPEED: " + str(data["spd"])
	stat_desc.text = data["desc"]

func _on_spell_hover(id):
	if stat_tween: stat_tween.kill()
	stat_tween = create_tween()
	stat_tween.tween_property(stat_panel, "modulate:a", 1.0, 0.15)
	var data = Globals.spells[id]
	stat_name.text = "SPELL: " + data["name"]
	stat_hp.text = "COST: " + str(data["cost"]) + " COINS"
	stat_dmg.text = ""
	stat_spd.text = ""
	stat_desc.text = data["desc"]

func _on_hero_unhover():
	if stat_tween: stat_tween.kill()
	stat_tween = create_tween()
	stat_tween.tween_property(stat_panel, "modulate:a", 0.0, 0.15)

func _on_hero_selected(btn, hero_id):
	var cost = Globals.chars[hero_id]["cost"]
	
	if hero_id in selected:
		selected.erase(hero_id)
		coins += cost
		btn.modulate = Color(1.0, 1.0, 1.0)
		coin_label.text = str(coins)
		return
		
	if coins >= cost and selected.size() < max_selections:
		selected.append(hero_id)
		coins -= cost
		btn.modulate = Color(0.4, 1.0, 0.4) # Highlight explicitly green
		coin_label.text = str(coins)

func _on_spell_selected(btn, spell_id):
	var cost = Globals.spells[spell_id]["cost"]
	
	if selected_spell == spell_id:
		selected_spell = 0
		coins += cost
		btn.modulate = Color(1.0, 1.0, 1.0)
		coin_label.text = str(coins)
		return
		
	if selected_spell != 0:
		var old_cost = Globals.spells[selected_spell]["cost"]
		coins += old_cost
		for sb in spell_btns: sb.modulate = Color(1.0, 1.0, 1.0)
		selected_spell = 0
		
	if coins >= cost:
		selected_spell = spell_id
		coins -= cost
		if spell_id == 1:
			btn.modulate = Color(1.0, 0.6, 0.2) # Fire highlight
		else:
			btn.modulate = Color(0.2, 0.8, 1.0) # Freeze highlight
		coin_label.text = str(coins)

func _on_finish_pressed():
	if selected.size() > 0:
		get_tree().root.get_node("Main/GameManager").transition_to_placement(selected, selected_spell)
		queue_free()
