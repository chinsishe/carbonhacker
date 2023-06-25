import '../styles/main.css';
import * as d3 from 'd3';
import sampleData from './sample.json';
// index.js
// import { initMap } from './map';
import L from 'leaflet';
import logoImage from './img/logo2.png';


fetch('./sample.json')
    .then(response => response.json())
    .then(data => {
        ////////////////////// MAP //////////////////

        function initMap() {
            // Map setup and configuration code here
            const map = L.map('map').setView([44.967243, -103.771556], 5);

            var Stamen_Toner = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}.{ext}', {
                attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                subdomains: 'abcd',
                minZoom: 0,
                maxZoom: 20,
                ext: 'png'
            });
            map.addLayer(Stamen_Toner);

            var houseIcon = L.icon({
                iconUrl: 'https://i.imgur.com/MAyRl85.png',

                iconSize: [95, 95], // size of the icon
                iconAnchor: [22, 94], // point of the icon which will correspond to marker's location
                popupAnchor: [-3, -76] // point from which the popup should open relative to the iconAnchor
            });


            // Create marker objects with specific coordinates
            const marker1 = L.marker([47.60348041274957, -122.33488277810534], { icon: houseIcon }).addTo(map);
            const marker2 = L.marker([40.74827905539646, -73.98639071492255], { icon: houseIcon }).addTo(map);
            const marker3 = L.marker([34.06366012952451, -118.36008635986163], { icon: houseIcon }).addTo(map);

            // // Bind a popup to each marker
            // marker1.bindPopup('Seattle Case Study');
            // marker2.bindPopup('New York Case Study');
            // marker3.bindPopup('Los Angeles Case Study');


        }

        initMap();

        ///////////////////// NUMBERS ///////////////////

        /////////////SLIDER///////////////////////////


        const pvAreaSlider = document.getElementById("pv-area-slider");

        // Get the current value of the slider
        const sliderValue = pvAreaSlider.value;

        // Add an event listener to track changes in the ksslider value
        pvAreaSlider.addEventListener("input", function () {
            const sliderValue = pvAreaSlider.value;
            updateDiagram(sliderValue);
        });



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
            updateDiagram();

        });

        const width = window.innerWidth * 0.9 - 235;
        const height = window.innerHeight * (1 / 2) - 85;
        // Create an SVG element with the calculated dimensions
        const svg = d3.select('#graph')
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .attr('viewBox', `0 0 ${width} ${height}`);

        const electricityNumber = d3.select("#electricity-number").append("text");
        const fossilFuelNumber = d3.select("#carbon-number").append("text");
        const totalNumber = d3.select("#total-number").append("text");


        function updateDiagram(sliderValue) {

            /* # EUI [kBtu/ft2/yr] from area [ft2] and electricity/gas consumption [kWh].
            # The 3.412 factor converts between kWh and kBtu.
            Electricity_EUI = 3.412 * Electricity_Consumption / Area
            FossilFuel_EUI = 3.412 * FossilFuel_Consumption / Area
            Total_EUI = Electricity_EUI + FossilFuel_EUI */

            // const electricityEui = data.Electricity_EUI;
            // const fossilFuelEui = data.FossilFuel_EUI;

            const electricityEui = (3.412 * electricityConsumption / buildingArea).toFixed(2);
            const fossilFuelEui = (3.412 * gasConsumption / buildingArea).toFixed(2);
            const totalEui = +electricityEui + +fossilFuelEui;
            electricityNumber
                .text(electricityEui)
                .attr("x", 10)
                .attr("y", 20)
                .attr("class", "eui-numbers");

            fossilFuelNumber
                .text(fossilFuelEui)
                .attr("x", 10)
                .attr("y", 20)
                .attr("class", "eui-numbers");

            totalNumber
                .text(totalEui)
                .attr("x", 10)
                .attr("y", 20)
                .attr("class", "eui-numbers");


            ///////////////////// GRAPH ////////////////////

            // data import
            const Years = data.Years;

            const fossilFuelEmissionsUnit = (0.067 * +buildingArea * +fossilFuelEui).toFixed(2);
            const fossilFuelEmissions = Years.map(() => fossilFuelEmissionsUnit);
            // const fossilFuelEmissionsRaW = data.FossilFuel_Emissions;
            // const fossilFuelEmissions = fossilFuelEmissionsRaW.map((emission) => emission * 0.067 * buildingArea * fossilFuelEui);

            const refElectricityEui = data.RefElectricity_EUI;
            const refFossilFuelEui = data.RefFossilFuel_EUI;
            const eScale = +electricityEui / +refElectricityEui;
            const fScale = +fossilFuelEui / +refFossilFuelEui;


            // const elecricityAverageEmissions = data.Electricity_AverageEmissions;


            const electricityAverageEmissionIntensity = data.Electricity_AverageEmissionsIntensity;
            const electricityMarginalEmissionIntensity = data.Electricity_MarginalEmissionsIntensity;
            const elecricityAverageEmissions = [];
            const electricityMarginalEmissions = [];
            const totalAverageEmissions = [];
            const totalMarginalEmissions = [];
            var totalIntegratedEmissions = 0;
            const yearInterval = 2;

            for (let i = 0; i < Years.length; i++) {
                elecricityAverageEmissions.push(+eScale * +buildingArea * +electricityAverageEmissionIntensity[i]);
                electricityMarginalEmissions.push(+eScale * +buildingArea * +electricityMarginalEmissionIntensity[i]);
                totalAverageEmissions.push(+fossilFuelEmissions[i] + +elecricityAverageEmissions[i]);
                totalMarginalEmissions.push(+fossilFuelEmissions[i] + +electricityMarginalEmissions[i]);
                totalIntegratedEmissions += +yearInterval * +totalAverageEmissions[i];
            }


            // Whenever PV area percent 'PVAreaPct' is updated:
            var pvArea = +sliderValue * +buildingArea; //////////UPDATE
            console.log(pvArea);

            const pvAverageEmissions = [];
            const pvMarginalEmissions = [];
            const netAverageEmissions = [];
            const netMarginalEmissions = [];
            var pvIntegratedEmissions = 0.0;
            for (let i = 0; i < Years.length; i++) {
                pvAverageEmissions.push(+pvArea * +data.PV_AverageEmissionsIntensity[i]);
                pvMarginalEmissions.push(+pvArea * +data.PV_MarginalEmissionsIntensity[i]);
                netAverageEmissions.push(+totalAverageEmissions[i] - +pvAverageEmissions[i]);
                netMarginalEmissions.push(+totalMarginalEmissions[i] - +pvMarginalEmissions[i]);
                pvIntegratedEmissions += +yearInterval * +pvAverageEmissions[i];
            }
            const netIntegratedEmissions = +totalIntegratedEmissions - +pvIntegratedEmissions;

            // Calculate the dimensions for the SVG

            // Set up the scales for x and y axes
            const xScale = d3.scaleLinear()
                .domain(d3.extent(Years))
                .range([0, width]);

            // const yScaleFossilFuelEmissions = d3.scaleLinear()
            //     .domain(d3.extent(fossilFuelEmissions))
            //     .range([height, 0]);

            // const yScaleElectricityAverageEmission = d3.scaleLinear()
            //     .domain(d3.extent(elecricityAverageEmissions))
            //     .range([height, 0]);

            // const yScaleElectricityMarginalEmissions = d3.scaleLinear()
            //     .domain(d3.extent(electricityMarginalEmissions))
            //     .range([height, 0]);

            // const yScalePVAverageEmissions = d3.scaleLinear()
            //     .domain(d3.extent(pvAverageEmissions))
            //     .range([height, 0]);

            // const yScalePVMarginalEmissions = d3.scaleLinear()
            //     .domain(d3.extent(pvMarginalEmissions))
            //     .range([height, 0]);


            const yScaleNetAverageEmissions = d3.scaleLinear()
                .domain(d3.extent(netAverageEmissions))
                // .domain([-17.713300086399727, 102.89005403611276])
                .range([height, 0]);

            console.log(d3.extent(netAverageEmissions));

            const yScaleNetMarginalEmissions = d3.scaleLinear()
                .domain(d3.extent(netMarginalEmissions))
                // .domain([-203.40285929374613, 34.98720974355429])
                .range([height, 0]);

            console.log(d3.extent(netMarginalEmissions));

            // Create the line generator

            // // Create the line generator
            // const lineFossilFuelEmissions = d3.line()
            //     .x((d, i) => xScale(Years[i]))
            //     .y((d) => yScaleFossilFuelEmissions(d))
            //     .curve(d3.curveMonotoneX);

            // const lineElectricityAverageEmission = d3.line()
            //     .x((d, i) => xScale(Years[i]))
            //     .y((d) => yScaleElectricityAverageEmission(d))
            //     .curve(d3.curveMonotoneX);

            // const lineElectricityMarginalEmissions = d3.line()
            //     .x((d, i) => xScale(Years[i]))
            //     .y((d) => yScaleElectricityMarginalEmissions(d))
            //     .curve(d3.curveMonotoneX);

            // const linePVAverageEmissions = d3.line()
            //     .x((d, i) => xScale(Years[i]))
            //     .y((d) => yScalePVAverageEmissions(d))
            //     .curve(d3.curveMonotoneX);

            // const linePVMarginalEmissionsn = d3.line()
            //     .x((d, i) => xScale(Years[i]))
            //     .y((d) => yScalePVMarginalEmissions(d))
            //     .curve(d3.curveMonotoneX);

            const lineNetAverageEmissions = d3.line()
                .x((d, i) => xScale(Years[i]))
                .y((d) => yScaleNetAverageEmissions(d))
                .curve(d3.curveMonotoneX);

            const lineNetMarginalEmissions = d3.line()
                .x((d, i) => xScale(Years[i]))
                .y((d) => yScaleNetMarginalEmissions(d))
                .curve(d3.curveMonotoneX);




            // // Append the line to the SVG
            // svg.append('path')
            //     .datum(fossilFuelEmissions)
            //     .attr('d', lineFossilFuelEmissions)
            //     .attr('fill', 'black')
            //     .attr('stroke', 'blue')
            //     .attr('stroke-width', 2);

            // // Append the line to the SVG
            // svg.append('path')
            //     .datum(elecricityAverageEmissions)
            //     .attr('d', lineElectricityAverageEmission)
            //     .attr('fill', 'none')
            //     .attr('stroke', 'red')
            //     .attr('stroke-width', 2);

            // // Append the line to the SVG
            // svg.append('path')
            //     .datum(electricityMarginalEmissions)
            //     .attr('d', lineElectricityMarginalEmissions)
            //     .attr('fill', 'none')
            //     .attr('stroke', 'brown')
            //     .attr('stroke-width', 2);

            // // Append the line to the SVG
            // svg.append('path')
            //     .datum(pvAverageEmissions)
            //     .attr('d', linePVAverageEmissions)
            //     .attr('fill', 'none')
            //     .attr('stroke', 'orange')
            //     .attr('stroke-width', 2);

            // // Append the line to the SVG
            // svg.append('path')
            //     .datum(pvMarginalEmissions)
            //     .attr('d', linePVMarginalEmissionsn)
            //     .attr('fill', 'none')
            //     .attr('stroke', 'green')
            //     .attr('stroke-width', 2);

            // Append the line to the SVG
            svg.selectAll('path').remove();

            svg.append('path')
                .datum(netAverageEmissions)
                .attr('d', lineNetAverageEmissions)
                .attr('id', 'lineNetAverageEmissions')
                .attr('class', 'graph-lines');

            // Append the line to the SVG
            svg.append('path')
                .datum(netMarginalEmissions)
                .attr('d', lineNetMarginalEmissions)
                .attr('id', 'lineNetMarginalEmissions')
                .attr('class', 'graph-lines');

            ///////////////////////// AXIS LINES ////////////////////////////

            svg.selectAll('g').remove();

            // Add x-axis
            const xAxis = d3.axisBottom(xScale);
            svg.append('g')
                .attr('transform', `translate(0, ${height})`)
                .call(xAxis);

            // Add y-axis
            const yAxis = d3.axisLeft(yScaleNetAverageEmissions);
            svg.append('g')
                .call(yAxis);

        }

        updateDiagram(sliderValue);






        ///////////////////////////////////// ICONS //////////////////////////////

        const icons = d3.select("#icons-section");
        const treeNumber = Math.floor(200 / 40);

        for (let i = 0; i < treeNumber; i++) {
            icons.append("img")
                .attr("src", "https://i.imgur.com/HaXm5nt.png")
                .attr("alt", "ThatsATree")
                .attr("class", "tree-icon");
        }
        const carNumber = Math.floor(100 / 40);

        for (let j = 0; j < carNumber; j++) {
            icons.append("img").attr("src", "https://i.imgur.com/gMhUu0I.png").attr("alt", "ThatsACar").attr("class", "car-icon");
        }



    })
    .catch(error => {
        console.log('Error:', error);
    });
