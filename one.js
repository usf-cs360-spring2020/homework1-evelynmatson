// Global variables because why not
let scales = {};

/**
 * This function converts date values during csv import
 * @param row the row object to convert
 * @param index who knows! I think this is required
 * @returns the converted row
 */
let convertRow = function(row, index) {
    let out = {};

    out["month"] = convertActivityPeriod(row["Activity Period"]);
    out["geo"] = row["GEO Region"];
    out["passenger count"] = row["Passenger Count"];

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
    rect.style("fill", "linen");

    // Make some scales!
    // Month scale (y)
    scales.month = d3.scaleBand()
        .range(0, config.plot.height);

    scales.passengers = d3.scaleLinear()
        .rangeRound([0, config.plot.width]);

    // TODO Region scale (x)

    // TODO color scale

    // Setup axes
    let axes = {};
    // TODO Make the axes

    // TODO make ticks


    // Load the data
    let csv = d3.csv("2 2018 enplaned per region per month.csv", convertRow).then(drawOne);
    // After this promise is loaded, send it in to drawOne().
};

/**
 * Draw the actual visualization number one
 * @param data the data loaded from csv to use in the visualization
 */
let drawOne = function(data) {
    console.log(data);

    // Work on scales
    let regions = new Set(data.map(row => row['geo']));     // Set for uniqueness
    // console.log(regions);
    let dates = new Set(data
        .filter(
            row => (row['geo'] === data[0]['geo']))     // Take only the first geo region's months
        .map(row => row['month']));
    // console.log(dates);

    scales.month.domain(dates);

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
