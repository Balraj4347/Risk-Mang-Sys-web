from flask import current_app as app
from flask import request
from functools import wraps
from app.utils import JsonResp
import jwt
import datetime

# Auth Decorator
def token_required(f):
	@wraps(f)
	def decorated(*args, **kwargs):
		access_token = request.headers.get('AccessToken')
		try:
			data = jwt.decode(access_token, app.config['SECRET_KEY'],algorithms=['HS256'])
		except Exception as e:
			return JsonResp({ "message": "Token Vaidation error", "exception": str(e) }, 403)

		return f(*args, **kwargs)

	return decorated

def encodeAccessToken(user_id, email,portfolio_id):

	accessToken = jwt.encode({
		"user_id": user_id,
		"email": email,
		"portfolio_id":portfolio_id,
		"exp": datetime.datetime.utcnow() + datetime.timedelta(days=1) # The token will expire in 1 day
	}, app.config["SECRET_KEY"], algorithm="HS256")

	return accessToken

def encodeRefreshToken(user_id, email,portfolio_id):

	refreshToken = jwt.encode({
		"user_id": user_id,
		"email": email,
		"portfolio_id":portfolio_id,
		"exp": datetime.datetime.utcnow() + datetime.timedelta(weeks=1) # The token will expire in 4 weeks
	}, app.config["SECRET_KEY"], algorithm="HS256")

	return refreshToken

def refreshAccessToken(refresh_token):

	# If the refresh_token is still valid, create a new access_token and return it
	try:
		user = app.db.users.find_one({ "refresh_token": refresh_token }, { "_id": 0, "id": 1, "email": 1,"portfolio_id":1})

		if user:
			decoded = jwt.decode(refresh_token, app.config["SECRET_KEY"],algorithms=['HS256'])
			new_access_token = encodeAccessToken(decoded["user_id"], decoded["email"],decoded["portfolio_id"])
			result = jwt.decode(new_access_token, app.config["SECRET_KEY"])
			result["new_access_token"] = new_access_token
			resp = JsonResp(result, 200)
		else:
			result = { "message": "Auth refresh token has expired" }
			resp = JsonResp(result, 403)

	except:
		result = { "message": "Auth refresh token has expired" }
		resp = JsonResp(result, 403)

	return resp