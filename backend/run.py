from app import create_app
from flask_cors import CORS
from config import DevlopmentConfig

app = create_app(DevlopmentConfig)

if __name__ == "__main__":
    app.run(debug=True)