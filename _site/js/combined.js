let parkingToegangUrl = "https://opendata.rdw.nl/resource/edv8-qiyg.json?$limit=5000",
    parkeerGebiedUrl = "https://opendata.rdw.nl/resource/b3us-f26s.json?$limit=5000",
    geoDataUrl = "https://opendata.rdw.nl/resource/nsk3-v9n7.json?$limit=7000",

    workLocal = false,
    githubPagesLinks = true;

if (workLocal) {
    parkingToegangUrl = "/data/parking-toegang.json"
    geoDataUrl = "/data/geodata.json"
    parkeerGebiedUrl = "/data/parkeergebied.json"
}


if (githubPagesLinks) {
    parkingToegangUrl = "/frontend-data/data/parking-toegang.json"
    geoDataUrl = "/frontend-data/data/geodata.json"
    parkeerGebiedUrl = "/frontend-data/data/parkeergebied.json"
}




let workArray = [];
let listOfUsableAreaIds = [];

async function getData(url) {
    const response = await fetch(url);
    const data = await response.json();
    return data;
}

getData(parkingToegangUrl).then(
    function (parkingToegangData) {
        getData(parkeerGebiedUrl).then(
            function (parkeerGebiedData) {
                getData(geoDataUrl).then(
                    function (geoData) {
                        // console.log(parkeerGebiedData);
                        listOfUsableAreaIds = setUpCleanDataSetWithIds(parkeerGebiedData);
                        workArray = listOfUsableAreaIds;
                        addDaysToWorkArray(parkingToegangData);
                        addCapacityToWorkArray(parkeerGebiedData);
                        addCityNameToWorkArray(geoData)
                    })
            })
    });



let myObject = [];

function addCityNameToWorkArray(geoDataSet) {
    let areaIdsAndGeoData = geoDataSet.map(entry => [entry.areaid, { geodata: entry.areageometryastext }]),
        areaIdsAndGeoDataThatIWant = areaIdsAndGeoData.filter(checkIfAreaIdInWorkArray);

    areaIdsAndGeoDataThatIWant = areaIdsAndGeoDataThatIWant.map(shapeToLatLong);

    // let cityNames = areaIdsAndGeoDataThatIWant.map(translateLatLongToCityName);

    // collectData(areaIdsAndGeoDataThatIWant, 0);

    let locationDataUrl = '/data/AreaIDwithlocationdata.json'
    if(githubPagesLinks) locationDataUrl = '/frontend-data/data/AreaIDwithlocationdata.json'

    getData(locationDataUrl).then(
        dataSet => {
            let filteredSet = dataSet.filter(isObjectFilled);
            let areaIDWithCityName = filteredSet.map(cityDataToCityName);
            workArray = areaIDWithCityName.map(entry => transformSingleEntry(entry, workArray));
            workArray = workArray.filter(entry => !isNull(entry));
            workArray = workArray.map(reformatDataEntry);
            initD3Graphs(workArray);
        }
    );
}


function reformatDataEntry(dataEntry) {
    const areaId = dataEntry[0],
        weekdays = dataEntry[1],
        capacity = dataEntry[2].capacity,
        laadPalen = dataEntry[2].laadPalen;
    let cityName = dataEntry[3].cityname

    if (cityName == null) cityName = dataEntry[4].cityname

    return { stad: cityName, capaciteit: capacity, openingstijden: weekdays, laadpalen: laadPalen };
}


function isObjectFilled(object) {
    if (object[1].cityname == null) return false;
    return true;
}


function cityDataToCityName(cityObject) {
    let cityData = cityObject[1].cityname,
        areaID = cityObject[0],
        cityName = "";

    if ('town' in cityData) cityName = cityData.town;
    else if ('city' in cityData) cityName = cityData.city;
    else cityName = cityData.village;

    return [areaID, { cityname: cityName }];
}

function collectData(geoDataSet, counter) {
    translateLatLongToCityData(geoDataSet[counter]).then(
        value => {
            console.log("VALUE ", value);
            myObject.push(value);
            console.log("MYOBJECT ", myObject);
            counter++;
            let rand = Math.ceil(40000 * Math.random());
            if (counter < 1056) {
                setTimeout(function () { collectData(geoDataSet, counter); }, rand);
            }
        })
}


