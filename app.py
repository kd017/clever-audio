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

##########
# Load Training Dataset
#########
DATA_FILE = os.path.join('data', 'combined-data.csv')
training_data = pd.read_csv(DATA_FILE)

##############################
# Begin API
##############################


@app.route("/")
@app.route("/home")
@app.route("/index.html")
def index():
    """Return the homepage."""
    return render_template("index.html")


@app.route("/predictor.html")
def dashboard():
    """Return the homepage."""
    return render_template("predictor.html")


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


@app.route("/news", methods=['GET'], endpoint="v1.caud.news")
def news():
    """Returns news items from static content DB
    ---
    tags:
      - Data Access API
    responses:
      '200':
        description: An array of news items
        schema:
          type: array
          items:
            type: object
            properties:
                title:
                    type: string
                    description: Title of the news article
                    example: "Seeking drought relief: The Navajo turn to NASA"
                href: 
                    type: string
                    description: Hyperlink of the news article
                    example: "https://climate.nasa.gov/news/2853/seeking-drought-relief-the-navajo-turn-to-nasa/"
                image: 
                    type: string
                    description: Image of the news article
                    example: "https://climate.nasa.gov/system/news_items/list_view_images/2853_20190322-WildHorses-320x240.jpg"
                index:
                    type: number
                    description: Index in the DB
                    example: 0
                teaser: 
                    type: string
                    description: Teaser of the news article
                    example: "Combining precipitation data from various sources, NASA’s Western Water Applications Office (WWAO), the Navajo Nation and the Desert Research Institute are working together to improve the Navajos’ ability to monitor and report drought."
      '500':
        description: Failure
    """
    df = pd.read_csv(os.path.join('data', 'news.csv'))

    return jsonify(df.to_dict(orient='records'))

@app.route("/data", methods=['GET'], endpoint="v1.caud.data")
def data():
    """Returns data used for training & testing
    ---
    tags:
      - Data Access API
    responses:
      '200':
        description: An array of songs with features
        schema:
          type: array
          items:
            type: object
            properties:
                Acousticness:
                    type: number
                    description: Acousticness of the song
                    example: 0.987
                Album:
                    type: string
                    description: Name of the album
                    example: Tutto Modugno (Mister Volare)
                Artist:
                    type: string
                    description: Name of the artist
                    example: Domenico Modugno
                Danceability:
                    type: number
                    description: Danceability of the song
                    example: 0.518
                Duration (ms):
                    type: number
                    description: Duration of the song in milli seconds
                    example: 216373
                Energy:
                    type: number
                    description: Energy of the song
                    example: 0.06
                Explicit:
                    type: boolean
                    description: Indicates if the song has explicit lyrics
                    example: false
                Image:
                    type: string
                    description: URL to fetch image of the album/track
                    example: https://i.scdn.co/image/5e8c49f7a8d161c1d6510999bd867b6a91640dae
                Instrumentalness:
                    type: number
                    description: Instrumentalness of the song
                    example: 0.00000787
                Key:
                    type: number
                    description: Key of the song
                    example: 10
                Liveness:
                    type: number
                    description: Liveness of the song
                    example: 0.161
                Loudness:
                    type: number
                    description: Loudness of the song
                    example: -14.887
                Mode:
                    type: number
                    description: Mode of the song
                    example: 1
                Popularity:
                    type: number
                    description: Popularity of the song
                    example: 35
                Speechiness:
                    type: number
                    description: Speechiness of the song
                    example: 0.0441
                Tempo:
                    type: number
                    description: Tempo of the song
                    example: 127.87
                Time Signature:
                    type: number
                    description: Signature of the song
                    example: 4
                Title:
                    type: string
                    description: Title of the song
                    example: Nel Blu Dipinto Di Blu (Volare)
                TrackId:
                    type: string
                    description: Track ID of the song
                    example: 006Ndmw2hHxvnLbJsBFnPx
                URL:
                    type: string
                    description: Spotify URL of the song
                    example: https://open.spotify.com/track/006Ndmw2hHxvnLbJsBFnPx
                Valence:
                    type: number
                    description: Valence of the song
                    example: 0.336
                Winner:
                    type: number
                    description: 1 if winner
                    example: 1
                Year:
                    type: number
                    description: Year of release
                    example: 1958
      '500':
        description: Failure
    """
    return jsonify(training_data.to_dict(orient='records'))

@app.route("/tracks", methods=['GET'], endpoint="v1.caud.tracks")
def tracks():
    """Returns tracks (title & artist)
    ---
    tags:
      - Data Access API
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
        description: An array of songs with features
        schema:
          type: array
          items:
            type: object
            properties:
                Title:
                    type: string
                    description: Title of the song
                    example: "Beat it"
                Artist:
                    type: string
                    description: Artist of the song
                    example: "Michael Jackson"
                Image:
                    type: string
                    description: Image of the Album/Track
                    example: "https://i.scdn.co/image/34b1c4afdd8e576fb048e9e6c900c6c9fe33ea76"
                Preview:
                    type: string
                    description: Image of the Album/Track
                    example: "https://p.scdn.co/mp3-preview/ce4e9952e1519b9fe6c858b085fbe79077ec9dfb?cid=bca78196e824433fbdf88ec18d84825f"
      '500':
        description: Failure
    """
    title = request.args.get('title')
    artist = request.args.get('artist')


    df = training_data[['Title', 'Artist', 'Image']]

    if title is not None:
        df = df[df.Title.str.contains(title, case=False)]

    if artist is not None:
        df = df[df.Artist.str.contains(artist, case=False)]

    df['Preview'] = 'https://p.scdn.co/mp3-preview/ce4e9952e1519b9fe6c858b085fbe79077ec9dfb?cid=bca78196e824433fbdf88ec18d84825f'
    track_info = df.to_dict(orient='records')
    return jsonify(track_info)


if __name__ == "__main__":
    app.run(debug=True)
