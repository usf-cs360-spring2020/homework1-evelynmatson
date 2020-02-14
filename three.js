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
        .attr('id', 'plot')
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
    console.log('Loaded (rawData)', rawdata);
    rawdata = process(rawdata);
    console.log('processed', rawdata);

    // Process the data
    let months = filterUniqueDates(rawdata.map(row => row.month));
    months.sort((a,b) => a - b);
    console.log('Months', months);

    // Make a map of months to terminal passenger counts (prep for stacking)
    let stackedMap = new Map();
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
    let preStacked = new Array(...stackedMap.values());
    console.log('Pre-stacked', preStacked);

    // Actually stack
    let stacker = d3.stack()
        .keys(["term3", "term2", "term1", "intl"]);
    let stack  = stacker(preStacked);
    console.log('stacked', stack);


    // Work on the scales
    scales.passengers = d3.scaleLinear()
        .domain([0,30000000])
        .range([config.plot.height, 0])
        .nice();

    let minDate = months
        .reduce(function (a, b) {
            return a < b ? a : b;
        });
    console.log('min date', minDate);
    let maxDate = months
        .reduce(function (a, b) {
            return a > b ? a : b;
        });
    console.log('max date', maxDate);
    scales.years = d3.scaleLinear()
        .domain([minDate, maxDate])
        .range([0, config.plot.width]);

    let terms = ["Terminal 1", "Terminal 2", "Terminal 3", "International Terminal"]
    scales.color = d3.scaleOrdinal(d3.schemeCategory10)
        .domain(terms);


    // Draw some stuff?
    let plot = d3.select('#plot');
    let draw = plot.append('g')
        .attr('id', 'draw');

    let oneoneone = d3.area()
        .x(d =>scales.years(d))
        .y0(200)
        .y1(150);


    // let area = d3.area()
    //     .x(function (d, index, data) {
    //         console.log('indexpizza', index)
    //         scales.years(months[index - 1]);
    //     })
    //     .y0(d => scales.passengers(d[0]))
    //     .y1(d => scales.passengers(d[1]));

    // let drawing = draw.selectAll('.fancy')
    //     .data(months)
    //     .enter()
    //     .append('g');
    //     // .append('class', 'fancy');
    //
    // drawing.append('path')
    //     .attr('class', 'area')
    //     .attr('d', oneoneone);
    //     // .style('fill', d => scales.color())

    let newArea = d3.area()
        .x(function(d, i, data) {
            // console.log('in x, d = ', d);
            // console.log('in x, i = ', i);
            // console.log('in x, data = ', data);
            // console.log('in x, TRYING = ', months[i]);
            // console.log('from x, returning', scales.years(months[i]));
            return scales.years(months[i]);
            // return (d.data.key);
        })
        .y0(function(d) {
            // console.log('in y, d = ', d);
            // console.log('from y0, returning', scales.passengers(d[0]));

            return scales.passengers(d[0]);
            // return y(d[0]);
        })
        .y1(function(d) {
            // console.log('from y1, returning', scales.passengers(d[1]));

            return scales.passengers(d[1]);
            // return y(d[1]);
        });
    // Shoutout https://www.d3-graph-gallery.com/graph/stackedarea_basic.html

    draw.selectAll("mylayers")
        .data(stack)
        .enter()
        .append('path')
        .style('fill', function(d, i, data) {
            // console.log('in fill func, i is', i);
            let thing = terms[i]
            return scales.color(terms[i]);
        })
        .attr('d', newArea);

}

/**
 * Perform Data wrangling to aggregate by year
 */
function process(raw) {
    let terms = ["Terminal 1", "Terminal 2", "Terminal 3", "International Terminal"]

    // let out = []

    let term1 = raw.filter(row => row.terminal === terms[0]);
    let term1Out = []
    // console.log('term1', term1);
    let term2 = raw.filter(row => row.terminal === terms[1]);
    let term2Out = []
    // console.log('term2', term2);
    let term3 = raw.filter(row => row.terminal === terms[2]);
    let term3Out = []
    // console.log('term3', term3);
    let intl = raw.filter(row => row.terminal === terms[3]);
    let intlOut = []
    // console.log('intl', intl);

    let years = [];
    for (let i = 0; i <= 12; i++) {
        years.push(new Date(i + 2006, 0));
        // console.log('year', years[i], typeof years[i]);
        term1Out.push({
            month: years[i],
            terminal: terms[0],
            count: 0
        })
        term2Out.push({
            month: years[i],
            terminal: terms[1],
            count: 0
        })
        term3Out.push({
            month: years[i],
            terminal: terms[2],
            count: 0
        })
        intlOut.push({
            month: years[i],
            terminal: terms[3],
            count: 0
        })
    }
    console.log('years', years);

    for (const row of raw) {
        for (const [index, year] of years.entries()) {
            // console.log('boop', row);
            // console.log('year', year, typeof year);
            if (row.month.getFullYear() === year.getFullYear()) {
                switch (row.terminal) {
                    case "Terminal 1":
                        term1Out[index].count += row.count;
                        break;
                    case "Terminal 2":
                        term2Out[index].count += row.count;
                        break;
                    case "Terminal 3":
                        term3Out[index].count += row.count;
                        break;
                    case "International":
                        // console.log('boop');
                        intlOut[index].count += row.count;
                        break;
                }
            }
        }
    }

    let out = [];
    out.push(...term1Out);
    out.push(...term2Out);
    out.push(...term3Out);
    out.push(...intlOut);
    // console.log('out', out);

    return out
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