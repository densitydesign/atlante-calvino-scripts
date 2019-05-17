// the aim of this script is to prepare data "hacked" so to generate a contourplot in RAWGraphs
// the scripts take a list of rows each of one represents calvino's operas and multiply them according on the number of the opera pages
// in this way we can produce a contourplot where a higher density is displayed in correspondence with longer operas
const fs = require('fs');
const d3 = require('d3');
const Json2csvParser = require('json2csv').Parser;
const fields = ["id","label","attributes.txt_length","attributes.publication","attributes.log_length","viz.position.x","viz.position.y"];
const opts = { fields, delimiter: '\t' };

let fileJSON = 'mixed-spatialisation.json';
let dataJSON = fs.readFileSync(fileJSON).toString();
console.log(dataJSON);
dataJSON = JSON.parse(dataJSON);
console.log(dataJSON);
data = dataJSON;

// let file = 'fruchterman-spatialisation.tsv';
// let data = fs.readFileSync(file).toString();
// data = d3.tsvParse(data);

console.log(data.length)

data.forEach( d => {
  // console.log(d)
  // console.log(+d.txt_length)
  let length = +d.attributes.log_length;
  // if (length > 50000) {
  //   length = 50000
  // }
  for (var i = 2; i <= length; i++) {

    let ri = Math.random()*(i/length)
    // incremento random

    let n_x = d.viz.position.x + ri;
    let n_y = d.viz.position.y + ri;

    // x + ir

    // y + ir


    data.push(d);
    // sgomitate
  }
})

let mmmax_x = d3.max(data, function(d) {
  return d.viz.position.x
})
let mmmax_y = d3.max(data, function(d) {
  return d.viz.position.y
})
let veryMaxValue = d3.max([mmmax_x, mmmax_y])
veryMaxValue = Math.ceil(veryMaxValue/1000) * 1000;
let mmmin_x = d3.min(data, function(d) {
  return d.viz.position.x
})
let mmmin_y = d3.min(data, function(d) {
  return d.viz.position.y
})
let veryMinValue = d3.min([mmmin_x, mmmin_y])
veryMinValue = Math.floor(veryMinValue/1000) * 1000;


let veryMax = {
  "id": "0000a",
  "label": "max",
  "attributes": {
    "title": "max",
    "txt_length": 2164,
    "type": "racconto",
    "year": null,
    "log_length": 20.07
  },
  "viz": {
    "color": "rgb(192,192,192)",
    "position": {
      "x": veryMaxValue,
      "y": veryMaxValue,
      "z": 0
    },
    "size": 6.6820207
  }
}

let veryMin = {
  "id": "0000b",
  "label": "min",
  "attributes": {
    "title": "min",
    "txt_length": 2164,
    "type": "racconto",
    "year": null,
    "log_length": 20.07
  },
  "viz": {
    "color": "rgb(192,192,192)",
    "position": {
      "x": veryMinValue,
      "y": veryMinValue,
      "z": 0
    },
    "size": 6.6820207
  }
}

data.push(veryMax);
data.push(veryMin);

console.log(data.length)

try {
  const parser = new Json2csvParser(opts);
  const csv = parser.parse(data);
  // console.log(csv);
  fs.writeFileSync('data-4-contourplot-mixed-spatialisation.tsv', csv)
} catch (err) {
  console.error(err);
}
//
// data = JSON.stringify(data, null, 2);
// fs.writeFileSync('data-4-contourplot-fruchterman.json', data)
