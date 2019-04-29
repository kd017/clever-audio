import os

import pandas as pd
import numpy as np

from flask import Flask, jsonify, render_template, request, redirect
from flasgger import Swagger
import json
from collections import OrderedDict


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
    ]
    ,
    "specs": [{
        "version": '1.0.0',
        "title": "Clever Audio API",
        "endpoint": 'v1_spec',
        "description": 'This is the version 1 of Clever Audio Prediction API',
        "route": '/v1/spec',
        "rule_filter": lambda rule: rule.endpoint.startswith('v1.adv')
    }]
}

swagger = Swagger(app)


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
    v = [ asdict(elem) for elem in all ]
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

@app.route("/tos")
def tos():
    """Return the apidocs."""
    return redirect("/apidocs")

@app.route("/dashboard.html")
def dashboard():
    """Return the homepage."""
    return render_template("dashboard.html")

@app.route("/data.html")
def data():
    """Return the homepage."""
    return render_template("data.html")


if __name__ == "__main__":
    app.run(debug=True)
