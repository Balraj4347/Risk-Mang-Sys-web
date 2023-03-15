import os
from dotenv import load_dotenv
load_dotenv()
baseDir = os.path.abspath(os.path.dirname(__name__))

class Config():
    SECRET_KEY = os.environ.get('SECRET_KEY')
    

class DevlopmentConfig(Config):
    DEBUG = True
    MONGO_URI = os.environ.get('MONGO_DB_URI')
    MONO_DB_NAME = os.environ.get('MONGO_DB_NAME')
    

class ProductionConfig(Config):
    DEBUG = False
    
