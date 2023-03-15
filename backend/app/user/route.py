from flask import Blueprint
from app.auth import token_required
from app.user.model import User


user = Blueprint("user",__name__)

@user.route("/me", methods=["GET"])
@token_required
def get():
	return User().get()

@user.route("/auth", methods=["GET"])
def getAuth():
	return User().getAuth()

@user.route("/login", methods=["POST"])
def login():
	return User().login()

@user.route("/logout", methods=["GET"])
@token_required
def logout():
	return User().logout()

@user.route("/register", methods=["POST"])
def add():
	return User().register()