async function translateLatLongToCityData(latLong) {
    let lat = latLong[1].lat,
        long = latLong[1].long;
    // cityUrl = "https://maps.googleapis.com/maps/api/geocode/json?latlng="+ lat + ","+ long + "&key=AIzaSyAbI0apjUDIAYQua581VGPwBsDOqtD-FsA", 
    cityUrl = "https://nominatim.openstreetmap.org/reverse?format=json&lat=" + lat + "&lon=" + long + "&zoom=18&addressdetails=1";


    const response = await fetch(cityUrl);
    const data = await response.json();
    const cityName = await data.address;


    return [latLong[0], { "cityname": cityName }];
}



function shapeToLatLong(shape) {
    let shapeString = shape[1].geodata,
        lat,
        long;
    if (shapeString.includes("POLYGON")) {
        let pointsArray = shapeString
            .replace("POLYGON", "")
            .replace("((", "")
            .replace("))", "")
            .trim()
            .split(",");
        let points = pointsArray.map(point => point.trim().split(" ")),
            lat = getAverage(points, 1),
            long = getAverage(points, 0);
    }
    else {
        let latLong = getLatLong(shape);
        lat = latLong[0]
        long = latLong[1]
    }
    return [shape[0], { "lat": lat, "long": long }];
}

function getAverage(array, index) {
    let total = 0;
    for (let i in array) {
        total = total + parseFloat((array[i][index]));
    }
    return (total / array.length);
}

function getLatLong(geoPoint) {
    let latLong = [],
        pointString = geoPoint[1].geodata;
    latLong = pointString
        .replace("POINT", "")
        .replace("(", "")
        .replace(")", "")
        .trim()
        .split(" ");
    latLong = [parseFloat(latLong[1]), parseFloat(latLong[0])]; // as it was Long Lat otherwise
    return latLong;
}

function checkIfAreaIdInWorkArray(areaIdEntry) {
    const areaId = areaIdEntry[0];
    return (listOfUsableAreaIds.includes(areaId));
}


function setUpCleanDataSetWithIds(dataSet) {
    return dataSet.map(entry => entry["areaid"]);
}


function addCapacityToWorkArray(dataSet) {
    let newData = dataSet.map(entry => [entry.areaid, { capacity: entry.capacity, laadPalen: entry.chargingpointcapacity }]);
    // output: 
    // capacity: x
    // laadPalen: y

    workArray = newData.map(entry => transformSingleEntry(entry, workArray));
    workArray = workArray.filter(entry => !isNull(entry));
}


function transformSingleEntry(entryToAdd, dataSetToBeAddedTo) {
    const entryToAddId = entryToAdd[0],
        entryToAddObjs = entryToAdd[1];

    if (dataSetToBeAddedTo.find(entry => entry[0] == entryToAddId)) {
        let matchedArray = dataSetToBeAddedTo.find(entry => entry[0] == entryToAddId);
        matchedArray.push(entryToAddObjs)
        return matchedArray;
    }
    return null;
}

function isNull(dataEntry) {
    if (dataEntry == null) return true;
    return false;
}


function addDaysToWorkArray(dataSet) {
    let allAreaIdsPerDay = (Object.entries(workArray = groupByKey(dataSet, "areaid")));
    workArray = allAreaIdsPerDay.map(entry => deleteExcessData(entry));
}


function deleteExcessData(parkingArea) {
    let weekdays = parkingArea[1]
    for (let day in weekdays) {
        delete weekdays[day].areamanagerid;
        delete weekdays[day].areaid;
        delete weekdays[day].startofperiod;
    }
    return parkingArea;
}



// https://stackoverflow.com/questions/40774697/how-to-group-an-array-of-objects-by-key
function groupByKey(array, key) {
    return array
        .reduce((hash, obj) => {
            if (obj[key] === undefined) return hash;
            return Object.assign(hash, { [obj[key]]: (hash[obj[key]] || []).concat(obj) })
        }, {})
}



