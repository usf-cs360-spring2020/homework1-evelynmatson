/*
 * This function converts date values during csv import
 */
let convertRow = function(row, index) {
    out = {};

    out["month"] = convertActivityPeriod(row["Activity Period"]);
    out["passenger count"] = row["Passenger Count"];
    out["geo"] = row["GEO Summary"];

    return out;
}

/*
 * This function will load the csv from disk for the 1st visualization
 */
let loadDataOne = function() {
    let csv = d3.csv("1 2018 enplaned per month by region summary.csv", convertRow).then(function(data) {
        rows = [];
        for (let element of data) {
            row = {};

            row["month"] = convertActivityPeriod(element["Activity Period"]);
            row["passenger count"] = element["Passenger Count"];
            row["geo"] = element["GEO Summary"];
             // console.log(row);
            rows.
      }
    });

    console.log(csv);
}

let convertActivityPeriod = function(monthstring) {
    let parseDate = d3.timeParse('%Y%m');
    let date = parseDate(monthstring);

    return date;
    // console.log(date);

}

loadDataOne();
