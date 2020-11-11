function makeGraphsWithD3(workableData) {


    const svg = d3.select('svg');

    const width = +svg.attr('width');
    const height = +svg.attr('height');

    const yValue = d => stad = d.stad;
    const xValue = d => +d.capaciteit;

    const margin = {top: 20, right: 20, bottom: 20, left: 200}
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const render = data => {
        const xScale = d3.scaleLinear()
            .domain([0, d3.max(data, xValue)])
            .range([0, innerWidth]);

            // const xAxis = d3.axisLeft(xScale);

        const yScale = d3.scaleBand()
            .domain(data.map(d => d.stad))
            .range([0, innerHeight])
            .padding(0.1);

        const g = svg.append('g')
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

        g.append('g').call(d3.axisLeft(yScale));
        g.append('g').call(d3.axisBottom(xScale))
            .attr("transform", `translate(0, ${ innerHeight })`);

        g.selectAll('rect').data(data)
            .enter().append('rect')
                .attr('y', d=> yScale(d.stad))
                .attr('width', d => xScale(xValue(d)))
                .attr('height', yScale.bandwidth());
    };
    render(workableData);
    console.log(workableData);
}