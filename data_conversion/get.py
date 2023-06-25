import sys

from constants import BuildingTypologies

import pgeocode

from math import sqrt

def lat_long_from_zip(zipcode:int):
  nomi = pgeocode.Nominatim('us')
  query = nomi.query_postal_code(str(zipcode))
  
  return query["latitude"], query["longitude"]

building_typology_list = [bt for bt in BuildingTypologies]

def user_input():
  building_type = None
  sqft = None
  zipcode = None
  electricity_consumption = None
  electricity_eui = None
  gas_consumption = None
  gas_eui = None
  
  if len(sys.argv) > 1:
    for argv in sys.argv:
      if '=' not in argv:
        continue
      
      key = argv[:argv.index('=')].replace(" ", "").replace("_", "").lower()
      val = argv[argv.index('=')+1:]
      if key == "buildingtype":
        try:
          building_type = building_typology_list[int(val)]
        except ValueError:
          building_type = BuildingTypologies(str(val))
      elif key == "sqft" or key == "squarefeet" or key == "area":
        sqft = float(val)
      elif key == "zip" or key == "zipcode":
        zipcode = int(val)
      elif key == "electricityconsumption":
        electricity_consumption = float(val)
      elif key == 'electricityeui':
        electricity_eui = float(val)
      elif key == "gasconsumption":
        gas_consumption = float(val)
      elif key == "gaseui":
        gas_eui = float(val)
    
    if building_type is None or sqft is None or zipcode is None or electricity_consumption is None or gas_consumption is None:
      message = "a value was missing from the command line.  please provide a value for each of these keys:\n"
      message += "buildingtype=<int>; valid ints:"
      for bt in BuildingTypologies:
        message += str(bt.value) + ". " + str(building_type)[14:] + "\n"
      
      message += "\nsqft=<float>\n"
      
      message += "\nzipcode=<int>\n"
      message += "\nelectricity_consumption=<float>\n"
      message += "\ngas_consumption=<float>"
      raise ValueError(message)
  else:
    print("what building type are you examining? (pick a number.)")
    for i in range(len(building_typology_list)):
      print(str(i + 1) + ". " + str(building_typology_list[i].value))
    building_type = building_typology_list[int(input()) - 1]
    
    print("how many square feet does your building have?")
    sqft = float(input())
    
    print("what's your building's zipcode?")
    zipcode = int(input())
    
    print("what is your electricity consumption?")
    electricity_consumption = float(input())
    
    print("what is your electricity eui?")
    electricity_eui = float(input())
    
    print("what is your gas consumption?")
    gas_consumption = float(input())
    
    print("what is your gas eui?")
    gas_eui = float(input())
  
  return building_type, sqft, zipcode, electricity_consumption, electricity_eui, gas_consumption, gas_eui

def weather_data_from_zip(building_typology:BuildingTypologies, zipcode:int):
  header_station_name = 'station_name'
  header_lat = 'lat'
  header_long = 'long'
  
  target_lat, target_long = lat_long_from_zip(zipcode)
  target_lat, target_long = float(target_lat), float(target_long)
  
  filename = "csv/weather_data.csv"
  
  station_lines = rows_from_csv(filename)
  vals          = []
  
  min_index = None
  min_dist  = None
  
  i = 0
  for line in station_lines:
    vals.append(line)
    lat = float(vals[i][header_long])
    long = float(vals[i][header_lat])
    
    dist = sqrt((lat - target_lat)**2 + (long - target_long)**2)
    
    if min_dist is None or min_dist > dist:
      min_index = i
      min_dist = dist
    
    i += 1
  
  if min_index is None:
    return None
  
  closest_weather_file = vals[min_index][header_station_name]
  
  all_typology_data = rows_from_csv("csv/TypologyWeatherFile_CarbonEmissions.csv")
  
  header_building_typology = 'BuildingTypology'
  header_weather_file = 'WeatherFile'
  header_year = 'Year'
  header_e_ae = 'Electricity_AverageEmissionsIntensity'
  header_e_me = 'Electricity_MarginalEmissionsIntensity'
  
  filtered_typology_data =\
  {
    'BuildingTypology': str(building_typology)[19:],
    'WeatherFile': closest_weather_file,
    header_year: [],
    header_e_ae: [],
    header_e_me: []
  }
  
  direct_copy_headers = { 'RefElectricity_EUI', 'RefFossilFuel_EUI', 'PV_AverageEmissionsIntensity', 'PV_MarginalEmissionsIntensity' }
  for datum in all_typology_data:
    typology = None
    try:
      typology = BuildingTypologies(datum[header_building_typology])
    except ValueError:
      print('warning: found an unsupported building topology: ' + datum[header_building_typology])
    
    if typology != building_typology or datum[header_weather_file] != closest_weather_file:
      continue
    
    for header in direct_copy_headers:
      filtered_typology_data[header] = datum[header]
    
    filtered_typology_data[header_year].append(datum[header_year])
    filtered_typology_data[header_e_ae].append(datum[header_e_ae])
    filtered_typology_data[header_e_me].append(datum[header_e_me])
  
  return filtered_typology_data

def cell_from_csv(filename:str, lookup_col:str, lookup_val:str, target_col:str):
  row = row_from_csv(filename, lookup_col, lookup_val)
  
  if row is None or target_col not in row:
    return None
  
  return row[target_col]

def row_from_csv(filename:str, lookup_col:str, lookup_val:str):
  rows = rows_from_csv(filename)
  for row in rows:
    if lookup_col not in row:
      return None
    
    if row[lookup_col] == lookup_val:
      return row
  
  return None

def rows_from_csv(filename:str):
  full_text = ""
  with open(filename) as csvfile:
    full_text = csvfile.readlines()
    
  headers = full_text[0][:-1].split(',')
  
  if len(headers) > 0 and headers[0].startswith('ï»¿'):
    headers[0] = headers[0][3:]
  
  header_map = {}
  index = 0
  for header in headers:
    header_map[header] = index
    index += 1
  
  result_rows = []
  rows = full_text[1:]
  for row in rows:
    cells = row.split(',')
    result_row = {}
    
    for i in range(len(cells)):
      result_row[headers[i]] = cells[i]
    
    result_rows.append(result_row)
  
  return result_rows