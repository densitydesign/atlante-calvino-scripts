// the aim of this script is to prepare data "hacked" so to generate a contourplot in RAWGraphs
// the scripts take a list of rows each of one represents calvino's operas and multiply them according on the number of the opera pages
// in this way we can produce a contourplot where a higher density is displayed in correspondence with longer operas
const fs = require('fs');
const d3 = require('d3');
const Json2csvParser = require('json2csv').Parser;
const fields = ["id","attributes.title","attributes.txt_length","attributes.log_length","viz.position.x","viz.position.y"];
const opts = { fields, delimiter: '\t' };

let fileJSON = 'fruchterman-spatialisation.json';
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
  for(var i = 2; i <= length; i++){
    data.push(d);
  }
})

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
      "x": 3000,
      "y": 3000,
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
      "x": -3000,
      "y": -3000,
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
  fs.writeFileSync('data-4-contourplot-fruchterman.tsv', csv)
} catch (err) {
  console.error(err);
}
//
// data = JSON.stringify(data, null, 2);
// fs.writeFileSync('data-4-contourplot-fruchterman.json', data)
