from main import generate_output
from constants import BuildingTypologies

from flask import Flask, render_template, request

app = Flask(__name__)

@app.route('/')
def index():
  return render_template('sample.html')

@app.route('/templates/ajax.js')
def ajax():
  content = ''
  
  with open('templates/ajax.js') as ajax:
    content = ajax.read()
  
  return content

@app.route('/get_output', methods=['GET'])
def get_output():
  args = request.args
  
  building_typology = BuildingTypologies(args.get("building_type"))
  area = float(args.get("area"))
  zipcode = int(args.get("zipcode"))
  electricity_consumption = float(args.get("electricity_consumption"))
  electricity_eui = float(args.get("electricity_eui"))
  gas_consumption = float(args.get("gas_consumption"))
  gas_eui = float(args.get("gas_eui"))
  
  generate_output(building_typology, area, zipcode, electricity_consumption, electricity_eui, gas_consumption, gas_eui)
  
  content = ''
  
  with open('data_output.json', 'r') as output:
    content = output.read()
  
  return content

@app.route('/favicon.ico')
def get_favicon():
  with open('templates/favicon.jpg', 'rb') as favicon:
    contents = favicon.read()
  
  return contents

if __name__ == '__main__':
  app.run()