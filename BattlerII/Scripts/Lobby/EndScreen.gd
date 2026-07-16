extends Control

func _ready():
	$VBoxContainer/BackButton.pressed.connect(_on_back_pressed)
	if Global.battle_result != "":
		$VBoxContainer/Title.text = Global.battle_result
		if Global.battle_result == "VICTORY":
			$VBoxContainer/Title.add_theme_color_override("font_color", Color(0.2, 0.8, 0.2))
			$VBoxContainer/Subtitle.text = "You won the match!"
		else:
			$VBoxContainer/Title.add_theme_color_override("font_color", Color(0.8, 0.2, 0.2))
			$VBoxContainer/Subtitle.text = "You lost the match!"
	else:
		$VBoxContainer/Title.text = "MATCH ENDED"
		$VBoxContainer/Subtitle.text = ""

func _on_back_pressed():
	get_tree().change_scene_to_file("res://Scenes/MainMenu/MainMenu.tscn")

