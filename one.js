// Global variables because why not
let scales = {};
let config = {
    'svg': {},
    'margin': {},
    'plot': {}
};
let svg;
let axes;
let plot;

/**
 * This function will draw the first visualization.
 */
let visualizationOne = function() {

    // Specs of the svg
    config.svg.height = 450;
    config.svg.width = 900;   // Golden Ratio!

    // svg margins
    config.margin.top = 50;
    config.margin.right = 10;
    config.margin.bottom = 40;
    config.margin.left = 70;

    // Plot specs
    // (Move the plot right and down by the margin amounts)
    config.plot.x = config.margin.left;
    config.plot.y = config.margin.top;
    // (Calculate the width and height of the plot area)
    config.plot.width = config.svg.width - config.margin.left - config.margin.right;
    config.plot.height = config.svg.height - config.margin.top - config.margin.bottom;

    config.plot.paddingBetweenRegions = .2;
    config.plot.paddingBetweenMonths = .05;

    // Set up the SVG
    svg = d3.select("#one");
    svg.attr("width", config.svg.width);
    svg.attr("height", config.svg.height);

    // Set up svg plot area
    plot = svg.append('g');
    plot.attr('id', 'plot1');
    plot.attr('transform', translate(config.plot.x, config.plot.y));

    // Set up a rect inside the g
    let rect = plot.append('rect');
    rect.attr('id', 'background1');
    rect.attr('x', 0);
    rect.attr('y', 0);
    rect.attr('width', config.plot.width);
    rect.attr('height', config.plot.height);
    rect.style("fill", "pink");

    // Make some scales!
    // Month scale (y)
    // console.log("height is :", config.plot.height);
    scales.month = d3.scaleBand()
        .rangeRound([0, config.plot.height])
        .paddingInner(config.plot.paddingBetweenMonths);

    scales.passengers = d3.scaleLinear()
        .nice();
        // Will give a range later, when we know more about the data

    // console.log("width is :", config.plot.width);
    scales.regions = d3.scaleBand()
        .rangeRound([0, config.plot.width])
        .paddingInner(config.plot.paddingBetweenRegions);


    // TODO color scale

    // Setup axes
    axes = {};


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

    data = data
        .filter(d => d['geo'] !== 'US'); // Filter out US data because it's too large

    // Work on scales
    let dates = data
        .filter(row => (row['geo'] === data[0]['geo']))     // Take only the first geo region's months
        .map(row => row['month'])
        .sort(function(a,b) {return a - b;});
    scales.month.domain(dates);
    // console.log("Months bandwidth is :", scales.month.bandwidth());

    let regions = data
        .sort(function(a, b) {
            return maxOfRegion(b, data) - maxOfRegion(a, data);
        })
        .map(row => row['geo'])
        .unique();
    console.log(regions);

    // console.log(regions);
    scales.regions.domain(regions);
    // console.log("Regions bandwidth is :", scales.regions.bandwidth());


    let maxPassengers = Math.max(... data.map(row => row['passengers']));
    scales.passengers.domain([0,maxPassengers])
        .range([0, scales.regions.bandwidth()]);
    // console.log("Max passengers is :", maxPassengers);

    // TODO actually draw axes

    let rect = d3.select("#background1");
    console.assert(rect.size() === 1); // Make sure we just have one thing

    let things = plot.selectAll(".bars")
        .data(data, function(d) {return d["month"]});

    // Draw new bars for entering data
    things.enter()
        .append("rect")
        .attr("class","bars")
        .attr("width", d => scales.passengers(d["passengers"]))
        .attr("x", d => scales.regions(d["geo"]))
        .attr("y", d => scales.month(d["month"]))
        .attr("height", scales.month.bandwidth());


    // Finally, set up axes
    let monthsAxis = d3.axisLeft(scales.month)
        // .tickPadding(0)
        .tickFormat(monthsFormatter);
    axes.months = monthsAxis;
    let monthsAxisGroup = plot.append("g")
        .attr("id", "months-axis")
        .attr("class", "axis");
    monthsAxisGroup.call(monthsAxis);

    let regionsAxis = d3.axisTop(scales.regions)
        // .tickPadding(0);

    axes.regions = regionsAxis;
    let regionsAxisGroup = plot.append("g")
        .attr("id", "regions-axis")
        .attr("class", "axis");
    regionsAxisGroup.call(regionsAxis);

    let passengersAxis = d3.axisBottom(scales.passengers)
        // .tickPadding(0)
        .tickFormat(passengerTicksFormatter)
        .ticks(3);
    axes.passengers = passengersAxis;
    for( let [index, region] of regions.entries() ) {
        let passengersAxisGroup = plot.append("g")
            .attr("id", "regions-axis")
            .attr("class", "axis" + index.toString())
            .attr("transform", translate(scales.regions(region) ,config.plot.height));
        passengersAxisGroup.call(passengersAxis);
    }

};

/**
 * Sophie's helpful helper method to make translating easier. Thank you, Sophie!
  */
function translate(x, y) {
    return 'translate(' + x + ',' + y + ')';
}

/*
 * Convert a data entry to a nice month name
 */
function monthsFormatter(d) {
    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];  // From https://stackoverflow.com/questions/1643320/get-month-name-from-date
    return monthNames[d.getMonth()];
}

/*
 * Helps format the ticks for the passenger count axes.
 */
function passengerTicksFormatter(d) {
    if(d === 0 ) {return ""}
    // if(d % 50000 !== 0) {return ""}
    return (d/1000).toString() + "k"
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
 * This function converts date values during csv import
 * @param row the row object to convert
 * @param index who knows! I think this is required
 * @returns the converted row
 */
let convertRow = function(row, index) {
    let out = {};

    out["month"] = convertActivityPeriod(row["Activity Period"]);
    out["geo"] = row["GEO Region"];
    out["passengers"] = parseInt(row["Passenger Count"]);

    return out;
};


/*
 * Finds the largest passenger count for any month for region in data entry a
 */
function maxOfRegion(a, data) {
    return Math.max(...data
        .filter(d => (d['geo'] === a['geo']))
        .map(d => d['passengers']));
}

visualizationOne();
