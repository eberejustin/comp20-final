import os
import json
from flask import Flask, render_template, request, send_from_directory, escape
from pymongo import MongoClient
import requests
import xml.etree.ElementTree as ET
from html.parser import HTMLParser
from bs4 import BeautifulSoup
import re
import time
import sys


mongoUri = os.environ.get('MONGODB_URI')
if not mongoUri:
    mongoUri = 'mongodb://localhost/jumbotour'

client = MongoClient(mongoUri)
db = client.get_default_database()
users = db.users
events = db.events

app = Flask(__name__, template_folder='www', static_url_path='/www')

# Serving static files
@app.route('/<path:path>')
def send_js(path):
    return send_from_directory('www', path)


# routes for the homepage
@app.route('/')
@app.route('/index')
def index():
    return render_template('index.html')

# Adding CORS to the responses
@app.after_request
def after_request(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    return response



# add a location to current location
@app.route('/add_location', methods=['POST'])
def add_location():
    data = request.form
    try:
        location = escape(data['loc'])
        key = data.get('id')

        item = {'locs': location}
        if not key:
            key = users.insert(item)
            return_data = '{"id":"'+str(key)+'"}'
        else:
            users.update({"_id": key}, {"$push": item}, upsert = True)
            return_data = '{"status":"success"}'
    except:
        return_data = '{"status":"error"}'
    return return_data


# routes for the preferenfes
# The clientside should make a post request with a key stored
# in localstorage if it exists. If it does not exist it is fine to
# make a post request without the key and this request returns a 
# new key that should be stored in the localstorage
@app.route('/preferences', methods=['POST'])
def set_pref():
    data = request.form
    try:
        prefs = data['prefs']
        key = data.get('id')
        item = {'prefs':prefs, 'locs':[]}
        if not key:
            key = users.insert(item)
            return_data = '{"id":"'+str(key)+'"}'
        else:
            users.update({"_id":key}, {"$set": item}, upsert=True)
            return_data = '{"status":"success"}'
    except:
        return_data = '{"status":"error"}'
    return return_data

def distance(lat1, lng1, lat2, lng2):
    from math import sqrt
    lat1 = float(lat1)
    lat2 = float(lat2)
    lng1 = float(lng1)
    lng2 = float(lng2)
    return sqrt((lat2 - lat1) * (lat2 - lat1) + (lng2 - lng1) * (lng2 - lng1))

# request suggest for next location
@app.route('/next_loc', methods=['POST'])
def next_loc():
    data = request.form
    key = data.get('id')
    curr_lat = data.get('lat')
    curr_lng = data.get('lng')

    if not key:
        return "['Halligan Hall']"

    cursor = users.find({'_id':key})

    prev_locs = []
    prefs = []
    for ind in cursor:
        print(ind)
        prev_locs.append(ind.get('locs'))
        prefs.append(ind.get('prefs'))
    

    with open('locations2.json') as json_data:
        data = json.load(json_data)
        pot_locs = []
        for addr in data:
            if addr["name"] in prev_locs:
                continue;
            for pref in prefs:
                num_matches = 0;
                try:
                    if pref in addr["tags"]:
                        num_matches += 1;
                except KeyError:
                    pass
                    
                pot_locs.append((addr, num_matches));
        
        if len(pot_locs) > 5:
            tag_locs = sorted(pot_locs, key=lambda x:x[1]);
            #tag_locs = tag_locs[:5];

            dist_locs = [];
            for loc in pot_locs:
                dist_locs.append((loc[0], distance(curr_lat, curr_lng, loc[0]["lat"], loc[0]["lng"])));
            dist_locs = sorted(dist_locs, key=lambda x:x[1]);
            pot_locs = tag_locs[:2];
            count = 0;
            while len(pot_locs) < 5:
                if dist_locs[count] not in pot_locs:
                    pot_locs.append(dist_locs[count]);
                count += 1;



        locs = [x[0] for x in pot_locs];
        return json.dumps(locs);




def add_events():
    events.remove({})
    events.insert({'created_at':time.time()})
    link = "http://www.trumba.com/calendars/tufts.xml"
    obj = requests.get(link)
    tree = ET.fromstring(obj.text)
    for n in tree.iter('{http://www.w3.org/2005/Atom}entry'):
        try:
            e_title=n.find('{http://www.w3.org/2005/Atom}title').text
            content = n.find('{http://www.w3.org/2005/Atom}content')
            soup = BeautifulSoup(content.text, "html5lib")
            splitted = soup.get_text().split()
            result = re.search('Building:(.*?)Campus:', soup.get_text())
            e_location = result.group(1).strip()
            result2 = re.search('Type:(.*?)School/Institute:', soup.get_text())
            try:
                e_type = result2.group(1).strip()
            except:
                result2 = re.search('Type:(.*?)Event', soup.get_text())
                try:
                    e_type = result2.group(1).strip()
                except:
                    raise ValueError('oops!')
            e_time = ""
            for i in range(0,7):
                e_time += splitted[i] + " "
            event = {"title": e_title, "time": e_time, "location": e_location, "type": e_type}
            events.insert(event)
        except:
            pass

@app.route('/events', methods=['POST'])
def event_send():
    data = request.form
    location = data.get('location')
    cur = events.find({'created_at':{ '$exists' : True }})
    for a in cur:
        if (time.time() - a['created_at'] > 86400):
            add_events()
    cursor = events.find({'location': location})
    ret_value = []
    for event in cursor:
        event.pop("_id")
        ret_value.append(event)
    ret_value = str(ret_value)
    ret_value = ret_value.replace("'", '"')
    return str(ret_value)

# routes for location data
@app.route('/places')
def places():
    with open('locations.json') as loc:
        data = loc.read();
    return data

# test route
@app.route('/test')
def test():
    return "Sucess!!"

if __name__ == "__main__":
    app.run()
