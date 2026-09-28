// Horizontal bar charts
// Author: Hitesh Kumar
d3.select("#option2").on("click", function () {

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

    d3.select(".chartbox")
        .html(
            "<div class=\"vbar-charts\">" +
                "<div id=\"chart-persons\"></div>" +
            "</div>"
        );

    drawVerticalBarChartPersons("#chart-persons");

});


// Grouped bar charts — coming soon
d3.select("#option3").on("click", function () {

    d3.select(".chartbox")
        .html("<p class=\"chartbox__placeholder\">Grouped bar chart is coming soon</p>");

});
