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
