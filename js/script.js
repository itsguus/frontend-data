var parkingToegangUrl = "https://opendata.rdw.nl/resource/edv8-qiyg.json?$limit=5000",
    parkeerGebiedUrl = "https://opendata.rdw.nl/resource/b3us-f26s.json?$limit=5000",
    geoDataUrl = "https://opendata.rdw.nl/resource/nsk3-v9n7.json?$limit=7000",

    workLocal = true;

if (workLocal) {
    parkingToegangUrl = "/parking-toegang.json"
    geoDataUrl = "/geodata.json"
    parkeerGebiedUrl = "/parkeergebied.json"
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
                        addCityNameToWorkArray(geoData);
                        // console.log(workArray);
                    })
            })
    });




function addCityNameToWorkArray(geoDataSet) {
    let areaIdsAndGeoData = geoDataSet.map(entry => [entry.areaid, { geodata: entry.areageometryastext }]),
        areaIdsAndGeoDataThatIWant = areaIdsAndGeoData.filter(checkIfAreaIdInWorkArray);
        
        areaIdsAndGeoDataThatIWant = areaIdsAndGeoDataThatIWant.map(shapeToLatLong);
    
    // let cityNames = areaIdsAndGeoDataThatIWant.map(translateLatLongToCityName);


    // console.log(areaIdsAndGeoDataThatIWant[0]);

    translateLatLongToCityName(areaIdsAndGeoDataThatIWant[0]).then(
        value => {console.log(value);}
    );
}


async function translateLatLongToCityName(latLong) {
    var lat = latLong[1].lat,
        long = latLong[1].long;
    // cityUrl = "https://maps.googleapis.com/maps/api/geocode/json?latlng="+ lat + ","+ long + "&key=AIzaSyAbI0apjUDIAYQua581VGPwBsDOqtD-FsA", 
    cityUrl = "https://nominatim.openstreetmap.org/reverse?format=json&lat=" + lat + "&lon=" + long + "&zoom=18&addressdetails=1";
    
    return cityName = [latLong[0], {"cityname": "Guustown"}];

    // const response = await fetch(cityUrl);
    // const data = await response.json();
    // return cityName = await data.address.town;
}


//  https://maps.googleapis.com/maps/api/geocode/json?latlng=[LAT],[LONG]&key=AIzaSyAbI0apjUDIAYQua581VGPwBsDOqtD-FsA

function shapeToLatLong(shape) {
    var polygonString = shape[1].geodata,
    lat,
    long;
    if (polygonString.includes("POLYGON")) {
        var pointsArray = polygonString
            .replace("POLYGON", "")
            .replace("((", "")
            .replace("))", "")
            .trim()
            .split(",");
        points = pointsArray.map(point => point.trim().split(" ")),
        lat = getAverage(points, 1),
        long = getAverage(points, 0);
    }
    else {
        var latLong = getLatLong(shape);
        lat = latLong[0]
        long = latLong[1]
    }
    return [shape[0], { "lat": lat, "long": long }];
}

function getAverage(array, index) {
    var total = 0;
    for (var i in array) {
        total = total + parseFloat((array[i][index]));
    }
    return (total / array.length);
}

function getLatLong(geoPoint) {
    var latLong = [],
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
        var matchedArray = dataSetToBeAddedTo.find(entry => entry[0] == entryToAddId);
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
    for (var day in weekdays) {
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


//      https://maps.googleapis.com/maps/api/geocode/json?latlng=[LAT],[LONG]&key=AIzaSyAbI0apjUDIAYQua581VGPwBsDOqtD-FsA


// API Code LocationIQ pk.d7636e5d5290f28cacda9f815b4a7b0d


// API Code Google AIzaSyAbI0apjUDIAYQua581VGPwBsDOqtD-FsA