function createCityInputs(data) {
    const citybox = document.querySelector('.cities');
    let allCityNames = [];
    for (var i in data) {
        if (!allCityNames.includes(data[i].stad)) {
            allCityNames.push(data[i].stad);
        }
    }
    for (var city in allCityNames) {
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
    var totals = []
    for (var i in selectedCities) {
        totals[i] = { stad: selectedCities[i], capaciteit: 0, laadpalen: 0 };
        for (var city in cityObject) {
            if (selectedCities[i] == cityObject[city].stad) {
                totals[i].capaciteit += parseInt(cityObject[city].capaciteit);
            }
        }
    }
    return totals;
}

function isCityMatch(dataEntry, selectedCities) {
    for (var city in selectedCities) {
        if (selectedCities[city] == dataEntry.stad) {
            return true;
        }
    }
    return false;
}



var currentlyLoadedData = [];
function makeGraphsWithD3(workableData, task) {

    var tooMuchData = false;
    if (workableData.length > 16) tooMuchData = true;

    const svg = d3.select('svg');


    const width = +svg.attr('width');
    const height = +svg.attr('height');

    const yValue = d => stad = d.stad;
    const xValue = d => +d.capaciteit;

    const margin = { top: 20, right: 75, bottom: 50, left: 75 }
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    const render = data => {
        const yScale = d3.scaleLinear()
            .domain([0, 8500])
            .range([innerHeight, 0]);


        const xScale = d3.scaleBand()
            .domain(data.map(d => d.stad))
            .range([0, innerWidth])
            .padding(0.1);

        const group = svg.append('g')
            .attr("transform", `translate(${margin.left}, ${margin.top})`)
            .attr("class", "barbox");

        if (task == "init") { // creates the whole thing
            svg.selectAll('.ax').remove();

            group.selectAll('rect')
                .data(data)
                .enter().append('rect')
                .attr('x', d => xScale(d.stad))
                .attr('width', xScale.bandwidth())
                .attr('y', d => yScale(+d.capaciteit))
                .attr('height', d => innerHeight - yScale(+d.capaciteit))
                .attr('class', 'bar');

        }
        else if (task == "add") {  // adds or subtracts a bar, reshapes the rest
            svg.selectAll('.ax').remove();
            var allBars = d3.select(".barbox").selectAll('rect')
                .data(workableData);
            allBars.enter()
                .append("rect")
                .attr('x', width)
                .attr('y', d => height - yScale(d.capaciteit))
                .attr('width', xScale.bandwidth())
                .attr('height', d => yScale(+d.capaciteit))
                .attr('class', 'bar')
                .merge(allBars)
                .transition()
                .duration(500)
                .attr('x', d => xScale(d.stad))
                .attr('y', d => yScale(+d.capaciteit))
                .attr('width', xScale.bandwidth())
                .attr('height', d => innerHeight - yScale(+d.capaciteit));

                
            var oldBars = d3.select(".barbox").selectAll('rect')
                .data(workableData);
                oldBars.exit()
                .remove();
        }

        else if (task == "update") { // only changes height of the bars already there
            svg.selectAll('.ax').remove();

            svg.selectAll("rect")
                .data(data)
                .transition()
                .duration(500)
                .attr("y", d => yScale(+d.capaciteit))
                .attr("height", d => innerHeight - yScale(+d.capaciteit));
        }


        group.append('g').call(d3.axisLeft(yScale))
            .attr("class", "ax y");
        group.append('g').call(d3.axisBottom(xScale))
            .attr("transform", `translate(0, ${innerHeight})`)
            .attr("class", "ax x");

    }
    render(workableData);
    currentlyLoadedData = workableData;
}


function isInOldData(entry, oldData) {
    for (var i in oldData) {
        if (entry.stad == oldData[i].stad) return true;
    }
    return false;
}

// TIME SLIDER
d3.select("#time")
    .on("input", function () {
        let combinedCityCapacityObjects = mergeCityCapacities(workArray, selectedCities);
        makeGraphsWithD3(combinedCityCapacityObjects, "update");
        updateTitle();
    })



// CITIES CHECKBOXES
var selectedCities = ["Amsterdam", "Delft", "Assen", "Den Haag"];
d3.selectAll('.cities')
    .on("click", function (e) {
        if (e.target.type == "checkbox") {
            if (e.target.checked) selectedCities.push(e.target.value);
            else selectedCities = selectedCities.filter(d => d != e.target.value);

            let combinedCityCapacityObjects = mergeCityCapacities(workArray, selectedCities);
            makeGraphsWithD3(combinedCityCapacityObjects, "add");
        }
    });



// DAYS RADIOS
d3.selectAll('input[type=radio]')
    .on("change", function () {
        let combinedCityCapacityObjects = mergeCityCapacities(workArray, selectedCities);
        makeGraphsWithD3(combinedCityCapacityObjects, "update");
        updateTitle();
    });



function updateTitle() {
    document.querySelector(".day").textContent = document.querySelector("input[type=radio]:checked").value;
    var range = time_convert(document.querySelector("input[type=range]").value * 60);

    document.querySelector(".time").textContent = range;
    document.querySelector("h3 span").textContent = range;

}


// Source: https://www.w3resource.com/javascript-exercises/javascript-basic-exercise-51.php modified a bit myself
function time_convert(num) {
    var hours = Math.floor(num / 60);
    var minutes = "00";
    if (hours < 10) hours = "0" + hours;
    return hours + ":" + minutes;
}

updateTitle();