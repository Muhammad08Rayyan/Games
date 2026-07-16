extends Control

@onready var title = $Header/Title
@onready var status_label = $Center/Status

func _ready():
	$Header/BackButton.pressed.connect(_on_leave_pressed)
	if Global.is_host:
		_create_lobby()
		var timer = Timer.new()
		timer.wait_time = 2.0
		timer.autostart = true
		timer.timeout.connect(_poll_lobby_status)
		add_child(timer)
	else:
		_join_lobby(Global.room_code)

func _poll_lobby_status():
	if status_label.text == "Joined! Starting draft..." or Global.current_lobby_id == "": return
	var q = SupabaseQuery.new().from("lobbies").select(["status"]).eq("id", Global.current_lobby_id)
	var task = Supabase.database.query(q)
	await task.completed
	if task.error == null and task.data != null and task.data.size() > 0:
		if task.data[0].get("status") == "drafting":
			get_tree().change_scene_to_file("res://Scenes/Lobby/Draft.tscn")

func _on_leave_pressed():
	status_label.text = "Leaving..."
	if Global.current_lobby_id != "":
		var q = SupabaseQuery.new().from("lobbies").update({"status": "cancelled"}).eq("id", Global.current_lobby_id)
		Supabase.database.query(q)
	
	Global.current_lobby_id = ""
	get_tree().change_scene_to_file("res://Scenes/MainMenu/MainMenu.tscn")

func _create_lobby():
	status_label.text = "Creating lobby..."
	var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	var code = ""
	for i in range(6):
		code += chars[randi() % chars.length()]
	
	Global.room_code = code
	title.text = "ROOM CODE: " + code
	
	var payload = {
		"room_code": code,
		"host_team_id": Supabase.auth.client.id
	}
	
	var q = SupabaseQuery.new().from("lobbies").insert([payload])
	var task = Supabase.database.query(q)
	await task.completed
	if task.error == null and task.data != null and task.data.size() > 0:
		Global.current_lobby_id = task.data[0]["id"]
		status_label.text = "Waiting for player..."
		_subscribe_realtime()
	else:
		status_label.text = "Failed to create lobby."

func _join_lobby(code: String):
	status_label.text = "Joining " + code + "..."
	title.text = "ROOM CODE: " + code
	
	var q = SupabaseQuery.new().from("lobbies").select(["*"]).eq("room_code", code)
	var task = Supabase.database.query(q)
	await task.completed
	if task.error == null and task.data != null and task.data.size() > 0:
		Global.current_lobby_id = task.data[0]["id"]
		_update_guest_in_db()
	else:
		status_label.text = "Lobby not found!"

func _update_guest_in_db():
	var payload = { "guest_team_id": Supabase.auth.client.id, "status": "drafting" }
	var q = SupabaseQuery.new().from("lobbies").update(payload).eq("id", Global.current_lobby_id)
	var task = Supabase.database.query(q)
	await task.completed
	if task.error == null:
		status_label.text = "Joined! Starting draft..."
		_subscribe_realtime()
	else:
		status_label.text = "Failed to join lobby."

var realtime_client

func _subscribe_realtime():
	Global.realtime_channel = Supabase.realtime.client()
	if Global.realtime_channel.get("socket") != null and Global.realtime_channel.socket.get_ready_state() == WebSocketPeer.STATE_OPEN:
		_on_realtime_connected()
	else:
		Global.realtime_channel.connected.connect(_on_realtime_connected)
		Global.realtime_channel.connect_client()

func _on_realtime_connected():
	var channel = Global.realtime_channel.channel("public", "lobbies", "id=eq." + Global.current_lobby_id)
	channel.on("update", _on_lobby_update)
	channel.subscribe()
	print("Subscribed to realtime channel!")
	if not Global.is_host:
		get_tree().change_scene_to_file("res://Scenes/Lobby/Draft.tscn")

func _on_lobby_update(_old_record, new_record, _channel):
	if new_record.get("status") == "drafting":
		get_tree().change_scene_to_file("res://Scenes/Lobby/Draft.tscn")
	elif new_record.get("status") == "cancelled":
		status_label.text = "Lobby Cancelled!"
		await get_tree().create_timer(1.5).timeout
		get_tree().change_scene_to_file("res://Scenes/MainMenu/MainMenu.tscn")
