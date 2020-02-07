/**
 * This function converts date values during csv import
 * @param row the row object to convert
 * @param index who knows! I think this is required
 * @returns the converted row
 */
let convertRow = function(row, index) {
    out = {};

    out["month"] = convertActivityPeriod(row["Activity Period"]);
    out["passenger count"] = row["Passenger Count"];
    out["geo"] = row["GEO Summary"];

    return out;
}

/**
 * This function will draw the first visualization.
 */
let visualizationOne = function() {
    let csv = d3.csv("1 2018 enplaned per month by region summary.csv", convertRow).then(drawOne);
    // After this promise is loaded, send it in to drawOne().

    // console.log(csv);
}

/**
 * Draw the actual visualization number one
 * @param data the data loaded from csv to use in the visualization
 */
let drawOne = function(data) {
    console.log(data);
}

/**
 * This function converts a date in YYYYMM form to a Date object
 * @param monthstring the date string in YYYYMM format
 * @returns {Date} Date object that represents the correct month
 */
let convertActivityPeriod = function(monthstring) {
    let parseDate = d3.timeParse('%Y%m');
    let date = parseDate(monthstring);

    return date;
    // console.log(date);

}

loadDataOne();
