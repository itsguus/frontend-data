
// TIME SLIDER
d3.select("#time")
    .on("input", function () {
        let combinedCityCapacityObjects = mergeCityCapacities(workArray, selectedCities);
        makeGraphsWithD3(combinedCityCapacityObjects, "update");
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