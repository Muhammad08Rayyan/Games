extends Control

@onready var container = $HBox/LeftPanel/Scroll/List
@onready var form = $HBox/RightPanel/Form
@onready var name_input = $HBox/RightPanel/Form/NameInput
@onready var hp_input = $HBox/RightPanel/Form/HPInput
@onready var dmg_input = $HBox/RightPanel/Form/DmgInput
@onready var cost_input = $HBox/RightPanel/Form/CostInput
@onready var save_btn = $HBox/RightPanel/Form/SaveBtn
@onready var status_label = $HBox/RightPanel/Form/Status

var characters = []
var selected_id = ""

func _ready():
	$Header/BackButton.pressed.connect(func(): get_tree().change_scene_to_file("res://Scenes/MainMenu/MainMenu.tscn"))
	save_btn.pressed.connect(_on_save_pressed)
	$HBox/LeftPanel/NewCharBtn.pressed.connect(_on_new_char)
	hp_input.min_value = 50
	hp_input.step = 10
	hp_input.get_line_edit().editable = false
	hp_input.get_line_edit().focus_mode = Control.FOCUS_NONE
	dmg_input.min_value = 5
	dmg_input.step = 2
	dmg_input.get_line_edit().editable = false
	dmg_input.get_line_edit().focus_mode = Control.FOCUS_NONE
	cost_input.editable = false
	hp_input.value_changed.connect(_recalc_cost)
	dmg_input.value_changed.connect(_recalc_cost)
	_fetch_characters()

func _recalc_cost(_ignore = 0):
	if not name_input.editable:
		return
	var extra_hp = max(0, hp_input.value - 50)
	var extra_dmg = max(0, dmg_input.value - 5)
	cost_input.value = 1 + floor(extra_hp / 10.0) + floor(extra_dmg / 2.0)

func _fetch_characters():
	var q = SupabaseQuery.new().from("characters").select(["*"]).eq("team_id", Supabase.auth.client.id)
	var task = Supabase.database.query(q)
	await task.completed
	if task.error == null and task.data != null:
		characters = task.data
		_render_list()

func _render_list():
	for c in container.get_children(): c.queue_free()
	for i in range(characters.size()):
		var char_data = characters[i]
		var btn = Button.new()
		btn.text = char_data.get("name", "Unknown") + " (Cost: " + str(char_data.get("cost", 1)) + ")"
		btn.custom_minimum_size = Vector2(0, 50)
		btn.pressed.connect(_on_char_selected.bind(char_data))
		container.add_child(btn)

func _on_new_char():
	selected_id = ""
	name_input.editable = true
	hp_input.editable = true
	dmg_input.editable = true
	save_btn.disabled = false
	name_input.text = "New Character"
	hp_input.value = 50
	dmg_input.value = 5
	_recalc_cost()
	status_label.text = ""

func _on_char_selected(character_data):
	var is_preset = character_data.get("is_preset", false)
	name_input.editable = not is_preset
	hp_input.editable = not is_preset
	dmg_input.editable = not is_preset
	selected_id = character_data.get("id", "")
	name_input.text = character_data.get("name", "")
	hp_input.value = character_data.get("health", 100)
	dmg_input.value = character_data.get("damage", 10)
	cost_input.value = character_data.get("cost", 1)
	status_label.text = ""
	save_btn.disabled = is_preset
	if is_preset:
		status_label.text = "Preset characters cannot be edited."

func _on_save_pressed():
	var custom_count = 0
	for c in characters:
		if not c.get("is_preset", false):
			custom_count += 1
	if selected_id == "" and custom_count >= 5:
		status_label.text = "Max 5 custom characters reached!"
		return

	save_btn.disabled = true
	status_label.text = "Saving..."
	var payload = {
		"team_id": Supabase.auth.client.id,
		"name": name_input.text,
		"health": int(hp_input.value),
		"damage": int(dmg_input.value),
		"cost": int(cost_input.value)
	}
	var q = SupabaseQuery.new().from("characters")
	if selected_id != "":
		q = q.update(payload).eq("id", selected_id)
	else:
		q = q.insert([payload])
		
	var task = Supabase.database.query(q)
	await task.completed
	save_btn.disabled = false
	
	if task.error == null:
		status_label.text = "Saved!"
		_fetch_characters()
	else:
		status_label.text = "Error saving!"
