window.onload = function (){

// A lot of credit for this goes to https://bl.ocks.org/mbostock/4063318 ...
// and thus gets licensed under GPLv3.
// It was very useful for learning how D3 and SVG works
// As well as cleaning up and extending the code, I had to port it to D3 v4.
// This is why the code is heavily commented ;)

// Get the maximum number
var commit_max = d3.max(d3.map(commits).values(), function (d) {return d['commits']});
// Calculate scale factor: c_max * c_F = scale_cap, thus c_F = scale_cap / c_max
// We're using 0.6 to let us use 0.15-0.75 on the colour range since the top 25% is harsh and bottom 15% too light
// This function takes the number of commits and returns a value to pass to interpolate
function commit_scale(c) { return c*(0.6/commit_max)+0.15 };

// Some general values
var cellSize = 8,
    hpad=30,
    vpad=8,
    width = hpad*2+cellSize*53,
    height = vpad*2+cellSize*7;

var format = d3.timeFormat("%Y-%m-%d"); // YYYY-MM-DD like sane people
var monthformat = d3.timeFormat("%b"); // Short name of month
var weekFormat = d3.timeFormat("%W"); // Week of year, Monday starting version

function weekX(d) {
  return weekFormat(d)*cellSize;
}

function dayY(d) {
  // The (d+6)%7 shifts the Sunday start week back a step to Monday reference. (d-1)%7 doesn't work.
  // the vpad/2 is to shift the cal down enough for the month names
    return vpad/2+(d.getDay()+6)%7 * cellSize;
}

// This function draws the box around the months
function monthPath(t0) {
  var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0);
  // M: moveTo, H: draw horizontal absolute, V: draw vertical absolute, Z: closePath
  // Starts in the top right of the first day of the month and draws anti-clockwise
  return "M" + (weekX(t0) + cellSize) + "," + dayY(t0)
       + "H" +  weekX(t0)             + "V" + (vpad/2 + cellSize*7)
       + "H" +  weekX(t1)             + "V" + (dayY(t1) + cellSize)
       + "H" + (weekX(t1) + cellSize) + "V" + vpad/2
       + "H" + (weekX(t0) + cellSize) + "Z";
}

// We want 1 svg per year.  Figure out the start
var first_date = new Date(d3.min(d3.map(commits).keys()));
var yearsvg = d3.select(".commitcalender").selectAll("svg")
    .data(d3.range(first_date.getFullYear(), 2017))
  .enter().append("svg")
    .attr("width", width).attr("height", height)
    .attr("class", "year")
  .append("g")
    .attr("transform", "translate(" + hpad + "," + vpad + ")");

// Add a scale below the years
var scale = d3.select(".commitcalender").append("svg")
      .attr("width", width).attr("height", cellSize+vpad*2)
      .append("g");

// Fix horrible float representation
var ffix = d3.format(".1f");
// Make 11 boxes showing 0% - 100% in increments of 10%
scale.selectAll(".scale").data(d3.range(0,11))
        .enter().append("rect")
          .attr("class", "day scale")
          .attr("width", cellSize).attr("height", cellSize)
          .attr("x", function(d){ return cellSize*d+hpad} ).attr("y", vpad+3 )
          // fraction of commit max adjusted to colour scale range
          .style("fill", function (d) { if (d) return d3.interpolateBlues(commit_scale(commit_max*(0.1*d)));})
          .append("title")
            .text(function (d) { return ffix(commit_max*(0.1*d));})

// Add some labels to it.  Sorry, more magic numbers.
scale.append("text").attr("transform", "translate("+(hpad-2-cellSize)+", "+(vpad+cellSize+3)+")")
     .text("0");
scale.append("text").style("text-anchor", "middle").attr("transform", "translate("+(hpad+cellSize*5.5)+", "+(vpad+1)+")")
     .text("Commit scale");
scale.append("text").attr("transform", "translate("+(hpad+3+cellSize*11)+", "+(vpad+cellSize+3)+")")
     .text(commit_max);

// Year label, side ways.  -22 is an arbitrary "move it left" offset that looks good
yearsvg.append("text")
    .attr("transform", "translate(-22," + cellSize * 3.5 + ")rotate(-90)")
    .style("text-anchor", "middle")
    .text(function(d) { return d; });

// Day letters letters.  -12 is a "move it left" offset that leaves the letters centred in the gap.
var letters = ['Mo', 'We', 'Fr', 'Su'];
for (var i = 0; i < 4; i++) {
  yearsvg.append("text")
      .attr("transform", "translate(-12," + (cellSize * i * 2 + vpad +3 ) + ")")
      .style("text-anchor", "middle")
      .text(letters[i]);
}

// This block draws the actual day squares
var rect = yearsvg.selectAll(".day")
    // the d argument here iterates over years as ints
    .data(function(d) { return d3.timeDays(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
  .enter().append("rect")
    // in the following 3, the d argument is the date object
    .attr("class", "day")
    .attr("width", cellSize).attr("height", cellSize)
    .attr("x", weekX ).attr("y", dayY )
    .datum(format);

// Mouse over title, useful thing
rect.append("title")
    .text(function(d) { return d; });

// Cheating a little.  This is the data join for months, we're going to reuse it.
var monsvg = yearsvg.selectAll(".month")
        // d argument is years as ints
    .data(function(d) { return d3.timeMonths(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })

// First use, draw the box around each month.
monsvg.enter().append("path")
      .attr("class", "month")
      // the d attribute contains the SVG path data
      .attr("d", monthPath);

// Second use, write the month name over each box.
// That Date kludge is because the 7th is always in the second week of the month so we can pin to that.
// cellSize-4
monsvg.enter().append("text")
      .attr("transform", function (d) { 
        return "translate("+(weekX(new Date(d.getFullYear(), d.getMonth(), 7))+4)+",2)";})
      .style("text-anchor", "left")
      .text(monthformat);

// Filter for days that are in the commit keys, set their fill appropriately, set title text
rect.filter(function(d) { return d in commits; })
  .attr("class", "day active")
  .style("fill", function (d) { return d3.interpolateBlues(commit_scale(commits[d]['commits']));})
  .select("title")
  .text(function(d) { return d + ": " + commits[d]['commits']; });

};