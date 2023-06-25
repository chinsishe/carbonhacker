from os import listdir
from os.path import isfile, join

import xmltodict

token_lookup = \
{
  "Atlanta": "Atlanta",
  "USA_GA": "Atlanta",
  "Denver": "Denver",
  "USA_CO": "Denver",
  "LosAngeles": "LosAngeles",
  "Los Angeles": "LosAngeles",
  "USA_CA": "LosAngeles",
  "Minneapolis": "Minneapolis",
  "USA_MN": "Minneapolis",
  "NewYork": "NewYork",
  "New York": "NewYork",
  "USA_NY": "NewYork",
  "Phoenix": "Phoenix",
  "USA_AZ": "Phoenix",
  "Seattle": "Seattle",
  "USA_WA": "Seattle",
  "Tampa": "Tampa",
  "USA_FL": "Tampa"
}

csv_filename = "../csv/weather_data.csv"
with open(csv_filename, 'w') as csv_file:
  csv_file.write("station_name,lat,long\n")

basedir = "..\\kml\\weather"
kml_filenames = [basedir + "/" + f for f in listdir(basedir) if isfile(join(basedir, f))]

for kml_filename in kml_filenames:
  kml:dict = {}
  with open(kml_filename, 'r') as kml_file:
    kml.update(xmltodict.parse(kml_file.read()))
  
  csv = {}
  for placemark in kml['kml']['Document']['Placemark']:
    csv_row = []
    
    name = None
    description_key = 'description'
    if description_key in placemark:
      description = str(placemark[description_key])
      
      # tried to parse this as xml and immediately got a mismatched tag error, so it's time to do this the wrong way.
      description = description.split("<tr><td>URL ")[1].split("</td></tr>")[0]
      
      name = description[description.rfind('/')+1:description.rfind('.')]
    else:
      name = placemark['name']
    
    found = False
    for key in token_lookup.keys():
      if key in name:
        name = token_lookup[key]
        found = True
        break
    
    if not found:
      continue
    
    csv_row.append(name)
    
    coords = placemark['Point']['coordinates'].split(',')
    
    csv_row.append(coords[0])
    csv_row.append(coords[1])
    
    csv_row.append('')
    
    csv[name] = coords[0] + ',' + coords[1]
  
  csv_text = ""
  for key in csv.keys():
    csv_text += key + ',' + csv[key] + '\n'
  csv_text = csv_text[:-1]
  
  with open(csv_filename, 'a') as csv_file:
    csv_file.write(csv_text)