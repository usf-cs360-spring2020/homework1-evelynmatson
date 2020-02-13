// import * as d3 from "d3.v5";

/**
 * This function converts date values during csv import
 * @param row the row object to convert
 * @param index who knows! I think this is required
 * @returns the converted row
 */
let convertRow = function(row, index) {
    let out = {};

    out["month"] = convertActivityPeriod(row["Activity Period"]);
    out["passenger count"] = row["Passenger Count"];
    out["terminal"] = row["Terminal"];

    return out;
};

/**
 * This function will draw the first visualization.
 */
let visualizationOne = function() {

    // Specs of the svg
    let config = {
        'svg': {},
        'margin': {},
        'plot': {}
    };
    config.svg.height = 450;
    config.svg.width = config.svg.height * 1.618;   // Golden Ratio!

    // svg margins
    config.margin.top = 10;
    config.margin.right = 10;
    config.margin.bottom = 10;
    config.margin.left = 10;

    // Plot specs
    // (Move the plot right and down by the margin amounts)
    config.plot.x = config.margin.left;
    config.plot.y = config.margin.top;
    // (Calculate the width and height of the plot area)
    config.plot.width = config.svg.width - config.margin.left - config.margin.right;
    config.plot.height = config.svg.height - config.margin.top - config.margin.bottom;

    // Set up the SVG
    let svg = d3.select("#one");
    svg.attr("width", config.svg.width);
    svg.attr("height", config.svg.height);

    // Set up svg plot area
    let plot = svg.append('g');
    plot.attr('id', 'plot1');
    plot.attr('transform', translate(config.plot.x, config.plot.y));

    // Set up a rect inside the g
    let rect = plot.append('rect');
    rect.attr('id', 'background1');
    rect.attr('x', 0);
    rect.attr('y', 0);
    rect.attr('width', config.plot.width);
    rect.attr('height', config.plot.height);

    // Make some scales!
    let scales = {};



    // Load the data
    let csv = d3.csv("3 terminals.csv", convertRow).then(drawOne);
    // After this promise is loaded, send it in to drawOne().
};

/**
 * Draw the actual visualization number one
 * @param data the data loaded from csv to use in the visualization
 */
let drawOne = function(data) {
    console.log(data);
};

/**
 * Sophie's helpful helper method to make translating easier. Thank you, Sophie!
  */
function translate(x, y) {
    return 'translate(' + x + ',' + y + ')';
}

/**
 * This function converts a date in YYYYMM form to a Date object
 * @param monthstring the date string in YYYYMM format
 * @returns {Date} Date object that represents the correct month
 */
let convertActivityPeriod = function(monthstring) {
    let parseDate = d3.timeParse('%Y%m');
    return parseDate(monthstring);
    // console.log(date);

};

visualizationOne();
