import get

import unittest

class Tests(unittest.TestCase):
  def test_csv(self):
    expected = "SOUTH"
    actual   = get.cell_from_csv("C:\\Users\\posei\\Downloads\\recs2020_public_v2.csv", "DOEID", "100007", "REGIONC")
    
    self.assertEqual(expected, actual)
  
  def test_headers(self):
    expected = {'station_name', 'lat', 'long'}
    actual   = get.rows_from_csv('csv/weather_data.csv')[0].keys()
    
    for key in expected:
      self.assertTrue(key in actual)
  
  def test_headers(self):
    expected = { 'BuildingTypology', 'WeatherFile', 'Year', 'RefElectricity_EUI', 'RefFossilFuel_EUI', 'Electricity_AverageEmissionsIntensity', 'Electricity_MarginalEmissionsIntensity', 'PV_AverageEmissionsIntensity', 'PV_MarginalEmissionsIntensity' }
    actual   = get.rows_from_csv('csv/TypologyWeatherFile_CarbonEmissions.csv')[0].keys()
    
    self.assertEqual(len(expected), len(actual))
    for key in expected:
      self.assertTrue(key in actual)