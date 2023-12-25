from flask import Flask, jsonify, abort
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app)

# Load the JSON data
with open('./soccer_small.json', 'r') as file:
    players = json.load(file)
    players_by_name = {player['Name']: player for player in players}


@app.route('/players/', methods=['GET'])
def get_players():
    return jsonify(players)


@app.route('/players/<string:name>', methods=['GET'])
def get_player_by_name(name):
    player = players_by_name.get(name)
    if not player:
        abort(404)  # Player not found
    return jsonify(player)


@app.route('/clubs/', methods=['GET'])
def get_clubs():
    clubs = {}
    for player in players:
        club = player['Club']
        clubs.setdefault(club, []).append(player)

    return jsonify(clubs)


@app.route('/attributes/', methods=['GET'])
def get_attributes():
    attribute_names = list(players[0].keys())
    return jsonify(attribute_names)


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
