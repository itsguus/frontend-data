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


