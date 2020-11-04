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
    let areaIdsAndGeoData = geoDataSet.map(entry => [entry.areaid, {geodata: entry.areageometryastext}]),
    areaIdsAndGeoDataThatIWant = areaIdsAndGeoData.filter(checkIfAreaIdInWorkArray);
    console.log(areaIdsAndGeoDataThatIWant);
    // transformLongLatIntoCityName()
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


    if(dataSetToBeAddedTo.find(entry => entry[0] == entryToAddId)) {
        var  matchedArray = dataSetToBeAddedTo.find(entry => entry[0] == entryToAddId);
        matchedArray.push(entryToAddObjs)
        return matchedArray;
    }
    return null;
}

function isNull(dataEntry) {
    if(dataEntry == null) return true;
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



// API Code LocationIQ pk.d7636e5d5290f28cacda9f815b4a7b0d