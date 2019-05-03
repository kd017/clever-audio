import os

import pandas as pd
import numpy as np

from flask import Flask, jsonify, render_template, request, redirect
from flasgger import Swagger
import json
from collections import OrderedDict
from sklearn.externals import joblib
import keras
from keras import backend as K
import requests
import spotipy
import spotipy.util as util
from spotipy.oauth2 import SpotifyClientCredentials
from pprint import pprint
from features_config import *


app = Flask(__name__)

#################################################
# Initialize Swagger for API Documentation
#################################################

app.config['SWAGGER'] = {
    "swagger_version": "2.0",
    "title": "Clever Audio  API",
    "headers": [
        ('Access-Control-Allow-Origin', '*'),
        ('Access-Control-Allow-Methods', "GET, POST, PUT, DELETE, OPTIONS"),
        ('Access-Control-Allow-Credentials', "true"),
    ],
    "specs": [{
        "version": '1.0.0',
        "title": "Clever Audio API",
        "endpoint": 'v1_spec',
        "description": 'This is the version 1 of Clever Audio Prediction API',
        "route": '/v1/spec',
        "rule_filter": lambda rule: rule.endpoint.startswith('v1.caud')
    }]
}

swagger = Swagger(app)

####
## Initialize Spotipy
###
# Spotify API Keys
spotify_cliend_id='bca78196e824433fbdf88ec18d84825f'
spotify_client_secret='d43763215bd8435eb9b3faaf048ca038'
os.environ['SPOTIPY_CLIENT_ID']=spotify_cliend_id
os.environ['SPOTIPY_CLIENT_SECRET']=spotify_client_secret

# Apply Credentials
client_credentials_manager = SpotifyClientCredentials()
sp = spotipy.Spotify(client_credentials_manager=client_credentials_manager)

def get_features(title, artist):
    results = sp.search(q=f'track:{title} artist:{artist}', type='track', limit=1)
    if len(results['tracks']['items']) == 0:
        results = sp.search(q=f'{title}', type='track', limit=1)
    if len(results['tracks']['items']) == 0:
        return
    track_info = results['tracks']['items'][0]
    track_id = track_info['id']
    features = sp.audio_features([track_id])[0]
    
    if features is None:
        return
    
    #pprint(track_info)
    
    features_as_dict = {
        'Year': track_info['album']['release_date'][:4],
        'Acousticness': features['acousticness'],
        'Danceability': features['danceability'],
        'Duration (ms)': features['duration_ms'],
        'Energy': features['energy'],
        'Instrumentalness': features['instrumentalness'],
        'Key': features['key'],
        'Liveness': features['liveness'],
        'Loudness': features['loudness'],
        'Mode': features['mode'],
        'Speechiness': features['speechiness'],
        'Tempo': features['tempo'],
        'Time Signature': features['time_signature'],
        'Valence': features['valence'],
        'Explicit': track_info['explicit'],
        'Popularity': track_info['popularity']

    }
    return features_as_dict

###############################
# LOAD Model
###############################

graph = None
X_scaler = None
grammy_prediction_model = None


# Loading Grammy Predication Model into flask
def load_model():
    global graph
    global X_scaler
    global grammy_prediction_model

    model_file = os.path.join('model', 'grammy_prediction_model.h5')
    grammy_prediction_model = keras.models.load_model(model_file)

    scaler_file = os.path.join('model', 'grammy_prediction_scaler.sav')
    X_scaler = joblib.load(scaler_file)

    graph = K.get_session().graph


load_model()

##############################
# Utility Methods
##############################


def asdict(elem):
    result = OrderedDict()
    for key in elem.__mapper__.c.keys():
        if getattr(elem, key) is not None:
            result[key] = str(getattr(elem, key))
        else:
            result[key] = getattr(elem, key)
    return result


def to_array(all):
    v = [asdict(elem) for elem in all]
    return v

##############################
# Begin API
##############################


@app.route("/")
@app.route("/home")
@app.route("/index.html")
def index():
    """Return the homepage."""
    return render_template("index.html")


@app.route("/dashboard.html")
def dashboard():
    """Return the homepage."""
    return render_template("dashboard.html")


@app.route("/data.html")
def data():
    """Return the homepage."""
    return render_template("data.html")


def perform_prediction(title, artist):
    global graph
    global X_scaler
    global grammy_prediction_model

    features = get_features(title, artist)
    df = pd.DataFrame([features])[FEATURE_ORDER]
    df.Explicit = df.Explicit.astype(int)
    df.drop(labels=EXCLUDED_FEATURES, axis=1, inplace=True)
    df_scaled = X_scaler.transform(df)

    with graph.as_default():
        predictions = grammy_prediction_model.predict_classes(df_scaled)
        prediction_info = {}
        prediction_info['artist'] = artist
        prediction_info['title'] = title
        prediction_info['prediction'] = 'Winner' if predictions[0] == 1 else 'Non-Winner'
        return prediction_info
    pass

@app.route("/predict", methods=['GET'], endpoint="v1.caud.predict")
def predict():
    """ Takes in a song title and artist name and returns a prediction.
    ---
    tags:
      - Clever Audio Prediction API
    parameters:
      - in: query
        name: title
        schema:
          type: string
          description: Title of the song
          default: Beat it
      - in: query
        name: artist
        schema:
          type: string
          description: Name of the artist
          default: Michael Jackson
    responses:
      '200':
        description: Prediction information 
        schema:
          type: object
          properties:
            prediciton:
                type: string
                description: Winner or Not a winner
                enum: ["Winner", "Non-Winner"]
                example: Winner
      '500':
        description: Failure
    """
    title = request.args.get('title')
    artist = request.args.get('artist')

    # Use default if both args are note passed...
    if artist is None or title is None:
        title = 'Beat it'
        artist = 'Michael Jackson'

    return jsonify(perform_prediction(title, artist))

if __name__ == "__main__":
    app.run(debug=True)
