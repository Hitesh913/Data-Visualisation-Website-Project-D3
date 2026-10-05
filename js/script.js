// Highlights the selected chart button
function setActiveTab(button) {
    d3.selectAll(".buttons button").attr("aria-selected", "false");
    d3.select(button).attr("aria-selected", "true");
}

// Horizontal bar charts
// Author: Hitesh Kumar
d3.select("#option2").on("click", function () {

    setActiveTab(this);

    d3.select(".chartbox")
        .html(
            "<div class=\"hbar-charts\">" +
                "<div id=\"chart-per1000\"></div>" +
            "</div>"
        );

    drawHorizontalBarChartPer1000("#chart-per1000");

});


// Vertical bar chart (Persons)
// Author: Isuri Ihalagamage
d3.select("#option1").on("click", function () {

    setActiveTab(this);

    d3.select(".chartbox")
        .html(
            "<div class=\"vbar-charts\">" +
                "<div id=\"chart-persons\"></div>" +
            "</div>"
        );

    drawVerticalBarChartPersons("#chart-persons");

});


// Grouped bar charts
// Author: Truong Nguyen
d3.select("#option3").on("click", function () {

    setActiveTab(this);

    d3.select(".chartbox")
        .html(
            "<div class=\"gbar-charts\">" +
                "<div id=\"groupchart\"></div>" +
            "</div>"
        );

    groupbarchart("#groupchart");

});
