from flask import current_app as app
from flask import  request
#importing neccessary library
from passlib.hash import pbkdf2_sha256
import jwt
import json
#importing utils and auth tools
import app.utils as tools
import app.auth as auth
from app.portfolio.model import Portfolio

#importing dev related lib
from pprint import pprint



class User:

  def __init__(self):
    self.defaults = {
      "id": tools.randID(),
      "acct_active": True,
      "date_created": tools.nowDatetimeUTC(),
      "last_login": tools.nowDatetimeUTC(),
      "user_name":"",
      "first_name":"",
      "last_name":"",
      "email": "",
      "portfolio_id":""
    }
  
  def get(self):
    token_data = jwt.decode(request.headers.get('AccessToken'), app.config['SECRET_KEY'],algorithms=["HS256"])
    user = app.db.users.find_one({ "id": token_data['user_id'] }, {
      "_id": 0,
      "password": 0
    })

    if user:
      resp = tools.JsonResp(user, 200)
    else:
      resp = tools.JsonResp({ "message": "User not found" }, 404)

    return resp
  
  def getAuth(self):
    access_token = request.headers.get("AccessToken")
    refresh_token = request.headers.get("RefreshToken")
  
    resp = tools.JsonResp({ "message": "User not logged in" }, 401)

    if access_token:
      try:
        decoded = jwt.decode(access_token, app.config["SECRET_KEY"],algorithms=['HS256'])
        resp = tools.JsonResp(decoded, 200)
      except Exception as e:
        # If the access_token has expired, get a new access_token - so long as the refresh_token hasn't expired yet
        pprint(e)
        resp = auth.refreshAccessToken(refresh_token)

    return resp

  def login(self):
    resp = tools.JsonResp({ "message": "Invalid user credentials" }, 403)
    
    try:
        data = json.loads(request.data)
    
        email = data["email"].lower()
        user = app.db.users.find_one({ "email": email }, { "_id": 0 })
        
        if user and pbkdf2_sha256.verify(data["password"], user["password"]):
            access_token = auth.encodeAccessToken(user["id"],user["email"],user["portfolio_id"] )
            refresh_token = auth.encodeRefreshToken(user["id"], user["email"],user['portfolio_id'])

            app.db.users.update_one({ "id": user["id"] }, { "$set": {
            "refresh_token": refresh_token,
            "last_login": tools.nowDatetimeUTC()
            } })

            resp = tools.JsonResp({
            "id": user["id"],
            "email": user["email"],
            "user_name": user["user_name"],
            "first_name": user["first_name"],
            "last_name": user["last_name"],
            "access_token": access_token,
            "refresh_token": refresh_token,
            "portfolio_id":user["portfolio_id"]
            }, 200)
    except Exception as e:
      pprint(e)
    
    return resp
  
  def logout(self):
    try:
      tokenData = jwt.decode(request.headers.get("AccessToken"), app.config["SECRET_KEY"],algorithms=["HS256"])
      app.db.users.update({ "id": tokenData["user_id"] }, { '$unset': { "refresh_token": "" } })
    except Exception as e:
      pprint(e)
    
    resp = tools.JsonResp({ "message": "User logged out" }, 200)

    return resp
  
  def register(self):
    data = json.loads(request.data)

    expected_data = {
      "user_name": data['user_name'],
      "first_name": data['first_name'],
      "last_name": data['last_name'],
      "email": data['email'].lower(),
      "password": data['password']
    }

    # Merge the posted data with the default user attributes
    self.defaults.update(expected_data)
    user = self.defaults
    # pprint(user)
    # Encrypt the password
    user["password"] = pbkdf2_sha256.encrypt(user["password"], rounds=20000, salt_size=16)
    # Make sure there isn"t already a user with this email address
    try:
      existing_email = app.db.users.find_one({ "email": user["email"] })

      if existing_email:
        resp = tools.JsonResp({
          "message": "There's already an account with this email address",
          "error": "email_exists"
        }, 400)
      
      else:
        if app.db.users.insert_one(user):
          portfolio_ID = Portfolio().create_portfolio(user["id"])
          # pprint(portfolio_ID)
          # Log the user in (create and return tokens)
          access_token = auth.encodeAccessToken(user["id"], user["email"],portfolio_ID)
          refresh_token = auth.encodeRefreshToken(user["id"], user["email"],portfolio_ID)
          

          app.db.users.update_one({ "id": user["id"] }, {
            "$set": {
              "refresh_token": refresh_token,
              "portfolio_id": portfolio_ID
            }
          })
          
          resp = tools.JsonResp({
            "id": user["id"],
            "email": user["email"],
            "user_name": user["user_name"],
            "access_token": access_token,
            "refresh_token": refresh_token,
            "portfolio_id":portfolio_ID
          }, 201)

        else:
          resp = tools.JsonResp({ "message": "User could not be added" }, 400)
    except Exception as e:
      pprint(e)

    return resp
  

  