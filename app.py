# Flask server
from flask import Flask, render_template, jsonify
import VoiceController

app = Flask(__name__)


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/control')
def control():
    command = VoiceController.get_command()
    print(command)
    command_dict = {'command': command}
    response = jsonify(command_dict)
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


if __name__ == '__main__':
    app.run()
