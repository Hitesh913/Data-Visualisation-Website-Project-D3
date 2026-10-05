function groupbarchart() {
  var groupchart = document.getElementById("groupchart");
  var menuDiv = document.createElement("div");
  menuDiv.id = "newdiv";
  groupchart.before(menuDiv);

  var titleDiv = document.createElement("div");
  titleDiv.id = "chart-title";
  titleDiv.textContent = "Grouped Bar Chart: Practising Caring Personnel (Persons)";
  menuDiv.before(titleDiv);

  // Supporting context
  var contextDiv = document.createElement("div");
  contextDiv.className = "chart-context chart-context--gbar";
  contextDiv.innerHTML =
    "<p class=\"chart-context__lead\">" +
      "This visualisation shows <strong>practising caring personnel (Persons)</strong> " +
      "for each country across multiple years side by side, so year-to-year patterns are easy to compare." +
    "</p>" +
    "<ul class=\"chart-context__list\">" +
      "<li><strong>Dataset:</strong> OECD Caring Personnel data reshaped as <code>OECDPersons.csv</code> " +
      "(countries as rows, years as columns).</li>" +
      "<li><strong>What you can discover:</strong> which countries grow or shrink over time, " +
      "how years compare within a country, and where values stand out against neighbouring years.</li>" +
      "<li><strong>Source:</strong> OECD Health Statistics — Health and social employment " +
      "(Caring personnel / personal care workers).</li>" +
    "</ul>";
  menuDiv.before(contextDiv);

  d3.select("#newdiv")
  .append("p")
  .attr("id", "myp")
  .html("<strong>How to use:</strong> pick a year from the dropdown to focus on it, or press Reset to bring back every year. Hover over a bar for its exact value.");
  
  var chartContainer = d3.select(menuDiv);
  chartContainer.append("select")
    .attr("id", "filterbutton");
  chartContainer.append("button")
    .attr("id", "reset")
    .attr("type", "button")
    .text("Reset");

  var margin = {top: 20, right: 20, bottom: 170, left: 80},
    width = 1020 - margin.left - margin.right,
    height = 720 - margin.top - margin.bottom;

  //SVG for chart block
  var svg = d3.select("#groupchart")
  .append("svg")
    .attr("viewBox", "0 0 " + (width + margin.left + margin.right) + " " + (height + margin.top + margin.bottom))
    .attr("preserveAspectRatio", "xMidYMid meet")
    .attr("role", "img")
    .attr("aria-label", "Grouped bar chart of practising caring personnel by country and year")
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
          .call(d3.axisBottom(xScale).tickSize(0).tickPadding(8))
          .selectAll("text")
          .attr("transform", "rotate(-45)")
          .style("text-anchor", "end");

  // Add Y axis
  // Scale to the largest value in the data so no bar is cut off
  var maxValue = d3.max(data, function(d) {
    return d3.max(years, function(key) { return d[key] === "" ? 0 : +d[key]; });
  });
  var yScale = d3.scaleLinear()
    .domain([0, maxValue])
    .nice()
    .range([ height, 0 ])

  // Light horizontal gridlines
  svg.append("g")
    .attr("class", "gbar-grid")
    .call(d3.axisLeft(yScale).ticks(8).tickSize(-width).tickFormat(""));

  svg.append("g")
    .call(d3.axisLeft(yScale).ticks(8).tickFormat(d3.format(".2~s")));

  svg.append("text")
    .attr("class", "gbar-axis-label")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -margin.left + 20)
    .attr("text-anchor", "middle")
    .text("Number of caring personnel");

  svg.append("text")
    .attr("class", "gbar-axis-label")
    .attr("x", width / 2)
    .attr("y", height + 95)
    .attr("text-anchor", "middle")
    .text("Country");

  //Another xScale to add multiple bars
  var xSubgroup = d3.scaleBand()
    .domain(years)
    .range([0, xScale.bandwidth()])
    .padding([0])
 
  var color = d3.scaleOrdinal()
    .domain(years, legends)
    // Years are ordered, so use a sequential ramp (gold for 2015 through to deep teal for 2025)
    .range(d3.quantize(d3.interpolateRgbBasis(["#e9b949", "#e07b39", "#b8432f", "#7d3a62", "#3d5a80", "#1a4a50"]), legends.length))

  var tooltip = d3.select("body")
    .selectAll("#grouped-bar-tooltip")
    .data([null])
    .join("div")
    .attr("id", "grouped-bar-tooltip")
    .style("opacity", 0);

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
    .attr("rx", 1)
    //tooltip
    .on("mouseover", function(event) {
      tooltip.style("opacity", 1);
      d3.select(this)
        .style("stroke", "#0f2f34")
        .style("stroke-width", "1px");
    })
    .on("mousemove", function(event, d) {
      tooltip
        .html("<strong>Country:</strong> " + d3.select(this.parentNode).datum().Timeperiod +
              "<br><strong>Year:</strong> " + d.key +
              "<br><strong>Personnel:</strong> " + (d.value ? d3.format(",")(d.value) : "No data"))
        .style("left", (event.clientX + 12) + "px")
        .style("top", (event.clientY + 12) + "px");
    })
    .on("mouseleave", function() {
      tooltip.style("opacity", 0);
      d3.select(this).style("stroke", "none");
    });

  //Block for legend 
  var size = 14
  var itemWidth = 72
  var legendY = height + 130
  var legendX = (width - legends.length * itemWidth) / 2

  svg.selectAll("squares")
    .data(legends)
    .enter()
    .append("rect")
      .attr("x", function(d,i){ return legendX + i*itemWidth })
      .attr("y", legendY)
      .attr("width", size)
      .attr("height", size)
      .attr("rx", 3)
      .style("fill", function(d){ return color(d) })

  svg.selectAll("legendtext")
    .data(legends)
    .enter()
    .append("text")
      .attr("x", function(d,i){ return legendX + i*itemWidth + size*1.5 })
      .attr("y", legendY + size/2)
      .style("font-size", "13px")
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
