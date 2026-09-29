// Vertical bar chart: practising caring personnel (Persons) by country
// Author: Isuri Ihalagamage
const PERSONS_CSV_FILE = "OECD.ELS.HD,DSD_HEALTH_REAC_EMP@DF_CARE,+.......P..csv";
const MAX_COUNTRIES = Infinity;

const VBAR_PX_PER_COUNTRY = 34;
const VBAR_MIN_CHART_WIDTH = 800;

const MIN_COUNTRIES_FOR_DEFAULT = 10;

const VBAR_METRICS = {
    "Persons": {
        unit: "Persons",
        label: "Persons",
        yAxisLabel: "Number of caring personnel",
        tooltipLabel: "Caring personnel",
        axisFormat: d3.format(".2~s"),
        fullFormat: d3.format(",.2~f")
    }
};

const VBAR_ACTIVITY_STATUS = "Practicing";
const VBAR_HEALTH_PROFESSION = "Caring personnel";
const VBAR_ACTIVITY_STATUS_LABEL = "Practising";

function loadPersonsCsv() {
    var localEncoded = "dataset/" + encodeURIComponent(PERSONS_CSV_FILE);
    var localPlain = "dataset/" + PERSONS_CSV_FILE;
    var github = "https://raw.githubusercontent.com/Hitesh913/Data-Visualisation-Website-Project-D3/main/dataset/" +
        encodeURIComponent(PERSONS_CSV_FILE);

    return d3.csv(localEncoded)
        .catch(function () { return d3.csv(localPlain); })
        .catch(function () { return d3.csv(github); });
}

function preparePersonsData(rawData, metricKey) {
    var metric = VBAR_METRICS[metricKey];

    return rawData
        .filter(function (d) {
            return d["Unit of measure"] === metric.unit &&
                d["Health profession activity status"] === VBAR_ACTIVITY_STATUS &&
                d["Health profession"] === VBAR_HEALTH_PROFESSION;
        })
        .map(function (d) {
            var rawValue = d["OBS_VALUE"];
            return {
                country: d["Reference area"] ? d["Reference area"].trim() : "",
                year: +d["TIME_PERIOD"],
                // Empty strings would become 0 with "+", so treat them as missing
                value: (rawValue === undefined || rawValue === null || String(rawValue).trim() === "")
                    ? NaN
                    : +rawValue
            };
        })
        .filter(function (d) {
            return d.country !== "" &&
                Number.isInteger(d.year) && d.year > 0 &&
                isFinite(d.value) && d.value > 0;
        });
}

function getAvailableYears(data) {
    return Array.from(new Set(data.map(function (d) { return d.year; })))
        .sort(function (a, b) { return a - b; });
}

function getDefaultYear(data, years) {
    for (var i = years.length - 1; i >= 0; i--) {
        var count = getDataForYear(data, years[i]).length;
        if (count >= MIN_COUNTRIES_FOR_DEFAULT) {
            return years[i];
        }
    }
    return years[years.length - 1];
}

// All countries for one year, largest value first
function getDataForYear(data, year) {
    return data
        .filter(function (d) { return d.year === year; })
        .sort(function (a, b) { return b.value - a.value; });
}

