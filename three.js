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
function drawThree(rawdata) {
    console.log('Loaded', rawdata);

    // Turn "long" data into "wide" data
//     let nest = d3.nest()
//         .key(d => d.month.toString())
//         .entries(data);
//     console.log(nest);
//
//     // let nicerNest = nest.reduce(function(map, obj) {
//     //     let value = {};
//     //     obj.values.forEach(function (item) {
//     //         value[item.terminal] = item.count;
//     //     });
//     //     map[obj.values[0]['month']] = obj.val;
//     //     return map;
//     // }, {});
//     // console.log(nicerNest);
//     //
//
//     // console.log(result);
// // { foo:'bar', hello:'world' }
//
//     // Merge data one object per month, with a property for each terminal
//
//     // Stack the data
//     // let stackKeys = data
//     //     .map(r => r.terminal)
//     //     .unique()
//     //     .sort();
//     let stackKeys = ['Terminal 1', 'Terminal 2', 'Terminal 3', 'International'];
//     let stack = d3.stack()
//         .keys(stackKeys);
//         // .value((d, key) => {
//         //     return d[]
//         // });
//     let stackedValues = stack(nest);
//     console.log(stackedValues)

    // Make some data
    let data = {};
    data.term1 = rawdata.filter(d => d.terminal === 'Terminal 1');
    data.term2 = rawdata.filter(d => d.terminal === 'Terminal 2');
    data.term3 = rawdata.filter(d => d.terminal === 'Terminal 3');
    data.termintl = rawdata.filter(d => d.terminal === 'International Terminal');
    console.log('Split', data);

    let months = filterUniqueDates(rawdata.map(row => row.month));
    months.sort((a,b) => a - b);
    console.log('Months', months);


    // Make a map of months to terminal passenger counts
    stackedMap = new Map();
    for (let month of months) {
        // Make sure the map has an object for each month
        if (!stackedMap.has(month.toString())) {
            stackedMap.set(month.toString(), {
                term1 : 0,
                term2 : 0,
                term3 : 0,
                intl : 0,
                month: month
            });
        }
    }
    for (let row of rawdata) {
        // console.log(row);
        switch (row.terminal) {
            case 'Terminal 1':
                // console.log(data.stacked.get(row.month.toString()))
                stackedMap.get(row.month.toString()).term1 += row.count;
                break;
            case 'Terminal 2':
                // console.log(data.stacked.get(row.month.toString()))
                stackedMap.get(row.month.toString()).term2 += row.count;
                break;
            case 'Terminal 3':
                // console.log(data.stacked.get(row.month.toString()))
                stackedMap.get(row.month.toString()).term3 += row.count;
                break;
            case 'International Terminal':
                // console.log(data.stacked.get(row.month.toString()))
                stackedMap.get(row.month.toString()).intl += row.count;
                break
        }
    }
    data.stacked = new Array(...stackedMap.values());
    console.log('Stacked', data.stacked);

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
    return count * normScalingFactor;
}

/**
 * Convert a row from the csv to a object containing the same info
 * @param row the row from the csv
 * @returns {{}} an object containing the same info
 */
function convertRow(row) {
    // console.log(row);
    let out = {};

    out.month = convertActivityPeriod(row['Activity Period']);
    out.terminal = row['Terminal'];
    out['count'] = parseInt(row['Passenger Count']);

    // Wrangle the data to normalize to a 30-day month
    out.count = normalizeCountByMonth(out.month, out.count);

    // console.log(out);
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

/**
 * Helper function to make a unique set of dates
 * @param data the dates to filter
 * @returns {*} a new list with just unique elements
 * @source https://stackoverflow.com/questions/40346773/unique-array-for-dates-javascript
 */
function filterUniqueDates(data) {
    const lookup = new Set();

    return data.filter(date => {
        const serialised = date.getTime();
        if (lookup.has(serialised)) {
            return false;
        } else {
            lookup.add(serialised);
            return true;
        }
    })
}


visualizationThree();