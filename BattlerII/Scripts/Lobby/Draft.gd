extends Control

@onready var budget_label = $HBox/LeftPanel/BudgetLabel
@onready var character_list = $HBox/LeftPanel/Scroll/VBox
@onready var roster_label = $HBox/RightPanel/RosterLabel
@onready var spell_option = $HBox/RightPanel/SpellOption
@onready var ready_button = $HBox/RightPanel/ReadyBtn
@onready var leave_button = $HBox/RightPanel/LeaveBtn
@onready var status_label = $HBox/RightPanel/Status

var budget = 0
var available_chars = []
var selected_chars = []
var my_ready = false

func _ready():
	ready_button.pressed.connect(_on_ready_pressed)
	leave_button.pressed.connect(_on_leave_pressed)
	spell_option.item_selected.connect(func(idx): _update_ui())
	_fetch_budget()
	_fetch_characters()
	_setup_realtime()

func _setup_realtime():
	if Global.realtime_channel != null:
		var channel = Global.realtime_channel.channel("public", "lobbies", "id=eq." + Global.current_lobby_id)
		if channel != null:
			channel.on("update", _on_lobby_update)

func _on_lobby_update(_old, new_record, _channel):
	if new_record.get("status") == "cancelled":
		status_label.text = "Opponent left!"
		await get_tree().create_timer(1.5).timeout
		get_tree().change_scene_to_file("res://Scenes/MainMenu/MainMenu.tscn")
		return
	
	var host_r = new_record.get("host_roster")
	var guest_r = new_record.get("guest_roster")
	if typeof(host_r) == TYPE_DICTIONARY and typeof(guest_r) == TYPE_DICTIONARY:
		if host_r.size() > 0 and guest_r.size() > 0:
			status_label.text = "Starting round..."
			if Global.is_host:
				Global.my_roster = host_r
				Global.enemy_roster = guest_r
			else:
				Global.my_roster = guest_r
				Global.enemy_roster = host_r
			await get_tree().create_timer(1.0).timeout
			get_tree().change_scene_to_file("res://Scenes/Battle/Arena.tscn")

func _on_leave_pressed():
	status_label.text = "Leaving..."
	var q = SupabaseQuery.new().from("lobbies").update({"status": "cancelled"}).eq("id", Global.current_lobby_id)
	Supabase.database.query(q)
	get_tree().change_scene_to_file("res://Scenes/MainMenu/MainMenu.tscn")

func _fetch_budget():
	var q = SupabaseQuery.new().from("teams").select(["coins"]).eq("id", Supabase.auth.client.id)
	var task = Supabase.database.query(q)
	await task.completed
	if task.error == null and task.data != null and task.data.size() > 0:
		budget = task.data[0].get("coins", 0)
		_update_ui()

func _fetch_characters():
	var q = SupabaseQuery.new().from("characters").select(["*"]).eq("team_id", Supabase.auth.client.id)
	var task = Supabase.database.query(q)
	await task.completed
	if task.error == null and task.data != null:
		available_chars = task.data
		_render_chars()

func _render_chars():
	for c in character_list.get_children():
		c.queue_free()
	for c in available_chars:
		var btn = Button.new()
		btn.text = c["name"] + " (Cost: " + str(c["cost"]) + ")"
		btn.custom_minimum_size = Vector2(0, 50)
		btn.pressed.connect(func(): _toggle_char(c))
		character_list.add_child(btn)

func _toggle_char(c):
	if my_ready: return
	if selected_chars.has(c):
		selected_chars.erase(c)
	else:
		if selected_chars.size() >= 3:
			status_label.text = "Max 3 characters!"
			return
		selected_chars.append(c)
	_update_ui()

func _update_ui():
	var current_cost = 0
	var text = "Selected:\n"
	for c in selected_chars:
		current_cost += c["cost"]
		text += "- " + c["name"] + " (C: " + str(c["cost"]) + ", HP: " + str(c["health"]) + ", DMG: " + str(c["damage"]) + ")\n"
	
	var spell_cost = 0
	if spell_option.selected == 1: spell_cost = 3
	elif spell_option.selected == 2: spell_cost = 2
	current_cost += spell_cost
	text += "- " + spell_option.text
	
	roster_label.text = text
	budget_label.text = "Budget: " + str(current_cost) + " / " + str(budget)
	
	if current_cost > budget:
		ready_button.disabled = true
		status_label.text = "Over budget!"
	elif selected_chars.size() < 1:
		ready_button.disabled = true
		status_label.text = "Select at least 1!"
	else:
		ready_button.disabled = false
		status_label.text = "Ready to draft."

func _on_ready_pressed():
	my_ready = true
	ready_button.disabled = true
	status_label.text = "Locking in..."
	var payload = {
		"characters": selected_chars,
		"spell": spell_option.text,
		"name": Supabase.auth.client.user_metadata.get("team_name", "Unknown Team")
	}
	var update_field = "host_roster" if Global.is_host else "guest_roster"
	var body = {}
	body[update_field] = payload
	
	var q = SupabaseQuery.new().from("lobbies").update(body).eq("id", Global.current_lobby_id)
	var task = Supabase.database.query(q)
	await task.completed
	if task.error == null:
		status_label.text = "Waiting for opponent..."
	else:
		status_label.text = "Failed to lock in!"
		my_ready = false
		ready_button.disabled = false