function drawVerticalBarChartPersons(containerId) {
    var selectedMetric = "Persons";
    var metric = VBAR_METRICS[selectedMetric];

    const container = d3.select(containerId);
    container.html("");

    container.append("h3")
        .attr("class", "vbar-heading")
        .text("Vertical bar chart: " + VBAR_ACTIVITY_STATUS_LABEL + " Caring Personnel (" + metric.label + ")");

    // Controls
    const controls = container.append("div")
        .attr("class", "vbar-chart-controls");

    const yearGroup = controls.append("div")
        .attr("class", "vbar-control-group");

    yearGroup.append("label")
        .attr("for", "year-persons")
        .text("Select year:");

    const yearSelect = yearGroup.append("select")
        .attr("id", "year-persons");

    const hint = controls.append("p")
        .attr("class", "vbar-control-hint");

    const chartArea = container.append("div")
        .attr("class", "vbar-chart-area");

    const tooltip = container.append("div")
        .attr("class", "vbar-tooltip")
        .style("opacity", 0);

    loadPersonsCsv().then(function (rawData) {

        const data = preparePersonsData(rawData, selectedMetric);

        if (data.length === 0) {
            chartArea.append("p")
                .attr("class", "vbar-message")
                .text("No valid " + metric.label + " records were found in the caring personnel dataset.");
            return;
        }

        const years = getAvailableYears(data);
        const defaultYear = getDefaultYear(data, years);

        yearSelect.selectAll("option")
            .data(years)
            .join("option")
            .attr("value", function (d) { return d; })
            .text(function (d) { return d; })
            .property("selected", function (d) { return d === defaultYear; });

        yearSelect.on("change", function () {
            updateChart();
        });

        const allCountries = Array.from(new Set(data.map(function (d) { return d.country; })))
            .sort();

        const missingNote = container.insert("p", ".vbar-tooltip")
            .attr("class", "vbar-missing-note");

        updateChart();

        function updateChart() {
            var year = +yearSelect.property("value");
            var allForYear = getDataForYear(data, year);
            var yearData = allForYear.slice(0, MAX_COUNTRIES);

            var shown = new Set(allForYear.map(function (d) { return d.country; }));
            var missing = allCountries.filter(function (c) { return !shown.has(c); });
            missingNote.text(missing.length > 0
                ? "No " + metric.label + " data in the dataset for " + year + ": " + missing.join(", ") + "."
                : "");

            if (allForYear.length > yearData.length) {
                hint.text("Showing the top " + yearData.length + " of " + allForYear.length +
                    " countries with data for " + year + ", sorted from highest to lowest.");
            } else {
                hint.text("Showing all " + yearData.length + " countries with data for " + year +
                    ", sorted from highest to lowest.");
            }

            tooltip.style("opacity", 0);
            chartArea.html("");
            drawChart(yearData, year);
        }

        function drawChart(yearData, year) {
            var margin = { top: 60, right: 30, bottom: 130, left: 100 };
            var outerWidth = Math.max(VBAR_MIN_CHART_WIDTH,
                margin.left + margin.right + yearData.length * VBAR_PX_PER_COUNTRY);
            var outerHeight = 520;
            var width = outerWidth - margin.left - margin.right;
            var height = outerHeight - margin.top - margin.bottom;

            var svgRoot = chartArea.append("svg")
                .attr("class", "vbar-svg")
                .attr("viewBox", "0 0 " + outerWidth + " " + outerHeight)
                .attr("preserveAspectRatio", "xMidYMid meet")
                .style("min-width", Math.round(outerWidth * 0.8) + "px")
                .attr("role", "img")
                .attr("aria-label", VBAR_ACTIVITY_STATUS_LABEL + " caring personnel by country, " +
                    metric.label + ", " + year);

            var svg = svgRoot.append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            // Title
            svg.append("text")
                .attr("class", "vbar-title")
                .attr("x", width / 2)
                .attr("y", -28)
                .attr("text-anchor", "middle")
                .text(VBAR_ACTIVITY_STATUS_LABEL + " Caring Personnel by Country — " +
                    metric.label + " (" + year + ")");

            if (yearData.length === 0) {
                svg.append("text")
                    .attr("class", "vbar-axis-label")
                    .attr("x", width / 2)
                    .attr("y", height / 2)
                    .attr("text-anchor", "middle")
                    .text("No data available for " + year + ".");
                return;
            }

            // Scales
            var x = d3.scaleBand()
                .domain(yearData.map(function (d) { return d.country; }))
                .range([0, width])
                .padding(0.2);

            var maxValue = d3.max(yearData, function (d) { return d.value; });
            var y = d3.scaleLinear()
                .domain([0, maxValue > 0 ? maxValue : 1])
                .nice()
                .range([height, 0]);

            // Light horizontal gridlines
            svg.append("g")
                .attr("class", "vbar-grid")
                .call(d3.axisLeft(y).ticks(6).tickSize(-width).tickFormat(""))
                .call(function (g) { g.select(".domain").remove(); });

            // X axis (rotated country labels)
            svg.append("g")
                .attr("class", "vbar-x-axis")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(x))
                .selectAll("text")
                .attr("text-anchor", "end")
                .attr("dx", "-0.6em")
                .attr("dy", "0.25em")
                .attr("transform", "rotate(-40)");

            svg.append("text")
                .attr("class", "vbar-axis-label")
                .attr("x", width / 2)
                .attr("y", height + margin.bottom - 15)
                .attr("text-anchor", "middle")
                .text("Country");

            // Y axis
            svg.append("g")
                .attr("class", "vbar-y-axis")
                .call(d3.axisLeft(y).ticks(6).tickFormat(metric.axisFormat));

            svg.append("text")
                .attr("class", "vbar-axis-label")
                .attr("transform", "rotate(-90)")
                .attr("x", -height / 2)
                .attr("y", -margin.left + 25)
                .attr("text-anchor", "middle")
                .text(metric.yAxisLabel);

            // Bars
            var bars = svg.selectAll(".vbar")
                .data(yearData)
                .join("rect")
                .attr("class", "vbar")
                .attr("x", function (d) { return x(d.country); })
                .attr("y", function (d) { return y(d.value); })
                .attr("width", x.bandwidth())
                .attr("height", function (d) { return height - y(d.value); });

            svg.selectAll(".vbar-hit")
                .data(yearData)
                .join("rect")
                .attr("class", "vbar-hit")
                .attr("x", function (d) { return x(d.country) - x.step() * x.paddingInner() / 2; })
                .attr("y", 0)
                .attr("width", x.step())
                .attr("height", height)
                .on("mouseover", function (event, d) {
                    bars.classed("vbar-active", function (b) { return b.country === d.country; });
                    tooltip
                        .html(
                            "<strong>Country:</strong> " + d.country + "<br>" +
                            "<strong>Year:</strong> " + d.year + "<br>" +
                            "<strong>Metric:</strong> " + metric.label + "<br>" +
                            "<strong>Status:</strong> " + VBAR_ACTIVITY_STATUS_LABEL + "<br>" +
                            "<strong>" + metric.tooltipLabel + ":</strong> " + metric.fullFormat(d.value)
                        )
                        .style("opacity", 1);
                    moveTooltip(event);
                })
                .on("mousemove", function (event) {
                    moveTooltip(event);
                })
                .on("mouseout", function () {
                    bars.classed("vbar-active", false);
                    tooltip.style("opacity", 0);
                });
        }

        function moveTooltip(event) {
            var containerNode = container.node();
            var pos = d3.pointer(event, containerNode);
            var tipNode = tooltip.node();
            var tipWidth = tipNode.offsetWidth;
            var left = pos[0] + 14;
            
            if (left + tipWidth > containerNode.clientWidth) {
                left = pos[0] - tipWidth - 14;
            }

            tooltip
                .style("left", Math.max(0, left) + "px")
                .style("top", (pos[1] - 10) + "px");
        }

    }).catch(function (error) {
        console.error("Vertical Persons chart: could not load the CSV.", error);
        chartArea.html("");
        chartArea.append("p")
            .attr("class", "vbar-message")
            .html("Could not load the caring personnel dataset.<br>" +
                "Please run the website through Live Server or another local web server.");
    });
}
