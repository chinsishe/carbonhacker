import json

def dict_into_json_file(output:dict):
  output_filename = "data_output.json"
  
  json_content = json.dumps(output, indent = 2)
  
  with open(output_filename, 'w') as json_output_file:
    json_output_file.write(json_content)