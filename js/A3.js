function groupbarchart() {

  var margin = {top: 10, right: 30, bottom: 120, left: 60},
    width = 2000 - margin.left - margin.right,
    height = 1000 - margin.top - margin.bottom;

  //SVG for chart block
  var svg = d3.select("#groupchart")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

  d3.csv("dataset/OECDPersons.csv").then(function(data) {
  //skip first column and assign each column to variable array
  var years = data.columns.slice(1)
  var legends = ["2015", "2016", "2017", "2018", "2019", "2020", "2021", "2022", "2023", "2024", "2025"]

  
  // Add X axis
  var xScale = d3.scaleBand()
      .domain(data.map(function(d) { return d.Timeperiod; }))
      .range([0, width])
      .padding([0.2])
        svg.append("g")
          .attr("transform", "translate(0," + height + ")")
          .call(d3.axisBottom(xScale).tickSize(5))
          .selectAll("text")
          .attr("transform", "rotate(-45)")
          .style("text-anchor", "end");

  // Add Y axis
  var yScale = d3.scaleLinear()
    .domain([0, 1500000])
    .range([ height, 0 ]);
  svg.append("g")
    .call(d3.axisLeft(yScale));

  //Another xScale to add multiple bars
  var xSubgroup = d3.scaleBand()
    .domain(years)
    .range([0, xScale.bandwidth()])
    .padding([0.05])
 
  var color = d3.scaleOrdinal()
    .domain(years, legends)
    .range(['#a6cee3',
  '#1f78b4',
  '#b2df8a',
  '#33a02c',
  '#fb9a99',
  '#e31a1c',
  '#fdbf6f',
  '#ff7f00',
  '#cab2d6',
  '#6a3d9a',
  '#ffff99'])

  //Rectangle bars
  svg.append("g")
    .selectAll("g")
    .data(data)
    .enter()
    .append("g")
    .attr("transform", function(d) { return "translate(" + xScale(d.Timeperiod) + ",0)"; })
    .selectAll("rect")
    .data(function(d) { return years.map(function(key) { return {key: key, value: d[key] === "" ? 0 : +d[key]}; }); }) 
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", function(d) { return xSubgroup(d.key); })
    .attr("y", function(d) { return yScale(d.value); })
    .attr("width", xSubgroup.bandwidth())
    .attr("height", function(d) { return height - yScale(d.value); })
    .attr("fill", function(d) { return color(d.key)})

      .on("mouseover", function(event, d) { //tooltip function
                d3.select(this).attr("fill", "orange");
                var xPosition = parseFloat(d3.select(this).attr("x")); //tooltip position relative to bar position
                var yPosition = parseFloat(d3.select(this).attr("y"));

                svg.append("text")
                    .attr("id", "tooltip")
                    .attr("x", xPosition + xSubgroup.bandwidth() / 4)
                    .attr("y", yPosition + 14)
                    .text(d);
      })
      .on("mouseout", function(d) { //mouse out function colour change
          d3.select(this).attr("fill", function(d) { return color(d.key)});
          d3.select("#tooltip").remove();
      });

  //Block for legend 
  var size = 20
  var itemWidth = 120
  var legendY = height + 80

  svg.selectAll("squares")
    .data(legends)
    .enter()
    .append("rect")
      .attr("x", function(d,i){ return i*itemWidth })
      .attr("y", legendY)
      .attr("width", size)
      .attr("height", size)
      .style("fill", function(d){ return color(d) })

  svg.selectAll("legendtext")
    .data(legends)
    .enter()
    .append("text")
      .attr("x", function(d,i){ return i*itemWidth + size*1.2 })
      .attr("y", legendY + size/2)
      .style("fill", function(d){ return color(d) })
      .text(function(d){ return d })
      .attr("text-anchor", "start")
      .style("alignment-baseline", "middle")

    // add the options to the button
    d3.select("#filterbutton")
      .selectAll('myOptions')
     	.data(years) //years option
      .enter()
    	.append('option')
      .text(function (d) { return d; }) 
      .attr("value", function (d) { return d;
    });

    //when selecting year via button, function updates the bars
    d3.select("#filterbutton").on("change", function() {
      var selectedYear = d3.select(this).property("value");
      update(selectedYear);
    });

    //reset button, refreshes chart to display all years
    d3.select("#reset").on("click", function() {
      location.reload();//reloads current document
    }); 

  //animates bar after selecting the year
  function update(selectedYear) {
    svg.selectAll(".bar")
      .transition()
      .duration(500)
      .attr("x", function(d) { return d.key === selectedYear ? 0 : xSubgroup(d.key); })
      .attr("width", function(d) { return d.key === selectedYear ? xScale.bandwidth() : xSubgroup.bandwidth(); })
      .style("opacity", function(d) { return d.key === selectedYear ? 1 : 0; });
  }
});
}
