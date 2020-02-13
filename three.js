// Global variables because why not
let scales = {};
let config = {
    'svg' : {},
    'margin' : {},
    'plot' : {},
    'legend' : {}
};
let axes = {};

/**
 * Set up the third visualization
 */
function visualizationThree() {

    // SVG config
    config.svg.height = 450;
    config.svg.width = 900;   // Golden Ratio!

    // SVG margins config
    config.margin.top = 50;
    config.margin.right = 50;
    config.margin.bottom = 50;
    config.margin.left = 50;

    // Plot config
    config.plot.x = config.margin.left;
    config.plot.y = config.margin.top;
    config.plot.width = config.svg.width - config.margin.left - config.margin.right;
    config.plot.height = config.svg.height - config.margin.top - config.margin.bottom;

    // Set up the SVG
    let svg = d3.select('#three')
        .attr('width', config.svg.width)
        .attr('height', config.svg.height);

    // Set up the plot area
    let plot = svg.append('g')
        .attr('width', config.plot.width)
        .attr('height', config.plot.height)
        .attr('transform', translate(config.plot.x, config.plot.y))
        .attr('x', config.plot.x)
        .attr('y', config.plot.y);

    // rect for fun
    plot.append('rect')
        .attr('width', config.plot.width)
        .attr('height', config.plot.height)
        .attr('x', 0)
        .attr('y', 0)
        .attr('fill', 'pink')
        .attr('stroke', 'purple');

    // Load the data
    let csv = d3.csv('3 terminals.csv', convertRow).then(drawThree);
}

/**
 * Draw the third visualization once the data is loaded
 */
function drawThree(data) {
    console.log(data);

    // Stack the data
    // let stackKeys = data
    //     .map(r => r.terminal)
    //     .unique()
    //     .sort();
    let stackKeys = ['Terminal 1', 'Terminal 2', 'Terminal 3', 'International'];
    let stack = d3.stack().keys(stackKeys);
}

// HELPER METHODS

/**
 * This function converts a date in YYYYMM form to a Date object
 * @param monthstring the date string in YYYYMM format
 * @returns {Date} Date object that represents the correct month
 */
function convertActivityPeriod(monthstring) {
    let parseDate = d3.timeParse('%Y%m');
    return parseDate(monthstring);
    // console.log(date);
}

/**
 * Normalize a passenger count to a standard 30-day month.
 * @param date the Date object representing the month
 * @param count the count to normalize
 */
function normalizeCountByMonth(date, count) {
    let dayCounts = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    let normalizedDayCount = 30;

    let normScalingFactor = normalizedDayCount /  dayCounts[date.getMonth()];
}

/**
 * Convert a row from the csv to a object containing the same info
 * @param row the row from the csv
 * @returns {{}} an object containing the same info
 */
function convertRow(row) {
    let out = {};

    out.month = convertActivityPeriod(row['Activity Period']);
    out.terminal = row['Terminal'];
    out.count = row['Passenger Count'];

    // Wrangle the data to normalize to a 30-day month
    out.count = normalizeCountByMonth(out.month, out.count);

    return out;
}

/**
 * Sophie's helpful helper method to make translating easier. Thank you, Sophie!
 */
function translate(x, y) {
    return 'translate(' + x + ',' + y + ')';
}

/**
 * Helpful unique-ing function
 * @returns {*[]} an array with only the unique elements of the array it was called on
 * @source https://coderwall.com/p/nilaba/simple-pure-javascript-array-unique-method-with-5-lines-of-code
 */
Array.prototype.unique = function() {
    return this.filter(function (value, index, self) {
        return self.indexOf(value) === index;
    });
};


visualizationThree();