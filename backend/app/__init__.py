from flask import Flask
from flask_pymongo import PyMongo
from flask_cors import CORS
from pprintpp import pprint

# Importing BluePrints
from app.portfolio.route import portfolio
from app.user.route import user
from app.analysis.route import analysis
from app.riskanalysis.route import risk
from app.sentiment.route import sentiment
from app.diversification.route import diversification
#Importing Utils 
from app.utils import JsonResp


def create_app(config_obj=None):
    app= Flask(__name__)
    CORS(app)
    if config_obj is not None:
        app.config.from_object(config_obj)

     # Database Config
    try:
        mongoClient = PyMongo(app).cx
        app.db = mongoClient[app.config['MONO_DB_NAME']]
        mongoClient.server_info() # to check if error occur ,in case no connection
        pprint("DataBase {} connected succesfully!!".format(app.db.name))
    except Exception as e:
        pprint("Error: {}".format(e));


    # db['Users'].insert_one({'name':"balraj"})

    #blueprint registration
    app.register_blueprint(user,url_prefix="/api/v1/user")
    app.register_blueprint(portfolio,url_prefix="/api/v1/portfolio")
    app.register_blueprint(analysis,url_prefix="/api/v1/analysis")
    app.register_blueprint(risk,url_prefix="/api/v1/risk")
    app.register_blueprint(diversification,url_prefix="/api/v1/diversify")
    app.register_blueprint(sentiment,url_prefix="/api/v1/senti")

    @app.route("/")
    def index():
        return JsonResp({ "status": "Online" }, 200)
    
    return app