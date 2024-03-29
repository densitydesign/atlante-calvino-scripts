const fs = require('fs');
const d3 = require('d3');

// "data-4-edges.tsv" equals to the "publications" sheet in the spreadsheet named "corups"
// the sheet is filtered as it follows:
// - leave apart id corresponding to volumes (keep only those ones starting with S)
// - leave apart publications on magazines, since we want to focus on "territories" generated by collections

let file = 'data-4-network-territory/data-4-edges.tsv';

let data = fs.readFileSync(file).toString();

data = d3.tsvParse(data);

let edges = [];

data = d3.nest()
    .key(function(d){ return d.destination })
    .entries(data);

fs.writeFileSync('data-4-network-territory/intermediary-data.json', JSON.stringify(data, null, 2));

// console.log(data);

data.forEach( d => {
  console.log(d);
  d.values.forEach((n,i) => {
    if (i < d.values.length-1) {
      for (var k=i+1; k<=d.values.length-1; k++) {
        let obj = {
          'source': n.id,
          'target': d.values[k].id,
          'volume': d.key,
          'year': d.values[k].year
        }
        console.log(obj);
        edges.push(obj);
      }
    }
  })
})

fs.writeFileSync('data-4-network-territory/edges.json', JSON.stringify(edges, null, 2));
