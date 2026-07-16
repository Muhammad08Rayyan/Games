extends Control

@onready var team_name_label = $Header/TeamName
@onready var coins_label = $Header/Coins

func _ready():
	$CenterContainer/VBoxContainer/CharactersButton.pressed.connect(func(): get_tree().change_scene_to_file("res://Scenes/MainMenu/Characters.tscn"))
	$CenterContainer/VBoxContainer/HostButton.pressed.connect(_on_host_pressed)
	$CenterContainer/VBoxContainer/JoinHBox/JoinButton.pressed.connect(_on_join_pressed)
	var user = Supabase.auth.client
	if user != null:
		var team_name = user.user_metadata.get("team_name", "Unknown Team")
		team_name_label.text = str(team_name)
		_fetch_coins(user.id)
	else:
		team_name_label.text = "Not logged in"

func _on_host_pressed():
	Global.is_host = true
	Global.room_code = ""
	get_tree().change_scene_to_file("res://Scenes/Lobby/Lobby.tscn")

func _on_join_pressed():
	var code = $CenterContainer/VBoxContainer/JoinHBox/JoinCodeInput.text.strip_edges().to_upper()
	if code.length() == 6:
		Global.is_host = false
		Global.room_code = code
		get_tree().change_scene_to_file("res://Scenes/Lobby/Lobby.tscn")

func _fetch_coins(user_id: String):
	var q = SupabaseQuery.new().from("teams").select(["coins"]).eq("id", user_id)
	var task = Supabase.database.query(q)
	await task.completed
	if task.error == null and task.data != null and task.data.size() > 0:
		coins_label.text = "Coins: " + str(task.data[0].get("coins", 0))
	else:
		coins_label.text = "Coins: 0 (No record)"
