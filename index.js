import '../styles/main.css';
import * as d3 from 'd3';
import sampleData from './sample.json';
// index.js
import { initMap } from './map';
import logoImage from './img/logo2.png';


fetch('./sample.json')
    .then(response => response.json())
    .then(data => {
        ////////////////////// MAP //////////////////
        initMap();

        ///////////////////// NUMBERS ///////////////////




        // Get references to the input elements and the submit button
        const zipCodeInput = document.getElementById("zip-code");
        const squareFootageInput = document.getElementById("square-footage");
        const buildingTypeInput = document.getElementById("building-type");
        const electricityConsumptionEUI = document.getElementById("electricity-consumption");
        const gasConsumptionEUI = document.getElementById("gas-consumption");
        const submitButton = document.getElementById("submit-button");

        let zipCode = null;
        let buildingArea = null;
        let buildingType = null;
        let electricityConsumption = null;
        let gasConsumption = null;


        function updateInput() {
            // Retrieve the values from the input elements
            zipCode = zipCodeInput.value;
            buildingArea = squareFootageInput.value;
            buildingType = buildingTypeInput.value;
            electricityConsumption = electricityConsumptionEUI.value;
            gasConsumption = gasConsumptionEUI.value;


            // Log the values to the console
            console.log("Zip Code:", zipCode);
            console.log("Area (SF):", buildingArea);
            console.log("Building Type:", buildingType);
            console.log("Electricity Consumption:", electricityConsumption);
            console.log("Gas Consumption:", gasConsumption);
        }

        updateInput();

        // Add event listener to the submit button
        submitButton.addEventListener("click", () => {

            updateInput();

        });


        /* # EUI [kBtu/ft2/yr] from area [ft2] and electricity/gas consumption [kWh].
        # The 3.412 factor converts between kWh and kBtu.
        Electricity_EUI = 3.412 * Electricity_Consumption / Area
        FossilFuel_EUI = 3.412 * FossilFuel_Consumption / Area
        Total_EUI = Electricity_EUI + FossilFuel_EUI */

        // const electricityEui = data.Electricity_EUI;
        // const fossilFuelEui = data.FossilFuel_EUI;

        const electricityEui = (3.412 * electricityConsumption / buildingArea).toFixed(2);
        const fossilFuelEui = (3.412 * gasConsumption/ buildingArea).toFixed(2);

        const electricityNumber = d3.select("#electricity-number");
        electricityNumber.append("text")
            .text(electricityEui)
            .attr("x", 10)
            .attr("y", 20)
            .attr("fill", "black");

        const fossilFuelNumber = d3.select("#carbon-number");
        fossilFuelNumber.append("text")
            .text(fossilFuelEui)
            .attr("x", 10)
            .attr("y", 20)
            .attr("fill", "black");


        ///////////////////// GRAPH ////////////////////

        // data import
        const Years = data.Years;
        const fossilFuelEmissions = data.FossilFuel_Emissions;
        const elecricityAverageEmissions = data.Electricity_AverageEmissions;
        const electricityMarginalEmissions = data.Electricity_MarginalEmissions;
        const pvAverageEmissions = data.PV_AverageEmissions;
        const pvMarginalEmissions = data.PV_MarginalEmissions;

        //data processing
        /* 

# Scale factors to relate building to reference building.
EScale = Electricity_EUI / RefElectricity_EUI
FScale = FossilFuel_EUI / RefElectricity_EUI

# Carbon emissions for each year [kg-CO2e/yr].
# For natural gas, 0.067 kg-CO2/kBtu.
FossilFuel_Emissions = 0.067 * Area * FossilFuel_EUI
Electricity_AverageEmissions[Year] = Area * EScale * Electricity_AverageEmissionsIntensity[Year]
Electricity_MarginalEmissions[Year] = Area * EScale * Electricity_MarginalEmissionsIntensity[Year]
PV_AverageEmissions[Year] = Area * EScale * PV_AverageEmissionsIntensity[Year]
PV_MarginalEmissions[Year] = PVArea * PV_MarginalEmissionsIntensity[Year]

# Total emissions.
Total_AverageEmissions[Year] = FossilFuel_Emissions + Electricity_AverageEmissions[Year]
Total_MarginalEmissions[Year] = FossilFuel_Emissions + Electricity_MarginalEmissions[Year]

# Net emissions is total minus PV.
Net_AverageEmissions[Year] = Total_AverageEmissions[Year] - PV_AverageEmissions[Year]
Net_MarginalEmissions[Year] = Total_MarginalEmissions[Year] - PV_MarginalEmissions[Year]

# Total over 30(?) years.  Add results for every year available, times 2 (since 2 year intervals). */



        // Calculate the dimensions for the SVG
        const width = window.innerWidth * 0.75;
        const height = window.innerHeight * (1 / 3);

        // Set up the scales for x and y axes
        const xScale = d3.scaleLinear()
            .domain(d3.extent(Years))
            .range([0, width]);

        const yScaleFossilFuelEmissions = d3.scaleLinear()
            .domain(d3.extent(fossilFuelEmissions))
            .range([height, 0]);

        const yScaleElectricityAverageEmission = d3.scaleLinear()
            .domain(d3.extent(elecricityAverageEmissions))
            .range([height, 0]);

        const yScaleElectricityMarginalEmissions = d3.scaleLinear()
            .domain(d3.extent(electricityMarginalEmissions))
            .range([height, 0]);

        const yScalePVAverageEmissions = d3.scaleLinear()
            .domain(d3.extent(pvAverageEmissions))
            .range([height, 0]);

        const yScalePVMarginalEmissions = d3.scaleLinear()
            .domain(d3.extent(pvMarginalEmissions))
            .range([height, 0]);


        // Create the line generator

        // Create the line generator
        const lineFossilFuelEmissions = d3.line()
            .x((d, i) => xScale(Years[i]))
            .y((d) => yScaleFossilFuelEmissions(d))
            .curve(d3.curveMonotoneX);

        const lineElectricityAverageEmission = d3.line()
            .x((d, i) => xScale(Years[i]))
            .y((d) => yScaleElectricityAverageEmission(d))
            .curve(d3.curveMonotoneX);

        const lineElectricityMarginalEmissions = d3.line()
            .x((d, i) => xScale(Years[i]))
            .y((d) => yScaleElectricityMarginalEmissions(d))
            .curve(d3.curveMonotoneX);

        const linePVAverageEmissions = d3.line()
            .x((d, i) => xScale(Years[i]))
            .y((d) => yScalePVAverageEmissions(d))
            .curve(d3.curveMonotoneX);

        const linePVMarginalEmissionsn = d3.line()
            .x((d, i) => xScale(Years[i]))
            .y((d) => yScalePVMarginalEmissions(d))
            .curve(d3.curveMonotoneX);




        // Create an SVG element with the calculated dimensions
        const svg = d3.select('#graph-section')
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .attr('viewBox', `0 0 ${width} ${height}`);




        // Append the line to the SVG
        svg.append('path')
            .datum(fossilFuelEmissions)
            .attr('d', lineFossilFuelEmissions)
            .attr('fill', 'none')
            .attr('stroke', 'blue')
            .attr('stroke-width', 2);

        // Append the line to the SVG
        svg.append('path')
            .datum(elecricityAverageEmissions)
            .attr('d', lineElectricityAverageEmission)
            .attr('fill', 'none')
            .attr('stroke', 'red')
            .attr('stroke-width', 2);

        // Append the line to the SVG
        svg.append('path')
            .datum(electricityMarginalEmissions)
            .attr('d', lineElectricityMarginalEmissions)
            .attr('fill', 'none')
            .attr('stroke', 'brown')
            .attr('stroke-width', 2);

        // Append the line to the SVG
        svg.append('path')
            .datum(pvAverageEmissions)
            .attr('d', linePVAverageEmissions)
            .attr('fill', 'none')
            .attr('stroke', 'orange')
            .attr('stroke-width', 2);

        // Append the line to the SVG
        svg.append('path')
            .datum(pvMarginalEmissions)
            .attr('d', linePVMarginalEmissionsn)
            .attr('fill', 'none')
            .attr('stroke', 'green')
            .attr('stroke-width', 2);


        ///////////////////////// AXIS LINES ////////////////////////////

        // Add x-axis
        const xAxis = d3.axisBottom(xScale);
        svg.append('g')
            .attr('transform', `translate(0, ${height})`)
            .call(xAxis);

        // Add y-axis
        const yAxis = d3.axisLeft(yScaleElectricityAverageEmission);
        svg.append('g')
            .call(yAxis);


        ///////////////////////////////////// ICONS //////////////////////////////

        const icons = d3.select("#icons-section");
        const treeNumber = Math.floor(200 / 40);

        for (let i = 0; i < treeNumber; i++) {
            icons.append("img")
                .attr("src", "https://i.imgur.com/HaXm5nt.png")
                .attr("alt", "ThatsATree")
                .attr("class", "tree-icon");
        }

        icons.append("img").attr("src", "https://i.imgur.com/gMhUu0I.png").attr("alt", "ThatsACar").attr("class", "car-icon");

        const carNumber = Math.floor(100 / 40);

        for (let j = 0; j < carNumber; j++) {
            icons.append("img").attr("src", "https://i.imgur.com/gMhUu0I.png").attr("alt", "ThatsACar").attr("class", "car-icon");
        }



    })
    .catch(error => {
        console.log('Error:', error);
    });