function createCityInputs(data) {
    const citybox = document.querySelector('.cities');
    let allCityNames = [];
    for (let i in data) {
        if (!allCityNames.includes(data[i].stad)) {
            allCityNames.push(data[i].stad);
        }
    }
    for (let city in allCityNames) {
        let box = document.createElement("div");
        let input = document.createElement("input")
        input.setAttribute('type', 'checkbox');
        input.setAttribute('value', allCityNames[city]);
        if (selectedCities.includes(allCityNames[city])) input.setAttribute('checked', 'checked');
        let label = document.createElement("label")
        label.textContent = allCityNames[city];
        label.setAttribute('for', allCityNames[city]);
        box.append(input);
        box.append(label);
        citybox.append(box);
    }
}




function initD3Graphs(data) {
    createCityInputs(data);
    let combinedCityCapacityObjects = mergeCityCapacities(data, selectedCities);
    makeGraphsWithD3(combinedCityCapacityObjects, "init");
}


function mergeCityCapacities(data, selectedCities) {
    let selectedCityObjects = data.filter(d => isCityMatch(d, selectedCities));
    let openedCityObjects = selectedCityObjects.filter(isObjectOpened);

    return addCapacities(openedCityObjects, selectedCities);
}

function isObjectOpened(cityObject) {
    const day = document.querySelector('input[type=radio]:checked').value;
    const time = document.querySelector("input[type=range").value * 100;

    const objectDag = cityObject.openingstijden.find(d => d.days == day);

    if (objectDag == null) return false;

    const openingsTijden = [objectDag.enterfrom, objectDag.enteruntil];
    if (time <= openingsTijden[1] && time >= openingsTijden[0]) return true;
    return false;
}

function addCapacities(cityObject, selectedCities) {
    let totals = []
    for (let i in selectedCities) {
        totals[i] = { stad: selectedCities[i], capaciteit: 0, laadpalen: 0 };
        for (let city in cityObject) {
            if (selectedCities[i] == cityObject[city].stad) {
                totals[i].capaciteit += parseInt(cityObject[city].capaciteit);
            }
        }
    }
    return totals;
}

function isCityMatch(dataEntry, selectedCities) {
    for (let city in selectedCities) {
        if (selectedCities[city] == dataEntry.stad) {
            return true;
        }
    }
    return false;
}




// Set up some stuff. SVG = SVG, width=width etc.
const svg = d3.select('svg');
const width = +svg.attr('width');
const height = +svg.attr('height');

//Get some margins otherwise the axis will fall outside the SVG.
const margin = { top: 20, right: 75, bottom: 50, left: 75 }

//Then calc an innerwidth and height.
const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;


// The yScale. The y axis and the data is run against this function so that everything is in proportion.
const yScale = d3.scaleLinear()
    .domain([0, 8500]) // was set to d3.max(something) making the axis dynamic. I put this to 8500
    // (the max data output) so the relation between days is visually stronger
    .range([innerHeight, 0]); // upside down because svg draws from top left.

// The xScale. The x axis and the data is run against this function so that everything is in proportion.
// Citynames will be on the right spot, and the bars will have the correct width.

const group = svg.append('g')
    .attr("transform", `translate(${margin.left}, ${margin.top})`) // translating the actual datavis to the right and to the bottom, so it centers a bit
    .attr("class", "barbox"); // adding a class, just for myself




function makeGraphsWithD3(workableData) {
    const render = data => {

        const xScale = d3.scaleBand()
        .domain(data.map(d => d.stad))  // extracting the citynames from the dataset, making them the domain.
        .range([0, innerWidth]) // zero to 100
        .padding(0.1); // meaning distance between the bars
    

        group.append('g').call(d3.axisLeft(yScale))
            .attr("class", "ax y");
        group.append('g').call(d3.axisBottom(xScale))
            .attr("transform", `translate(0, ${innerHeight})`)
            .attr("class", "ax x");

        group.selectAll('rect') // selecting the group to position it on the baseline,
            .data(data)         //assigning the data to the bars
            .enter().append('rect')   //enter (focusing) and append a rectangle for each new data entry
            .attr('x', d => xScale(d.stad)) // distance x on scale 
            .attr('width', xScale.bandwidth())  // width on scale 
            .attr('y', d => yScale(+d.capaciteit))  // distance from the top, as svg draws from the top and not the bottom
            .attr('height', d => innerHeight - yScale(+d.capaciteit)) // start drawing from there to the bottom
            .attr('class', 'bar'); // again, for myself.

    }
    //and put it to work!
    render(workableData);
}

