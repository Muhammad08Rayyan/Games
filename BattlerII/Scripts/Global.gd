extends Node

var is_host = false
var room_code = ""
var current_lobby_id = ""
var realtime_channel = null
var my_roster = {}
var enemy_roster = {}
var battle_result = ""

func _ready():
	_apply_global_theme()
	get_tree().node_added.connect(_on_node_added)
	call_deferred("_apply_animations_to_tree", get_tree().root)

func _apply_animations_to_tree(node: Node):
	_on_node_added(node)
	for child in node.get_children():
		_apply_animations_to_tree(child)

func _on_node_added(node: Node):
	if node is Control:
		if node.has_theme_font_override("font"):
			node.remove_theme_font_override("font")
			
	if node is Button:
		if not node.mouse_entered.is_connected(_on_btn_hover):
			node.mouse_entered.connect(_on_btn_hover.bind(node))
		if not node.mouse_exited.is_connected(_on_btn_exit):
			node.mouse_exited.connect(_on_btn_exit.bind(node))
		if not node.resized.is_connected(_update_btn_pivot):
			node.resized.connect(_update_btn_pivot.bind(node))
			_update_btn_pivot(node)

func _update_btn_pivot(btn: Button):
	btn.pivot_offset = btn.size / 2.0

func _on_btn_hover(btn: Button):
	var tween = create_tween().set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_OUT)
	tween.tween_property(btn, "scale", Vector2(1.05, 1.05), 0.2)
	tween.parallel().tween_property(btn, "modulate", Color(1.2, 1.2, 1.2), 0.2)

func _on_btn_exit(btn: Button):
	var tween = create_tween().set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_OUT)
	tween.tween_property(btn, "scale", Vector2(1.0, 1.0), 0.2)
	tween.parallel().tween_property(btn, "modulate", Color(1.0, 1.0, 1.0), 0.2)

func _apply_global_theme():
	var theme = Theme.new()
	
	# Primary UI Font (Clean Sans-Serif)
	var font = SystemFont.new()
	font.font_names = PackedStringArray(["Montserrat", "Helvetica Neue", "Arial", "sans-serif"])
	theme.default_font = font
	theme.default_font_size = 20
	
	# Colors
	var color_bg = Color(0.04, 0.04, 0.04, 0.95)
	var color_gold = Color(0.83, 0.68, 0.21, 1.0)
	var color_text = Color(0.9, 0.9, 0.9, 1.0)
	var color_dark_text = Color(0.05, 0.05, 0.05, 1.0)
	
	# Button - Normal (Transparent with Gold Border)
	var btn_normal = StyleBoxFlat.new()
	btn_normal.bg_color = Color(0, 0, 0, 0.4)
	btn_normal.border_width_left = 1
	btn_normal.border_width_right = 1
	btn_normal.border_width_top = 1
	btn_normal.border_width_bottom = 1
	btn_normal.border_color = Color(0.3, 0.3, 0.3, 0.8)
	btn_normal.corner_radius_top_left = 2
	btn_normal.corner_radius_top_right = 2
	btn_normal.corner_radius_bottom_left = 2
	btn_normal.corner_radius_bottom_right = 2
	
	var btn_hover = btn_normal.duplicate()
	btn_hover.bg_color = color_gold
	btn_hover.border_color = color_gold
	
	var btn_pressed = btn_hover.duplicate()
	btn_pressed.bg_color = Color(0.6, 0.5, 0.1, 1.0)
	
	theme.set_stylebox("normal", "Button", btn_normal)
	theme.set_stylebox("hover", "Button", btn_hover)
	theme.set_stylebox("pressed", "Button", btn_pressed)
	theme.set_stylebox("focus", "Button", btn_hover)
	
	theme.set_color("font_color", "Button", color_text)
	theme.set_color("font_hover_color", "Button", color_dark_text)
	theme.set_color("font_pressed_color", "Button", color_dark_text)
	theme.set_color("font_focus_color", "Button", color_dark_text)
	
	# Panel Style (Sleek, sharp dark glass with gold top accent)
	var panel_bg = StyleBoxFlat.new()
	panel_bg.bg_color = color_bg
	panel_bg.border_width_left = 0
	panel_bg.border_width_right = 0
	panel_bg.border_width_top = 2
	panel_bg.border_width_bottom = 0
	panel_bg.border_color = color_gold
	theme.set_stylebox("panel", "Panel", panel_bg)
	
	# LineEdit (Minimalist bottom border)
	var le_normal = StyleBoxFlat.new()
	le_normal.bg_color = Color(0, 0, 0, 0.5)
	le_normal.border_width_left = 0
	le_normal.border_width_right = 0
	le_normal.border_width_top = 0
	le_normal.border_width_bottom = 1
	le_normal.border_color = Color(0.4, 0.4, 0.4, 1.0)
	theme.set_stylebox("normal", "LineEdit", le_normal)
	
	var le_focus = le_normal.duplicate()
	le_focus.border_color = color_gold
	theme.set_stylebox("focus", "LineEdit", le_focus)
	
	get_tree().root.theme = theme
