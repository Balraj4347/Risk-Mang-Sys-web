from flask import current_app as app
from pytz import timezone, UTC
from datetime import timedelta
import time, datetime
import random
import uuid
import yfinance as yf

def nowDatetimeUserTimezone(user_timezone):
	tzone = timezone(user_timezone)
	return datetime.datetime.now(tzone)

def nowDatetimeUTC():
	tzone = UTC
	now = datetime.datetime.now(tzone)
	return now

def JsonResp(data, status):
	from flask import Response
	from bson import json_util
	import json
	return Response(json.dumps(data, default=json_util.default), mimetype="application/json", status=status)

def randID():
	randId = uuid.uuid4().hex
	return randId

def randString(length):
	randString = ""
	for _ in range(length):
		randString += random.choice("AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz1234567890")

	return randString

def randStringCaps(length):
	randString = ""
	for _ in range(length):
		randString += random.choice("ABCDEFGHJKLMNPQRSTUVWXYZ23456789")

	return randString

def randStringNumbersOnly(length):
	randString = ""
	for _ in range(length):
		randString += random.choice("23456789")

	return randString

def validEmail(email):
	import re

	if re.match("^.+\\@(\\[?)[a-zA-Z0-9\\-\\.]+\\.([a-zA-Z]{2,3}|[0-9]{1,3})(\\]?)$", email) != None:
		return True
	else:
		return False
	
def get_historical_data(tickers,period,interval):
    data = yf.download(tickers,period=period,interval=interval,group_by='ticker')
    data.sort_index(ascending=True,inplace=True)
    return data

def dict_values_to_float(data:dict):
	for k,v in data.items():
		data[k]= float(v)
		data[k] = round(data[k],5)
	return data