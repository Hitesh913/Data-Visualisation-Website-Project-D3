// Horizontal bar chart: total caring personnel (Persons)
// Author: Hitesh Kumar

const PERSONS_CSV_FILE = "OECD.ELS.HD,DSD_HEALTH_REAC_EMP@DF_CARE,+.......P..csv";

// Load dataset
function loadPersonsCsv() {
    var localEncoded = "dataset/" + encodeURIComponent(PERSONS_CSV_FILE);
    var localPlain = "dataset/" + PERSONS_CSV_FILE;
    var github = "https://raw.githubusercontent.com/Hitesh913/Data-Visualisation-Website-Project-D3/main/dataset/" +
        encodeURIComponent(PERSONS_CSV_FILE);

    return d3.csv(localEncoded)
        .catch(function () { return d3.csv(localPlain); })
        .catch(function () { return d3.csv(github); });
}

function drawHorizontalBarChartPersons(containerId) {
    const container = d3.select(containerId);
    container.html("");

    container.append("h3")
        .text("Alternative 1: Total Caring Personnel by Country");

    // Filters
    const controls = container.append("div")
        .attr("class", "hbar-chart-controls");

    const yearGroup = controls.append("div")
        .attr("class", "hbar-control-group");

    yearGroup.append("label")
        .attr("for", "year-persons")
        .text("Select year:");

    const yearSelect = yearGroup.append("select")
        .attr("id", "year-persons");

    const countryGroup = controls.append("div")
        .attr("class", "hbar-control-group");

    countryGroup.append("span")
        .text("Select countries:");

    const countryList = countryGroup.append("div")
        .attr("id", "countries-persons")
        .attr("class", "hbar-country-list");

    const clearButton = countryGroup.append("button")
        .attr("type", "button")
        .attr("class", "hbar-clear-countries")
        .text("Show all countries");

    countryGroup.append("p")
        .attr("class", "hbar-control-hint")
        .text("Tick two or more countries to compare them. Leave all unchecked to show every country.");

    const chartArea = container.append("div")
        .attr("class", "hbar-chart-area");

    loadPersonsCsv().then(function (rawData) {

        // Prepare data
        const data = rawData
            .filter(function (d) {
                return d["Unit of measure"] === "Persons";
            })
            .map(function (d) {
                return {
                    country: d["Reference area"],
                    year: +d.TIME_PERIOD,
                    value: +d.OBS_VALUE
                };
            })
            .filter(function (d) {
                return d.country && !isNaN(d.value) && d.value > 0;
            });

        const years = Array.from(new Set(data.map(function (d) { return d.year; })))
            .sort(function (a, b) { return a - b; });

        // Default year
        var defaultYear = years[years.length - 1];
        for (var i = years.length - 1; i >= 0; i--) {
            var count = data.filter(function (d) { return d.year === years[i]; }).length;
            if (count >= 10) {
                defaultYear = years[i];
                break;
            }
        }

        const countries = Array.from(new Set(data.map(function (d) { return d.country; })))
            .sort();

        // Year options
        yearSelect.selectAll("option")
            .data(years)
            .join("option")
            .attr("value", function (d) { return d; })
            .text(function (d) { return d; })
            .property("selected", function (d) { return d === defaultYear; });

        // Country checkboxes
        var countryLabels = countryList.selectAll("label")
            .data(countries)
            .join("label")
            .attr("class", "hbar-country-option");

        countryLabels.append("input")
            .attr("type", "checkbox")
            .attr("value", function (d) { return d; })
            .on("change", updateFromFilters);

        countryLabels.append("span")
            .text(function (d) { return d; });

        yearSelect.on("change", updateFromFilters);
        clearButton.on("click", function () {
            countryList.selectAll("input").property("checked", false);
            updateFromFilters();
        });

        updateFromFilters();

        function getSelectedCountries() {
            var selected = [];
            countryList.selectAll("input:checked").each(function () {
                selected.push(this.value);
            });
            return selected;
        }

        // Apply filters
        function updateFromFilters() {
            var year = +yearSelect.property("value");
            var selectedCountries = getSelectedCountries();
            var filtered;

            if (selectedCountries.length > 0) {
                filtered = selectedCountries.map(function (country) {
                    var match = data.find(function (d) {
                        return d.year === year && d.country === country;
                    });
                    return {
                        country: country,
                        year: year,
                        value: match ? match.value : 0,
                        missing: !match
                    };
                });
            } else {
                filtered = data.filter(function (d) {
                    return d.year === year;
                });
            }

            filtered.sort(function (a, b) { return b.value - a.value; });

            chartArea.html("");
            drawChart(filtered, year);
        }

        // Draw chart
        function drawChart(yearData, year) {
            var margin = { top: 50, right: 80, bottom: 50, left: 150 };
            var width = 800 - margin.left - margin.right;
            var rowHeight = yearData.length > 0 && yearData.length <= 5 ? 48 : 24;
            var height = Math.max(240, Math.max(yearData.length, 1) * rowHeight);

            var svg = chartArea.append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            // Title
            svg.append("text")
                .attr("class", "hbar-title")
                .attr("x", width / 2)
                .attr("y", -20)
                .attr("text-anchor", "middle")
                .text("Total Caring Personnel by Country (" + year + ")");

            // Scales
            var maxValue = d3.max(yearData, function (d) { return d.value; });
            var x = d3.scaleLinear()
                .domain([0, maxValue > 0 ? maxValue : 1])
                .nice()
                .range([0, width]);

            var y = d3.scaleBand()
                .domain(yearData.map(function (d) { return d.country; }))
                .range([0, height])
                .padding(0.2);

            // Axes
            svg.append("g")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(x).ticks(6).tickFormat(d3.format(",")))
                .selectAll("text")
                .attr("dy", "1em");

            svg.append("text")
                .attr("x", width / 2)
                .attr("y", height + 40)
                .attr("text-anchor", "middle")
                .attr("class", "hbar-axis-label")
                .text("Number of caring personnel");

            svg.append("g")
                .call(d3.axisLeft(y));

            // Bars
            svg.selectAll(".hbar")
                .data(yearData)
                .join("rect")
                .attr("class", "hbar")
                .attr("x", 0)
                .attr("y", function (d) { return y(d.country); })
                .attr("width", function (d) { return x(d.value); })
                .attr("height", y.bandwidth())
                .attr("fill", "#002ac1")
                .append("title")
                .text(function (d) {
                    if (d.missing) {
                        return d.country + ": no data for " + year;
                    }
                    return d.country + ": " + d3.format(",")(d.value) + " persons";
                });
        }
    }).catch(function (error) {
        container.append("p").text(
            "Could not load the dataset. Open this page with Live Server (or python -m http.server) instead of double-clicking the HTML file. " +
            error.message
        );
        console.error(error);
    });
}
