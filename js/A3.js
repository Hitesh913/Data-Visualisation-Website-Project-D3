function groupbarchart() {
  var groupchart = document.getElementById("groupchart");
  var menuDiv = document.createElement("div");
  menuDiv.id = "newdiv";
  groupchart.before(menuDiv);

  var titleDiv = document.createElement("div");
  titleDiv.id = "chart-title";
  titleDiv.textContent = "Grouped Bar Chart: Practising Caring Personnel (Persons)";
  menuDiv.before(titleDiv);

  d3.select("#newdiv")
  .append("p")
  .attr("id", "myp")
  .html("Instructions:<br> -Filter option left click and select year, filters by year <br> -Reset to return to all years");
  
  var chartContainer = d3.select(menuDiv);
  chartContainer.append("select")
    .attr("id", "filterbutton");
  chartContainer.append("button")
    .attr("id", "reset")
    .attr("type", "button")
    .text("Reset");

  var margin = {top: 10, right: 10, bottom: 160, left: 80},
    width = 1020 - margin.left - margin.right,
    height = 1000 - margin.top - margin.bottom;

  //SVG for chart block
  var svg = d3.select("#groupchart")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform","translate(" + margin.left + "," + margin.top + ")");

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
          .call(d3.axisBottom(xScale).tickSize(6))
          .selectAll("text")
          .attr("transform", "rotate(-45)")
          .style("text-anchor", "end");

  // Add Y axis
  var yScale = d3.scaleLinear()
    .domain([0, 1000000])
    .range([ height, 0 ])
  svg.append("g")
    .call(d3.axisLeft(yScale).ticks(15));

  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -margin.left + 10)
    .attr("text-anchor", "middle")
    .text("Number of caring personnel");

  svg.append("text")
    .attr("x", width / 2)
    .attr("y", height + 85)
    .attr("text-anchor", "middle")
    .text("Country");

  //Another xScale to add multiple bars
  var xSubgroup = d3.scaleBand()
    .domain(years)
    .range([0, xScale.bandwidth()])
    .padding([0])
 
  var color = d3.scaleOrdinal()
    .domain(years, legends)
    .range(['#a6cee3','#1f78b4','#b2df8a','#33a02c','#fb9a99','#e31a1c','#fdbf6f','#ff7f00','#cab2d6','#6a3d9a','#ffff99'])

  var tooltip = d3.select("body")
    .selectAll("#grouped-bar-tooltip")
    .data([null])
    .join("div")
    .attr("id", "grouped-bar-tooltip")
    .style("position", "fixed")
    .style("pointer-events", "none")
    .style("opacity", 0)
    .style("z-index", 1000)
    .style("padding", "6px 8px")
    .style("color", "#111")
    .style("background-color", "white")
    .style("border", "1px solid #777")
    .style("border-radius", "3px")
    .style("font-size", "12px");

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
    //tooltip
    .on("mouseover", function(event) {
      tooltip.style("opacity", 1);
      d3.select(this)
        .style("stroke", "black")
        .style("stroke-width", "1px");
    })
    .on("mousemove", function(event, d) {
      tooltip
        .html("Year: " + d.key + "<br>Value: " + d3.format(",")(d.value))
        .style("left", (event.clientX + 12) + "px")
        .style("top", (event.clientY + 12) + "px");
    })
    .on("mouseleave", function() {
      tooltip.style("opacity", 0);
      d3.select(this).style("stroke", "none");
    });

  //Block for legend 
  var size = 20
  var itemWidth = 80
  var legendY = height + 120

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

    var yearFilter = d3.select("#filterbutton");
    yearFilter.append("option")
      .attr("value", "")
      .text("All years");
    yearFilter.selectAll(".year-option")
      .data(years)
      .enter()
      .append("option")
      .attr("class", "year-option")
      .attr("value", function(d) { return d; })
      .text(function(d) { return d; });

    yearFilter.on("change", function() {
      var selectedYear = d3.select(this).property("value");
      if (selectedYear) {
        update(selectedYear);
      } else {
        showAllYears();
      }
    });

    d3.select("#reset").on("click", function() {
      yearFilter.property("value", "");
      showAllYears();
    });

  //animates bar after selecting the year
  function update(selectedYear) {
    tooltip.style("opacity", 0).html("");
    svg.selectAll(".bar")
      .style("stroke", "none")
      .style("pointer-events", function(d) { return d.key === selectedYear ? "auto" : "none"; })
      .transition()
      .duration(500)
      .attr("x", function(d) { return d.key === selectedYear ? 0 : xSubgroup(d.key); })
      .attr("width", function(d) { return d.key === selectedYear ? xScale.bandwidth() : xSubgroup.bandwidth(); })
      .style("opacity", function(d) { return d.key === selectedYear ? 1 : 0; });
  }

  function showAllYears() {
    tooltip.style("opacity", 0).html("");
    svg.selectAll(".bar")
      .style("stroke", "none")
      .style("pointer-events", "auto")
      .transition()
      .duration(500)
      .attr("x", function(d) { return xSubgroup(d.key); })
      .attr("width", xSubgroup.bandwidth())
      .style("opacity", 1);
  }
});
}
