# setup
download all this code and install the required packages.

## required packages
these can be installed via `pip install <package_name>` or `python -m pip install <package_name>`.
* pgeocode
* flask
* unittest (unless you don't want to run tests, which is probly fine.)

# running this code
there are two ways to run this script.

## from the command line
this will generate output and store it locally.
1. cd into whatever directory you downloaded it from.
2. run the script either without parameters (option a, in which case it'll prompt you) or with parameters (option b, in which case it'll generate output without any more user input).
   1. `python main.py`
   2. `python main.py building_type=OfficeMedium area=1325 zipcode=98112 electricity_consumption=12345.67 electricity_eui=42.0 gas_consumption=12345.67 gas_eui=1123.58`<br />
      (values here are examples and should be changed as appropriate.)

## in a web browser
this will let you use the output in your own javascript.
1. edit line 10 of server.py so that the path points to the html file that you want to run.
2. add a javascript reference to ajax.js in you html head, like the one in sample.html:<br />
   `<script type="text/javascript" src="templates/ajax.js"></script>`
3. add a call to the `get_output` function and use the json in the return value as appropriate.
   * `get_output` takes parameters in this order:
     * building_type, area, zipcode, electricity_consumption, electricity_eui, gas_consumption, gas_eui
4. run `python server.py`.
5. use a web browser to browse to http://127.0.0.1:5000.