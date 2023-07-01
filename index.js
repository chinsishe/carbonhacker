import '../styles/main.css';
import * as d3 from 'd3';
import L from 'leaflet';


fetch('./sample.json')
    .then(response => response.json())
    .then(data => {

        // MAP CONFIGURATION
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

        }

        initMap();

        // READING AND PROCESSING DATA
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

        // default data
        let zipCode = 85711;
        let buildingArea = 1200;
        let buildingType = "mid-rise-residential";
        let electricityConsumption = 1200;
        let gasConsumption = 150;

        // DATA UPDATE FUNCTION. RUNS WHEN "SUBMIT" IS CLICKED 

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

        // Add event listener to the submit button
        submitButton.addEventListener("click", () => {
            updateInput();
            updateDiagram();
        });

        // GRAPH SVG IS BEING CREATED HERE

        // Calculate the dimensions for the SVG
        const width = window.innerWidth * 0.9 - 235;
        const height = window.innerHeight * (1 / 2) - 85;
        const margin = { top: 50, right: 50, bottom: 50, left: 50 };

        // Create an SVG element with the calculated dimensions
        const svg = d3.select('#graph')
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .attr('viewBox', `0 0 ${width} ${height}`);

        const electricityNumber = d3.select("#electricity-number").append("text");
        const fossilFuelNumber = d3.select("#carbon-number").append("text");
        const totalNumber = d3.select("#total-number").append("text");

        // FUNCTION THAT RENDERS DIAGRAM WITH UPDATED DATA
        function updateDiagram(sliderValue) {

            ///left menu EUIs are printed here
            const electricityEui = (3.412 * electricityConsumption / buildingArea).toFixed(2);
            const fossilFuelEui = (3.412 * gasConsumption / buildingArea).toFixed(2);
            const totalEui = (+electricityEui + +fossilFuelEui).toFixed(2);
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

            // data import and processing from sample file
            const Years = data.Years;
            const fossilFuelEmissionsUnit = (0.067 * +buildingArea * +fossilFuelEui).toFixed(2);
            const fossilFuelEmissions = Years.map(() => fossilFuelEmissionsUnit);
            const refElectricityEui = data.RefElectricity_EUI;
            const refFossilFuelEui = data.RefFossilFuel_EUI;
            const eScale = +electricityEui / +refElectricityEui;
            const fScale = +fossilFuelEui / +refFossilFuelEui;
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
            var pvArea = +sliderValue * +buildingArea;
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

            console.log(netAverageEmissions);
            console.log(netMarginalEmissions);
            console.log(pvAverageEmissions);



            // Set up the scales for x and y axes
            const xScale = d3.scaleLinear()
                .domain(d3.extent(Years))
                .range([40, +width - 50]);

            const yScaleUniversal = d3.scaleLinear()
                .domain([-500, 500])
                .range([+height - 50, 50]);

            const yScaleNetAverageEmissions = yScaleUniversal;
            const yScaleNetMarginalEmissions = yScaleUniversal;
            const yScaleTotalAverageEmissions = yScaleUniversal;
            const yScaleTotalMarginalEmissions = yScaleUniversal;

            //Create lines in graph
            const lineNetAverageEmissions = d3.line()
                .x((d, i) => xScale(Years[i]))
                .y((d) => yScaleNetAverageEmissions(d))
                .curve(d3.curveMonotoneX);

            const lineNetMarginalEmissions = d3.line()
                .x((d, i) => xScale(Years[i]))
                .y((d) => yScaleNetMarginalEmissions(d))
                .curve(d3.curveMonotoneX);

            const lineTotalAverageEmissions = d3.line()
                .x((d, i) => xScale(Years[i]))
                .y((d) => yScaleTotalAverageEmissions(d))
                .curve(d3.curveMonotoneX);

            const lineTotalMarginalEmissions = d3.line()
                .x((d, i) => xScale(Years[i]))
                .y((d) => yScaleTotalMarginalEmissions(d))
                .curve(d3.curveMonotoneX);

            // This could use join, however simple solution is to remove old lines and draw new every time parameters change
            svg.selectAll('path').remove();

            // Append the line to the SVG
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

            // Append the line to the SVG
            svg.append('path')
                .datum(totalAverageEmissions)
                .attr('d', lineTotalAverageEmissions)
                .attr('id', 'lineTotalAverageEmissions')
                .attr('class', 'graph-lines');

            // Append the line to the SVG
            svg.append('path')
                .datum(totalMarginalEmissions)
                .attr('d', lineTotalMarginalEmissions)
                .attr('id', 'lineTotalMarginalEmissions')
                .attr('class', 'graph-lines');

            //Axis are created here
            //First clean all old axis when data change
            svg.selectAll('g').remove();

            //Create y axis
            const xAxis = d3.axisBottom(xScale)
                .tickSizeOuter(0)
                .tickPadding(8)
                .tickFormat(d3.format(".0f"))
                .tickSize(6);

            const xAxisGroup = svg.append('g')
                .attr('transform', `translate(0, ${+height - 50})`)
                .call(xAxis);

            // Append arrowhead marker to the x-axis
            xAxisGroup.append('marker')
                .attr('id', 'xAxisArrowhead')
                .attr('markerWidth', 10)
                .attr('markerHeight', 10)
                .attr('refX', 9)
                .attr('refY', 3)
                .attr('orient', 'auto')
                .append('path')
                .attr('d', 'M0,0 L0,6 L9,3 z')
                .style('fill', 'black').attr('transform', 'rotate(90)');

            xAxisGroup.select('.domain')
                .attr('marker-end', 'url(#xAxisArrowhead)');

            //create y axis
            const yAxisTotalMarginal = d3.axisLeft(yScaleTotalMarginalEmissions)
                .tickSizeInner(-width)
                .tickSizeOuter(0)
                .tickPadding(8)
                .tickFormat(d3.format(".0f"))
                .tickSize(6);

            const yAxisGroupTotalMarginal = svg.append('g')
                .call(yAxisTotalMarginal).attr('transform', `translate(40, 0)`);

        }

        updateDiagram(sliderValue);

        // Unfinished module that visualize co2 emissions. It shows how many trees you need to plant to compensate for your emissions and how many cars emit that much co2

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
