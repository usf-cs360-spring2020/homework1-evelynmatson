/*
 * This function will load the csv from disk for the 1st visualization
 *
 */
let loadDataOne = function() {
    let csv = d3.csv("1 2018 enplaned per month by region summary.csv").then(function(data) {
      for (element of data) {
        console.log(element);
      }

    });
    console.log(csv);
}

loadDataOne();
