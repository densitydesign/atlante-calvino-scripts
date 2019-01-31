// the aim of this script is to prepare data "hacked" so to generate a contourplot in RAWGraphs
// the scripts take a list of rows each of one represents calvino's operas and multiply them according on the number of the opera pages
// in this way we can produce a contourplot where a higher density is displayed in correspondence with longer operas
const fs = require('fs');
const d3 = require('d3');

let file = 'all-data.tsv';

let data = fs.readFileSync(file).toString();

data = d3.tsvParse(data);

data.forEach( d => {
  // console.log(d)
  // console.log(+d.txt_length)
  for(var i = 2; i <= +d.txt_length/300; i++){
    data.push(d);
  }
})

console.log(data.length)

data = JSON.stringify(data, null, 2);

fs.writeFileSync('data-4-contourplot.json', data)
