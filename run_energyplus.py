import subprocess
import pandas as pd
import regex as re
import csv
import eeweather

def run_energyplus(bldg_type, epw_file):

    station_id = re.findall('\d{6}', epw_file)[0]

    station_result = eeweather.ISDStation(station_id)
    climate_zone = station_result.iecc_climate_zone + station_result.iecc_moisture_regime

    cz_to_model = pd.read_csv(r'sim/data/ClimateZone_to_Model.csv')
    model = cz_to_model[cz_to_model['Thermal Zone'] == climate_zone]['Model'].item()
    idf_file = f'sim/ASHRAE901_{bldg_type}_STD2019_{model}.idf'

    energyplus_install_dir = r'C:\EnergyPlusV9-0-1'
    cl_st = f'{energyplus_install_dir}\\EnergyPlus --help'
    result = subprocess.run(cl_st, capture_output=True)

    print('---ARGS---\n',result.args)
    print('---RETURNCODE---\n',result.returncode, '(SUCCESS)' if result.returncode==0 else '(FAIL)')
    print('---STDOUT---\n',result.stdout.decode())
    print('---STDERR---\n',result.stderr.decode())

    output_relative_directory='sim'
    cl_st=(f'"{energyplus_install_dir}\\EnergyPlus" '
           + '--readvars '  # included to create a .csv file of the results
           + f'--output-directory "{output_relative_directory}" '
           + f'--weather "{epw_file}" '
           + f'"{idf_file}"')
    print(cl_st)

    result=subprocess.run(cl_st, capture_output=True)
    print('---ARGS---\n',result.args)
    print('---RETURNCODE---\n',result.returncode, '(SUCCESS)' if result.returncode==0 else '(FAIL)')
    print('---STDOUT---\n',result.stdout.decode())
    print('---STDERR---\n',result.stderr.decode())

def calculate_carbon(model_output, meter_output, state):

    with open(model_output) as f:
       csv_reader = csv.reader(f)
       for index, row in enumerate(csv_reader):
          if index == 42:
             bldg_area = float(row[2])

    meter_data = pd.read_csv(meter_output)
    meter_data.columns = ['Date', 'Electricity', 'Net Electricity', 'Gas']
    electricity_kWh = sum(meter_data['Electricity']) / 3600000 / bldg_area
    net_electricity_kWh = sum(meter_data['Net Electricity']) / 3600000 / bldg_area
    gas_kWh = sum(meter_data['Gas']) / 3600000 / bldg_area

    EUI = {'electricity': electricity_kWh * 3.41214 / 10.7639,
           'net_electricity': net_electricity_kWh * 3.41214 / 10.7639,
           'gas': gas_kWh * 3.41214 / 10.7639}

    years = [2024, 2026, 2028, 2030, 2035, 2040, 2045, 2050]
    average_co2_kg = dict()
    marginal_co2_kg = dict()

    for year in years:
        aer = pd.read_csv(fr'sim/data/Cambium22_MidCase_hourly_{state}_{year}.csv', skiprows=5, header=0)['aer_load_co2e']
        lrmer = pd.read_csv(fr'sim/data/Cambium22_MidCase_hourly_{state}_{year}.csv', skiprows=5, header=0)['lrmer_co2e']
        average_co2_kg[year] = meter_data['Net Electricity'] * aer / 3600000000
        marginal_co2_kg[year] = meter_data['Net Electricity'] * lrmer / 3600000000

    average_CO2_equiv = pd.DataFrame(average_co2_kg).sum(axis=0)
    marginal_CO2_equiv = pd.DataFrame(marginal_co2_kg).sum(axis=0)
    CO2_equiv = pd.concat([average_CO2_equiv, marginal_CO2_equiv], axis=1)

    return EUI, CO2_equiv


def main():
    bldg_type = 'ApartmentMidRise'
    epw_file = fr'sim/USA_WA_Seattle-Tacoma.Intl.AP.727930_TMYx.2007-2021.epw'
    model_output = fr'sim/eplustbl.csv'
    meter_output = fr'sim/eplusmtr.csv'
    state = 'WA'

    run_energyplus(bldg_type, epw_file)
    return calculate_carbon(model_output, meter_output, state)


if __name__ == '__main__':
    main()
