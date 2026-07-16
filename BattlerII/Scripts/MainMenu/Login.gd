extends Control

@onready var email_input = $CenterContainer/Panel/VBoxContainer/Email
@onready var pass_input = $CenterContainer/Panel/VBoxContainer/Password
@onready var login_button = $CenterContainer/Panel/VBoxContainer/LoginButton
@onready var status_label = $CenterContainer/Panel/VBoxContainer/Status

func _ready():
	login_button.pressed.connect(_on_login_pressed)

func _on_login_pressed():
	if email_input.text == "" or pass_input.text == "":
		status_label.text = "Please enter email and password."
		return
		
	status_label.text = "Authenticating..."
	login_button.disabled = true
	
	var task = Supabase.auth.sign_in(email_input.text, pass_input.text)
	await task.completed
	
	if task.error != null:
		status_label.text = "Error: " + task.error.message
		login_button.disabled = false
	else:
		status_label.text = "Success!"
		get_tree().change_scene_to_file("res://Scenes/MainMenu/MainMenu.tscn")