function update(workableData) {
    const render = data => {   
        const xScale = d3.scaleBand()
        .domain(data.map(d => d.stad))  // extracting the citynames from the dataset, making them the domain.
        .range([0, innerWidth]) // zero to 100
        .padding(0.1); // meaning distance between the bars
    

        let allBars = d3.select(".barbox").selectAll('rect')// selecting the bars that are already made, putting them into a letiable.
            .data(data);  // put in the new data
        allBars.enter() // focus on what's new.
            .append("rect") // make a rect for this.

            // FROM 
            .attr('x', width) // all the way to right because we want to make a nice transition, offscreen
            .attr('y', d => height - yScale(d.capaciteit)) // allllll the way to the bottom, offscreen
            .attr('width', xScale.bandwidth()) // get the width right though
            .attr('height', d => yScale(+d.capaciteit)) // height too
            .attr('class', 'bar') // for me again
            .merge(allBars) // Putterthere!
            .transition() // and make it smooth 
            .duration(500) // half a second

            //TO 
            .attr('x', d => xScale(d.stad)) // new position
            .attr('y', d => yScale(+d.capaciteit)) //new position
            .attr('width', xScale.bandwidth()) // same width
            .attr('height', d => innerHeight - yScale(+d.capaciteit)); // same height

        let oldBars = d3.select(".barbox").selectAll('rect')  // selecting the bars that are already made, putting them into a letiable.
            .data(data); // put in the new data
        oldBars.exit() // focus on what's old.
            .remove(); // and get rid of that.

        // update Axis
            group.selectAll(".ax.y")
                .transition()
                .duration(500)
                .call(d3.axisLeft(yScale))

            group.selectAll('.ax.x')
                .transition()
                .duration(500)
                .call(d3.axisBottom(xScale))
    }
    render(workableData);
}


function isInOldData(entry, oldData) {
    for (let i in oldData) {
        if (entry.stad == oldData[i].stad) return true;
    }
    return false;
}

// TIME SLIDER
d3.select("#time")
    .on("input", function () {
        let combinedCityCapacityObjects = mergeCityCapacities(workArray, selectedCities);
        update(combinedCityCapacityObjects);
        updateTitle();
    })



// CITIES CHECKBOXES
let selectedCities = ["Amsterdam", "Delft", "Assen", "Den Haag"];
d3.selectAll('.cities')
    .on("click", function (e) {
        if (e.target.type == "checkbox") {
            if (e.target.checked) selectedCities.push(e.target.value);
            else selectedCities = selectedCities.filter(d => d != e.target.value);

            let combinedCityCapacityObjects = mergeCityCapacities(workArray, selectedCities);
            update(combinedCityCapacityObjects);
        }
    });



// DAYS RADIOS
d3.selectAll('input[type=radio]')
    .on("change", function () {
        let combinedCityCapacityObjects = mergeCityCapacities(workArray, selectedCities);
        update(combinedCityCapacityObjects);
        updateTitle();
    });



function updateTitle() {
    document.querySelector(".day").textContent = document.querySelector("input[type=radio]:checked").value;
    let range = time_convert(document.querySelector("input[type=range]").value * 60);

    document.querySelector(".time").textContent = range;
    document.querySelector("h3 span").textContent = range;

}


// Source: https://www.w3resource.com/javascript-exercises/javascript-basic-exercise-51.php modified a bit myself
function time_convert(num) {
    let hours = Math.floor(num / 60);
    let minutes = "00";
    if (hours < 10) hours = "0" + hours;
    return hours + ":" + minutes;
}

updateTitle();