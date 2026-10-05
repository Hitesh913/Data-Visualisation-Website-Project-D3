// Horizontal bar chart: Caring Personnel per 1,000 inhabitants — Author: Hitesh Kumar
const PER1000_CSV_FILE = "OECD.ELS.HD,DSD_HEALTH_REAC_EMP@DF_CARE,+.......P..csv";

// Load CSV locally first, then fall back to GitHub if needed
function loadPer1000Csv() {
    var localEncoded = "dataset/" + encodeURIComponent(PER1000_CSV_FILE);
    var localPlain = "dataset/" + PER1000_CSV_FILE;
    var github = "https://raw.githubusercontent.com/Hitesh913/Data-Visualisation-Website-Project-D3/main/dataset/" +
        encodeURIComponent(PER1000_CSV_FILE);

    return d3.csv(localEncoded)
        .catch(function () { return d3.csv(localPlain); })
        .catch(function () { return d3.csv(github); });
}

// Draw the horizontal bar chart into the given container
function drawHorizontalBarChartPer1000(containerId) {
    const container = d3.select(containerId);
    container.html("");

    // Chart heading
    container.append("h3")
        .text("Horizontal bar chart: Caring Personnel per 1,000 Inhabitants");

    // Supporting context for the visualisation
    const context = container.append("div")
        .attr("class", "chart-context chart-context--hbar");

    context.append("p")
        .attr("class", "chart-context__lead")
        .html(
            "This visualisation shows <strong>practising caring personnel relative to population</strong> " +
            "using the OECD metric <em>Per 1 000 inhabitants</em>. " +
            "It helps compare workforce density fairly across countries of different sizes."
        );

    const contextList = context.append("ul")
        .attr("class", "chart-context__list");

    contextList.append("li")
        .html(
            "<strong>Dataset:</strong> OECD Caring Personnel CSV " +
            "(Health and social employment) loaded from the project <code>dataset</code> folder."
        );
    contextList.append("li")
        .html(
            "<strong>What you can discover:</strong> which countries have a higher density of caring personnel, " +
            "how rankings change by year, and how selected countries compare when population is taken into account."
        );
    contextList.append("li")
        .html(
            "<strong>Source:</strong> OECD Health Statistics — Health and social employment " +
            "(Caring personnel / personal care workers)."
        );

    // Year and country filters
    const controls = container.append("div")
        .attr("class", "hbar-chart-controls");

    // Year dropdown
    const yearGroup = controls.append("div")
        .attr("class", "hbar-control-group");

    yearGroup.append("label")
        .attr("for", "year-per1000")
        .text("Select year:");

    const yearSelect = yearGroup.append("select")
        .attr("id", "year-per1000");

    // Country checkboxes (none selected = show all)
    const countryGroup = controls.append("div")
        .attr("class", "hbar-control-group");

    countryGroup.append("span")
        .text("Select countries:");

    const countryList = countryGroup.append("div")
        .attr("id", "countries-per1000")
        .attr("class", "hbar-country-list");

    const clearButton = countryGroup.append("button")
        .attr("type", "button")
        .attr("class", "hbar-clear-countries")
        .text("Show all countries");

    countryGroup.append("p")
        .attr("class", "hbar-control-hint")
        .text("Tick two or more countries to compare them. Leave all unchecked to show every country.");

    // Chart drawing area
    const chartArea = container.append("div")
        .attr("class", "hbar-chart-area");

    loadPer1000Csv().then(function (rawData) {

        // Keep only Per 1 000 inhabitants rows with valid values
        const data = rawData
            .filter(function (d) {
                return d["Unit of measure"] === "Per 1 000 inhabitants";
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

        // Unique years in the data
        const years = Array.from(new Set(data.map(function (d) { return d.year; })))
            .sort(function (a, b) { return a - b; });

        // Default to a recent year with at least 10 countries
        var defaultYear = years[years.length - 1];
        for (var i = years.length - 1; i >= 0; i--) {
            var count = data.filter(function (d) { return d.year === years[i]; }).length;
            if (count >= 10) {
                defaultYear = years[i];
                break;
            }
        }

        // Sorted country list for checkboxes
        const countries = Array.from(new Set(data.map(function (d) { return d.country; })))
            .sort();

        // Fill year dropdown
        yearSelect.selectAll("option")
            .data(years)
            .join("option")
            .attr("value", function (d) { return d; })
            .text(function (d) { return d; })
            .property("selected", function (d) { return d === defaultYear; });

        // Create one checkbox per country
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

        // Update chart when filters change
        yearSelect.on("change", updateFromFilters);
        clearButton.on("click", function () {
            countryList.selectAll("input").property("checked", false);
            updateFromFilters();
        });

        // Draw chart on first load
        updateFromFilters();

        // Draw the horizontal bars for the filtered data
        function drawChart(yearData, year) {
            var margin = { top: 50, right: 90, bottom: 56, left: 130 };
            var width = 800 - margin.left - margin.right;
            // Use taller rows when only a few countries are shown
            var rowHeight = yearData.length > 0 && yearData.length <= 5 ? 48 : 24;
            var height = Math.max(240, Math.max(yearData.length, 1) * rowHeight);

            // Create responsive SVG
            var svg = chartArea.append("svg")
                .attr("viewBox", "0 0 " + (width + margin.left + margin.right) + " " + (height + margin.top + margin.bottom))
                .attr("preserveAspectRatio", "xMidYMid meet")
                .attr("role", "img")
                .attr("aria-label", "Caring personnel per 1,000 inhabitants by country, " + year)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            // SVG chart title
            svg.append("text")
                .attr("class", "hbar-title")
                .attr("x", width / 2)
                .attr("y", -20)
                .attr("text-anchor", "middle")
                .text("Caring Personnel per 1,000 Inhabitants by Country (" + year + ")");

            // Scales: x = density, y = country
            var maxValue = d3.max(yearData, function (d) { return d.value; });
            var x = d3.scaleLinear()
                .domain([0, maxValue > 0 ? maxValue : 1])
                .nice()
                .range([0, width]);

            var y = d3.scaleBand()
                .domain(yearData.map(function (d) { return d.country; }))
                .range([0, height])
                .padding(0.2);

            // Vertical gridlines
            svg.append("g")
                .attr("class", "vbar-grid")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(x).ticks(6).tickSize(-height).tickFormat(""))
                .call(function (g) { g.select(".domain").remove(); });

            // X and Y axes
            svg.append("g")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(x).ticks(6).tickFormat(d3.format(".2f")))
                .selectAll("text")
                .attr("dy", "1em");

            svg.append("text")
                .attr("x", width / 2)
                .attr("y", height + 46)
                .attr("text-anchor", "middle")
                .attr("class", "hbar-axis-label")
                .text("Caring personnel per 1,000 inhabitants");

            svg.append("g")
                .call(d3.axisLeft(y).tickSizeOuter(0));

            // Draw bars with hover tooltips
            svg.selectAll(".hbar")
                .data(yearData)
                .join("rect")
                .attr("class", "hbar")
                .attr("x", 0)
                .attr("y", function (d) { return y(d.country); })
                .attr("width", function (d) { return x(d.value); })
                .attr("height", y.bandwidth())
                .attr("rx", 2)
                .append("title")
                .text(function (d) {
                    if (d.missing) {
                        return d.country + ": no data for " + year;
                    }
                    return d.country + ": " + d3.format(".2f")(d.value) + " per 1,000 inhabitants";
                });

            drawValueLabels(svg, yearData, x, y, year);
        }

        // Add value labels at the end of each bar
        function drawValueLabels(svg, yearData, x, y, year) {
            svg.selectAll(".hbar-value")
                .data(yearData)
                .join("text")
                .attr("class", "hbar-value")
                .attr("x", function (d) { return x(d.value) + 6; })
                .attr("y", function (d) { return y(d.country) + y.bandwidth() / 2; })
                .attr("dy", "0.35em")
                .text(function (d) { return d.missing ? "No data for " + year : d3.format(".2f")(d.value); });
        }

        // Get currently checked country names
        function getSelectedCountries() {
            var selected = [];
            countryList.selectAll("input:checked").each(function () {
                selected.push(this.value);
            });
            return selected;
        }

        // Apply year/country filters and re-draw the chart
        function updateFromFilters() {
            var year = +yearSelect.property("value");
            var selectedCountries = getSelectedCountries();
            var filtered;

            if (selectedCountries.length > 0) {
                // Keep selected countries even if data is missing for that year
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
                // Show all countries with data for the selected year
                filtered = data.filter(function (d) {
                    return d.year === year;
                });
            }

            // Sort highest density first
            filtered.sort(function (a, b) { return b.value - a.value; });

            chartArea.html("");
            drawChart(filtered, year);
        }
    }).catch(function (error) {
        // Show a helpful message if the CSV cannot be loaded
        container.append("p").text(
            "Could not load the dataset. Open this page with Live Server (or python -m http.server) instead of double-clicking the HTML file. " +
            error.message
        );
        console.error(error);
    });
}
